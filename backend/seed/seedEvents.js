// seed/seedEvents.js
// Run this file ONCE to add sample events to MongoDB
// Command: node seed/seedEvents.js

const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Event = require("../models/Event");
const User = require("../models/User");

dotenv.config({ path: "../.env" }); // Load .env from parent folder

const sampleEvents = [
  {
    title: "Premium Birthday Balloon Decor",
    eventType: "birthday",
    description: "Transform any space into a magical birthday paradise. Includes 200+ balloons, LED lights, personalized banner, and flower arrangements.",
    price: 4999,
    rating: 4.8,
    reviewCount: 124,
    features: ["200+ Balloons", "LED Lights", "Custom Banner", "Flower Arch", "Photo Backdrop"],
    duration: "3-4 hours",
    teamSize: 3,
    availability: true,
  },
  {
    title: "Royal Wedding Stage Decor",
    eventType: "wedding",
    description: "Luxury wedding decoration with royal mandap, floral stage, LED lighting, and premium draping.",
    price: 49999,
    rating: 4.9,
    reviewCount: 87,
    features: ["Royal Mandap", "Floral Stage", "LED Lighting", "Premium Draping", "Flower Shower"],
    duration: "1 day",
    teamSize: 8,
    availability: true,
  },
  {
    title: "Corporate Event Setup",
    eventType: "corporate",
    description: "Professional corporate event decoration with stage, backdrop, branding elements, and premium seating.",
    price: 24999,
    rating: 4.7,
    reviewCount: 56,
    features: ["Stage Setup", "Branded Backdrop", "Premium Seating", "AV Support", "Registration Desk"],
    duration: "Half day",
    teamSize: 5,
    availability: true,
  },
  {
    title: "Anniversary Gold Theme Decor",
    eventType: "wedding",
    description: "Elegant gold and white anniversary decoration with floral centerpieces and candle lighting.",
    price: 12999,
    rating: 4.8,
    reviewCount: 91,
    features: ["Gold Balloon Arch", "Floral Centerpieces", "Candle Lighting", "Table Setup", "Couple Frame"],
    duration: "4-5 hours",
    teamSize: 4,
    availability: true,
  },
  {
    title: "Kids Birthday Party Package",
    eventType: "birthday",
    description: "Super fun kids party with themed decorations, cartoon characters setup, game zone, and colorful balloons.",
    price: 5999,
    rating: 4.9,
    reviewCount: 210,
    features: ["Theme Decorations", "Cartoon Characters", "Game Zone", "Balloon Art", "Birthday Crown"],
    duration: "3-4 hours",
    teamSize: 4,
    availability: true,
  },
];

const sampleUsers = [
  { name: "Admin User",  email: "admin@Momentix.com",  password: "admin123",  role: "admin",       phone: "9000000001" },
  { name: "Priya Team",  email: "team@Momentix.com",   password: "team123",   role: "team_member", phone: "9000000002" },
  { name: "Rahul Sharma",email: "customer@Momentix.com",password: "test123",  role: "customer",    phone: "9876543210" },
];

const seedDB = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Event.deleteMany();
    await User.deleteMany();
    console.log("🗑️  Cleared old data");

    // Insert events
    await Event.insertMany(sampleEvents);
    console.log("✅ Sample events added!");

    // Insert users (passwords will be auto-hashed by the model)
    for (const userData of sampleUsers) {
      await User.create(userData);
    }
    console.log("✅ Sample users added!");
    console.log("\n🎉 Database seeded successfully!");
    console.log("Login credentials:");
    console.log("  Admin:    admin@Momentix.com / admin123");
    console.log("  Team:     team@Momentix.com  / team123");
    console.log("  Customer: customer@Momentix.com / test123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error);
    process.exit(1);
  }
};

seedDB();