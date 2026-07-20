const User = require("../models/userModel");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const transporter = require("../config/mailer");

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
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role,
      verificationToken,
      verificationTokenExpires,
    });
    const verificationLink = `http://localhost:4404/api/auth/verifyemail/${verificationToken}`;

    await transporter.sendMail({
      from: process.env.USER_EMAIL,
      to: user.email,
      subject: "Email verification for PizzaExpress",
      html: `<p>Hello<b> ${user.name} </b></p><br>
      <p> Please click on the button to verify your email - </p><br>
      <button><a href="${verificationLink}">Verify</a></button><br>
      <p>${verificationLink}</p>`,
    });
    return res.status(201).json({
      message: "Registration Sucessfull. Please verify your email to log in.",
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

const verifyEmail = async (req, res) => {
  const { token } = req.params;

  const user = await User.findOne({
    verificationToken: token,
  });

  if (!user) {
    return res.status(400).json({
      message: "Invalid token.",
    });
  }
  if (user.verificationTokenExpires < Date.now()) {
    return res.status(400).json({
      message: "Token expired.",
    });
  }

  user.isVerified = true;
  user.verificationToken = "undefined";
  user.verificationLink = "undefined";

  await user.save();

  return res.status(201).json({
    message: "Email verified successfully. You can login now.",
  });
};

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
      message: "Login sucessfull",
      data: {
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

const userProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");

  return res.status(200).json({
    user,
  });
};

const inventory = async (req, res) => {
  return res.status(200).json({
    message: "Welcome to the inventory.",
  });
};

const forgotPassword = async (req, res) => {};
const resetPassword = async (req, res) => {};

module.exports = {
  registerUser,
  verifyEmail,
  userLogin,
  userProfile,
  inventory,
  forgotPassword,
  resetPassword,
};
