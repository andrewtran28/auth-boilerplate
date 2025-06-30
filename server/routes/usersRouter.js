const { Router } = require("express");
const usersRouter = Router();
const usersController = require("../controllers/usersController");
const { signupValidator, changePassValidator } = require("../utils/validator");
const { authenticateToken } = require("../utils/authMiddleware");

//User Routing
usersRouter.get("/", authenticateToken, usersController.getUserInfo);
usersRouter.post("/", signupValidator, usersController.createUser);
usersRouter.put("/", authenticateToken, changePassValidator, usersController.changePassword);
usersRouter.delete("/", authenticateToken, usersController.deleteUser);

module.exports = usersRouter;
