const mongoose = require("mongoose");
 
const eventSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  eventType:   { type: String, required: true, enum: ["birthday","wedding","corporate","other"] },
  description: { type: String, required: true },
  price:       { type: Number, required: true },
  images:      { type: [String], default: [] },
  features:    { type: [String], default: [] },
  rating:      { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  duration:    { type: String, default: "3-4 hours" },
  teamSize:    { type: Number, default: 2 },
  availability:{ type: Boolean, default: true },
}, { timestamps: true });
 
module.exports = mongoose.model("Event", eventSchema);
