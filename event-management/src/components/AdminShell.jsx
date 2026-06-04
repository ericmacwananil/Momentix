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
    { to: "/admin",         label: "Active / Running Events" },
    { to: "/admin/team",    label: "Team Members"            },
    { to: "/admin/events",  label: "Manage Events"           },
  ];

  return (
    <div className="min-h-screen text-white bg-slate-950">
      {/* Top header */}
      <div className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/90 backdrop-blur">
        <div className="flex flex-col gap-4 px-4 py-4 mx-auto max-w-7xl lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-orange-300 font-semibold">Admin Console</p>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl">{title}</h1>
            <p className="max-w-2xl mt-1 text-sm text-slate-300">{subtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="items-center hidden gap-2 px-3 py-2 text-sm border rounded-full md:inline-flex bg-white/8 text-slate-200 border-white/10">
              👤 {user?.name?.split(" ")[0] || "Admin"}
            </span>
            <Button onClick={handleLogout} variant="danger">Logout</Button>
          </div>
        </div>

        {/* Nav tabs */}
        <div className="px-4 pb-4 mx-auto max-w-7xl">
          <div className="flex flex-wrap gap-2">
            {navItems.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                    active
                      ? "bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/30"
                      : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <main className="px-4 py-6 mx-auto max-w-7xl md:py-8">
        {children}
      </main>
    </div>
  );
}