
import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  FiMenu,
  FiX,
  FiChevronDown,
  FiUser,
} from "react-icons/fi";

import "./Navbar.css";

const whoWeAreItems = [
  { label: "About Us", href: "/about" },
  { label: "What We Do", href: "/what-we-do" },
  { label: "Founder", href: "/founder" },
  { label: "Our Team", href: "/our-team" },
];

const achievementsItems = [
  { label: "Making a Difference", href: "/making-deference" },
  { label: "Our Impact", href: "/our-impact" },
  { label: "Testimonials", href: "/testimonial" },
];

const inNewsItems = [
  { label: "Media Coverage", href: "/under-construction" },
  { label: "Info Videos", href: "/under-construction" },
];

const resourcesItems = [
  { label: "Judgments", href: "/under-construction" },
  { label: "Research", href: "/under-construction" },
];

const dropdownGroups = [
  { id: "who", label: "Who We Are", items: whoWeAreItems },
  { id: "news", label: "In News", items: inNewsItems },
  {
    id: "achievements",
    label: "Achievements",
    items: achievementsItems,
  },
  { id: "resources", label: "Resources", items: resourcesItems },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  const navRef = useRef(null);
  const location = useLocation();

  const userToken = localStorage.getItem("userToken");
  const orderUserToken = localStorage.getItem("orderUserToken");

  const readUserData = (key) => {
    try {
      return JSON.parse(localStorage.getItem(key) || "{}");
    } catch {
      return {};
    }
  };

  const userData = readUserData("userData");
  const orderUserData = readUserData("orderUserData");

  const closeMenu = () => {
    setMenuOpen(false);
    setOpenDropdown(null);
  };

  useEffect(() => {
    closeMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        navRef.current &&
        !navRef.current.contains(event.target)
      ) {
        setOpenDropdown(null);
        setMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const toggleDropdown = (id) => {
    setOpenDropdown((current) => (current === id ? null : id));
  };

  const isGroupActive = (items) =>
    items.some(
      (item) =>
        location.pathname === item.href ||
        location.pathname.startsWith(`${item.href}/`)
    );

  const renderDropdown = ({ id, label, items }) => {
    const isOpen = openDropdown === id;
    const isActive = isGroupActive(items);

    return (
      <div
        key={id}
        className={`nav-dropdown ${id}-dropdown ${
          isOpen ? "dropdown-open" : ""
        } ${isActive ? "dropdown-active" : ""}`}
      >
        <button
          type="button"
          className="nav-link dropdown-trigger"
          aria-expanded={isOpen}
          aria-haspopup="true"
          onClick={() => toggleDropdown(id)}
        >
          <span>{label}</span>

          <span className="dropdown-plus" aria-hidden="true">
            {isOpen ? "−" : "+"}
          </span>

          <FiChevronDown className="dropdown-chevron" />
        </button>

        <div className="dropdown-menu">
          {items.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive: itemActive }) =>
                `dropdown-item ${itemActive ? "active" : ""}`
              }
              onClick={closeMenu}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <header className="site-header" ref={navRef}>
        <div className="header-main">
          <button
            type="button"
            className="mobile-menu-toggle"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            onClick={() => {
              setMenuOpen((previous) => !previous);
              setOpenDropdown(null);
            }}
          >
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>

          <Link
            to="/"
            className="brand"
            aria-label="Star Link Goods homepage"
            onClick={closeMenu}
          >
            <img
              src="/logo3.jpeg"
              alt="Star Link Goods"
              className="brand-logo"
            />
          </Link>

          <nav
            className={`main-nav ${menuOpen ? "nav-open" : ""}`}
            aria-label="Main navigation"
          >
            <div className="nav-inner">
              {dropdownGroups.map(renderDropdown)}

              <NavLink
                to="/blog"
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
                onClick={closeMenu}
              >
                Blogs
              </NavLink>

              <NavLink
                to="/under-construction"
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
                onClick={closeMenu}
              >
                Podcast
              </NavLink>

              <NavLink
                to="/under-construction"
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
                onClick={closeMenu}
              >
                Our Heroes
              </NavLink>

              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
                onClick={closeMenu}
              >
                Contact
              </NavLink>
            </div>
          </nav>

          <div className="header-actions">
            {userToken ? (
              <Link
                to="/user/dashboard"
                className="login-button"
                title={`Logged in as ${userData.name || "Vendor"}`}
                onClick={closeMenu}
              >
                <FiUser className="login-icon" />
                <span>
                  {userData.name
                    ? userData.name.split(" ")[0]
                    : "Dashboard"}
                </span>
              </Link>
            ) : orderUserToken ? (
              <Link
                to="/order-user/dashboard"
                className="login-button"
                title={`Logged in as Customer: ${
                  orderUserData.name || "Customer"
                }`}
                onClick={closeMenu}
              >
                <FiUser className="login-icon" />
                <span>
                  {orderUserData.name
                    ? orderUserData.name.split(" ")[0]
                    : "My Orders"}
                </span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="login-button"
                onClick={closeMenu}
              >
                <FiUser className="login-icon" />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="site-header-spacer" aria-hidden="true" />
    </>
  );
}
