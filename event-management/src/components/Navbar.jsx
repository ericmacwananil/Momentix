import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { MdStar } from "react-icons/md";
import Button from "./Button";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  if (location.pathname.startsWith("/admin")) return null;

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [menuOpen]);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate("/");
  };

  const getDashboardLink = () => {
    if (!user) return null;
    if (user.role === "admin") return { href: "/admin", label: "Admin Panel" };
    if (user.role === "team_member") return { href: "/team", label: "My Tasks" };
    return { href: "/dashboard", label: "My Bookings" };
  };

  const dashLink = getDashboardLink();
  const isTeamMember = user && user.role === "team_member";

  return (
    <nav className="relative sticky top-0 z-50 bg-white border-b border-gray-100 shadow-md">
      <div className="flex items-center justify-between px-4 py-3 mx-auto sm:px-6 sm:py-4 max-w-7xl">

        {/* Logo */}
        {!isTeamMember ? (
          <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-orange-500 sm:gap-3 sm:text-3xl">
            <span className="inline-flex items-center justify-center text-white shadow-lg w-9 h-9 sm:w-12 sm:h-12 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-orange-500 via-amber-400 to-pink-500 shadow-orange-200">
              <svg viewBox="0 0 24 24" className="w-5 h-5 sm:h-7 sm:w-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3l2.3 5.2L20 10.5l-5.7 2.1L12 18l-2.3-5.4L4 10.5l5.7-2.3L12 3z" />
                <path d="M18.5 3.5l.7 1.8L21 6l-1.8.7-.7 1.8-.7-1.8L16 6l1.8-.7.7-1.8z" />
              </svg>
            </span>
            <span>Momentix</span>
          </Link>
        ) : (
          <div className="flex items-center gap-2 text-xl font-bold tracking-tight text-orange-500 sm:gap-3 sm:text-3xl">
            <span className="inline-flex items-center justify-center text-white shadow-lg w-9 h-9 sm:w-12 sm:h-12 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-orange-500 via-amber-400 to-pink-500 shadow-orange-200">
              <svg viewBox="0 0 24 24" className="w-5 h-5 sm:h-7 sm:w-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            <Link to={dashLink.href} className="transition hover:text-orange-500">{dashLink.label}</Link>
          )}
        </div>

        {/* Desktop Auth */}
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

        {/* Mobile Hamburger */}
        <Button onClick={() => setMenuOpen(!menuOpen)} className="text-2xl md:hidden" variant="secondary">
          {menuOpen ? "✕" : "☰"}
        </Button>
      </div>

      {/* ✅ Mobile Menu — absolute so it floats over page */}
      {menuOpen && (
        <div className="absolute left-0 z-50 flex flex-col w-full gap-1 px-6 pt-2 pb-6 bg-white border-t border-gray-100 shadow-lg top-full md:hidden">
          {!isTeamMember && (
            <>
              <Link to="/" onClick={() => setMenuOpen(false)} className="py-3 text-base font-medium text-gray-700 transition border-b border-gray-50 hover:text-orange-500">Home</Link>
              <Link to="/events" onClick={() => setMenuOpen(false)} className="py-3 text-base font-medium text-gray-700 transition border-b border-gray-50 hover:text-orange-500">Services</Link>
            </>
          )}
          {dashLink && (
            <Link to={dashLink.href} onClick={() => setMenuOpen(false)} className="py-3 text-base font-medium text-gray-700 transition border-b border-gray-50 hover:text-orange-500">
              {dashLink.label}
            </Link>
          )}
          {user ? (
            <div className="pt-2">
              <Button onClick={handleLogout} variant="logout" size="lg">Logout</Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 pt-2">
              <Link to="/login" onClick={() => setMenuOpen(false)} className="text-base font-semibold text-gray-700 hover:text-orange-500">Login</Link>
              <Button to="/register" variant="primary" size="lg">Sign Up</Button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}