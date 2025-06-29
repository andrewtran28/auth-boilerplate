const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
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
      sameSite: "Lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 60 * 1000, // 30 min
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "Lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
    .status(200)
    .json({ success: true, message: "Logged in" });
});

//Clears the token
const logOutUser = (req, res) => {
  res.clearCookie("token").clearCookie("refreshToken").json({ success: true, message: "Logged out" });
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
      sameSite: "Lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60 * 1000, // 30 min
    });

    res.status(200).json({ success: true, message: "Token refreshed" });
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired refresh token" });
  }
});

module.exports = {
  getCurrentUser,
  logInUser,
  logOutUser,
  refreshToken,
};
