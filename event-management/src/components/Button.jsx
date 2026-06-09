// src/components/Button.jsx
import { useNavigate } from "react-router-dom";

export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
  to,
  ...props
}) {
  const navigate = useNavigate();

  // ✅ Added active:scale-95 for satisfying tap feedback on mobile
  const baseStyles =
    "font-semibold rounded-lg transition outline-none cursor-pointer active:scale-95 select-none";

  const variantStyles = {
    primary:   "bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed",
    secondary: "border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed",
    danger:    "bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed",
    success:   "bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed",
    logout:    "text-left text-red-500 hover:text-red-600",
  };

  const sizeStyles = {
    sm:   "px-3 py-1.5 text-sm",
    md:   "px-4 py-2 text-sm sm:text-base",
    lg:   "px-5 sm:px-6 py-2.5 sm:py-3 text-base sm:text-lg",
    // ✅ Added text-sm and proper vertical padding for full-width buttons
    full: "w-full px-4 py-2.5 text-sm sm:text-base",
  };

  const combinedStyles = `${baseStyles} ${variantStyles[variant] || variantStyles.primary} ${sizeStyles[size] || sizeStyles.md} ${className}`;

  const handleClick = (e) => {
    if (disabled) return;
    if (to) navigate(to);
    if (onClick) onClick(e);
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={combinedStyles}
      {...props}
    >
      {children}
    </button>
  );
}