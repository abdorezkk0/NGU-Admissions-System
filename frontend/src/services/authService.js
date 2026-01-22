// src/services/authService.js
import api from "./api";

export async function login(email, password) {
  const res = await api.post("/api/auth/login", { email, password });

  const payload = res.data;

  // ✅ try all common token shapes (so it works with your backend response)
  const accessToken =
    payload?.data?.tokens?.accessToken ||
    payload?.data?.accessToken ||
    payload?.accessToken ||
    payload?.token ||
    payload?.data?.token;

  if (!accessToken) {
    throw new Error("No access token returned from backend");
  }

  localStorage.setItem("accessToken", accessToken);
  return payload;
}

export function logout() {
  localStorage.removeItem("accessToken");
}

export function getAccessToken() {
  return localStorage.getItem("accessToken");
}
