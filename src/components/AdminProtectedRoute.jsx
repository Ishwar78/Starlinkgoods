import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function AdminProtectedRoute() {
  const location = useLocation();
  const token = localStorage.getItem("adminToken");

  if (!token) {
    // Redirect to /admin/login if token is not present
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
