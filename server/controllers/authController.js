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

  const user = await prisma.user.findUnique({
    where: { username: username },
  });
  if (!user) {
    console.error(`Login failed: User does not exist (${username})`);
    return res.status(401).json({ message: "Invalid username or password." });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    console.error(`Login failed: Invalid password for user (${username})`);
    return res.status(401).json({ message: "Invalid username or password." });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Send both tokens in cookies
  res
    .cookie("token", accessToken, {
      httpOnly: true,
      sameSite: "Lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60 * 1000, // 15 min
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
  res.clearCookie("token").res.clearCookie("refreshToken").json({ success: true, message: "Logged out" });
};

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
