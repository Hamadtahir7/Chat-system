// src/controllers/chatsController.js
const { pool } = require("../config/db");

// ── GET /api/chats ───────────────────────────────────────────────
// Returns all chats the logged-in user belongs to
async function getMyChats(req, res, next) {
  try {
    const user_id = req.user.user_id;

    const [rows] = await pool.query(
      `SELECT
         c.chat_id,
         c.chat_type,
         c.title,
         c.description,
         c.created_by,
         c.created_at,
         cm.role,
         cm.is_muted,
         -- last message preview
         (SELECT m.content
          FROM Messages m
          WHERE m.chat_id = c.chat_id AND m.is_deleted = 0
          ORDER BY m.created_at DESC LIMIT 1) AS last_message,
         (SELECT m.created_at
          FROM Messages m
          WHERE m.chat_id = c.chat_id AND m.is_deleted = 0
          ORDER BY m.created_at DESC LIMIT 1) AS last_message_at,
         -- unread count
         (SELECT COUNT(*)
          FROM Messages m2
          JOIN Message_Status ms ON ms.message_id = m2.message_id
          WHERE m2.chat_id = c.chat_id
            AND ms.user_id = ?
            AND ms.status != 'seen') AS unread_count
       FROM Chats c
       JOIN Chat_Members cm ON cm.chat_id = c.chat_id
       WHERE cm.user_id = ?
       ORDER BY last_message_at DESC`,
      [user_id, user_id]
    );

    // For private chats, get the other person's name and online status
    const enriched = await Promise.all(
      rows.map(async (chat) => {
        if (chat.chat_type === "private") {
          const [other] = await pool.query(
            `SELECT u.user_id, u.username, u.avatar_url, u.is_online
             FROM Chat_Members cm
             JOIN Users u ON u.user_id = cm.user_id
             WHERE cm.chat_id = ? AND cm.user_id != ?
             LIMIT 1`,
            [chat.chat_id, user_id]
          );
          if (other.length > 0) {
            chat.title     = other[0].username;
            chat.online    = !!other[0].is_online;
            chat.other_user = other[0];
          }
        } else {
          chat.online = false;
        }
        return chat;
      })
    );

    res.json({ data: enriched });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/chats/private ──────────────────────────────────────
// Start a DM with another user
async function createPrivateChat(req, res, next) {
  try {
    const me     = req.user.user_id;
    const { user_id: other_id } = req.body;

    if (!other_id) return res.status(400).json({ message: "user_id is required." });
    if (other_id === me) return res.status(400).json({ message: "Cannot chat with yourself." });

    // Check if private chat already exists between these two users
    const [existing] = await pool.query(
      `SELECT c.chat_id FROM Chats c
       JOIN Chat_Members cm1 ON cm1.chat_id = c.chat_id AND cm1.user_id = ?
       JOIN Chat_Members cm2 ON cm2.chat_id = c.chat_id AND cm2.user_id = ?
       WHERE c.chat_type = 'private'
       LIMIT 1`,
      [me, other_id]
    );

    if (existing.length > 0) {
      // Return existing chat in consistent format
      const [existingChat] = await pool.query(
        `SELECT c.chat_id, c.chat_type, c.title, c.description, c.created_by, c.created_at
         FROM Chats c WHERE c.chat_id = ?`,
        [existing[0].chat_id]
      );
      if (existingChat.length > 0) {
        const chat = existingChat[0];
        const [other] = await pool.query(
          `SELECT u.user_id, u.username, u.avatar_url, u.is_online
           FROM Chat_Members cm
           JOIN Users u ON u.user_id = cm.user_id
           WHERE cm.chat_id = ? AND cm.user_id != ?
           LIMIT 1`,
          [chat.chat_id, me]
        );
        if (other.length > 0) {
          chat.title = other[0].username;
          chat.online = !!other[0].is_online;
          chat.other_user = other[0];
        }
        chat.last_message = null;
        chat.last_message_at = null;
        chat.unread_count = 0;
        return res.json({ data: chat, already_exists: true });
      }
    }

    // Create new private chat
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [chatResult] = await conn.query(
        "INSERT INTO Chats (chat_type, created_by, created_at) VALUES ('private', ?, NOW())",
        [me]
      );
      const chat_id = chatResult.insertId;

      await conn.query(
        "INSERT INTO Chat_Members (chat_id, user_id, role, joined_at) VALUES (?, ?, 'owner', NOW()), (?, ?, 'member', NOW())",
        [chat_id, me, chat_id, other_id]
      );

      await conn.commit();
      
      // Fetch and return the created chat
      const [newChat] = await conn.query(
        `SELECT c.chat_id, c.chat_type, c.title, c.description, c.created_by, c.created_at
         FROM Chats c WHERE c.chat_id = ?`,
        [chat_id]
      );
      
      if (newChat.length > 0) {
        const chat = newChat[0];
        // Get the other person's info for private chats
        if (chat.chat_type === "private") {
          const [other] = await conn.query(
            `SELECT u.user_id, u.username, u.avatar_url, u.is_online
             FROM Chat_Members cm
             JOIN Users u ON u.user_id = cm.user_id
             WHERE cm.chat_id = ? AND cm.user_id != ?
             LIMIT 1`,
            [chat.chat_id, me]
          );
          if (other.length > 0) {
            chat.title = other[0].username;
            chat.online = !!other[0].is_online;
            chat.other_user = other[0];
          }
        }
        chat.last_message = null;
        chat.last_message_at = null;
        chat.unread_count = 0;
        res.status(201).json({ data: chat });
      } else {
        res.status(201).json({ data: { chat_id, chat_type: 'private' } });
      }
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

// ── POST /api/chats/group ────────────────────────────────────────
async function createGroupChat(req, res, next) {
  try {
    const me = req.user.user_id;
    const { title, description, member_ids } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Group title is required." });
    }

    const members = Array.isArray(member_ids) ? member_ids.filter(id => id !== me) : [];

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [chatResult] = await conn.query(
        "INSERT INTO Chats (chat_type, title, description, created_by, created_at) VALUES ('group', ?, ?, ?, NOW())",
        [title.trim(), description || null, me]
      );
      const chat_id = chatResult.insertId;

      // Insert creator as owner
      const memberRows = [[chat_id, me, "owner"]];
      for (const uid of members) {
        memberRows.push([chat_id, uid, "member"]);
      }
      await conn.query(
        "INSERT INTO Chat_Members (chat_id, user_id, role, joined_at) VALUES ?",
        [memberRows.map(r => [...r, new Date()])]
      );

      await conn.commit();
      
      // Fetch and return the created chat
      const [newChat] = await conn.query(
        `SELECT c.chat_id, c.chat_type, c.title, c.description, c.created_by, c.created_at
         FROM Chats c WHERE c.chat_id = ?`,
        [chat_id]
      );
      
      if (newChat.length > 0) {
        const chat = newChat[0];
        chat.last_message = null;
        chat.last_message_at = null;
        chat.unread_count = 0;
        res.status(201).json({ data: chat });
      } else {
        res.status(201).json({ data: { chat_id, chat_type: 'group', title } });
      }
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

// ── GET /api/chats/:id/members ───────────────────────────────────
async function getChatMembers(req, res, next) {
  try {
    const { id: chat_id } = req.params;
    const user_id = req.user.user_id;

    // Check user is a member
    const [membership] = await pool.query(
      "SELECT role FROM Chat_Members WHERE chat_id = ? AND user_id = ?",
      [chat_id, user_id]
    );
    if (membership.length === 0) {
      return res.status(403).json({ message: "Access denied." });
    }

    const [rows] = await pool.query(
      `SELECT u.user_id, u.username, u.avatar_url, u.is_online, u.last_seen_at,
              cm.role, cm.joined_at
       FROM Chat_Members cm
       JOIN Users u ON u.user_id = cm.user_id
       WHERE cm.chat_id = ?
       ORDER BY FIELD(cm.role,'owner','admin','member'), u.username`,
      [chat_id]
    );

    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/chats/:id/members ──────────────────────────────────
async function addMember(req, res, next) {
  try {
    const { id: chat_id } = req.params;
    const { user_id: new_user } = req.body;
    const requester = req.user.user_id;

    // Check requester is owner or admin
    const [me] = await pool.query(
      "SELECT role FROM Chat_Members WHERE chat_id = ? AND user_id = ?",
      [chat_id, requester]
    );
    if (!me.length || !["owner","admin"].includes(me[0].role)) {
      return res.status(403).json({ message: "Only admins or owners can add members." });
    }

    // Check not already a member
    const [exists] = await pool.query(
      "SELECT 1 FROM Chat_Members WHERE chat_id = ? AND user_id = ?",
      [chat_id, new_user]
    );
    if (exists.length > 0) {
      return res.status(409).json({ message: "User is already a member." });
    }

    await pool.query(
      "INSERT INTO Chat_Members (chat_id, user_id, role, joined_at) VALUES (?, ?, 'member', NOW())",
      [chat_id, new_user]
    );

    res.status(201).json({ message: "Member added." });
  } catch (err) {
    next(err);
  }
}

// ── DELETE /api/chats/:id/members/:userId ────────────────────────
async function removeMember(req, res, next) {
  try {
    const { id: chat_id, userId: target_id } = req.params;
    const requester = req.user.user_id;

    const [me] = await pool.query(
      "SELECT role FROM Chat_Members WHERE chat_id = ? AND user_id = ?",
      [chat_id, requester]
    );
    if (!me.length || !["owner","admin"].includes(me[0].role)) {
      return res.status(403).json({ message: "Only admins or owners can remove members." });
    }

    await pool.query(
      "DELETE FROM Chat_Members WHERE chat_id = ? AND user_id = ?",
      [chat_id, target_id]
    );

    res.json({ message: "Member removed." });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMyChats,
  createPrivateChat,
  createGroupChat,
  getChatMembers,
  addMember,
  removeMember,
};
