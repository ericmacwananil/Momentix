import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import sleep from "../utils/sleep";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isNumeric = /^\d+$/.test(identifier.trim());

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedId = identifier.trim();
    if (!trimmedId) {
      setError("Please enter your email address or 10-digit mobile number");
      return;
    }

    // Mobile number validation (if numbers entered)
    if (/^\d+$/.test(trimmedId)) {
      if (trimmedId.length !== 10) {
        setError("Mobile number must be exactly 10 digits (e.g. 9876543210)");
        return;
      }
    } else if (!trimmedId.includes("@")) {
      setError("Please enter a valid email address or 10-digit mobile number");
      return;
    }

    // Password validation: must be at least 6 characters
    if (password.length < 6) {
      setError("Password must be at least 6 characters or digits");
      return;
    }

    setLoading(true);
    const start = Date.now();
    const result = await login(trimmedId, password);
    const elapsed = Date.now() - start;
    if (elapsed < 600) await sleep(600 - elapsed);
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
          <span className="text-xs font-medium text-gray-400">LOGIN WITH EMAIL OR MOBILE</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Error notification */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-2.5 mb-4 text-xs sm:text-sm">
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-gray-700">Email or Mobile Number</label>
              {isNumeric && (
                <span
                  className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
                    identifier.trim().length === 10
                      ? "bg-green-100 text-green-700 font-semibold"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {identifier.trim().length}/10 digits
                </span>
              )}
            </div>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-sm transition"
              placeholder="rahul@email.com or 9876543210"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-gray-700">Password</label>
              <span
                className={`text-[11px] px-1.5 py-0.5 rounded ${
                  password.length >= 6
                    ? "bg-green-100 text-green-700 font-semibold"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {password.length >= 6 ? "✓ Min 6 met" : `${password.length}/6 min`}
              </span>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-lg pl-3 pr-10 py-2.5 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-sm transition"
                placeholder="Enter password (min 6 characters)"
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