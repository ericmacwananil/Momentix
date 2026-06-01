// src/pages/LoginPage.jsx
import { useState } from "react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import sleep from "../utils/sleep";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.body.classList.add("auth-compact");
    return () => document.body.classList.remove("auth-compact");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const start = Date.now();
    const result = await login(form.email, form.password);
    const elapsed = Date.now() - start;
    if (elapsed < 1000) await sleep(1000 - elapsed);
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
    <div className="min-h-screen md:h-[calc(100vh-64px)] overflow-y-auto md:overflow-hidden bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center px-3 sm:px-4 py-6 md:py-0 auth-compact">
      <div className="w-full max-w-sm container py-2">

        {/* Logo */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="inline-flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-500 via-amber-400 to-pink-500 text-white shadow-md mx-auto mb-2 sm:mb-3">
            <svg viewBox="0 0 24 24" className="h-5 sm:h-6 w-5 sm:w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 3l2.3 5.2L20 10.5l-5.7 2.1L12 18l-2.3-5.4L4 10.5l5.7-2.3L12 3z" />
              <path d="M18.5 3.5l.7 1.8L21 6l-1.8.7-.7 1.8-.7-1.8L16 6l1.8-.7.7-1.8z" />
            </svg>
          </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Welcome Back</h1>
            <p className="text-gray-500 mt-1 text-sm sm:text-base">Login to your EventEase account</p>
        </div>

        {/* Divider */}
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-xs font-medium">OR LOGIN</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* ===== EMAIL / PASSWORD FORM ===== */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4 text-xs sm:text-sm flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-3">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition text-gray-800 text-sm"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition text-gray-800 text-sm"
                placeholder="Enter your password"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              variant="primary"
              size="full"
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-md hover:shadow-orange-200 active:scale-[0.98] mt-3 sm:mt-4"
            >
              {loading ? "Logging in..." : "Login →"}
            </Button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-2">
            No account yet?{" "}
            <Link to="/register" className="text-orange-500 font-semibold hover:underline">
              Sign up free
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}