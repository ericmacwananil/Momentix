/* =====================================================
   backend/controllers/authController.js
   ===================================================== */
const User = require("../models/User");
const jwt  = require("jsonwebtoken");

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const sendToken = (user, code, res) => {
  const token = generateToken(user._id);
  const isProd = process.env.NODE_ENV === "production";
  res.status(code)
    .cookie("token", token, {
      httpOnly: true,
      secure: isProd,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: isProd ? "none" : "lax",
    })
    .json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
    });
};

const registerUser = async (req, res) => {
  try {
    console.log("[auth] register request payload:", { ...req.body, password: req.body.password ? "***" : "" });
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: "Please provide all required fields: name, email, phone, and password" });
    }

    const cleanPhone = phone.toString().replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ message: "Mobile number must be exactly 10 digits" });
    }

    if (typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingEmail = await User.findOne({ email: cleanEmail });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const existingPhone = await User.findOne({ phone: cleanPhone });
    if (existingPhone) {
      return res.status(400).json({ message: "Mobile number already registered" });
    }

    // Only accept a known role value; fallback to customer
    const allowedRoles = ["customer", "admin", "team_member"];
    const roleToSet = allowedRoles.includes(role) ? role : "customer";

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      phone: cleanPhone,
      role: roleToSet
    });

    sendToken(user, 201, res);
  } catch (e) {
    console.error("[auth] register error:", e && e.stack ? e.stack : e);
    if (e && e.name === "ValidationError") {
      return res.status(400).json({ message: e.message });
    }
    res.status(500).json({ message: e.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, phone, identifier, password } = req.body;
    const loginIdentifier = (email || phone || identifier || "").trim();

    if (!loginIdentifier || !password) {
      return res.status(400).json({ message: "Please provide email/mobile and password" });
    }

    if (typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const isNumeric = /^\d+$/.test(loginIdentifier);
    let query;

    if (isNumeric) {
      const cleanPhone = loginIdentifier.replace(/\D/g, "");
      if (cleanPhone.length !== 10) {
        return res.status(400).json({ message: "Mobile number must be exactly 10 digits" });
      }
      query = { phone: cleanPhone };
    } else {
      query = { email: loginIdentifier.toLowerCase() };
    }

    const user = await User.findOne(query).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email/mobile or password" });
    }

    sendToken(user, 200, res);
  } catch (e) {
    console.error("[auth] login error:", e);
    res.status(500).json({ message: e.message });
  }
};

const logoutUser = (req, res) => {
  res.cookie("token", "", { httpOnly: true, expires: new Date(0) })
     .json({ success: true, message: "Logged out" });
};

const getMe = async (req, res) => res.json({ success: true, user: req.user });

module.exports = { registerUser, loginUser, logoutUser, getMe };