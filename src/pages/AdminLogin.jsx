import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FiArrowLeft,
  FiShield,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiKey,
  FiCheckCircle,
} from "react-icons/fi";

import "./AdminLogin.css";
import { adminLogin } from "../lib/api.js";

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberAdmin, setRememberAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");

  // If already logged in, redirect straight to dashboard
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
  };

  const handleFillDemo = () => {
    setFormData({
      email: "Starlinkadmin@gmail.com",
      password: "STARLINK@123#$",
    });
    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    const email = formData.email.trim();
    const password = formData.password;

    if (!email || !password) {
      setMessageType("error");
      setMessage("Please enter both admin email and password.");
      return;
    }

    setLoading(true);

    try {
      const data = await adminLogin(email, password);

      // Store authentication data
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminUser", JSON.stringify(data.admin));

      setMessageType("success");
      setMessage("Login successful! Redirecting to dashboard...");

      const destination = location.state?.from?.pathname || "/admin/dashboard";

      setTimeout(() => {
        navigate(destination, { replace: true });
      }, 500);
    } catch (error) {
      console.error("Admin login error:", error);
      setMessageType("error");
      setMessage(error.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <main className="admin-login-page">
      <section className="admin-login-layout">
        {/* Left information panel */}
        <aside className="admin-login-visual">
          <button
            type="button"
            className="admin-back-button"
            onClick={handleBack}
          >
            <FiArrowLeft />
            <span>Back</span>
          </button>

          <Link to="/" className="admin-brand">
            <span className="admin-brand-icon">
              <FiShield />
            </span>

            <span className="admin-brand-copy">
              <strong>SLG</strong>
              <small>ADMINISTRATION PORTAL</small>
            </span>
          </Link>

          <div className="admin-visual-content">
            <span className="admin-visual-eyebrow">
              ADMINISTRATOR ACCESS
            </span>

            <h1>
              Manage your
              <br />
              store with ease.
            </h1>

            <p>
              Access your furniture store management portal to manage
              products, categories, orders and customer activity.
            </p>

            <div className="admin-security-card">
              <span className="admin-security-icon">
                <FiKey />
              </span>

              <div>
                <strong>Authorized access only</strong>
                <p>
                  Sign in using your registered administrator account.
                </p>
              </div>
            </div>
          </div>

          <div className="admin-visual-footer">
            <FiShield />
            <span>SLG Store Management</span>
          </div>
        </aside>

        {/* Right login form */}
        <section className="admin-login-form-side">
          <div className="admin-login-form-card">
            <Link to="/" className="admin-mobile-brand">
              <FiShield />
              <span>SLG Admin</span>
            </Link>

            <span className="admin-form-eyebrow">
              ADMIN CONTROL PANEL
            </span>

            <h2>Admin Login</h2>

            <p className="admin-login-subtitle">
              Welcome back! Sign in with your database admin credentials.
            </p>

            <div
              className="admin-access-label"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>
                <span className="admin-access-dot" />
                Database Verified Admin
              </span>
              <button
                type="button"
                onClick={handleFillDemo}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#915b36",
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Auto-fill credentials
              </button>
            </div>

            <form
              className="admin-login-form"
              onSubmit={handleSubmit}
            >
              <div className="admin-login-field">
                <label htmlFor="admin-email">
                  Admin Email Address
                </label>

                <div className="admin-input-wrap">
                  <FiMail className="admin-input-icon" />

                  <input
                    id="admin-email"
                    type="email"
                    name="email"
                    placeholder="Starlinkadmin@gmail.com"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className="admin-login-field">
                <label htmlFor="admin-password">
                  Password
                </label>

                <div className="admin-input-wrap">
                  <FiLock className="admin-input-icon" />

                  <input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter admin password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="admin-password-toggle"
                    onClick={() =>
                      setShowPassword((previous) => !previous)
                    }
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div className="admin-login-options">
                <label className="admin-remember-option">
                  <input
                    type="checkbox"
                    checked={rememberAdmin}
                    onChange={(event) =>
                      setRememberAdmin(event.target.checked)
                    }
                  />
                  <span>Remember me</span>
                </label>

                <span style={{ fontSize: "11px", color: "#8a7360" }}>
                  Credential: Starlinkadmin@...
                </span>
              </div>

              {message && (
                <div
                  className={`admin-login-message ${messageType}`}
                  role="status"
                  aria-live="polite"
                >
                  {messageType === "success" && <FiCheckCircle style={{ marginRight: 6, verticalAlign: "middle" }} />}
                  {message}
                </div>
              )}

              <button
                type="submit"
                className="admin-login-submit"
                disabled={loading}
              >
                <span>{loading ? "Authenticating..." : "Sign In to Dashboard"}</span>
                <FiArrowRight />
              </button>
            </form>

            <div className="admin-login-divider">
              <span>SECURE ADMIN ACCESS</span>
            </div>

            <div className="admin-login-security-note">
              <FiShield />
              <span>
                Protected area: Unauthenticated requests are redirected.
              </span>
            </div>

            <Link to="/" className="admin-home-link">
              <FiArrowLeft />
              Return to SLG Store
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}
