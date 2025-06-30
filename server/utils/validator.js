const { body } = require("express-validator");
const { validationResult } = require("express-validator");
const CustomError = require("./customError");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const signupValidator = [
  body("username")
    .trim()
    .custom(async (newUser) => {
      const users = await prisma.user.findUnique({
        where: { username: newUser },
      });

      if (users) {
        throw new Error("Username already exists.");
      }
    })
    .isAlphanumeric()
    .withMessage("Username must only contain letters or numbers.")
    .bail()
    .isLength({ min: 1, max: 25 })
    .withMessage("Username must be between 1-25 characters.")
    .bail(),
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please enter a valid email address.")
    .custom(async (newEmail) => {
      const emails = await prisma.user.findUnique({
        where: { email: newEmail },
      });

      if (emails) {
        throw new Error("Email already exists.");
      }
    })
    .bail(),
  body("firstName")
    .trim()
    .isAlpha()
    .withMessage("First name must only contain letters.")
    .bail()
    .isLength({ min: 1, max: 30 }),
  body("lastName")
    .trim()
    .isAlpha()
    .withMessage("Last name must only contain letters.")
    .bail()
    .isLength({ min: 1, max: 30 }),
  body("password").trim().isLength({ min: 6, max: 50 }).withMessage("Password must be between 6-50 characters.").bail(),
  body("confirmPassword")
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match.");
      }
      return true;
    }),
];

const changePassValidator = [
  body("newPassword")
    .trim()
    .isLength({ min: 6, max: 50 })
    .withMessage("New password must be between 6-50 characters.")
    .bail(),
  body("confirmPassword")
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("New passwords do not match.");
      }
      return true;
    }),
];

//Helper function for any API route that requires validator.
const handleValidationErrors = (req) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const errorMessages = result.errors.map((err) => (err.param ? `${err.msg} (${err.param})` : err.msg));
    const error = new CustomError(400, "Validation failed");
    error.details = errorMessages;
    throw error;
  }
};

module.exports = {
  signupValidator,
  changePassValidator,
  handleValidationErrors,
};
