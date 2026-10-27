const Razorpay = require("razorpay");

let razorpay = null;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  try {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  } catch (err) {
    console.warn("⚠️ Failed to initialize Razorpay:", err.message);
  }
} else {
  console.warn("⚠️ Razorpay keys missing (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET). Payments disabled until configured in Environment.");
}

module.exports = razorpay;