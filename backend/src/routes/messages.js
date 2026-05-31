// src/routes/messages.js
const router = require("express").Router();
const auth   = require("../middleware/auth");
const { editMessage, deleteMessage, markSeen } = require("../controllers/messagesController");

router.put("/:id",      auth, editMessage);
router.delete("/:id",   auth, deleteMessage);
router.patch("/:id/seen", auth, markSeen);

module.exports = router;
