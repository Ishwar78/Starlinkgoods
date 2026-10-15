import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import {
  FiMenu,
  FiBell,
  FiSearch,
  FiChevronDown,
} from "react-icons/fi";

import UserSidebar from "../components/UserSidebar.jsx";
import "./UserDashboardLayout.css";

const pageNames = {
  "/user/dashboard": "Dashboard",
  "/user/products": "My Products",
  "/user/wallet": "My Wallet",
  "/user/kyc": "KYC Verification",
  "/user/add-user": "Add User",
  "/user/orders": "My Orders",
};

export default function UserDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const pageTitle = pageNames[location.pathname] || "User Dashboard";

  const [userData, setUserData] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("userData") || "{}");
    } catch {
      return {};
    }
  });

  // Refresh profile details on mount
  React.useEffect(() => {
    const userToken = localStorage.getItem("userToken");
    if (!userToken) return;

    fetch("http://localhost:5000/api/vendors/me", {
      headers: { Authorization: `Bearer ${userToken}` },
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.user) {
          localStorage.setItem("userData", JSON.stringify(res.user));
          setUserData(res.user);
        }
      })
      .catch(() => {});
  }, [location.pathname]);

  const userName = userData.name || "Vendor User";
  const userInitial = userName.charAt(0).toUpperCase();
  const userSub = userData.role ? `${userData.role} Account` : "Vendor Account";

  return (
    <div className="user-shell">
      <UserSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userData={userData}
      />

      <div className="user-main">
        <header className="user-topbar">
          <button
            type="button"
            className="user-mobile-menu"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation menu"
          >
            <FiMenu />
          </button>

          <div className="user-topbar-title">
            <span>SLG / Vendor Panel</span>
            <h1>{pageTitle}</h1>
          </div>

          <div className="user-topbar-actions">
            <label className="user-top-search">
              <FiSearch />
              <input
                type="search"
                placeholder="Search panel..."
                aria-label="Search panel"
              />
            </label>

            <button
              type="button"
              className="user-notification"
              aria-label="Notifications"
            >
              <FiBell />
              <i />
            </button>

            <div className="user-profile-chip" title={`${userName} (${userData.email || ""})`}>
              <span className="user-avatar">{userInitial}</span>
              <span className="user-profile-copy">
                <strong>{userName}</strong>
                <small>{userSub}</small>
              </span>
              <FiChevronDown className="user-profile-chevron" />
            </div>
          </div>
        </header>

        <main className="user-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
