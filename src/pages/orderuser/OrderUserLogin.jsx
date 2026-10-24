import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiLoader,
  FiHome,
  FiCheckCircle,
  FiAlertCircle,
  FiPackage,
  FiHeadphones,
} from "react-icons/fi";
import { orderUserLogin } from "../../lib/api";
import "./OrderUserLogin.css";

import Navbar from "../../components/Navbar";

export default function OrderUserLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const cleanEmail = formData.email.trim();
    if (!cleanEmail) {
      setErrorMsg("Please enter your registered email address.");
      return;
    }

    if (!formData.password) {
      setErrorMsg("Please enter your password.");
      return;
    }

    try {
      setLoading(true);
      const res = await orderUserLogin(cleanEmail, formData.password);

      if (res && res.success && res.token) {
        localStorage.setItem("orderUserToken", res.token);
        localStorage.setItem("orderUserData", JSON.stringify(res.user));
        if (rememberMe) {
          localStorage.setItem("rememberOrderUser", "true");
        }

        setSuccessMsg(res.message || "Login successful! Redirecting to dashboard...");

        setTimeout(() => {
          navigate("/order-user/dashboard");
        }, 800);
      } else {
        setErrorMsg(res?.message || "Invalid email or password. Please try again.");
      }
    } catch (err) {
      console.error("Order user login error:", err);
      setErrorMsg(err.message || "Login failed. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Navbar />
    <div className="order-login-page">
      <div className="order-login-overlay"></div>

      <div className="order-login-container">
        {/* Top brand header */}
        <div className="order-login-card">
          <div className="order-login-header">
            <Link to="/" className="order-login-home-link" title="Return to Home">
              <FiHome /> Back to Home
            </Link>

            <div className="order-login-logo">
              <span className="logo-badge">CUSTOMER PORTAL</span>
              <h2>Solar Customer Login</h2>
              <p>
                Access your orders, installation progress, and dedicated customer support
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="order-login-alert error">
              <FiAlertCircle />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="order-login-alert success">
              <FiCheckCircle />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="order-login-form">
            <div className="order-form-group">
              <label htmlFor="order-email">Registered Email Address</label>
              <div className="order-input-wrapper">
                <FiMail className="order-input-icon" />
                <input
                  id="order-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. customer@example.com"
                  autoComplete="email"
                  required
                />
              </div>
              <small className="order-input-hint">
                Use the email address entered during order booking
              </small>
            </div>

            <div className="order-form-group">
              <label htmlFor="order-password">Password</label>
              <div className="order-input-wrapper">
                <FiLock className="order-input-icon" />
                <input
                  id="order-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your account password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="order-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className="order-form-options">
              <label className="order-remember-checkbox">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Keep me signed in</span>
              </label>
            </div>

            <button
              type="submit"
              className="order-login-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <FiLoader className="spin-icon" /> Authenticating...
                </>
              ) : (
                <>
                  Login to Customer Dashboard <FiArrowRight />
                </>
              )}
            </button>
          </form>

          <div className="order-login-footer">
            <div className="login-perks-row">
              <div className="perk-item">
                <FiPackage /> <span>Track Solar Orders</span>
              </div>
              <div className="perk-item">
                <FiHeadphones /> <span>24/7 Support Desk</span>
              </div>
            </div>

            <div className="alternate-login-link">
              Are you a Vendor or Member?{" "}
              <Link to="/login">Click here for Vendor Login</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

