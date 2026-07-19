const express = require("express");
const router = express.Router();
const { authMiddleware, authorize } = require("../middlewares/authMiddleware");

const {
  registerUser,
  verifyEmail,
  userLogin,
  userProfile,
  inventory,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth.controller");

router.post("/register", registerUser);
router.post("/login", userLogin);
router.get("/profile", authMiddleware, userProfile);
router.get("/inventory", authMiddleware, authorize("admin", "user"), inventory);

module.exports = router;
