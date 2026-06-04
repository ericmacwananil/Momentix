// src/pages/LoginPage.jsx
import { useState } from "react";
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
    <div className="h-[calc(100vh-64px)] bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center px-3 overflow-hidden">
      <div className="bg-white rounded-2xl shadow-lg p-4 w-full max-w-xs">
        {/* Logo */}
        <div className="text-center mb-4">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-amber-400 to-pink-500 text-white shadow-md mx-auto mb-1">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 3l2.3 5.2L20 10.5l-5.7 2.1L12 18l-2.3-5.4L4 10.5l5.7-2.3L12 3z" />
              <path d="M18.5 3.5l.7 1.8L21 6l-1.8.7-.7 1.8-.7-1.8L16 6l1.8-.7.7-1.8z" />
            </svg>
          </div>
          <h1 className="text-lg font-bold text-gray-800">Welcome Back</h1>
          <p className="text-gray-500 mt-1 text-xs">Login to Momentix</p>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-[10px] font-medium">OR LOGIN</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* ===== EMAIL / PASSWORD FORM ===== */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-1.5 mb-2 text-[10px]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-2">
          <div>
            <label className="block text-[10px] font-medium text-gray-700 mb-0.5">Email Address</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-orange-400 text-xs"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-gray-700 mb-0.5">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-orange-400 text-xs"
              placeholder="Enter your password"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            variant="primary"
            size="full"
            className="mt-1"
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <p className="text-center text-gray-500 text-[10px] mt-2">
          No account yet?{" "}
          <Link to="/register" className="text-orange-500 font-semibold hover:underline">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}