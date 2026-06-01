// src/components/PrivateRoute.jsx

// 🧠 What is Navigate?
// Used to redirect users.
import { Navigate } from "react-router-dom";

//USEAUTH
// To access logged-in user data, From AuthContext.
import { useAuth } from "../context/AuthContext";


// PrivateRoute = Security Guard

// It checks:

// ✅ logged in? OR NOT
//if login then enter and not login so login first.

export default function PrivateRoute({ children, role }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  
  return children;
}