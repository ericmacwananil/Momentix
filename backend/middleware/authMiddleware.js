// middleware/authMiddleware.js
// This function checks if a user is logged in before they can access protected routes

const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect route — user must be logged in
const protect = async (req, res, next) => {
  let token;

  // Check for token in HTTP-only cookie OR Authorization header
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    // Verify the token using our secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database (minus the password field)
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    next(); // Move to the actual route handler
  } catch (error) {
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

// Admin only route
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as admin" });
  }
};

// Team member only route
const teamOnly = (req, res, next) => {
  if (req.user && (req.user.role === "team_member" || req.user.role === "admin")) {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as team member" });
  }
};

module.exports = { protect, adminOnly, teamOnly };