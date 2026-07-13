const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

const {
  registerUser,
  verifyEmail,
  userLogin,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", userLogin);

module.exports = router;
