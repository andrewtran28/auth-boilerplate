const { Router } = require("express");
const authRouter = Router();
const authController = require("../controllers/authController");
const { changePassValidator } = require("../utils/validator");
const { authenticateToken } = require("../utils/authMiddleware");

authRouter.get("/", authenticateToken, authController.getCurrentUser);
authRouter.post("/", authController.logInUser);
authRouter.delete("/", authenticateToken, authController.logOutUser);
authRouter.post("/refresh", authenticateToken, authController.refreshToken);
authRouter.post("/forgot-password", authController.forgotPassword);
authRouter.get("/reset-password/:token", authController.getResetPasswordUser);
authRouter.post("/reset-password", changePassValidator, authController.resetPassword);

module.exports = authRouter;
