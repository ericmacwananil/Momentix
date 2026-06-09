// src/components/Footer.jsx
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="py-10 mt-12 text-gray-300 bg-gray-900 sm:py-12 md:py-16 sm:mt-16">
      <div className="grid grid-cols-1 gap-8 px-4 mx-auto max-w-7xl sm:px-6 sm:grid-cols-2 md:grid-cols-3 sm:gap-10">

        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🎉</span>
            <h3 className="text-lg font-bold text-white sm:text-xl">Momentix</h3>
          </div>
          <p className="text-xs leading-relaxed text-gray-400 sm:text-sm">
            Making your special moments unforgettable. Professional event decoration across Gujarat.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="mb-3 text-sm font-semibold text-white sm:text-base">Quick Links</h4>
          <ul className="space-y-2 text-xs sm:text-sm">
            <li>
              <Link to="/" className="text-gray-400 transition hover:text-orange-400">Home</Link>
            </li>
            <li>
              <Link to="/events" className="text-gray-400 transition hover:text-orange-400">Services</Link>
            </li>
            <li>
              <Link to="/login" className="text-gray-400 transition hover:text-orange-400">Login</Link>
            </li>
            <li>
              <Link to="/register" className="text-gray-400 transition hover:text-orange-400">Sign Up</Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="mb-3 text-sm font-semibold text-white sm:text-base">Contact</h4>
          <ul className="space-y-2 text-xs text-gray-400 sm:text-sm">
            <li>📞 +91 98765 43210</li>
            <li>📧 hello@momentix.in</li>
            <li>📍 Anand, Gujarat</li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="px-4 pt-5 mt-8 text-xs text-center text-gray-500 border-t border-gray-800 sm:text-sm sm:mt-10 sm:pt-6">
        © 2025 Momentix. All rights reserved.
      </div>
    </footer>
  );
}