const mongoose = require("mongoose");
const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: false,
    },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    eventDate: { type: Date, required: true },
    venueAddress: { type: String, required: true },
    notes: { type: String, default: "" },
    remarks: { type: String, default: "" },
    price: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "assigned", "completed", "cancelled"],
      default: "pending",
    },
    cancelledBy: { type: String, default: "" },
    assignedMember: { type: String, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Booking", bookingSchema);
