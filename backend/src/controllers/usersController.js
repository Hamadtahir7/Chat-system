// src/controllers/usersController.js
const { pool } = require("../config/db");
const bcrypt   = require("bcryptjs");

// ── GET /api/users?search=username ──────────────────────────────
async function getUsers(req, res, next) {
  try {
    const search = (req.query.search || "").trim();
    let query = `SELECT user_id, username, email, avatar_url, is_online, last_seen_at FROM Users`;
    let params = [];

    if (search) {
      query += ` WHERE (username LIKE ? OR email LIKE ?) AND user_id != ?`;
      params = [`%${search}%`, `%${search}%`, req.user.user_id];
    } else {
      // Get all users except current user
      query += ` WHERE user_id != ?`;
      params = [req.user.user_id];
    }

    query += ` LIMIT 100`;

    const [rows] = await pool.query(query, params);
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/users/search?q=username ────────────────────────────
async function searchUsers(req, res, next) {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.json({ data: [] });

    const [rows] = await pool.query(
      `SELECT user_id, username, email, avatar_url, is_online, last_seen_at
       FROM Users
       WHERE (username LIKE ? OR email LIKE ?)
         AND user_id != ?
       LIMIT 20`,
      [`%${q}%`, `%${q}%`, req.user.user_id]
    );

    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/users/:id ───────────────────────────────────────────
async function getUser(req, res, next) {
  try {
    const [rows] = await pool.query(
      "SELECT user_id, username, email, avatar_url, is_online, last_seen_at FROM Users WHERE user_id = ?",
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "User not found." });
    res.json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
}

// ── PUT /api/users/profile ───────────────────────────────────────
async function updateProfile(req, res, next) {
  try {
    const { username, avatar_url } = req.body;
    const user_id = req.user.user_id;

    if (username) {
      const [dup] = await pool.query(
        "SELECT user_id FROM Users WHERE username = ? AND user_id != ? LIMIT 1",
        [username, user_id]
      );
      if (dup.length > 0) {
        return res.status(409).json({ message: "Username already taken." });
      }
      await pool.query(
        "UPDATE Users SET username = ? WHERE user_id = ?",
        [username, user_id]
      );
    }

    if (avatar_url !== undefined) {
      await pool.query(
        "UPDATE Users SET avatar_url = ? WHERE user_id = ?",
        [avatar_url, user_id]
      );
    }

    const [rows] = await pool.query(
      "SELECT user_id, username, email, avatar_url, is_online FROM Users WHERE user_id = ?",
      [user_id]
    );

    res.json({ message: "Profile updated.", user: rows[0] });
  } catch (err) {
    next(err);
  }
}

module.exports = { getUsers, searchUsers, getUser, updateProfile };
