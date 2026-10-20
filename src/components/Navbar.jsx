
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

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [whoMenuOpen, setWhoMenuOpen] = useState(false);
  const [search, setSearch] = useState("");

  const dropdownRef = useRef(null);
  const location = useLocation();

  const userToken = localStorage.getItem("userToken");

  const userData = (() => {
    try {
      return JSON.parse(localStorage.getItem("userData") || "{}");
    } catch {
      return {};
    }
  })();

  const closeMenu = () => {
    setMenuOpen(false);
    setWhoMenuOpen(false);
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
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setWhoMenuOpen(false);
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
              src="/Logo.jpeg"
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
            <Link
              to="/vendor-register"
              className="register-button vendor-register-button"
              onClick={closeMenu}
            >
              <FiUsers className="register-icon" />
              <span>Vendor Register</span>
            </Link>

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
                onClick={() =>
                  setWhoMenuOpen((previous) => !previous)
                }
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
