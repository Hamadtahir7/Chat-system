// src/socket/socketHandler.js
const jwt  = require("jsonwebtoken");
const { pool } = require("../config/db");

// Map: user_id → socket.id  (for online presence)
const onlineUsers = new Map();

module.exports = function registerSocketHandlers(io) {

  // ── Auth middleware for Socket.io ─────────────────────────────
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication required."));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch {
      next(new Error("Invalid token."));
    }
  });

  io.on("connection", async (socket) => {
    const user_id = socket.user.user_id;
    console.log(`🔌  Socket connected: user ${user_id} (${socket.id})`);

    // Track online
    onlineUsers.set(user_id, socket.id);

    // Mark user online in DB
    await pool.query(
      "UPDATE Users SET is_online = 1, last_seen_at = NOW() WHERE user_id = ?",
      [user_id]
    );

    // Join all chat rooms this user belongs to
    const [chats] = await pool.query(
      "SELECT chat_id FROM Chat_Members WHERE user_id = ?",
      [user_id]
    );
    chats.forEach(c => socket.join(`chat:${c.chat_id}`));

    // Broadcast online status to all contacts
    io.emit("user:online", { user_id, is_online: true });

    // ── send_message ─────────────────────────────────────────────
    // Client emits this; server saves it and broadcasts to the room
    socket.on("send_message", async (data, callback) => {
      try {
        const { chat_id, content, message_type = "text", reply_to } = data;

        // Verify membership
        const [membership] = await pool.query(
          "SELECT 1 FROM Chat_Members WHERE chat_id = ? AND user_id = ?",
          [chat_id, user_id]
        );
        if (!membership.length) return callback?.({ error: "Access denied." });

        // Insert message
        const [msgResult] = await pool.query(
          `INSERT INTO Messages (chat_id, sender_id, message_type, content, reply_to, is_deleted, created_at)
           VALUES (?, ?, ?, ?, ?, 0, NOW())`,
          [chat_id, user_id, message_type, content || null, reply_to || null]
        );
        const message_id = msgResult.insertId;

        // Insert status rows for other members
        const [members] = await pool.query(
          "SELECT user_id FROM Chat_Members WHERE chat_id = ? AND user_id != ?",
          [chat_id, user_id]
        );
        if (members.length > 0) {
          const rows = members.map(m => [message_id, m.user_id, "sent", new Date()]);
          await pool.query(
            "INSERT INTO Message_Status (message_id, user_id, status, updated_at) VALUES ?",
            [rows]
          );
        }

        // Fetch full message with sender info
        const [full] = await pool.query(
          `SELECT m.*, u.username AS sender_name, u.avatar_url AS sender_avatar
           FROM Messages m
           JOIN Users u ON u.user_id = m.sender_id
           WHERE m.message_id = ?`,
          [message_id]
        );

        const msg = full[0];

        // Broadcast to everyone in the room (including sender) - emit with correct event name
        io.to(`chat:${chat_id}`).emit("message:new", msg);

        // Auto-deliver for online members
        members.forEach(m => {
          if (onlineUsers.has(m.user_id)) {
            pool.query(
              `UPDATE Message_Status SET status = 'delivered', updated_at = NOW()
               WHERE message_id = ? AND user_id = ? AND status = 'sent'`,
              [message_id, m.user_id]
            );
            io.to(`chat:${chat_id}`).emit("message_delivered", {
              message_id, user_id: m.user_id,
            });
          }
        });

        callback?.({ message_id });
      } catch (err) {
        console.error("send_message error:", err);
        callback?.({ error: "Failed to send message." });
      }
    });

    // ── typing ───────────────────────────────────────────────────
    socket.on("typing_start", ({ chat_id }) => {
      socket.to(`chat:${chat_id}`).emit("user_typing", {
        chat_id,
        user_id,
        username: socket.user.username,
      });
    });

    socket.on("typing_stop", ({ chat_id }) => {
      socket.to(`chat:${chat_id}`).emit("user_stopped_typing", { chat_id, user_id });
    });

    // ── mark seen ────────────────────────────────────────────────
    socket.on("mark_seen", async ({ chat_id, message_id }) => {
      await pool.query(
        `UPDATE Message_Status SET status = 'seen', updated_at = NOW()
         WHERE message_id = ? AND user_id = ? AND status != 'seen'`,
        [message_id, user_id]
      );
      io.to(`chat:${chat_id}`).emit("message_seen", { message_id, user_id });
    });

    // ── join new chat room (after creating a chat) ────────────────
    socket.on("join_chat", ({ chat_id }) => {
      socket.join(`chat:${chat_id}`);
    });

    // ── disconnect ───────────────────────────────────────────────
    socket.on("disconnect", async () => {
      console.log(`🔌  Socket disconnected: user ${user_id}`);
      onlineUsers.delete(user_id);

      await pool.query(
        "UPDATE Users SET is_online = 0, last_seen_at = NOW() WHERE user_id = ?",
        [user_id]
      );

      io.emit("user:offline", { user_id, is_online: false });
    });
  });
};
