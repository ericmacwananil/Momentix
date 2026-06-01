const express = require("express");
const router = express.Router();
const {
  createBooking, getMyBookings, getAssignedBookings,
  getAllBookings, updateBookingStatus, cancelBooking
} = require("../controllers/bookingController");
// const { protect, adminOnly, teamOnly } = require("../middleware/authMiddleware");

// Booking routes — auth not required for now (using localStorage on frontend)
router.post("/", createBooking);                     // Customer: create booking
// Support both POST (frontend uses POST with body) and GET variants for compatibility
router.post("/my-bookings", getMyBookings);         // Customer: see own bookings (POST)
router.get("/my-bookings", getMyBookings);          // Customer: see own bookings (GET)
router.post("/my-tasks", getAssignedBookings);      // Team: see assigned tasks (POST)
router.get("/my-tasks", getAssignedBookings);       // Team: see assigned tasks (GET)
router.get("/all", getAllBookings);                 // Admin: see all bookings
router.get("/", getAllBookings);                    // Admin: alias - GET /bookings
router.put("/:id/status", updateBookingStatus);    // Admin: update status
router.put("/:id/cancel", cancelBooking);          // Customer/Admin: cancel

module.exports = router;