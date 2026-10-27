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
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");

      // Populate immediately from localStorage so UI is responsive
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          localStorage.removeItem("user");
        }
      }

      // If user was never logged in (no user and no token), do not make an unnecessary network call
      if (!storedUser && !storedToken) {
        setUser(null);
        setLoading(false);
        return;
      }

      // If a session exists, verify with backend
      try {
        const res = await api.get("/auth/me", { timeout: 5000 });
        if (res.data && res.data.user) {
          setUser(res.data.user);
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }
      } catch (err) {
        // If 401 Unauthorized, token has expired or is invalid
        if (err?.response?.status === 401) {
          console.log("⚠️ Session expired or invalid:", err.message);
          setUser(null);
          localStorage.removeItem("user");
          localStorage.removeItem("token");
        } else {
          // If network error, preserve storedUser for offline preview
          console.warn("⚠️ Backend session check skipped (server offline or network error):", err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const login = async (identifier, password) => {
    const trimmedId = (identifier || "").trim();
    const isNumeric = /^\d+$/.test(trimmedId);

    if (!trimmedId) {
      return { success: false, error: "Please enter your email or 10-digit mobile number" };
    }

    if (isNumeric && trimmedId.length !== 10) {
      return { success: false, error: "Mobile number must be exactly 10 digits" };
    }

    if (!password || password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters" };
    }

    try {
      const payload = isNumeric
        ? { phone: trimmedId, password }
        : { email: trimmedId, password };

      const res = await api.post("/auth/login", payload, { timeout: 8000 });
      if (res.data && res.data.user) {
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        if (res.data.token) {
          localStorage.setItem("token", res.data.token);
        }
        return { success: true, user: res.data.user };
      }
    } catch (e) {
      console.warn("⚠️ Backend login failed:", e?.message);
      if (e?.response?.data?.message) {
        return { success: false, error: e.response.data.message };
      }
      if (e?.code === "ERR_NETWORK" || !e?.response) {
        return {
          success: false,
          error: "Network Error: Cannot connect to backend server. Please verify backend is running and VITE_API_BASE_URL is configured."
        };
      }
      return { success: false, error: e.message || "Invalid credentials" };
    }

    return { success: false, error: "Invalid email or password" };
  };

  const register = async (name, email, password, phone, role = "customer") => {
    // Client-side validation to avoid common rejections
    if (!name || !name.trim()) {
      return { success: false, error: "Please enter your full name" };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      return { success: false, error: "Please enter a valid email address" };
    }

    const cleanPhone = (phone || "").toString().replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      return { success: false, error: "Mobile number must be exactly 10 digits" };
    }

    if (!password || password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters" };
    }

    try {
      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: cleanPhone,
        role,
      };

      console.log("[Auth] register payload:", { ...payload, password: "***" });
      const res = await api.post("/auth/register", payload, { timeout: 10000 });
      if (res.data && res.data.user) {
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        if (res.data.token) {
          localStorage.setItem("token", res.data.token);
        }
        return { success: true, user: res.data.user };
      }
    } catch (e) {
      console.error("⚠️ Backend register failed:", e?.message, e?.response?.data || null);
      if (e?.response?.data?.message) {
        return { success: false, error: e.response.data.message };
      }
      if (e?.code === "ERR_NETWORK" || !e?.response) {
        return {
          success: false,
          error: "Network Error: Cannot connect to backend server. If deployed on Vercel, please ensure backend is hosted and VITE_API_BASE_URL is configured."
        };
      }
      return { success: false, error: e.message || "Registration failed" };
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
      localStorage.removeItem("token");
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