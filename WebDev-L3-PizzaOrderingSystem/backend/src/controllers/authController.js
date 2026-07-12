const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "All fields are mandatory.",
      });

      const existingUser = await User.find({
        $or: [{ email }, { phone }],
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = User.create({
        name,
        email,
        password: hashedPassword,
        phone,
        role,
      });

      return res.status(201).json({
        message: "Registration Sucessfull",
        data: {
          userId: User._id,
          nam: User.name,
          email: User.email,
        },
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const verifyEmail = async (req, res) => {};
const userLogin = async (req, res) => {};
const forgotPassword = async (req, res) => {};
const resetPassword = async (req, res) => {};

module.exports = {
  registerUser,
  verifyEmail,
  userLogin,
  forgotPassword,
  resetPassword,
};
