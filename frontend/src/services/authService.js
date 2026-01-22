import api from "./api";

export async function login(email, password) {
  const res = await api.post("/api/auth/login", { email, password });
  const payload = res.data;

  // ✅ Backend returns: { success: true, data: { user: {...}, tokens: { accessToken, refreshToken } } }
  const accessToken = payload?.data?.tokens?.accessToken 
    || payload?.tokens?.accessToken 
    || payload?.token 
    || payload?.data?.token;

  if (!accessToken) {
    console.error('Login response:', payload);
    throw new Error("No access token returned from backend");
  }

  localStorage.setItem("accessToken", accessToken);
  
  // ✅ Store refresh token if available
  const refreshToken = payload?.data?.tokens?.refreshToken || payload?.tokens?.refreshToken;
  if (refreshToken) {
    localStorage.setItem("refreshToken", refreshToken);
  }
  
  // ✅ Store user data
  const user = payload?.data?.user || payload?.user;
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  }

  return { user, token: accessToken };
}

export async function register(userData) {
  const res = await api.post("/api/auth/register", userData);
  const payload = res.data;

  // ✅ Backend returns same structure for register
  const accessToken = payload?.data?.tokens?.accessToken 
    || payload?.tokens?.accessToken 
    || payload?.token 
    || payload?.data?.token;

  if (!accessToken) {
    console.error('Register response:', payload);
    throw new Error("No access token returned from backend");
  }

  localStorage.setItem("accessToken", accessToken);
  
  // ✅ Store refresh token if available
  const refreshToken = payload?.data?.tokens?.refreshToken || payload?.tokens?.refreshToken;
  if (refreshToken) {
    localStorage.setItem("refreshToken", refreshToken);
  }
  
  // ✅ Store user data
  const user = payload?.data?.user || payload?.user;
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  }

  return { user, token: accessToken };
}

export function logout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
}

export function getAccessToken() {
  return localStorage.getItem("accessToken");
}

export function getRefreshToken() {
  return localStorage.getItem("refreshToken");
}

export function getCurrentUser() {
  try {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
}