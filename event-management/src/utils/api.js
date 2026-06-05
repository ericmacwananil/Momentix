// src/utils/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://momentix-6csp.onrender.com/api", // Your deployed backend URL
  withCredentials: true,               // Send cookies automatically
  timeout: 10000,                      // Increase timeout to 10s to avoid false client timeouts
});

export default api;