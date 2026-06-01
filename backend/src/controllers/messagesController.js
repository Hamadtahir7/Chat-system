// src/controllers/messagesController.js
const { pool } = require("../config/db");
const path     = require("path");

// ── GET /api/chats/:id/messages ──────────────────────────────────
// Paginated message history for a chat
async function getMessages(req, res, next) {
  try {
    const { id: chat_id } = req.params;
    const user_id  = req.user.user_id;
    const limit    = parseInt(req.query.limit  || "50");
    const before   = req.query.before || null; // message_id cursor

    // Verify membership
    const [membership] = await pool.query(
      "SELECT 1 FROM Chat_Members WHERE chat_id = ? AND user_id = ?",
      [chat_id, user_id]
    );
    if (!membership.length) {
      return res.status(403).json({ message: "Access denied." });
    }

    let query = `
      SELECT
        m.message_id, m.chat_id, m.sender_id,
        m.message_type, m.content, m.reply_to,
        m.is_deleted, m.created_at, m.edited_at,
        u.username AS sender_name, u.avatar_url AS sender_avatar,
        f.file_id, f.file_name, f.file_type, f.file_size_kb, f.storage_url
      FROM Messages m
      JOIN Users u ON u.user_id = m.sender_id
      LEFT JOIN Files f ON f.message_id = m.message_id
      WHERE m.chat_id = ?
    `;
    const params = [chat_id];

    if (before) {
      query += " AND m.message_id < ?";
      params.push(before);
    }

    query += " ORDER BY m.created_at DESC LIMIT ?";
    params.push(limit);

    const [rows] = await pool.query(query, params);

    // Return oldest-first
    const messages = rows.reverse();

    // Mark as delivered for this user
    const undelivered = messages
      .filter(m => m.sender_id !== user_id)
      .map(m => m.message_id);

    if (undelivered.length > 0) {
      await pool.query(
        `UPDATE Message_Status
         SET status = 'delivered', updated_at = NOW()
         WHERE message_id IN (?) AND user_id = ? AND status = 'sent'`,
        [undelivered, user_id]
      );
    }

    res.json({ data: messages, has_more: rows.length === limit });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/chats/:id/messages ─────────────────────────────────
async function sendMessage(req, res, next) {
  try {
    const { id: chat_id }            = req.params;
    const sender_id                  = req.user.user_id;
    const { content, message_type = "text", reply_to } = req.body;

    // Verify membership
    const [membership] = await pool.query(
      "SELECT 1 FROM Chat_Members WHERE chat_id = ? AND user_id = ?",
      [chat_id, sender_id]
    );
    if (!membership.length) {
      return res.status(403).json({ message: "Access denied." });
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Insert message
      const [msgResult] = await conn.query(
        `INSERT INTO Messages
           (chat_id, sender_id, message_type, content, reply_to, is_deleted, created_at)
         VALUES (?, ?, ?, ?, ?, 0, NOW())`,
        [chat_id, sender_id, message_type, content || null, reply_to || null]
      );
      const message_id = msgResult.insertId;

      // Insert status rows for every other member (status = 'sent')
      const [members] = await conn.query(
        "SELECT user_id FROM Chat_Members WHERE chat_id = ? AND user_id != ?",
        [chat_id, sender_id]
      );

      if (members.length > 0) {
        const statusRows = members.map(m => [message_id, m.user_id, "sent"]);
        await conn.query(
          "INSERT INTO Message_Status (message_id, user_id, status, updated_at) VALUES ?",
          [statusRows.map(r => [...r, new Date()])]
        );
      }

      await conn.commit();

      // Fetch the full message to return and broadcast
      const [full] = await pool.query(
        `SELECT m.*, u.username AS sender_name, u.avatar_url AS sender_avatar
         FROM Messages m
         JOIN Users u ON u.user_id = m.sender_id
         WHERE m.message_id = ?`,
        [message_id]
      );

      res.status(201).json(full[0]);
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (err) {
    next(err);
  }
}

// ── PUT /api/messages/:id ────────────────────────────────────────
async function editMessage(req, res, next) {
  try {
    const { id: message_id } = req.params;
    const { content }        = req.body;
    const user_id            = req.user.user_id;

    const [rows] = await pool.query(
      "SELECT sender_id FROM Messages WHERE message_id = ?",
      [message_id]
    );
    if (!rows.length) return res.status(404).json({ message: "Message not found." });
    if (rows[0].sender_id !== user_id) {
      return res.status(403).json({ message: "You can only edit your own messages." });
    }

    await pool.query(
      "UPDATE Messages SET content = ?, edited_at = NOW() WHERE message_id = ?",
      [content, message_id]
    );

    res.json({ message_id, content, edited: true });
  } catch (err) {
    next(err);
  }
}

// ── DELETE /api/messages/:id ─────────────────────────────────────
async function deleteMessage(req, res, next) {
  try {
    const { id: message_id } = req.params;
    const user_id            = req.user.user_id;

    const [rows] = await pool.query(
      "SELECT sender_id FROM Messages WHERE message_id = ?",
      [message_id]
    );
    if (!rows.length) return res.status(404).json({ message: "Message not found." });
    if (rows[0].sender_id !== user_id) {
      return res.status(403).json({ message: "You can only delete your own messages." });
    }

    // Soft delete
    await pool.query(
      "UPDATE Messages SET is_deleted = 1 WHERE message_id = ?",
      [message_id]
    );

    res.json({ message_id, deleted: true });
  } catch (err) {
    next(err);
  }
}

// ── PATCH /api/messages/:id/seen ─────────────────────────────────
async function markSeen(req, res, next) {
  try {
    const { id: message_id } = req.params;
    const user_id = req.user.user_id;

    await pool.query(
      `UPDATE Message_Status
       SET status = 'seen', updated_at = NOW()
       WHERE message_id = ? AND user_id = ?`,
      [message_id, user_id]
    );

    res.json({ message_id, seen: true });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/messages/read ──────────────────────────────────────
async function markAsRead(req, res, next) {
  try {
    const { chat_id } = req.body;
    const user_id = req.user.user_id;

    if (!chat_id) {
      return res.status(400).json({ error: "chat_id is required" });
    }

    // Mark all messages in the chat as seen for this user
    // The unread_count is calculated from Message_Status, so marking as 'seen' will clear it
    await pool.query(
      `UPDATE Message_Status
       SET status = 'seen', updated_at = NOW()
       WHERE message_id IN (
         SELECT message_id FROM Messages WHERE chat_id = ?
       ) AND user_id = ? AND status != 'seen'`,
      [chat_id, user_id]
    );

    res.json({ chat_id, read: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMessages, sendMessage, editMessage, deleteMessage, markSeen, markAsRead };
