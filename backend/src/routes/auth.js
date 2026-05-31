// src/routes/auth.js
const router = require("express").Router();
const { body } = require("express-validator");
const auth = require("../middleware/auth");
const { register, login, logout, me } = require("../controllers/authController");

router.post("/register",
  [
    body("username").trim().isLength({ min: 3, max: 50 }).withMessage("Username must be 3-50 characters."),
    body("email").isEmail().normalizeEmail().withMessage("Valid email required."),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters."),
  ],
  register
);

router.post("/login",
  [
    body("email").notEmpty().withMessage("Email or username required."),
    body("password").notEmpty().withMessage("Password required."),
  ],
  login
);

router.post("/logout", auth, logout);
router.get("/me", auth, me);

module.exports = router;
