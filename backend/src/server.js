// src/server.js
require("dotenv").config();

const express  = require("express");
const http     = require("http");
const { Server } = require("socket.io");
const cors     = require("cors");
const path     = require("path");

const { testConnection } = require("./config/db");
const errorHandler       = require("./middleware/errorHandler");
const registerSocket     = require("./socket/socketHandler");

// ── Routes ────────────────────────────────────────────────────────
const authRoutes     = require("./routes/auth");
const usersRoutes    = require("./routes/users");
const chatsRoutes    = require("./routes/chats");
const messagesRoutes = require("./routes/messages");

// ── App setup ─────────────────────────────────────────────────────
const app    = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin:      function(origin, callback) {
      // Allow all origins in development
      if (process.env.NODE_ENV === "development") {
        callback(null, true);
      } else {
        const allowedOrigins = [process.env.CLIENT_URL || "http://localhost:3000"];
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      }
    },
    methods:     ["GET", "POST"],
    credentials: true,
  },
});

// ── Middlewares ───────────────────────────────────────────────────
app.use(cors({
  origin: function(origin, callback) {
    // Allow all origins in development
    if (process.env.NODE_ENV === "development") {
      callback(null, true);
    } else {
      const allowedOrigins = [process.env.CLIENT_URL || "http://localhost:3000"];
      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ── API Routes ────────────────────────────────────────────────────
app.use("/api/auth",     authRoutes);
app.use("/api/users",    usersRoutes);
app.use("/api/chats",    chatsRoutes);
app.use("/api/messages", messagesRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Socket.io ─────────────────────────────────────────────────────
registerSocket(io);

// ── Error handler (must be last) ──────────────────────────────────
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

async function start() {
  await testConnection();
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀  Server running on http://0.0.0.0:${PORT}`);
    console.log(`📡  Socket.io ready`);
    console.log(`💡  Accessible at http://localhost:${PORT} and http://10.17.86.43:${PORT}`);
  });
}

start();
