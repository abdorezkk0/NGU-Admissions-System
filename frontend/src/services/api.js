// src/services/api.js
import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach Authorization header automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken"); // ✅ use ONE key everywhere
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Optional: if token is invalid/expired, force logout
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // Clear token so user must login again
      localStorage.removeItem("accessToken");
    }
    return Promise.reject(err);
  }
);

export default api;
