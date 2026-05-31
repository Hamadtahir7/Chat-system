// src/controllers/filesController.js
const { pool }  = require("../config/db");
const upload    = require("../config/multer");
const path      = require("path");

// ── POST /api/chats/:id/files ────────────────────────────────────
async function uploadFile(req, res, next) {
  // multer runs first via route middleware
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded." });

    const { id: chat_id } = req.params;
    const uploader_id     = req.user.user_id;

    // Verify membership
    const [membership] = await pool.query(
      "SELECT 1 FROM Chat_Members WHERE chat_id = ? AND user_id = ?",
      [chat_id, uploader_id]
    );
    if (!membership.length) {
      return res.status(403).json({ message: "Access denied." });
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Create a message row of type 'file' or 'image'
      const msgType = req.file.mimetype.startsWith("image/") ? "image" : "file";
      const [msgResult] = await conn.query(
        `INSERT INTO Messages (chat_id, sender_id, message_type, content, is_deleted, created_at)
         VALUES (?, ?, ?, NULL, 0, NOW())`,
        [chat_id, uploader_id, msgType]
      );
      const message_id = msgResult.insertId;

      // Insert file metadata
      const storage_url = `/uploads/${req.file.filename}`;
      const [fileResult] = await conn.query(
        `INSERT INTO Files
           (message_id, uploader_id, file_name, file_type, file_size_kb, storage_url, uploaded_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [
          message_id,
          uploader_id,
          req.file.originalname,
          req.file.mimetype,
          Math.round(req.file.size / 1024),
          storage_url,
        ]
      );

      // Status rows for other members
      const [members] = await conn.query(
        "SELECT user_id FROM Chat_Members WHERE chat_id = ? AND user_id != ?",
        [chat_id, uploader_id]
      );
      if (members.length > 0) {
        const statusRows = members.map(m => [message_id, m.user_id, "sent", new Date()]);
        await conn.query(
          "INSERT INTO Message_Status (message_id, user_id, status, updated_at) VALUES ?",
          [statusRows]
        );
      }

      await conn.commit();

      // Return the enriched message
      const [full] = await pool.query(
        `SELECT m.*, u.username AS sender_name,
                f.file_id, f.file_name, f.file_type, f.file_size_kb, f.storage_url
         FROM Messages m
         JOIN Users u ON u.user_id = m.sender_id
         JOIN Files f ON f.message_id = m.message_id
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

module.exports = { uploadFile };
