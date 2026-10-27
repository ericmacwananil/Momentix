// backend/config/db.js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI not set in environment");
    }
    console.log("⏳ Attempting to connect to MongoDB...");
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    console.log(`⚠️  To fix: Check MONGO_URI in backend/.env, ensure the Atlas cluster is active and your IP (or 0.0.0.0/0) is allowed.`);
  }
};

module.exports = connectDB;