// src/components/AdminShell.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "./Button";

export default function AdminShell({ title, subtitle, children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navItems = [
    { to: "/admin", label: "Active / Running Events" },
    { to: "/admin/team", label: "Team Members" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-white/10 bg-slate-950/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-orange-300 font-semibold">Admin Console</p>
            <h1 className="text-2xl md:text-3xl font-bold mt-1">{title}</h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">{subtitle}</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline-flex items-center gap-2 rounded-full bg-white/8 px-3 py-2 text-sm text-slate-200 border border-white/10">
              👤 {user?.name?.split(" ")[0] || "Admin"}
            </span>
            <Button onClick={handleLogout} variant="danger">Logout</Button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 pb-4">
          <div className="flex flex-wrap gap-2">
            {navItems.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`btn-standard px-4 py-2 rounded-full text-sm ${active ? "btn-primary" : "btn-outline"}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        {children}
      </main>
    </div>
  );
}
