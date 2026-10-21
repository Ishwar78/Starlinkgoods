
import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  FiMenu,
  FiX,
  FiSearch,
  FiChevronDown,
  FiUser,
  FiUsers,
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

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [whoMenuOpen, setWhoMenuOpen] = useState(false);
  const [achievementsMenuOpen, setAchievementsMenuOpen] =
    useState(false);
  const [search, setSearch] = useState("");

  const dropdownRef = useRef(null);
  const achievementsDropdownRef = useRef(null);

  const location = useLocation();

  const userToken = localStorage.getItem("userToken");
  const orderUserToken = localStorage.getItem("orderUserToken");

  const userData = (() => {
    try {
      return JSON.parse(localStorage.getItem("userData") || "{}");
    } catch {
      return {};
    }
  })();

  const orderUserData = (() => {
    try {
      return JSON.parse(localStorage.getItem("orderUserData") || "{}");
    } catch {
      return {};
    }
  })();

  const closeMenu = () => {
    setMenuOpen(false);
    setWhoMenuOpen(false);
    setAchievementsMenuOpen(false);
  };

  useEffect(() => {
    closeMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setWhoMenuOpen(false);
      }

      if (
        achievementsDropdownRef.current &&
        !achievementsDropdownRef.current.contains(event.target)
      ) {
        setAchievementsMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setWhoMenuOpen(false);
        setAchievementsMenuOpen(false);
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();

    const query = search.trim();

    if (!query) return;

    window.dispatchEvent(
      new CustomEvent("SLG-search", {
        detail: query,
      })
    );

    if (location.pathname === "/") {
      window.location.hash = "products";

      document.getElementById("products")?.scrollIntoView({
        behavior: "smooth",
      });
    } else {
      window.location.href = "/#products";
    }

    closeMenu();
  };

  const isWhoWeAreActive = whoWeAreItems.some(
    (item) => location.pathname === item.href
  );

  const isAchievementsActive = achievementsItems.some(
    (item) => location.pathname === item.href
  );

  return (
    <>
      <header className="site-header">
        {/* Top Header */}
        <div className="header-main">
          {/* Mobile Menu Button */}
          <button
            type="button"
            className="mobile-menu-toggle"
            aria-label={
              menuOpen ? "Close navigation" : "Open navigation"
            }
            aria-expanded={menuOpen}
            onClick={() => {
              setMenuOpen((previous) => !previous);
              setWhoMenuOpen(false);
              setAchievementsMenuOpen(false);
            }}
          >
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>

          {/* Logo */}
          <Link
            to="/"
            className="brand"
            aria-label="Star Link Goods homepage"
            onClick={closeMenu}
          >
            <img
              src="/Logo-1.png"
              alt="Star Link Goods"
              className="brand-logo"
            />
          </Link>

          {/* Search */}
          <form
            className="header-search"
            onSubmit={handleSearch}
            role="search"
          >
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search sofas, beds, chairs..."
              aria-label="Search furniture"
            />

            <button type="submit" aria-label="Search products">
              <FiSearch />
            </button>
          </form>

          {/* Header Actions */}
          <div className="header-actions">
            {/* Member Register */}
            <Link
              to="/member-register"
              className="register-button member-register-button"
              onClick={closeMenu}
            >
              <FiUser className="register-icon" />
              <span>Member Register</span>
            </Link>

            {/* Vendor Register */}
            {/* <Link
              to="/vendor-register"
              className="register-button vendor-register-button"
              onClick={closeMenu}
            >
              <FiUsers className="register-icon" />
              <span>Vendor Register</span>
            </Link> */}

            {/* Login / Dashboard */}
            {userToken ? (
              <Link
                to="/user/dashboard"
                className="login-button"
                onClick={closeMenu}
                title={`Logged in as ${userData.name || "Vendor"}`}
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
                onClick={closeMenu}
                title={`Logged in as Customer: ${orderUserData.name || "Customer"}`}
              >
                <FiUser className="login-icon" />
                <span>
                  {orderUserData.name
                    ? orderUserData.name.split(" ")[0]
                    : "My Orders"}
                </span>
              </Link>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Link
                  to="/login"
                  className="login-button"
                  onClick={closeMenu}
                >
                  <FiUser className="login-icon" />
                  <span>Login</span>
                </Link>

                <Link
                  to="/order-user/login"
                  className="login-button"
                  onClick={closeMenu}
                  style={{
                    background: "rgba(255, 208, 68, 0.15)",
                    border: "1px solid rgba(255, 208, 68, 0.35)",
                    color: "#ffd044",
                  }}
                  title="Track Order / Customer Login"
                >
                  <span>Track Order</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <nav
          className={`main-nav ${menuOpen ? "nav-open" : ""}`}
          aria-label="Main navigation"
        >
          <div className="nav-inner">
            {/* Home */}
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
              onClick={closeMenu}
            >
              Home
            </NavLink>

            {/* Who We Are Dropdown */}
            <div
              className={`nav-dropdown ${
                whoMenuOpen ? "dropdown-open" : ""
              } ${isWhoWeAreActive ? "dropdown-active" : ""}`}
              ref={dropdownRef}
            >
              <button
                type="button"
                className="nav-link dropdown-trigger"
                aria-expanded={whoMenuOpen}
                aria-haspopup="true"
                onClick={() => {
                  setWhoMenuOpen((previous) => !previous);
                  setAchievementsMenuOpen(false);
                }}
              >
                <span>Who We Are</span>

                <span className="dropdown-plus" aria-hidden="true">
                  {whoMenuOpen ? "−" : "+"}
                </span>

                <FiChevronDown className="dropdown-chevron" />
              </button>

              <div className="dropdown-menu">
                {whoWeAreItems.map((item) => (
                  <NavLink
                    key={item.label}
                    to={item.href}
                    className={({ isActive }) =>
                      `dropdown-item ${isActive ? "active" : ""}`
                    }
                    onClick={closeMenu}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Achievements Dropdown */}
            <div
              className={`nav-dropdown achievements-dropdown ${
                achievementsMenuOpen ? "dropdown-open" : ""
              } ${
                isAchievementsActive ? "dropdown-active" : ""
              }`}
              ref={achievementsDropdownRef}
            >
              <button
                type="button"
                className="nav-link dropdown-trigger"
                aria-expanded={achievementsMenuOpen}
                aria-haspopup="true"
                onClick={() => {
                  setAchievementsMenuOpen((previous) => !previous);
                  setWhoMenuOpen(false);
                }}
              >
                <span>Achievements</span>

                <span className="dropdown-plus" aria-hidden="true">
                  {achievementsMenuOpen ? "−" : "+"}
                </span>

                <FiChevronDown className="dropdown-chevron" />
              </button>

              <div className="dropdown-menu">
                {achievementsItems.map((item) => (
                  <NavLink
                    key={item.label}
                    to={item.href}
                    className={({ isActive }) =>
                      `dropdown-item ${isActive ? "active" : ""}`
                    }
                    onClick={closeMenu}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Blogs */}
            <NavLink
              to="/blog"
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
              onClick={closeMenu}
            >
              Blogs
            </NavLink>

            {/* Contact */}
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
      </header>

      {/* Space below fixed navbar */}
      <div className="site-header-spacer" aria-hidden="true" />
    </>
  );
}
