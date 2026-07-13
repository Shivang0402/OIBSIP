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
const userLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.find({
      email,
    });
    if (!user) {
      return res.status(404).json({
        message: "User does not exist",
      });
    }
    const match = bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(404).json({
        message: "Invalid credentails.",
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      process.env.EXPIRY,
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
  } catch (error) {}
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
