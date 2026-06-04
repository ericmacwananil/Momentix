// /routes-authRoutes.js
const express = require("express");
const router = express.Router();
const { registerUser, loginUser, logoutUser, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

// Protected route (need to be logged in)
router.get("/me", protect, getMe);

module.exports = router;