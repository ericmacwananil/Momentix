// backend/config/db.js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI not set in environment");
    }
    console.log("⏳ Attempting to connect to MongoDB...");
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    console.error(error.stack);
    console.log(`⚠️  Running with mock data fallback. To fix, verify MONGO_URI in backend/.env and allow your IP in Atlas network access.`);
  }
};

module.exports = connectDB;