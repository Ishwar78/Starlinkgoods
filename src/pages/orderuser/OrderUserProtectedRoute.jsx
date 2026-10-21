import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function OrderUserProtectedRoute() {
  const location = useLocation();
  const token = localStorage.getItem("orderUserToken");

  if (!token) {
    return <Navigate to="/order-user/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

