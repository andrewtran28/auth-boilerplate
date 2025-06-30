const bcrypt = require("bcrypt");
const asyncHandler = require("express-async-handler");
const CustomError = require("../utils/customError");
const { handleValidationErrors } = require("../utils/validator");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getUserInfo = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      username: true,
    },
  });

  if (!user) {
    throw new CustomError(404, "User could not be found or does not exist.");
  }

  return res.status(200).json(user);
});

const createUser = asyncHandler(async (req, res) => {
  handleValidationErrors(req);

  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  await prisma.user.create({
    data: {
      username: req.body.username,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hashedPassword,
      isAdmin: Boolean(req.body.isAdmin).valueOf(), //ensures value is boolean
    },
  });

  res.status(201).json({ message: "User successfully created." });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!req.user || !currentPassword || !newPassword) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) {
    return res.status(401).json({ message: "Current password is incorrect." });
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: req.user.id },
    data: { password: hashedNewPassword },
  });

  res.status(200).json({ message: "Password updated successfully." });
});

const deleteUser = asyncHandler(async (req, res) => {
  const { password } = req.body;
  if (!req.user || !password) {
    return res.status(400).json({ message: "Password is required." });
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) {
    console.error("User not found, ID: ", req.user.username);
    throw new CustomError(404, "User not found.");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    console.error("User deletion failed: Incorrect password for user:", req.user.username);
    return res.status(404).json({ message: "Incorrect password." });
  }

  await prisma.user.delete({
    where: { id: req.user.id },
  });

  res.status(200).json({ message: "User successfully deleted." });
});

module.exports = {
  getUserInfo,
  createUser,
  changePassword,
  deleteUser,
};
