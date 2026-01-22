import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Programs from "./pages/programs";
import Apply from "./pages/Apply";

import Login from "./components/auth/Login";
import NotFound from "./pages/NotFound";

// simple protected route
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("accessToken");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/programs" element={<Programs />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/apply"
        element={
          <ProtectedRoute>
            <Apply />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
