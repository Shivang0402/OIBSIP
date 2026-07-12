const express = require("express");
const router = express.Router();
const {
  registerUser,
  verifyEmail,
  userLogin,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

module.exports = router;
