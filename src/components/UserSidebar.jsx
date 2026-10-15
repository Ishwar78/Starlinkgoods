
import React from "react";
import { NavLink } from "react-router-dom";
import {
  FiGrid,
  FiCreditCard,
  FiShield,
  FiUserPlus,
  FiShoppingBag,
  FiPackage,
  FiHome,
  FiLogOut,
  FiX,
} from "react-icons/fi";
import "./UserSidebar.css";

const menuItems = [
  {
    title: "Dashboard",
    path: "/user/dashboard",
    icon: <FiGrid />,
  },
  {
    title: "My Products",
    path: "/user/products",
    icon: <FiPackage />,
  },
  {
    title: "Wallet",
    path: "/user/wallet",
    icon: <FiCreditCard />,
  },
  {
    title: "KYC Verification",
    path: "/user/kyc",
    icon: <FiShield />,
  },
  {
    title: "Add User",
    path: "/user/add-user",
    icon: <FiUserPlus />,
  },
  {
    title: "My Orders",
    path: "/user/orders",
    icon: <FiShoppingBag />,
  },
];

const UserSidebar = ({ isOpen = false, onClose = () => {}, userData: propUserData }) => {
  const userData = propUserData || (() => {
    try {
      return JSON.parse(localStorage.getItem("userData") || "{}");
    } catch {
      return {};
    }
  })();

  const userName = userData.name || "Vendor User";
  const userInitial = userName.charAt(0).toUpperCase();
  const userSub = userData.email || userData.role || "Vendor Panel";

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userData");
    onClose();
    window.location.href = "/login";
  };

  return (
    <>
      {isOpen && (
        <button
          type="button"
          className="user-sidebar-overlay"
          aria-label="Close sidebar"
          onClick={onClose}
        />
      )}

      <aside className={`user-sidebar ${isOpen ? "user-sidebar-open" : ""}`}>
        <div className="user-sidebar-brand">
          <div className="user-sidebar-logo">H</div>

          <div className="user-sidebar-brand-text">
            <h2>SLG</h2>
            <span>Vendor Portal</span>
          </div>

          <button
            type="button"
            className="user-sidebar-close"
            onClick={onClose}
            aria-label="Close menu"
          >
            <FiX />
          </button>
        </div>

        <div className="user-sidebar-profile" title={userData.email || ""}>
          <div className="user-sidebar-avatar">{userInitial}</div>

          <div className="user-sidebar-profile-info">
            <h4>{userName}</h4>
            <p>{userSub}</p>
          </div>

          <span className="user-sidebar-online-dot" />
        </div>

        <div className="user-sidebar-section-label">
          MAIN MENU
        </div>

        <nav className="user-sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `user-sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <span className="user-sidebar-link-icon">
                {item.icon}
              </span>

              <span className="user-sidebar-link-title">
                {item.title}
              </span>

              <span className="user-sidebar-link-arrow">›</span>
            </NavLink>
          ))}
        </nav>

        <div className="user-sidebar-bottom">
          <NavLink
            to="/"
            className="user-sidebar-link user-sidebar-home-link"
            onClick={onClose}
          >
            <span className="user-sidebar-link-icon">
              <FiHome />
            </span>
            <span className="user-sidebar-link-title">
              Back to Website
            </span>
          </NavLink>

          <button
            type="button"
            className="user-sidebar-logout"
            onClick={handleLogout}
          >
            <span className="user-sidebar-link-icon">
              <FiLogOut />
            </span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default UserSidebar;
