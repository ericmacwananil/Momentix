/* =====================================================
   backend/controllers/authController.js
   ===================================================== */
const User = require("../models/User");
const jwt  = require("jsonwebtoken");
 
const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
 
const sendToken = (user, code, res) => {
  const token = generateToken(user._id);
  res.status(code)
    .cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "lax",
    })
    .json({
      success: true, token,
      user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    });
};
 
const registerUser = async (req, res) => {
  try {
    console.log('[auth] register request payload:', req.body);
    const { name, email, password, phone, role } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "Please provide name, email, password" });
    if (password && password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    if (await User.findOne({ email }))
      return res.status(400).json({ message: "Email already registered" });
    // Only accept a known role value; fallback to model default if invalid/absent
    const allowedRoles = ["customer", "admin", "team_member"];
    const roleToSet = allowedRoles.includes(role) ? role : undefined;
    const user = await User.create({ name, email, password, phone, role: roleToSet });
    sendToken(user, 201, res);
  } catch (e) {
    console.error('[auth] register error:', e && e.stack ? e.stack : e);
    // Map mongoose validation errors to 400 so client can show them
    if (e && e.name === 'ValidationError')
      return res.status(400).json({ message: e.message });
    res.status(500).json({ message: e.message });
  }
};
 
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: "Invalid email or password" });
    sendToken(user, 200, res);
  } catch (e) { res.status(500).json({ message: e.message }); }
};
 
const logoutUser = (req, res) => {
  res.cookie("token", "", { httpOnly: true, expires: new Date(0) })
     .json({ success: true, message: "Logged out" });
};
 
const getMe = async (req, res) => res.json({ success: true, user: req.user });
 
module.exports = { registerUser, loginUser, logoutUser, getMe };