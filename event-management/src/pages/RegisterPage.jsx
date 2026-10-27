// src/pages/RegisterPage.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ROLE_OPTIONS = [
  { id: "customer", label: "Customer" },
  { id: "admin", label: "Admin" },
  { id: "team_member", label: "Team" },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [selectedRole, setSelectedRole] = useState("customer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handlePhoneChange = (e) => {
    // Keep only numbers and max 10 digits
    const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
    setForm((prev) => ({ ...prev, phone: digitsOnly }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate Name
    if (!form.name.trim()) {
      setError("Please enter your full name");
      return;
    }

    // Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      setError("Please enter a valid email address");
      return;
    }

    // Validate Phone: must be exactly 10 digits
    const cleanPhone = form.phone.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      setError("Mobile number must be exactly 10 digits (e.g. 9876543210)");
      return;
    }

    // Validate Password: must be at least 6 digits/characters
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters or digits");
      return;
    }

    // Validate Confirm Password
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    const result = await register(
      form.name.trim(),
      form.email.trim(),
      form.password,
      cleanPhone,
      selectedRole
    );
    setLoading(false);

    if (result.success) {
      if (result.user.role === "admin") navigate("/admin");
      else if (result.user.role === "team_member") navigate("/team");
      else navigate("/dashboard");
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm p-6 bg-white shadow-lg rounded-2xl sm:p-8">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-5">
          <div className="inline-flex items-center justify-center flex-shrink-0 w-10 h-10 text-white shadow-md rounded-xl bg-gradient-to-br from-orange-500 via-amber-400 to-pink-500">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l2.3 5.2L20 10.5l-5.7 2.1L12 18l-2.3-5.4L4 10.5l5.7-2.3L12 3z" />
              <path d="M18.5 3.5l.7 1.8L21 6l-1.8.7-.7 1.8-.7-1.8L16 6l1.8-.7.7-1.8z" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold leading-none text-gray-800 sm:text-lg">Create Account</h1>
            <p className="text-gray-400 text-xs leading-none mt-0.5">Join Momentix</p>
          </div>
        </div>

        {/* Role Selection */}
        <div className="mb-4">
          <label className="block mb-2 text-xs font-semibold text-gray-600">Select Role</label>
          <div className="grid grid-cols-3 gap-2">
            {ROLE_OPTIONS.map((role) => (
              <label key={role.id} className="cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value={role.id}
                  checked={selectedRole === role.id}
                  onChange={() => setSelectedRole(role.id)}
                  className="sr-only"
                />
                <div
                  className={`rounded-lg border-2 py-2 text-center transition ${
                    selectedRole === role.id
                      ? "border-orange-500 bg-orange-50 text-orange-700 font-bold"
                      : "border-gray-200 text-gray-500 hover:border-orange-200"
                  }`}
                >
                  <p className="text-xs font-semibold">{role.label}</p>
                </div>
              </label>
            ))}
          </div>
          {selectedRole === "admin" && (
            <p className="text-xs text-gray-500 bg-blue-50 rounded-lg px-2.5 py-1.5 mt-2">
              Already admin? <Link to="/login" className="font-semibold text-orange-500">Login</Link>
            </p>
          )}
        </div>

        {/* Error Notification */}
        {error && (
          <div className="px-3 py-2.5 mb-3 text-xs text-red-700 border border-red-200 rounded-lg bg-red-50 sm:text-sm">
            <div className="flex items-start gap-1.5">
              <span className="text-red-500 font-bold">⚠️</span>
              <div className="flex-1 leading-snug">
                <span>{error}</span>
                {error.includes("Network Error") && (
                  <p className="mt-1 text-[11px] text-red-600 font-normal">
                    Tip: If visiting the Vercel deployment, ensure your backend service is deployed and <code className="font-mono bg-red-100 px-1 rounded">VITE_API_BASE_URL</code> is set in Vercel settings.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Full Name */}
          <div>
            <label className="block mb-1 text-xs font-semibold text-gray-600">Full Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Rahul Sharma"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-sm transition"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block mb-1 text-xs font-semibold text-gray-600">Email Address</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="rahul@email.com"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-sm transition"
            />
          </div>

          {/* Mobile Number (10 digits) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-gray-600">
                Mobile Number <span className="text-orange-600 font-bold">*</span>
              </label>
              <span
                className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
                  form.phone.length === 10
                    ? "bg-green-100 text-green-700 font-semibold"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {form.phone.length}/10 digits
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-gray-400 font-semibold select-none">
                +91
              </span>
              <input
                type="tel"
                inputMode="numeric"
                required
                maxLength={10}
                value={form.phone}
                onChange={handlePhoneChange}
                placeholder="9876543210"
                className={`w-full border rounded-lg pl-11 pr-3 py-2.5 outline-none text-sm transition font-mono ${
                  form.phone.length === 10
                    ? "border-green-400 focus:ring-2 focus:ring-green-100"
                    : "border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                }`}
              />
            </div>
            <p className="mt-1 text-[11px] text-gray-400">
              Enter 10-digit mobile number without country code
            </p>
          </div>

          {/* Password (min 6 characters) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-gray-600">
                Password <span className="text-orange-600 font-bold">*</span>
              </label>
              <span
                className={`text-[11px] px-1.5 py-0.5 rounded ${
                  form.password.length >= 6
                    ? "bg-green-100 text-green-700 font-semibold"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {form.password.length >= 6 ? "✓ Min 6 met" : `${form.password.length}/6 min`}
              </span>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Min 6 characters or digits"
                className="w-full border border-gray-200 rounded-lg pl-3 pr-10 py-2.5 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-sm transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 text-xs font-medium focus:outline-none"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block mb-1 text-xs font-semibold text-gray-600">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                required
                minLength={6}
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                placeholder="Re-enter password"
                className="w-full border border-gray-200 rounded-lg pl-3 pr-10 py-2.5 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-sm transition"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 text-xs font-medium focus:outline-none"
              >
                {showConfirm ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 mt-2 text-sm font-semibold text-white transition bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 shadow-sm"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-4 text-xs text-center text-gray-400 sm:text-sm">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-orange-500 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}