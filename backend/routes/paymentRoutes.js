const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const razorpay = require("../utils/razorpay");
const Booking = require("../models/Booking");


// 1. Create Order
router.post("/create-order", async (req, res) => {
  const { amount } = req.body; // amount in INR (e.g. 5000 = ₹5000)

  const options = {
    amount: amount * 100, // Razorpay expects paise
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json({ success: true, order });
  } catch (err) {
    console.error("Error creating Razorpay order:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. Verify Payment
router.post("/verify", async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    // ✅ Payment is genuine — update booking status in DB
    if (bookingId) {
      try {
        await Booking.findByIdAndUpdate(bookingId, {
          paymentId: razorpay_payment_id,
          paymentStatus: "paid",
          status: "confirmed"
        });
      } catch (err) {
        console.error("Error updating booking payment status:", err);
      }
    }
    res.json({ success: true, message: "Payment verified" });
  } else {
    res.status(400).json({ success: false, message: "Invalid signature" });
  }
});

module.exports = router;