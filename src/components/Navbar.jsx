
import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  FiMenu,
  FiX,
  FiSearch,
  FiHeart,
  FiShoppingCart,
  FiUser,
} from "react-icons/fi";

import "./Navbar.css";

const navItems = [
  { label: "Home", href: "/" },
  // { label: "Sofas", href: "/#categories" },
  // { label: "Beds", href: "/#categories" },
  // { label: "Dining", href: "/#categories" },
  // { label: "Mattresses", href: "/#categories" },
  // { label: "Chairs", href: "/#categories" },
  // { label: "Storage", href: "/#categories" },
  // { label: "Decor", href: "/#categories" },
  // { label: "Offers", href: "/#offers" },
  // { label: "Brands", href: "/#about" },
  { label: "About", href: "/about" },
  { label: "Member Register", href: "/member-register" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");

  const userToken = localStorage.getItem("userToken");
  const userData = (() => {
    try {
      return JSON.parse(localStorage.getItem("userData") || "{}");
    } catch {
      return {};
    }
  })();

  const closeMenu = () => setMenuOpen(false);

  const handleSearch = (event) => {
    event.preventDefault();

    const query = search.trim();
    if (!query) return;

    window.dispatchEvent(
      new CustomEvent("SLG-search", {
        detail: query,
      })
    );

    if (window.location.hash === "#products") {
      document.getElementById("products")?.scrollIntoView({
        behavior: "smooth",
      });
    } else {
      window.location.hash = "products";
    }

    closeMenu();
  };

  return (
    <>
      <header className="site-header">
      {/* Top Header */}
      <div className="header-main">
        <button
          type="button"
          className="mobile-menu-toggle"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((previous) => !previous)}
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
          {/* <Link
            to="/"
            className="header-action"
            aria-label="Wishlist"
            onClick={closeMenu}
          >
            <FiHeart />
            <span>Wishlist</span>
          </Link>

          <Link
            to="/"
            className="header-action cart-action"
            aria-label="Shopping cart"
            onClick={closeMenu}
          >
            <FiShoppingCart />
            <span>Cart</span>
            <b>0</b>
          </Link> */}

          {/* <Link
            to="/user/dashboard"
            className="header-action dashboard-action"
            aria-label="User Dashboard"
            onClick={closeMenu}
          >
            <FiUser />
            <span>Dashboard</span>
          </Link> */}

          {userToken ? (
            <Link
              to="/user/dashboard"
              className="login-button"
              onClick={closeMenu}
              title={`Logged in as ${userData.name || "Vendor"}`}
            >
              {userData.name ? userData.name.split(" ")[0] : "Dashboard"}
            </Link>
          ) : (
            <Link
              to="/login"
              className="login-button"
              onClick={closeMenu}
            >
              Login
            </Link>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav
        className={`main-nav ${menuOpen ? "nav-open" : ""}`}
        aria-label="Main navigation"
      >
        <div className="nav-inner">
          {navItems.map((item, index) => (
            <NavLink
              key={item.label}
              to={item.href}
              end={index === 0}
              className={({ isActive }) =>
                `nav-link ${
                  index === 0 && isActive ? "active" : ""
                }`
              }
              onClick={closeMenu}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
    <div className="site-header-spacer" aria-hidden="true" />
  </>
);
}
