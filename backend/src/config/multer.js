// src/config/multer.js
const multer = require("multer");
const path   = require("path");
const fs     = require("fs");

const uploadDir = path.join(__dirname, "../../", process.env.UPLOAD_DIR || "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = [
    "image/jpeg", "image/png", "image/gif", "image/webp",
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "text/plain",
    "application/zip",
    "video/mp4",
  ];
  allowed.includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error("File type not allowed"), false);
};

const maxMB = parseInt(process.env.MAX_FILE_SIZE_MB || "10");

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxMB * 1024 * 1024 },
});
