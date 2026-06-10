// test-razorpay.js
require("dotenv").config();
const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function testCreateOrder() {
  try {
    const options = {
      amount: 500 * 100, // ₹500 in paise
      currency: "INR",
      receipt: `receipt_test_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    console.log("✅ Order created successfully:", order.id);
    console.log(order);
  } catch (err) {
    console.error("❌ Error creating order:", err);
  }
}

testCreateOrder();