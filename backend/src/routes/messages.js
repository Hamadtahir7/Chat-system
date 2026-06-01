// src/routes/messages.js
const router = require("express").Router();
const auth   = require("../middleware/auth");
const { editMessage, deleteMessage, markSeen, markAsRead } = require("../controllers/messagesController");

router.put("/:id",      auth, editMessage);
router.delete("/:id",   auth, deleteMessage);
router.patch("/:id/seen", auth, markSeen);
router.post("/read",    auth, markAsRead);

module.exports = router;
