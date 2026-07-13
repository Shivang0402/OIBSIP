const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

const {
  registerUser,
  verifyEmail,
  userLogin,
  userProfile,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", userLogin);
router.get("/profile", authMiddleware, userProfile);
module.exports = router;
