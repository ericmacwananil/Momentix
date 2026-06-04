// src/pages/RegisterPage.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";

const ROLE_OPTIONS = [
  { id: "customer", label: "Customer" },
  { id: "admin",    label: "Admin"    },
  { id: "team_member", label: "Team" },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [selectedRole, setSelectedRole] = useState("customer");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError("Passwords do not match"); return; }
    const result = await register(form.name, form.email, form.password, form.phone, selectedRole);
    if (result.success) {
      if (result.user.role === "admin") navigate("/admin");
      else if (result.user.role === "team_member") navigate("/team");
      else navigate("/dashboard");
    } else setError(result.error);
  };

  return (
    <div className="h-[calc(100vh-64px)] bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center px-4 overflow-hidden">
      <div className="w-full max-w-sm px-5 py-4 bg-white shadow-lg rounded-2xl">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-white shadow-md rounded-xl bg-gradient-to-br from-orange-500 via-amber-400 to-pink-500">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l2.3 5.2L20 10.5l-5.7 2.1L12 18l-2.3-5.4L4 10.5l5.7-2.3L12 3z" />
              <path d="M18.5 3.5l.7 1.8L21 6l-1.8.7-.7 1.8-.7-1.8L16 6l1.8-.7.7-1.8z" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold leading-none text-gray-800">Create Account</h1>
            <p className="text-gray-400 text-[11px] leading-none mt-0.5">Join Momentix</p>
          </div>
        </div>

        {/* Role Selection */}
        <div className="mb-3">
          <label className="block text-[11px] font-semibold text-gray-600 mb-1.5">Select Role</label>
          <div className="grid grid-cols-3 gap-1.5">
            {ROLE_OPTIONS.map((role) => (
              <label key={role.id} className="cursor-pointer">
                <input type="radio" name="role" value={role.id} checked={selectedRole === role.id} onChange={() => setSelectedRole(role.id)} className="sr-only" />
                <div className={`rounded-lg border-2 py-1.5 text-center transition ${selectedRole === role.id ? "border-orange-500 bg-orange-50 text-orange-700" : "border-gray-200 text-gray-500 hover:border-orange-200"}`}>
                  <p className="font-semibold text-[11px]">{role.label}</p>
                </div>
              </label>
            ))}
          </div>
          {selectedRole === "admin" && (
            <p className="text-[10px] text-gray-500 bg-blue-50 rounded-lg px-2 py-1 mt-1">
              Already admin? <Link to="/login" className="font-semibold text-orange-500">Login</Link>
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-2.5 py-1.5 mb-2 text-[11px]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-1.5">
          {[
            { key: "name",     label: "Full Name",       type: "text",     placeholder: "Rahul Sharma"    },
            { key: "email",    label: "Email",            type: "email",    placeholder: "rahul@email.com" },
            { key: "phone",    label: "Phone",            type: "tel",      placeholder: "9876543210"      },
            { key: "password", label: "Password",         type: "password", placeholder: "Min 6 characters" },
            { key: "confirm",  label: "Confirm Password", type: "password", placeholder: "Re-enter password" },
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-[10px] font-medium text-gray-600 mb-0.5">{field.label}</label>
              <input
                type={field.type}
                required
                value={form[field.key]}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                placeholder={field.placeholder}
                className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100 text-xs transition"
              />
            </div>
          ))}

          <button
            type="submit"
            className="w-full py-2 mt-1 text-sm font-semibold text-white transition bg-orange-500 rounded-lg hover:bg-orange-600"
          >
            Create Account
          </button>
        </form>

        <p className="text-center text-gray-400 mt-2 text-[10px]">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-orange-500 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}