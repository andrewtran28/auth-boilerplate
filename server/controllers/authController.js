const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
const { sendEmail } = require("../utils/sendEmail");
const { PrismaClient } = require("@prisma/client");
const { handleValidationErrors } = require("../utils/validator");
const isProduction = process.env.NODE_ENV === "production";
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();

const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id, username: user.username, isAuthor: user.isAuthor }, process.env.JWT_SECRET, {
    expiresIn: "30m", //30 minutes; short-lived token
  });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d", //7 days; long-lived token
  });
};

//Returns the current user
const getCurrentUser = (req, res) => {
  res.json({ user: req.user });
};

//Verifies credentials, issues token via res.cookie()
const logInUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const MAX_ATTEMPTS = 5;
  const LOCKOUT_TIME_MIN = 15;

  const user = await prisma.user.findUnique({ where: { username: username } });
  if (!user) {
    // Add mock delay to mitigate user enumeration
    await new Promise((resolve) => setTimeout(resolve, 500));
    return res.status(401).json({ message: "Invalid username or password." });
  }

  //Verify if account is locked
  if (user.lockOutUntil && new Date() < user.lockOutUntil) {
    const minutes = Math.ceil((user.lockOutUntil - new Date()) / 1000 / 60);
    console.warn(`User ${username} is locked out until ${user.lockOutUntil}`);
    return res.status(403).json({ message: `Account locked. Try again in ${minutes} minutes.` });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    const updated = {
      loginAttempts: user.loginAttempts + 1,
    };

    if (updated.loginAttempts >= MAX_ATTEMPTS) {
      updated.lockOutUntil = new Date(Date.now() + LOCKOUT_TIME_MIN * 60 * 1000);
      updated.loginAttempts = 0;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: updated,
    });

    console.warn(`Failed login attempt for ${username}. Attempt ${updated.loginAttempts}`);
    return res.status(401).json({ message: "Invalid username or password." });
  }

  // Reset attempts on successful login
  await prisma.user.update({
    where: { id: user.id },
    data: { loginAttempts: 0, lockOutUntil: null },
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  res
    .cookie("token", accessToken, {
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
      maxAge: 30 * 60 * 1000, // 30 min
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
    .status(200)
    .json({ success: true, message: "Logged in" });
});

//Clears the token
const logOutUser = (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";

  res
    .clearCookie("token", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
    })
    .clearCookie("refreshToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
    })
    .json({ success: true, message: "Logged out" });
};

//Refresh short-lived token based on refresh token
const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return res.status(401).json({ message: "User not found" });

    const newAccessToken = generateAccessToken(user);
    res.cookie("token", newAccessToken, {
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
      maxAge: 30 * 60 * 1000, // 30 min
    });

    res.status(200).json({ success: true, message: "Token refreshed" });
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired refresh token" });
  }
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { userInput } = req.body;
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: userInput }, { username: userInput }],
    },
  });

  const MESSAGE_FORGET =
    "If an account with that username or email exists, a password reset link will be sent to that email.";

  if (!user) return res.status(200).json({ message: MESSAGE_FORGET });

  const token = uuidv4();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken: token,
      resetTokenExpiry: expires,
    },
  });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  await sendEmail({
    to: user.email,
    subject: "Auth Boilerplate - Password Reset Request",
    text: `You are receiving this because you (or someone else) have requested to reset the password for your Auth Boilerplate account.
Please click the following link below, or paste it into your browser to reset your password:

  ${resetUrl}

This link is only valid for 24 hours. If you did not request this, please ignore this email and your password will remain unchanged.

— The Auth Boilerplate Team`,
  });

  res.status(200).json({ message: MESSAGE_FORGET });
});

const getResetPasswordUser = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: {
        gte: new Date(),
      },
    },
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired reset token." });
  }

  res.json({ username: user.username });
});

const resetPassword = asyncHandler(async (req, res) => {
  handleValidationErrors(req);
  const { token, newPassword } = req.body;

  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: {
        gte: new Date(),
      },
    },
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired reset token." });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  res.json({ message: "Password updated successfully." });
});

module.exports = {
  getCurrentUser,
  logInUser,
  logOutUser,
  refreshToken,
  forgotPassword,
  getResetPasswordUser,
  resetPassword,
};
