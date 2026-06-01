// src/components/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import { MdStar } from "react-icons/md";
import Button from "./Button";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  if (location.pathname.startsWith("/admin")) return null;

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate("/");
  };

  // Show correct dashboard link based on role
  const getDashboardLink = () => {
    if (!user) return null;
    if (user.role === "admin") return { href: "/admin", label: "Admin Panel" };
    if (user.role === "team_member") return { href: "/team", label: "My Tasks" };
    return { href: "/dashboard", label: "My Bookings" };
  };

  const dashLink = getDashboardLink();

  const isTeamMember = user && user.role === "team_member";

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        {!isTeamMember ? (
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-orange-500 tracking-tight">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-amber-400 to-pink-500 text-white shadow-md shadow-orange-200">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3l2.3 5.2L20 10.5l-5.7 2.1L12 18l-2.3-5.4L4 10.5l5.7-2.3L12 3z" />
                <path d="M18.5 3.5l.7 1.8L21 6l-1.8.7-.7 1.8-.7-1.8L16 6l1.8-.7.7-1.8z" />
              </svg>
            </span>
            <span>EventEase</span>
          </Link>
        ) : (
          <div className="flex items-center gap-2 text-2xl font-bold text-orange-500 tracking-tight">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-amber-400 to-pink-500 text-white shadow-md shadow-orange-200">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3l2.3 5.2L20 10.5l-5.7 2.1L12 18l-2.3-5.4L4 10.5l5.7-2.3L12 3z" />
                <path d="M18.5 3.5l.7 1.8L21 6l-1.8.7-.7 1.8-.7-1.8L16 6l1.8-.7.7-1.8z" />
              </svg>
            </span>
            <span>EventEase</span>
          </div>
        )}

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6 text-gray-700 font-medium">
          {!isTeamMember && (
            <>
              <Link to="/" className="hover:text-orange-500 transition">Home</Link>
              <Link to="/events" className="hover:text-orange-500 transition">Services</Link>
            </>
          )}
          {dashLink && (
            <Link to={dashLink.href} className="hover:text-orange-500 transition">
              {dashLink.label}
            </Link>
          )}
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <MdStar className="text-orange-500 text-lg" />
              <span className="text-gray-600 text-sm">{user.name.split(" ")[0]}</span>
              <Button onClick={handleLogout} variant="primary" size="md">Logout</Button>
            </div>
          ) : (
            <>
              <Link to="/login" className="text-gray-700 font-medium hover:text-orange-500">Login</Link>
              <Button to="/register" variant="primary" size="md">Sign Up</Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-2xl" variant="secondary">{menuOpen ? "✕" : "☰"}</Button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white px-4 pb-4 border-t flex flex-col gap-3">
          {!isTeamMember && (
            <>
              <Link to="/" onClick={() => setMenuOpen(false)} className="text-gray-700 py-2">Home</Link>
              <Link to="/events" onClick={() => setMenuOpen(false)} className="text-gray-700 py-2">Services</Link>
            </>
          )}
          {dashLink && <Link to={dashLink.href} onClick={() => setMenuOpen(false)} className="text-gray-700 py-2">{dashLink.label}</Link>}
          {user ? (
            <Button onClick={handleLogout} variant="logout">Logout</Button>
          ) : (
            <>
              <Link to="/login" className="text-gray-700 font-medium hover:text-orange-500">Login</Link>
              <Button to="/register" variant="primary" size="md">Sign Up</Button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}