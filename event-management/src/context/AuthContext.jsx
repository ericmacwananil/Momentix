// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load — check if user is logged in
  useEffect(() => {
    const checkUser = async () => {
      // First try to get from localStorage
      const start = Date.now();
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        const elapsed = Date.now() - start;
        if (elapsed < 1000) await new Promise(r => setTimeout(r, 1000 - elapsed));
        setLoading(false);
        return;
      }

      // Then try backend
      try {
        const res = await api.get("/auth/me", { timeout: 5000 });
        if (res.data.user) {
          setUser(res.data.user);
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }
      } catch (err) {
        // backend may be unavailable — remain signed out
        console.log("⚠️ Auth check failed (backend):", err.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const login = async (email, password) => {
    // Try backend login first
    try {
      const res = await api.post("/auth/login", { email, password }, { timeout: 5000 });
      if (res.data && res.data.user) {
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        return { success: true, user: res.data.user };
      }
    } catch (e) {
      console.log("⚠️ Backend login failed:", e.message);
      return { success: false, error: "Backend unavailable or request failed" };
    }

    return { success: false, error: "Invalid email or password" };
  };

  const register = async (name, email, password, phone, role = "customer") => {
    // Try backend registration first
    // Client-side validation to avoid common server rejections
    if (!password || password.length < 6) return { success: false, error: "Password must be at least 6 characters" };
    try {
      console.log("[Auth] register payload:", { name, email, password: password ? '***' : '', phone, role });
      const res = await api.post("/auth/register", { name, email, password, phone, role }, { timeout: 5000 });
      if (res.data && res.data.user) {
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        return { success: true, user: res.data.user };
      }
    } catch (e) {
      console.error("⚠️ Backend register failed:", e && e.message, e && e.response && e.response.data ? e.response.data : null);
      const serverMessage = e && e.response && e.response.data && e.response.data.message;
      return { success: false, error: serverMessage || "Backend unavailable or request failed" };
    }

    return { success: false, error: "Registration failed" };
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.log("⚠️ Logout request failed, clearing local session anyway:", err.message);
    } finally {
      setUser(null);
      localStorage.removeItem("user");
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}