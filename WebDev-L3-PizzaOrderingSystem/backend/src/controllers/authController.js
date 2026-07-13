const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "All fields are mandatory.",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email: email }, { phone: phone }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role,
    });

    return res.status(201).json({
      message:
        "Registration Sucessfull. Please verify your email before logging in.",
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({
      error: error.name,
      message: error.message,
    });
  }
};

const verifyEmail = async (req, res) => {};
const userLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(404).json({
        message: "User does not exist",
      });
    }
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(404).json({
        message: "Invalid credentails.",
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.EXPIRY },
    );

    return res.status(201).json({
      success: true,
      message: "Login sucessful",
      message: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
      token,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.name,
      message: error.message,
    });
  }
};

const forgotPassword = async (req, res) => {};
const resetPassword = async (req, res) => {};

module.exports = {
  registerUser,
  verifyEmail,
  userLogin,
  forgotPassword,
  resetPassword,
};
