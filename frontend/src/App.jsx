import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Programs from "./pages/programs";
import NotFound from "./pages/NotFound";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import NewApplication from "./pages/NewApplication";
import Apply from "./pages/Apply";
import ApplicationDetails from "./pages/ApplicationDetails"; // ✅ ADD THIS
import ProtectedRoute from "./components/auth/ProtectedRoute";
import RoleRoute from "./components/auth/RoleRoute";

// Import dashboards
import ApplicantDashboard from "./components/applicant/Dashboard";
import StaffDashboard from "./components/staff/Dashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/programs" element={<Programs />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes - any authenticated user */}
        <Route element={<ProtectedRoute />}>
          <Route path="/apply" element={<NewApplication />} />
          <Route path="/application/start" element={<Apply />} />
          <Route path="/dashboard" element={<ApplicantDashboard />} />
          <Route path="/applicant/dashboard" element={<ApplicantDashboard />} />
          
          {/* ✅ ADD THIS ROUTE */}
          <Route path="/applications/:id" element={<ApplicationDetails />} />
        </Route>

        {/* Staff only routes */}
        <Route element={<RoleRoute allowedRoles={['staff', 'admin']} />}>
          <Route path="/staff/dashboard" element={<StaffDashboard />} />
        </Route>

        {/* Admin only routes */}
        <Route element={<RoleRoute allowedRoles={['admin']} />}>
          <Route path="/admin/dashboard" element={<div style={{ padding: 40 }}>Admin Dashboard</div>} />
        </Route>

        {/* Fallback routes */}
        <Route path="/unauthorized" element={<div style={{ padding: 40, textAlign: 'center' }}><h1>Unauthorized</h1><p>You don't have permission to access this page.</p></div>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}