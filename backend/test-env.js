// test-env.js
require("dotenv").config();

console.log("Environment variables:");
console.log("MONGO_URI:", process.env.MONGO_URI ? "set" : "not set");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "set" : "not set");
console.log("RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID ? "set" : "not set");
console.log("RAZORPAY_KEY_SECRET:", process.env.RAZORPAY_KEY_SECRET ? "set" : "not set");
console.log("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME ? "set" : "not set");
console.log("CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY ? "set" : "not set");
console.log("CLOUDINARY_API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "set" : "not set");