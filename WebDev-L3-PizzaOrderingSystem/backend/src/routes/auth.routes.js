const express = require("express");
const router = express.Router();
const { authMiddleware, authorize } = require("../middlewares/authMiddleware");

const {
  registerUser,
  verifyEmail,
  userLogin,
  adminLogin,
  userProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
  changePassword,
} = require("../controllers/auth.controller");

router.post("/register", registerUser);
router.get("/verifyemail/:token", verifyEmail);
router.post("/login", userLogin);
router.post("/admin-login", adminLogin);
router.post("/forgotpass", forgotPassword);
router.patch("/resetpass/:token", resetPassword);
router.post(
  "/changepass",
  authMiddleware,
  authorize("user", "admin"),
  changePassword,
);
router.get("/profile", authMiddleware, userProfile);
router.patch("/profile", authMiddleware, authorize("user", "admin"), updateProfile);

module.exports = router;
