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

  const baseStyles = "font-semibold rounded-lg transition outline-none cursor-pointer";

  const variantStyles = {
    primary: "bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50",
    secondary: "border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50",
    danger: "bg-red-500 text-white hover:bg-red-600 disabled:opacity-50",
    success: "bg-green-500 text-white hover:bg-green-600 disabled:opacity-50",
    logout: "text-left text-red-500",
  };

  const sizeStyles = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
    full: "w-full px-4 py-2",
  };

  const combinedStyles = `${baseStyles} ${variantStyles[variant] || variantStyles.primary} ${sizeStyles[size] || sizeStyles.md} ${className}`;

  const handleClick = (e) => {
    if (to) {
      navigate(to);
    }
    if (onClick) {
      onClick(e);
    }
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
