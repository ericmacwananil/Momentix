// /mojsdels-User.
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6, select: false },
  phone:    { type: String, default: "" },
  role:     { type: String, enum: ["customer","admin","team_member"], default: "customer" },
}, { timestamps: true });

// Use an async pre-save hook without the `next` callback —
// returning a promise is the recommended pattern for modern mongoose.
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});
 
userSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};
 
module.exports = mongoose.model("User", userSchema);
 