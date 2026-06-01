// src/utils/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // Your backend URL
  withCredentials: true,               // Send cookies automatically
  timeout: 10000,                      // Increase timeout to 10s to avoid false client timeouts
});

export default api;