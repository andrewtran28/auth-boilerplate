require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("node:path");

const authRouter = require("./routes/authRouter");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.FRONTEND_URL, methods: ["GET", "POST", "PUT", "DELETE"], credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

//Routes
app.use("/api/auth", authRouter);

//Global error andling middleware
app.use((err, req, res, next) => {
  console.error(`ERROR: ${req.method} ${req.url}`, {
    user: req.user ? req.user.username : "Unauthenticated user",
    body: req.body,
    error: err.stack,
  });
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

//Start Express server
app.listen(PORT, () => {
  console.log(`Server running on: http://localhost:${PORT}`);
});
