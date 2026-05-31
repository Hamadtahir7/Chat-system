// src/controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt    = require("jsonwebtoken");
const { pool } = require("../config/db");
const { validationResult } = require("express-validator");

function generateToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

// ── POST /api/auth/register ──────────────────────────────────────
async function register(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    // Check duplicate username or email
    const [existing] = await pool.query(
      "SELECT user_id FROM Users WHERE username = ? OR email = ? LIMIT 1",
      [username, email]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: "Username or email already in use." });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 12);

    // Insert user
    const [result] = await pool.query(
      `INSERT INTO Users (username, email, password_hash, is_online, created_at)
       VALUES (?, ?, ?, 0, NOW())`,
      [username, email, password_hash]
    );

    const user_id = result.insertId;
    const token   = generateToken({ user_id, username, email });

    res.status(201).json({
      message: "Account created successfully.",
      token,
      user: { user_id, username, email, avatar_url: null, is_online: 0 },
    });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/auth/login ─────────────────────────────────────────
async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const [rows] = await pool.query(
      "SELECT * FROM Users WHERE email = ? OR username = ? LIMIT 1",
      [email, email]
    );
    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const user = rows[0];

    // Verify password
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Set online
    await pool.query(
      "UPDATE Users SET is_online = 1, last_seen_at = NOW() WHERE user_id = ?",
      [user.user_id]
    );

    const token = generateToken({
      user_id:  user.user_id,
      username: user.username,
      email:    user.email,
    });

    res.json({
      message: "Logged in successfully.",
      token,
      user: {
        user_id:    user.user_id,
        username:   user.username,
        email:      user.email,
        avatar_url: user.avatar_url,
        is_online:  1,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/auth/logout ────────────────────────────────────────
async function logout(req, res, next) {
  try {
    await pool.query(
      "UPDATE Users SET is_online = 0, last_seen_at = NOW() WHERE user_id = ?",
      [req.user.user_id]
    );
    res.json({ message: "Logged out." });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/auth/me ─────────────────────────────────────────────
async function me(req, res, next) {
  try {
    const [rows] = await pool.query(
      "SELECT user_id, username, email, avatar_url, is_online, created_at FROM Users WHERE user_id = ?",
      [req.user.user_id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "User not found." });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, logout, me };
