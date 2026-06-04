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
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-md">
      <div className="flex items-center justify-between px-6 py-4 mx-auto max-w-7xl">
        {/* Logo */}
        {!isTeamMember ? (
          <Link to="/" className="flex items-center gap-3 text-3xl font-bold tracking-tight text-orange-500">
            <span className="inline-flex items-center justify-center w-12 h-12 text-white shadow-lg rounded-3xl bg-gradient-to-br from-orange-500 via-amber-400 to-pink-500 shadow-orange-200">
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3l2.3 5.2L20 10.5l-5.7 2.1L12 18l-2.3-5.4L4 10.5l5.7-2.3L12 3z" />
                <path d="M18.5 3.5l.7 1.8L21 6l-1.8.7-.7 1.8-.7-1.8L16 6l1.8-.7.7-1.8z" />
              </svg>
            </span>
            <span>Momentix</span>
          </Link>
        ) : (
          <div className="flex items-center gap-3 text-3xl font-bold tracking-tight text-orange-500">
            <span className="inline-flex items-center justify-center w-12 h-12 text-white shadow-lg rounded-3xl bg-gradient-to-br from-orange-500 via-amber-400 to-pink-500 shadow-orange-200">
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3l2.3 5.2L20 10.5l-5.7 2.1L12 18l-2.3-5.4L4 10.5l5.7-2.3L12 3z" />
                <path d="M18.5 3.5l.7 1.8L21 6l-1.8.7-.7 1.8-.7-1.8L16 6l1.8-.7.7-1.8z" />
              </svg>
            </span>
            <span>Momentix</span>
          </div>
        )}

        {/* Desktop Links */}
        <div className="items-center hidden gap-8 text-lg font-semibold text-gray-700 md:flex">
          {!isTeamMember && (
            <>
              <Link to="/" className="transition hover:text-orange-500">Home</Link>
              <Link to="/events" className="transition hover:text-orange-500">Services</Link>
            </>
          )}
          {dashLink && (
            <Link to={dashLink.href} className="transition hover:text-orange-500">
              {dashLink.label}
            </Link>
          )}
        </div>

        {/* Auth Buttons */}
        <div className="items-center hidden gap-4 md:flex">
          {user ? (
            <div className="flex items-center gap-3">
              <MdStar className="text-2xl text-orange-500" />
              <span className="text-base text-gray-600">{user.name.split(" ")[0]}</span>
              <Button onClick={handleLogout} variant="primary" size="lg">Logout</Button>
            </div>
          ) : (
            <>
              <Link to="/login" className="text-lg font-semibold text-gray-700 hover:text-orange-500">Login</Link>
              <Button to="/register" variant="primary" size="lg">Sign Up</Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button onClick={() => setMenuOpen(!menuOpen)} className="text-3xl md:hidden" variant="secondary">{menuOpen ? "✕" : "☰"}</Button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="flex flex-col gap-4 px-6 pb-6 bg-white border-t md:hidden">
          {!isTeamMember && (
            <>
              <Link to="/" onClick={() => setMenuOpen(false)} className="py-3 text-lg font-medium text-gray-700">Home</Link>
              <Link to="/events" onClick={() => setMenuOpen(false)} className="py-3 text-lg font-medium text-gray-700">Services</Link>
            </>
          )}
          {dashLink && <Link to={dashLink.href} onClick={() => setMenuOpen(false)} className="py-3 text-lg font-medium text-gray-700">{dashLink.label}</Link>}
          {user ? (
            <Button onClick={handleLogout} variant="logout" size="lg">Logout</Button>
          ) : (
            <>
              <Link to="/login" className="text-lg font-semibold text-gray-700 hover:text-orange-500">Login</Link>
              <Button to="/register" variant="primary" size="lg">Sign Up</Button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}