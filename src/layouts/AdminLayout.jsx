import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import {
  FiMenu,
  FiBell,
  FiSearch,
  FiChevronDown,
} from "react-icons/fi";

import AdminSidebar from "../components/AdminSidebar.jsx";
import "./AdminLayout.css";

const pageNames = {
  "/admin/dashboard": "Dashboard",
  "/admin/users": "Vendor Management",
  "/admin/vendor-users": "Vendor Users",
  "/admin/wallet-requests": "Wallet Requests",
  "/admin/kyc": "KYC Verification",
  "/admin/products": "Products",
  "/admin/categories": "Categories",
  "/admin/orders": "Orders",
  "/admin/messages": "Contact Messages",
  "/admin/contact-details": "Contact Details Settings",
  "/admin/settings": "Settings",
};

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  let adminUser = null;
  try {
    adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
  } catch {}

  const adminName = adminUser?.name || "Starlink Admin";
  const adminEmail = adminUser?.email || "Store admin";
  const adminInitial = adminName.charAt(0).toUpperCase() || "S";

  const pageTitle =
    pageNames[location.pathname] || "Admin Workspace";

  return (
    <div className="admin-shell">
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="admin-main">
        <header className="admin-topbar">
          <button
            type="button"
            className="admin-mobile-menu"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open admin menu"
          >
            <FiMenu />
          </button>

          <div className="admin-topbar-title">
            <span>SLG / Admin</span>
            <h1>{pageTitle}</h1>
          </div>

          <div className="admin-topbar-actions">
            <label className="admin-top-search">
              <FiSearch />
              <input
                type="search"
                placeholder="Search dashboard..."
                aria-label="Search dashboard"
              />
            </label>

            <button
              type="button"
              className="admin-notification"
              aria-label="Notifications"
            >
              <FiBell />
              <i />
            </button>

            <div className="admin-profile-chip" title={adminEmail}>
              <span className="admin-avatar">{adminInitial}</span>

              <span className="admin-profile-copy">
                <strong>{adminName}</strong>
                <small>{adminEmail}</small>
              </span>

              <FiChevronDown className="admin-profile-chevron" />
            </div>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}