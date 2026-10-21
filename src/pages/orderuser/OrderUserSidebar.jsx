import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiPackage,
  FiHeadphones,
  FiHome,
  FiLogOut,
  FiUser,
  FiShield,
  FiX,
} from "react-icons/fi";
import "./OrderUserSidebar.css";

export default function OrderUserSidebar({
  activeTab,
  setActiveTab,
  user,
  ordersCount = 0,
  isMobileOpen = false,
  onCloseMobile = () => {},
}) {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out from your customer dashboard?")) {
      localStorage.removeItem("orderUserToken");
      localStorage.removeItem("orderUserData");
      navigate("/order-user/login");
    }
  };

  const navItems = [
    {
      id: "orders",
      label: "My Orders",
      icon: <FiPackage />,
      badge: ordersCount > 0 ? ordersCount : null,
    },
    {
      id: "support",
      label: "Support",
      icon: <FiHeadphones />,
      badge: "24/7",
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="order-sidebar-backdrop"
          onClick={onCloseMobile}
        ></div>
      )}

      <aside className={`order-user-sidebar ${isMobileOpen ? "mobile-open" : ""}`}>
        {/* Header Branding */}
        <div className="order-sidebar-header">
          <div className="order-brand-box">
            <span className="order-brand-tag">CUSTOMER PORTAL</span>
            <h1 className="order-brand-title">SLG Solar</h1>
          </div>

          <button
            type="button"
            className="order-sidebar-close-btn"
            onClick={onCloseMobile}
            title="Close menu"
          >
            <FiX />
          </button>
        </div>

        {/* User Profile Card */}
        <div className="order-sidebar-user-card">
          <div className="order-avatar-circle">
            <FiUser />
          </div>
          <div className="order-user-info">
            <span className="order-user-name" title={user.name || "Customer"}>
              {user.name || "Customer Account"}
            </span>
            <span className="order-user-email" title={user.email || ""}>
              {user.email || "Registered User"}
            </span>
            <span className="order-user-badge">
              <FiShield /> Verified Customer
            </span>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="order-sidebar-nav">
          <span className="nav-group-title">MAIN MENU</span>

          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`order-nav-button ${isActive ? "active" : ""}`}
                onClick={() => {
                  setActiveTab(item.id);
                  onCloseMobile();
                }}
              >
                <span className="order-nav-icon">{item.icon}</span>
                <span className="order-nav-label">{item.label}</span>
                {item.badge && (
                  <span className={`order-nav-badge ${isActive ? "active" : ""}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="order-sidebar-footer">
          <Link to="/" className="order-footer-link" onClick={onCloseMobile}>
            <FiHome />
            <span>Return to Store</span>
          </Link>

          <button
            type="button"
            className="order-logout-button"
            onClick={handleLogout}
          >
            <FiLogOut />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

