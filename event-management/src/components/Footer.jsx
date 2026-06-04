// src/components/Footer.jsx
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-8 sm:py-10 md:py-16 mt-12 sm:mt-16">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
        <div>
          <h3 className="text-white text-lg sm:text-xl font-bold mb-2 sm:mb-3">🎉 Momentix</h3>
          <p className="text-xs sm:text-sm leading-relaxed">Making your special moments unforgettable. Professional event decoration across Gujarat.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Quick Links</h4>
          <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
            <li><Link to="/" className="hover:text-orange-400">Home</Link></li>
            <li><Link to="/events" className="hover:text-orange-400">Services</Link></li>
            <li><Link to="/login" className="hover:text-orange-400">Login</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Contact</h4>
          <p className="text-xs sm:text-sm">📞 +91 98765 43210</p>
          <p className="text-xs sm:text-sm mt-1">📧 hello@Momentix.in</p>
          <p className="text-xs sm:text-sm mt-1">📏 Anand, Gujarat</p>
        </div>
      </div>
      <div className="text-center text-gray-500 text-xs sm:text-sm mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-800">
        © 2025 Momentix. All rights reserved.
      </div>
    </footer>
  );
}