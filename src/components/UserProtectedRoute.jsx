import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function UserProtectedRoute() {
  const location = useLocation();
  const token = localStorage.getItem("userToken");

  if (!token) {
    // Redirect to /login if userToken is not present
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
