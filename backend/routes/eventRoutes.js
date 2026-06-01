const express = require("express");
const router = express.Router();
const {
  getAllEvents, getEventById, createEvent, updateEvent, deleteEvent
} = require("../controllers/eventController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Public routes (anyone can view events)
router.get("/", getAllEvents);
router.get("/:id", getEventById);

// Admin only routes (must be logged in AND be admin)
router.post("/", protect, adminOnly, createEvent);
router.put("/:id", protect, adminOnly, updateEvent);
router.delete("/:id", protect, adminOnly, deleteEvent);

module.exports = router;