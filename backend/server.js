// backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const paymentRoutes = require("./routes/paymentRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

// Connect to DB
connectDB();

const app = express();

// Simple request logger to help debug frontend/backend connectivity
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} from origin ${req.headers.origin}`);
  next();
});

// CORS configuration - allow all origins for debugging (we can restrict later)
app.use(cors({ 
  origin: true,
  credentials: true 
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/auth",     require("./routes/authRoutes"));
app.use("/api/events",   require("./routes/eventRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/users",    require("./routes/userRoutes"));
app.use("/api/payments", paymentRoutes);
app.use("/api/upload",   uploadRoutes);

// Health check
app.get("/api", (req, res) => res.json({ 
  message: "🎉 Momentix API is running!",
  hasJwtSecret: !!process.env.JWT_SECRET,
  hasMongoUri: !!process.env.MONGO_URI,
  hasCloudinary: !!process.env.CLOUDINARY_CLOUD_NAME,
  hasRazorpay: !!process.env.RAZORPAY_KEY_ID
}));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);
  res.status(500).json({ message: "Something went wrong!", error: err.message });
});

// 404 handler
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));// Last updated: Tue Jun  9 16:47:05 IST 2026
