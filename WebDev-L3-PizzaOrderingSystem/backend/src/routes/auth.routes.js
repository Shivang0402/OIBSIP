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
router.get("/inventory", authMiddleware, authorize("admin", "user"), inventory); // user allowed as of now to test addInventory, to be
//  changed after creating an admin account
module.exports = router;
