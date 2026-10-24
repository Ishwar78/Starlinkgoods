import React from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  FiGrid,
  FiUsers,
  FiPackage,
  FiLayers,
  FiShoppingBag,
  FiMessageSquare,
  FiSettings,
  FiHome,
  FiX,
  FiLogOut,
  FiShield,
  FiUserCheck,
  FiMapPin,
  FiCreditCard,
  FiDatabase,
  FiImage,
} from "react-icons/fi";

import "./AdminSidebar.css";

const sidebarItems = [
  { label: "Dashboard", path: "/admin/dashboard", icon: FiGrid },
  { label: "Vendor Data", path: "/admin/vendor-data", icon: FiDatabase },
  { label: "Vendor", path: "/admin/users", icon: FiUsers },
  { label: "Vendor Users", path: "/admin/vendor-users", icon: FiUserCheck },
  { label: "Wallet Requests", path: "/admin/wallet-requests", icon: FiCreditCard },
  { label: "KYC Verification", path: "/admin/kyc", icon: FiShield },
  { label: "Products", path: "/admin/products", icon: FiPackage },
  { label: "Banners", path: "/admin/banners", icon: FiImage },
  { label: "Categories", path: "/admin/categories", icon: FiLayers },
  { label: "Orders", path: "/admin/orders", icon: FiShoppingBag },
  {
    label: "Contact Messages",
    path: "/admin/messages",
    icon: FiMessageSquare,
  },
  {
    label: "Contact Details",
    path: "/admin/contact-details",
    icon: FiMapPin,
  },
  // { label: "Settings", path: "/admin/settings", icon: FiSettings },
];

export default function AdminSidebar({ open, onClose }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onClose?.();
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin/login", { replace: true });
  };

  return (
    <>
      <button
        type="button"
        className={`admin-sidebar-backdrop ${open ? "is-visible" : ""}`}
        onClick={onClose}
        aria-label="Close sidebar"
      />

      <aside className={`admin-sidebar ${open ? "is-open" : ""}`}>
        <div className="admin-sidebar-brand-row">
          <Link
  to="/admin/dashboard"
  className="admin-sidebar-brand"
  onClick={onClose}
>
  <img
    src="/Logo-1.png"
    alt="Starlink Goods"
    className="admin-sidebar-logo"
  />
</Link>

          <button
            type="button"
            className="admin-sidebar-close"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <FiX />
          </button>
        </div>

        <p className="admin-sidebar-caption">WORKSPACE</p>

        <nav className="admin-sidebar-nav">
          {sidebarItems.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `admin-sidebar-link ${isActive ? "active" : ""}`
              }
              onClick={onClose}
            >
              <Icon />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-bottom">
          <div className="admin-sidebar-help">
            <span className="admin-help-icon">
              <FiMessageSquare />
            </span>

            <div>
              <strong>Need help?</strong>
              <small>Manage your store confidently.</small>
            </div>
          </div>

          <Link
            to="/"
            className="admin-sidebar-bottom-link"
            onClick={onClose}
          >
            <FiHome />
            <span>View Storefront</span>
          </Link>

          

          <button
            type="button"
            className="admin-sidebar-bottom-link"
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              textAlign: "left",
              cursor: "pointer",
              font: "inherit",
              color: "#a6493b",
            }}
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