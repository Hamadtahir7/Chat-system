// src/routes/chats.js
const router = require("express").Router();
const auth   = require("../middleware/auth");
const upload = require("../config/multer");
const {
  getMyChats, createPrivateChat, createGroupChat,
  getChatMembers, addMember, removeMember,
} = require("../controllers/chatsController");
const { getMessages, sendMessage } = require("../controllers/messagesController");
const { uploadFile }               = require("../controllers/filesController");

router.get("/",              auth, getMyChats);
router.post("/private",      auth, createPrivateChat);
router.post("/group",        auth, createGroupChat);
router.get("/:id/members",   auth, getChatMembers);
router.post("/:id/members",  auth, addMember);
router.delete("/:id/members/:userId", auth, removeMember);
router.get("/:id/messages",  auth, getMessages);
router.post("/:id/messages", auth, sendMessage);
router.post("/:id/files",    auth, upload.single("file"), uploadFile);

module.exports = router;
