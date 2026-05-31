// src/middleware/errorHandler.js
module.exports = function errorHandler(err, req, res, next) {
  console.error("💥 Unhandled error:", err.stack || err.message);

  const status  = err.status  || 500;
  const message = err.message || "Internal server error";

  res.status(status).json({ message });
};
