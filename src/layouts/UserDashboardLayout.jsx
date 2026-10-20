import React, { useState, useEffect } from "react";
import { Outlet, useLocation, Link, useNavigate } from "react-router-dom";
import {
  FiMenu,
  FiBell,
  FiSearch,
  FiChevronDown,
  FiShoppingCart,
} from "react-icons/fi";

import UserSidebar from "../components/UserSidebar.jsx";
import { getUserCartCount } from "../lib/cart";
import { formatImageUrl } from "../lib/api";
import "./UserDashboardLayout.css";

const pageNames = {
  "/user/dashboard": "My Profile",
  "/user/profile": "My Profile",
  "/user/products": "My Products",
  "/user/cart": "My Cart",
  "/user/wallet": "My Wallet",
  "/user/kyc": "KYC Verification",
  "/user/add-user": "Add User",
  "/user/orders": "My Orders",
};

export default function UserDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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

  const [cartCount, setCartCount] = useState(() => getUserCartCount(userData));

  useEffect(() => {
    setCartCount(getUserCartCount(userData));

    const onCartUpdate = () => {
      setCartCount(getUserCartCount(userData));
    };

    window.addEventListener("slg-cart-updated", onCartUpdate);
    return () => window.removeEventListener("slg-cart-updated", onCartUpdate);
  }, [userData?._id, userData?.id, userData?.email]);

  useEffect(() => {
    const onProfileUpdate = (e) => {
      try {
        const updated = e?.detail?.user || JSON.parse(localStorage.getItem("userData") || "{}");
        setUserData(updated);
      } catch {}
    };

    window.addEventListener("slg-profile-updated", onProfileUpdate);
    return () => window.removeEventListener("slg-profile-updated", onProfileUpdate);
  }, []);

  const isMember = (userData?.role || "").toLowerCase() === "member";

  useEffect(() => {
    if (isMember && (location.pathname === "/user/wallet" || location.pathname === "/user/add-user")) {
      navigate("/user/dashboard", { replace: true });
    }
  }, [isMember, location.pathname, navigate]);

  const userName = userData.name || "Vendor User";
  const userInitial = userName.charAt(0).toUpperCase();
  const userSub = userData.vendorId
    ? `${userData.vendorId} · ${userData.role || "Vendor"}`
    : userData.role
    ? `${userData.role} Account`
    : "Vendor Account";

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

            <Link
              to="/user/cart"
              className="user-cart-topbar-btn"
              title={`My Cart (${cartCount} items)`}
              aria-label="View Shopping Cart"
            >
              <FiShoppingCart />
              {cartCount > 0 && <span className="user-cart-topbar-badge">{cartCount}</span>}
            </Link>

            <button
              type="button"
              className="user-notification"
              aria-label="Notifications"
            >
              <FiBell />
              <i />
            </button>

            <div className="user-profile-chip" title={`${userName} (${userData.email || ""})`}>
              <span className="user-avatar" style={{ overflow: "hidden", display: "grid", placeItems: "center" }}>
                {userData.profileImage ? (
                  <img
                    src={formatImageUrl(userData.profileImage)}
                    alt={userName}
                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
                  />
                ) : (
                  userInitial
                )}
              </span>
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
