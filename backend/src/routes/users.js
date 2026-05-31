// src/routes/users.js
const router = require("express").Router();
const auth   = require("../middleware/auth");
const { getUsers, searchUsers, getUser, updateProfile } = require("../controllers/usersController");

router.get("/",        auth, getUsers);      // Get all users or search
router.get("/search",  auth, searchUsers);   // Alternative search endpoint
router.get("/:id",     auth, getUser);
router.put("/profile", auth, updateProfile);

module.exports = router;
