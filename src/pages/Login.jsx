
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiHome,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiLoader,
} from "react-icons/fi";
import { vendorLogin } from "../lib/api";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    const loginId = formData.identifier.trim();
    if (!loginId || !formData.password) {
      setMessage("Please enter your registered email/mobile number and password.");
      setMessageType("error");
      return;
    }

    try {
      setSubmitting(true);
      const res = await vendorLogin(loginId, formData.password);

      if (res.success && res.token) {
        if (res.role === "OrderCustomer" || res.user?.role === "OrderCustomer") {
          localStorage.setItem("orderUserToken", res.token);
          localStorage.setItem("orderUserData", JSON.stringify(res.user));
          if (rememberMe) {
            localStorage.setItem("rememberOrderUser", "true");
          }
          setMessage(res.message || "Login successful! Redirecting to customer dashboard...");
          setMessageType("success");
          setTimeout(() => {
            navigate("/order-user/dashboard");
          }, 500);
          return;
        }

        localStorage.setItem("userToken", res.token);
        localStorage.setItem("userData", JSON.stringify(res.user));
        if (rememberMe) {
          localStorage.setItem("rememberUser", "true");
        } else {
          localStorage.removeItem("rememberUser");
        }

        setMessage("Login successful! Redirecting to dashboard...");
        setMessageType("success");

        setTimeout(() => {
          navigate("/user/dashboard");
        }, 500);
      } else {
        setMessage(res.message || "Invalid credentials. Please try again.");
        setMessageType("error");
      }
    } catch (err) {
      console.error("Login error:", err);
      setMessage(err.message || "Login failed. Please check your credentials.");
      setMessageType("error");
    } finally {
      setSubmitting(false);
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
    <main className="login-page">
      <section className="login-layout">
        <div className="login-visual">
          <button
            type="button"
            className="login-back-button"
            onClick={handleBack}
          >
            <FiArrowLeft />
            <span>Back</span>
          </button>

          <Link to="/" className="login-brand">
            <span className="login-brand-icon">
              <FiHome />
            </span>
            <span>
              <strong>SLG</strong>
              <small>FURNITURE FOR A BETTER LIFE</small>
            </span>
          </Link>

          <div className="login-visual-content">
            <span className="login-eyebrow">WELCOME TO SLG</span>

            <h1>
              Make yourself
              <br />
              at home.
            </h1>

            <p>
              Discover furniture that brings comfort, warmth and timeless
              style to every corner of your home.
            </p>

            <div className="login-feature">
              <span>01</span>
              <div>
                <strong>Thoughtful designs</strong>
                <small>Beautiful furniture for everyday living.</small>
              </div>
            </div>

            <div className="login-feature">
              <span>02</span>
              <div>
                <strong>Comfort that lasts</strong>
                <small>Find your perfect space with SLG.</small>
              </div>
            </div>
          </div>

          <div className="login-visual-footer">
            Your home, your style, your story.
          </div>
        </div>

        <div className="login-form-side">
          <div className="login-form-card">
            <Link to="/" className="mobile-login-brand">
              <FiHome />
              <span>SLG</span>
            </Link>

            <span className="form-eyebrow">YOUR HOME JOURNEY STARTS HERE</span>

            <h2>Welcome back!</h2>

            <p className="login-subtitle">
              Sign in to your account to continue shopping.
            </p>

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="login-field">
                <label htmlFor="login-identifier">Email or Mobile Number</label>

                <div className="login-input-wrap">
                  <FiMail className="login-input-icon" />

                  <input
                    id="login-identifier"
                    type="text"
                    name="identifier"
                    placeholder="Enter email or mobile number"
                    value={formData.identifier}
                    onChange={handleChange}
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className="login-field">
                <label htmlFor="login-password">Password</label>

                <div className="login-input-wrap">
                  <FiLock className="login-input-icon" />

                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
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

              <div className="login-options">
                <label className="remember-option">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) =>
                      setRememberMe(event.target.checked)
                    }
                  />
                  <span>Remember me</span>
                </label>

                <Link to="/forgot-password" className="forgot-link">
                  Forgot password?
                </Link>
              </div>

              {message && (
                <p
                  className={`login-message ${
                    messageType === "success" ? "login-message-success" : ""
                  }`}
                  role="status"
                >
                  {message}
                </p>
              )}

              <button
                type="submit"
                className="login-submit-button"
                disabled={submitting}
                style={{ opacity: submitting ? 0.75 : 1, cursor: submitting ? "not-allowed" : "pointer" }}
              >
                {submitting ? (
                  <>
                    <FiLoader className="spinning" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    Sign In
                    <FiArrowRight />
                  </>
                )}
              </button>
            </form>

            {/* <div className="login-divider">
              <span>NEW TO SLG?</span>
            </div> */}

            <p className="register-prompt">
              Don't have an account?{" "}
              <Link to="/member-register">Create account</Link>
            </p>

            {/* <p className="register-prompt" style={{ marginTop: "6px" }}>
              Quick access:{" "}
              <Link to="/user/dashboard"><strong>Go to User Dashboard →</strong></Link>
            </p> */}

            <div className="login-security-note">
              <FiLock />
              <span>Your account details are kept secure.</span>
            </div>

            {/* <Link to="/" className="back-home-link">
              <FiArrowLeft />
              Continue browsing as a guest
            </Link> */}
          </div>
        </div>
      </section>
    </main>
  );
}
