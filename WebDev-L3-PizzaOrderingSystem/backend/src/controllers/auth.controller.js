const User = require("../models/userModel");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const transporter = require("../config/mailer");
const { renderEmail } = require("../utils/emailTemplate");
const {
  isValidEmail,
  isValidPhone,
  isStrongEnough,
  MIN_PASSWORD_LENGTH,
  MAX_NAME_LENGTH,
} = require("../utils/validators");

const registerUser = async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const phone = String(req.body.phone || "").trim();

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "All fields are mandatory.",
      });
    }

    if (name.length < 2 || name.length > MAX_NAME_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Name must be between 2 and ${MAX_NAME_LENGTH} characters.`,
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address.",
      });
    }

    if (!isStrongEnough(password)) {
      return res.status(400).json({
        success: false,
        message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 10-digit phone number.",
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
      verificationToken,
      verificationTokenExpires,
    });

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const verificationLink = `${frontendUrl}/verify-email/${verificationToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Verify your PizzaNova account",
      html: renderEmail({
        title: "Verify your email",
        greeting: `Hello ${user.name},`,
        bodyHtml: `
          <p style="margin:0 0 4px;font-family:Arial, Helvetica, sans-serif;font-size:14px;line-height:1.6;color:#44403c;">
            Welcome to PizzaNova! Confirm your email address to activate your account and start ordering.
          </p>`,
        ctaText: "Verify Email",
        ctaHref: verificationLink,
      }),
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
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        message: "Verification token is required.",
      });
    }

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
    user.verificationToken = undefined;
    user.verificationLink = undefined;

    await user.save();

    return res.status(201).json({
      message: "Email verified successfully. You can login now.",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const userLogin = async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  try {
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: "Enter a valid email address.",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User does not exist.",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Email not verified. Please verify your email before logging in.",
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({
        message: "Invalid credentials.",
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.EXPIRY },
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
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

const adminLogin = async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  try {
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: "Enter a valid email address.",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "Admin account does not exist.",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        message: "Access restricted to admin accounts only.",
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({
        message: "Invalid credentials.",
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.EXPIRY },
    );

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
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

const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Name is required.",
      });
    }

    const updateFields = { name: name.trim() };

    if (phone) {
      if (!/^\d{10}$/.test(phone)) {
        return res.status(400).json({
          message: "Enter a valid 10-digit phone number.",
        });
      }
      const phoneInUse = await User.findOne({
        phone,
        _id: { $ne: req.user.id },
      });
      if (phoneInUse) {
        return res.status(400).json({
          message: "Phone number is already in use.",
        });
      }
      updateFields.phone = phone;
    }

    const user = await User.findByIdAndUpdate(req.user.id, updateFields, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.status(200).json({
      message: "Profile updated successfully.",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const forgotPassword = async (req, res) => {  try {
    const passToken = crypto.randomBytes(32).toString("hex");
    const passTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
    const email = String(req.body.email || "").trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        message: "Email is required.",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: "Enter a valid email address.",
      });
    }

    const user = await User.findOne({
      email: email,
    });

    if (!user) {
      return res.status(404).json({
        message: "Invalid email address.",
      });
    }

    user.passToken = passToken;
    user.passTokenExpires = passTokenExpires;
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const passVerificationLink = `${frontendUrl}/reset-password/${passToken}`;

    await transporter.sendMail({
      from: process.env.USER_EMAIL,
      to: user.email,
      subject: "Reset your PizzaNova password",
      html: renderEmail({
        title: "Reset your password",
        greeting: `Hello ${user.name},`,
        bodyHtml: `
          <p style="margin:0 0 4px;font-family:Arial, Helvetica, sans-serif;font-size:14px;line-height:1.6;color:#44403c;">
            We received a request to reset the password for your PizzaNova account. Click the button below to choose a new one.
          </p>
          <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:12px;line-height:1.6;color:#a8a29e;">
            This link expires in 24 hours. If you did not request this, you can safely ignore this email.
          </p>`,
        ctaText: "Reset Password",
        ctaHref: passVerificationLink,
      }),
    });

    return res.status(201).json({
      message:
        "Please verify the password reset request from your registered email address.",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const newPass = String(req.body.newPass || "");
  const confirmNewPass = String(req.body.confirmNewPass || "");

  if (!token) {
    return res.status(400).json({
      message: "Reset token is required.",
    });
  }

  if (!newPass || !confirmNewPass) {
    return res.status(400).json({
      message: "All fields are required.",
    });
  }

  if (newPass !== confirmNewPass) {
    return res.status(400).json({
      message: "Passwords do not match",
    });
  }

  if (!isStrongEnough(newPass)) {
    return res.status(400).json({
      message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    });
  }

  const user = await User.findOne({
    passToken: token,
  });

  if (!user) {
    return res.status(400).json({
      message: "Invalid token.",
    });
  }
  if (user.passTokenExpires < Date.now()) {
    return res.status(400).json({
      message: "Token expired.",
    });
  }

  user.password = await bcrypt.hash(newPass, 10);
  user.passToken = undefined;
  user.passTokenExpires = undefined;

  await user.save();

  return res.status(201).json({
    message: "Password reset successfull.",
  });
};

const changePassword = async (req, res) => {
  const currentPass = String(req.body.currentPass || "");
  const newPass = String(req.body.newPass || "");
  const confirmNewPass = String(req.body.confirmNewPass || "");
  try {
    if (!currentPass || !newPass || !confirmNewPass) {
      return res.status(400).json({
        message: "All fields are required.",
      });
    }

    if (newPass !== confirmNewPass) {
      return res.status(400).json({
        message: "Passwords do not match.",
      });
    }

    if (!isStrongEnough(newPass)) {
      return res.status(400).json({
        message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const isMatch = await bcrypt.compare(currentPass, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Current password is incorrect.",
      });
    }

    user.password = await bcrypt.hash(newPass, 10);
    await user.save();

    return res.status(200).json({
      message: "Password changed successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  registerUser,
  verifyEmail,
  userLogin,
  adminLogin,
  userProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
  changePassword,
};
