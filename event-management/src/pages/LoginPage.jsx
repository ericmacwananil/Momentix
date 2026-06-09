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
    // ✅ min-h instead of h, removed overflow-hidden, added py for breathing room
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm p-6 bg-white shadow-lg rounded-2xl sm:p-8">

        {/* Logo */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 mx-auto mb-3 text-white shadow-md rounded-2xl bg-gradient-to-br from-orange-500 via-amber-400 to-pink-500">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l2.3 5.2L20 10.5l-5.7 2.1L12 18l-2.3-5.4L4 10.5l5.7-2.3L12 3z" />
              <path d="M18.5 3.5l.7 1.8L21 6l-1.8.7-.7 1.8-.7-1.8L16 6l1.8-.7.7-1.8z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-800">Welcome Back</h1>
          <p className="mt-1 text-sm text-gray-500">Login to Momentix</p>
        </div>

        <div className="flex items-center gap-2 mb-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs font-medium text-gray-400">OR LOGIN</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-2.5 mb-4 text-xs sm:text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            {/* ✅ Bumped labels from text-[10px] to text-xs — readable on mobile */}
            <label className="block mb-1 text-xs font-semibold text-gray-700">Email Address</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-sm transition"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="block mb-1 text-xs font-semibold text-gray-700">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-sm transition"
              placeholder="Enter your password"
            />
          </div>

          <Button type="submit" disabled={loading} variant="primary" size="full">
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <p className="mt-4 text-xs text-center text-gray-500 sm:text-sm">
          No account yet?{" "}
          <Link to="/register" className="font-semibold text-orange-500 hover:underline">Sign up free</Link>
        </p>
      </div>
    </div>
  );
}