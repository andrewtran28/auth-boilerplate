require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("node:path");

const authRouter = require("./routes/authRouter");
const usersRouter = require("./routes/usersRouter");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.FRONTEND_URL, methods: ["GET", "POST", "PUT", "DELETE"], credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

//Routes
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);

//Global error handling middleware
app.use((err, req, res, next) => {
  // Remove the following sensitive data from req.body
  const { password, confirmPassword, newPassword, currentPassword, email, ...safeBody } = req.body || {};

  console.error(`ERROR: ${req.method} ${req.url}`, {
    user: req.user ? req.user.username : "Unauthenticated user",
    body: safeBody,
    error: err.stack,
  });

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error",
    errors: err.details || null,
  });
});

//Start Express server
app.listen(PORT, () => {
  console.log(`Server running on: http://localhost:${PORT}`);
});
