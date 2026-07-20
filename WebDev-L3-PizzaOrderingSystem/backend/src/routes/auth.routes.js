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
  changePassword,
} = require("../controllers/auth.controller");

router.post("/register", registerUser);
router.get("/verifyemail/:token", verifyEmail);
router.post("/login", userLogin);
router.post("/forgotpass", forgotPassword);
router.patch("/resetpass/:token", resetPassword);
router.post(
  "/changepass",
  authMiddleware,
  authorize("user", "admin"),
  changePassword,
);
router.get("/profile", authMiddleware, userProfile);
router.get("/inventory", authMiddleware, authorize("admin", "user"), inventory);

module.exports = router;
