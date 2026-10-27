// src/utils/api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api", // Your backend URL
  withCredentials: true,               // Send cookies automatically
  timeout: 10000,                      // Increase timeout to 10s to avoid false client timeouts
});

// Automatically attach Authorization Bearer token from localStorage for cross-origin / header auth
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;