const { Router } = require("express");
const authRouter = Router();
const authController = require("../controllers/authController");
const { authenticateToken } = require("../utils/authMiddleware");

authRouter.get("/", authenticateToken, authController.getCurrentUser);
authRouter.post("/", authController.logInUser);
authRouter.delete("/", authenticateToken, authController.logOutUser);
authRouter.post("/refresh", authenticateToken, authController.refreshToken);

module.exports = authRouter;
