// src/pages/RegisterPage.jsx
import { useState } from "react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";

const ROLE_OPTIONS = [
  { id: "customer", label: "Customer", icon: "🧑", desc: "Browse & book events" },
  { id: "admin", label: "Admin", icon: "👑", desc: "Manage bookings" },
  { id: "team_member", label: "Team Member", icon: "🔧", desc: "View assigned tasks" },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [selectedRole, setSelectedRole] = useState("customer");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    const result = await register(form.name, form.email, form.password, form.phone, selectedRole);
    if (result.success) {
      // Redirect based on role
      if (result.user.role === "admin") navigate("/admin");
      else if (result.user.role === "team_member") navigate("/team");
      else navigate("/dashboard");
    }
    else setError(result.error);
  };

  useEffect(() => {
    document.body.classList.add("auth-compact");
    return () => document.body.classList.remove("auth-compact");
  }, []);
  return (
    <div className="min-h-screen md:h-[calc(100vh-64px)] overflow-y-auto md:overflow-hidden bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center px-3 sm:px-4 py-6 md:py-0 auth-compact">
      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 w-full max-w-sm overflow-visible container">
        <div className="text-center mb-4 sm:mb-6">
          <div className="inline-flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-500 via-amber-400 to-pink-500 text-white shadow-md mx-auto mb-2 sm:mb-3">
            <svg viewBox="0 0 24 24" className="h-5 sm:h-6 w-5 sm:w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 3l2.3 5.2L20 10.5l-5.7 2.1L12 18l-2.3-5.4L4 10.5l5.7-2.3L12 3z" />
              <path d="M18.5 3.5l.7 1.8L21 6l-1.8.7-.7 1.8-.7-1.8L16 6l1.8-.7.7-1.8z" />
            </svg>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Create Account</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">Join EventEase and book events</p>
        </div>

        {/* Role Selection */}
        <div className="mb-4 sm:mb-6">
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Select Your Role</label>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {ROLE_OPTIONS.map((role) => (
              <label key={role.id} className="relative">
                <input
                  type="radio"
                  name="role"
                  value={role.id}
                  checked={selectedRole === role.id}
                  onChange={() => setSelectedRole(role.id)}
                  className="sr-only"
                />
                <div className={`rounded-lg border-2 transition p-2 sm:p-3 text-center cursor-pointer ${
                  selectedRole === role.id 
                    ? 'border-orange-500 bg-orange-50' 
                    : 'border-gray-200 bg-white hover:border-orange-200'
                }`}>
                  <div className="text-xl sm:text-2xl mb-1">{role.icon}</div>
                  <p className="font-semibold text-xs sm:text-sm text-gray-800">{role.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{role.desc}</p>
                </div>
              </label>
            ))}
          </div>

          {selectedRole === 'admin' && (
            <div className="mt-2 sm:mt-3 text-xs text-gray-600 bg-blue-50 rounded-lg p-2 sm:p-3">
              Already an admin? <a href="/login" className="text-orange-500 font-semibold">Login here</a>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4 text-xs sm:text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-3">
          {[
            { key: "name", label: "Full Name", type: "text", placeholder: "Rahul Sharma" },
            { key: "email", label: "Email", type: "email", placeholder: "rahul@email.com" },
            { key: "phone", label: "Phone Number", type: "tel", placeholder: "9876543210" },
            { key: "password", label: "Password", type: "password", placeholder: "Min 6 characters" },
            { key: "confirm", label: "Confirm Password", type: "password", placeholder: "Re-enter password" },
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">{field.label}</label>
              <input
                type={field.type}
                required
                value={form[field.key]}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                placeholder={field.placeholder}
                className="w-full border border-gray-300 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 outline-none focus:border-orange-400 text-sm"
              />
            </div>
          ))}

          <Button type="submit" variant="primary" size="full" className="mt-3 sm:mt-4">Create Account</Button>
        </form>

        <p className="text-center text-gray-500 mt-3 sm:mt-4 text-xs sm:text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-orange-500 font-semibold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}