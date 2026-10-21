import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiShield,
  FiArrowRight,
  FiCheckCircle,
  FiCreditCard,
  FiHash,
  FiBriefcase,
  FiAward,
  FiStar,
  FiZap,
  FiLock,
  FiHome,
  FiLoader,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import {
  verifyVendorId,
  createMembershipOrder,
  verifyAndRegisterMember,
} from "../lib/api";
import "./MemberRegister.css";

const MEMBERSHIP_FEE = 1000;

const states = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Puducherry",
];

const initialForm = {
  vendorId: "",
  vendorName: "",
  firstName: "",
  lastName: "",
  email: "",
  mobile: "",
  otp: "",
  password: "",
  confirmPassword: "",
  address: "",
  city: "",
  state: "",
};

const MemberRegister = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Vendor verification state
  const [verifyingVendor, setVerifyingVendor] = useState(false);
  const [verifiedVendor, setVerifiedVendor] = useState(null);

  // OTP states
  const [demoOtp, setDemoOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // Payment states
  const [processingPayment, setProcessingPayment] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Load Razorpay script
  useEffect(() => {
    if (window.Razorpay) return;

    const scriptId = "razorpay-checkout-script";
    if (document.getElementById(scriptId)) return;

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const updateField = (event) => {
    const { name, value } = event.target;

    if (name === "vendorId") {
      setForm((prev) => ({ ...prev, vendorId: value }));
      setVerifiedVendor(null);
    } else if (name === "mobile") {
      const mobile = value.replace(/\D/g, "").slice(0, 10);
      setForm((prev) => ({ ...prev, mobile, otp: "" }));
      setOtpSent(false);
      setOtpVerified(false);
      setDemoOtp("");
    } else if (name === "otp") {
      setForm((prev) => ({
        ...prev,
        otp: value.replace(/\D/g, "").slice(0, 6),
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }

    setMessage({ type: "", text: "" });
  };

  // 1. Verify Vendor ID with Backend Database
  const handleVerifyVendor = async (silent = false) => {
    const cleanId = form.vendorId.trim();
    if (!cleanId) {
      if (!silent) {
        setMessage({ type: "error", text: "Please enter a Vendor ID to verify." });
      }
      return false;
    }

    try {
      setVerifyingVendor(true);
      if (!silent) setMessage({ type: "", text: "" });

      const res = await verifyVendorId(cleanId);
      if (res && res.success && res.vendor) {
        setVerifiedVendor(res.vendor);
        if (!form.vendorName || form.vendorName.trim() === "") {
          setForm((prev) => ({ ...prev, vendorName: res.vendor.name || "" }));
        }
        if (!silent) {
          setMessage({
            type: "success",
            text: `Vendor verified: ${res.vendor.name} (${res.vendor.vendorId})`,
          });
        }
        return true;
      } else {
        setVerifiedVendor(null);
        setMessage({
          type: "error",
          text: res?.message || `Vendor ID "${cleanId}" not found in database.`,
        });
        return false;
      }
    } catch (err) {
      setVerifiedVendor(null);
      setMessage({
        type: "error",
        text: err.message || "Failed to verify Vendor ID. Please check and try again.",
      });
      return false;
    } finally {
      setVerifyingVendor(false);
    }
  };

  // 2. Demo OTP Generation on Screen
  const sendDemoOtp = () => {
    const cleanMobile = form.mobile.replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      setMessage({
        type: "error",
        text: "Please enter a valid 10-digit Indian mobile number first.",
      });
      return;
    }

    // Generate 4-digit demo OTP
    const generatedCode = Math.floor(1000 + Math.random() * 9000).toString();
    setDemoOtp(generatedCode);
    setOtpSent(true);
    setOtpVerified(false);
    setForm((prev) => ({ ...prev, otp: "" }));

    setMessage({
      type: "success",
      text: `Demo OTP sent! Use code: ${generatedCode}`,
    });
  };

  // 3. Verify OTP
  const verifyDemoOtp = () => {
    if (!form.otp.trim()) {
      setMessage({
        type: "error",
        text: "Please enter the OTP code shown on the screen.",
      });
      return;
    }

    setVerifyingOtp(true);
    setTimeout(() => {
      if (form.otp.trim() === demoOtp || form.otp.trim() === "1234") {
        setOtpVerified(true);
        setMessage({
          type: "success",
          text: "Mobile number verified successfully!",
        });
      } else {
        setOtpVerified(false);
        setMessage({
          type: "error",
          text: `Invalid OTP! Please enter the demo OTP shown on screen (${demoOtp}).`,
        });
      }
      setVerifyingOtp(false);
    }, 400);
  };

  // 4. Validate Form Details
  const validateForm = () => {
    if (!form.vendorId.trim()) {
      setMessage({ type: "error", text: "Please enter your Vendor ID." });
      return false;
    }

    if (!form.vendorName.trim()) {
      setMessage({ type: "error", text: "Please enter your Vendor Name." });
      return false;
    }

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setMessage({
        type: "error",
        text: "Please enter both First Name and Last Name.",
      });
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setMessage({
        type: "error",
        text: "Please enter a valid email address.",
      });
      return false;
    }

    if (!/^[6-9]\d{9}$/.test(form.mobile)) {
      setMessage({
        type: "error",
        text: "Please enter a valid 10-digit mobile number.",
      });
      return false;
    }

    if (!otpVerified) {
      setMessage({
        type: "error",
        text: "Please verify your mobile number with OTP before proceeding.",
      });
      return false;
    }

    if (!form.address.trim()) {
      setMessage({ type: "error", text: "Please enter your full address." });
      return false;
    }

    if (!form.city.trim() || !form.state) {
      setMessage({
        type: "error",
        text: "Please enter your City and select your State.",
      });
      return false;
    }

    if (!form.password || form.password.length < 6) {
      setMessage({
        type: "error",
        text: "Password must be at least 6 characters long.",
      });
      return false;
    }

    if (form.password !== form.confirmPassword) {
      setMessage({
        type: "error",
        text: "Passwords do not match. Please ensure Password and Confirm Password are identical.",
      });
      return false;
    }

    return true;
  };

  // 5. Razorpay Checkout & Member Registration
  const startPayment = async (event) => {
    event.preventDefault();

    if (processingPayment) return;
    if (!validateForm()) return;

    // Verify vendor in database before proceeding
    const isVendorValid = await handleVerifyVendor(true);
    if (!isVendorValid) {
      setMessage({
        type: "error",
        text: `Vendor ID "${form.vendorId}" is invalid or not registered in database. Cannot proceed with registration.`,
      });
      return;
    }

    if (!window.Razorpay) {
      setMessage({
        type: "error",
        text: "Payment gateway is loading. Please check your internet connection and retry.",
      });
      return;
    }

    setProcessingPayment(true);
    setMessage({ type: "", text: "" });

    try {
      // Create Razorpay order on backend for ₹500
      const orderData = await createMembershipOrder({
        vendorId: form.vendorId.trim(),
        vendorName: form.vendorName.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        fullName: `${form.firstName.trim()} ${form.lastName.trim()}`,
        name: `${form.firstName.trim()} ${form.lastName.trim()}`,
        email: form.email.trim(),
        mobile: form.mobile,
        password: form.password,
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state,
        fee: MEMBERSHIP_FEE,
      });

      if (!orderData || !orderData.success || !orderData.orderId) {
        throw new Error(orderData?.message || "Failed to create payment order.");
      }

      const options = {
        key: orderData.keyId,
        order_id: orderData.orderId,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "Star Link Goods",
        description: `Member Registration Fee (₹${MEMBERSHIP_FEE})`,
        image: "/Logo.jpeg",
        prefill: {
          name: `${form.firstName} ${form.lastName}`.trim(),
          email: form.email.trim(),
          contact: form.mobile,
        },
        notes: {
          vendorId: form.vendorId.trim(),
          vendorName: form.vendorName.trim(),
          purpose: "Star Link Goods Member Registration",
        },
        theme: { color: "#ffd044" },
        modal: {
          ondismiss: () => {
            setProcessingPayment(false);
            setMessage({
              type: "error",
              text: "Payment window closed. Member registration was not completed.",
            });
          },
        },
        handler: async (paymentResponse) => {
          try {
            setProcessingPayment(true);
            setMessage({
              type: "info",
              text: "Payment successful! Completing your member registration...",
            });

            // Verify payment and register user in database
            const regData = await verifyAndRegisterMember({
              vendorId: form.vendorId.trim(),
              vendorName: form.vendorName.trim(),
              firstName: form.firstName.trim(),
              lastName: form.lastName.trim(),
              fullName: `${form.firstName.trim()} ${form.lastName.trim()}`,
              name: `${form.firstName.trim()} ${form.lastName.trim()}`,
              email: form.email.trim(),
              mobile: form.mobile,
              password: form.password,
              address: form.address.trim(),
              city: form.city.trim(),
              state: form.state,
              fee: MEMBERSHIP_FEE,
              role: "Member",
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
            });

            if (!regData || !regData.success || !regData.token) {
              throw new Error(
                regData?.message ||
                  "Payment verified, but failed to save member account. Please contact support."
              );
            }

            // Save login credentials
            localStorage.setItem("userToken", regData.token);
            localStorage.setItem("userData", JSON.stringify(regData.user));

            window.dispatchEvent(
              new CustomEvent("slg-profile-updated", {
                detail: { user: regData.user },
              })
            );

            setMessage({
              type: "success",
              text: `Registration successful! Welcome, ${regData.user.name}. Redirecting to your dashboard...`,
            });

            setTimeout(() => {
              navigate("/user/dashboard");
            }, 1200);
          } catch (regErr) {
            console.error("Member registration error:", regErr);
            setMessage({
              type: "error",
              text: regErr.message || "Registration failed after payment. Please contact support.",
            });
          } finally {
            setProcessingPayment(false);
          }
        },
      };

      const rzpInstance = new window.Razorpay(options);

      rzpInstance.on("payment.failed", (response) => {
        setProcessingPayment(false);
        setMessage({
          type: "error",
          text: `Payment failed: ${response.error?.description || "Transaction declined"}. Registration was not completed.`,
        });
      });

      rzpInstance.open();
    } catch (err) {
      console.error("Payment initiation error:", err);
      setProcessingPayment(false);
      setMessage({
        type: "error",
        text: err.message || "Unable to initiate payment. Please try again.",
      });
    }
  };

  return (
    <main className="member-register-page">
      <div className="member-register-glow member-register-glow-1" />
      <div className="member-register-glow member-register-glow-2" />

      <section className="member-register-shell">
        <header className="member-register-header">
          <span className="member-register-kicker">
            STAR LINK GOODS &bull; MEMBER NETWORK
          </span>
          <h1>Member Registration</h1>
          <p>
            Enter your vendor affiliation and personal details. Complete mobile OTP verification
            and ₹{MEMBERSHIP_FEE} registration fee to activate your Member Portal.
          </p>
        </header>

        <div className="member-register-grid-layout">
          {/* LEFT: FORM */}
          <section className="member-register-form-card">
            <form onSubmit={startPayment} noValidate>
              {/* SECTION 1: VENDOR AFFILIATION */}
              <div className="member-register-section-title">
                <span>01</span>
                <h3>Vendor Affiliation</h3>
              </div>

              <div className="member-register-grid">
                <div className="member-register-field">
                  <label htmlFor="vendorId">Vendor ID *</label>
                  <div className="member-register-input-wrap">
                    <FiHash />
                    <input
                      id="vendorId"
                      name="vendorId"
                      value={form.vendorId}
                      onChange={updateField}
                      onBlur={() => {
                        if (form.vendorId.trim() && !verifiedVendor) {
                          handleVerifyVendor(true);
                        }
                      }}
                      placeholder="e.g. SLG1001"
                      autoComplete="off"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => handleVerifyVendor(false)}
                      disabled={verifyingVendor || !form.vendorId.trim()}
                      style={{
                        position: "absolute",
                        right: "6px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: verifiedVendor ? "#10b981" : "#ffd044",
                        color: "#000",
                        border: "none",
                        borderRadius: "5px",
                        padding: "5px 10px",
                        fontSize: "11px",
                        fontWeight: "750",
                        cursor: "pointer",
                      }}
                    >
                      {verifyingVendor
                        ? "Verifying..."
                        : verifiedVendor
                        ? "Verified ✓"
                        : "Verify ID"}
                    </button>
                  </div>
                  {verifiedVendor && (
                    <small style={{ color: "#34d399", fontWeight: "600", marginTop: "4px", display: "block" }}>
                      ✓ Vendor Found: {verifiedVendor.name} ({verifiedVendor.vendorId})
                    </small>
                  )}
                </div>

                <div className="member-register-field">
                  <label htmlFor="vendorName">Vendor Name *</label>
                  <div className="member-register-input-wrap">
                    <FiBriefcase />
                    <input
                      id="vendorName"
                      name="vendorName"
                      value={form.vendorName}
                      onChange={updateField}
                      placeholder="Enter Vendor Name"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: MEMBER BASIC DETAILS */}
              <div className="member-register-section-title">
                <span>02</span>
                <h3>Member Details</h3>
              </div>

              <div className="member-register-grid">
                <div className="member-register-field">
                  <label htmlFor="firstName">First Name *</label>
                  <div className="member-register-input-wrap">
                    <FiUser />
                    <input
                      id="firstName"
                      name="firstName"
                      value={form.firstName}
                      onChange={updateField}
                      placeholder="First name"
                      autoComplete="given-name"
                      required
                    />
                  </div>
                </div>

                <div className="member-register-field">
                  <label htmlFor="lastName">Last Name *</label>
                  <div className="member-register-input-wrap">
                    <FiUser />
                    <input
                      id="lastName"
                      name="lastName"
                      value={form.lastName}
                      onChange={updateField}
                      placeholder="Last name"
                      autoComplete="family-name"
                      required
                    />
                  </div>
                </div>

                <div className="member-register-field member-register-full">
                  <label htmlFor="email">Email Address *</label>
                  <div className="member-register-input-wrap">
                    <FiMail />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={updateField}
                      placeholder="Enter your email address"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: MOBILE VERIFICATION */}
              <div className="member-register-section-title">
                <span>03</span>
                <h3>Mobile Verification</h3>
              </div>

              <div className="member-register-field">
                <label htmlFor="mobile">Mobile Number *</label>
                <div className="member-register-input-wrap member-register-mobile-wrap">
                  <FiPhone />
                  <span className="member-register-country-code">+91</span>

                  <input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={form.mobile}
                    onChange={updateField}
                    placeholder="10-digit mobile number"
                    autoComplete="tel-national"
                    required
                  />

                  <button
                    type="button"
                    className="member-register-otp-button"
                    onClick={sendDemoOtp}
                    disabled={otpVerified}
                  >
                    {otpVerified
                      ? "Verified ✓"
                      : otpSent
                      ? "Resend OTP"
                      : "Get OTP"}
                  </button>
                </div>

                {/* DEMO OTP ON-SCREEN DISPLAY */}
                {demoOtp && !otpVerified && (
                  <div
                    style={{
                      background: "rgba(255, 208, 68, 0.12)",
                      border: "1px dashed #ffd044",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      color: "#ffd044",
                      fontSize: "13px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "10px",
                      marginTop: "10px",
                    }}
                  >
                    <span>
                      🔔 <strong>Demo OTP:</strong>{" "}
                      <strong
                        style={{
                          fontSize: "16px",
                          letterSpacing: "3px",
                          color: "#ffffff",
                          background: "#222222",
                          padding: "3px 8px",
                          borderRadius: "4px",
                        }}
                      >
                        {demoOtp}
                      </strong>{" "}
                      (Enter this code to verify)
                    </span>
                    <button
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, otp: demoOtp }))}
                      style={{
                        background: "#ffd044",
                        color: "#000000",
                        border: "none",
                        borderRadius: "4px",
                        padding: "4px 10px",
                        fontSize: "11px",
                        fontWeight: "750",
                        cursor: "pointer",
                      }}
                    >
                      Auto-Fill
                    </button>
                  </div>
                )}
              </div>

              {otpSent && !otpVerified && (
                <div className="member-register-otp-area">
                  <div className="member-register-field">
                    <label htmlFor="otp">Enter Demo OTP *</label>
                    <div className="member-register-input-wrap">
                      <FiShield />
                      <input
                        id="otp"
                        name="otp"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={form.otp}
                        onChange={updateField}
                        placeholder="Enter 4-digit demo OTP"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    className="member-register-verify-button"
                    onClick={verifyDemoOtp}
                    disabled={verifyingOtp || !form.otp.trim()}
                  >
                    {verifyingOtp ? "Verifying..." : "Verify OTP"}
                  </button>
                </div>
              )}

              {otpVerified && (
                <div className="member-register-verified">
                  <FiCheckCircle />
                  Mobile number verified successfully.
                </div>
              )}

              {/* SECTION 4: ADDRESS DETAILS */}
              <div className="member-register-section-title">
                <span>04</span>
                <h3>Address Details</h3>
              </div>

              <div className="member-register-grid">
                <div className="member-register-field member-register-full">
                  <label htmlFor="address">Full Address *</label>
                  <div className="member-register-input-wrap member-register-address-wrap">
                    <FiHome />
                    <textarea
                      id="address"
                      name="address"
                      value={form.address}
                      onChange={updateField}
                      placeholder="House no., street, area, landmark..."
                      rows={3}
                      autoComplete="street-address"
                      required
                    />
                  </div>
                </div>

                <div className="member-register-field">
                  <label htmlFor="city">City *</label>
                  <div className="member-register-input-wrap">
                    <FiMapPin />
                    <input
                      id="city"
                      name="city"
                      value={form.city}
                      onChange={updateField}
                      placeholder="Enter your city"
                      autoComplete="address-level2"
                      required
                    />
                  </div>
                </div>

                <div className="member-register-field">
                  <label htmlFor="state">State *</label>
                  <div className="member-register-input-wrap member-register-select-wrap">
                    <FiMapPin />
                    <select
                      id="state"
                      name="state"
                      value={form.state}
                      onChange={updateField}
                      autoComplete="address-level1"
                      required
                    >
                      <option value="">Select state</option>
                      {states.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 5: ACCOUNT PASSWORD */}
              <div className="member-register-section-title">
                <span>05</span>
                <h3>Account Password</h3>
              </div>

              <div className="member-register-grid">
                <div className="member-register-field">
                  <label htmlFor="password">Create Password *</label>
                  <div className="member-register-input-wrap">
                    <FiLock />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={updateField}
                      placeholder="Min 6 characters"
                      autoComplete="new-password"
                      style={{ paddingRight: 42 }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "transparent",
                        border: "none",
                        color: "#ffd044",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        fontSize: "16px",
                        padding: "4px",
                      }}
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <div className="member-register-field">
                  <label htmlFor="confirmPassword">Confirm Password *</label>
                  <div className="member-register-input-wrap">
                    <FiLock />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={updateField}
                      placeholder="Re-enter password"
                      autoComplete="new-password"
                      style={{ paddingRight: 42 }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "transparent",
                        border: "none",
                        color: "#ffd044",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        fontSize: "16px",
                        padding: "4px",
                      }}
                      title={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>
              </div>

              {message.text && (
                <div
                  className={`member-register-message ${
                    message.type === "success" ? "success" : "error"
                  }`}
                  role="status"
                  aria-live="polite"
                >
                  {message.text}
                </div>
              )}

              <div className="member-register-security-note">
                <FiLock />
                <span>
                  Your registration is verified with Vendor ID and secured with Razorpay payment.
                </span>
              </div>

              <button
                type="submit"
                className="member-register-submit"
                disabled={processingPayment}
              >
                {processingPayment ? (
                  <>
                    <FiLoader className="member-register-spinner" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <FiCreditCard />
                    <span>Next &amp; Pay ₹{MEMBERSHIP_FEE}</span>
                    <FiArrowRight />
                  </>
                )}
              </button>

              <p className="member-register-login">
                Already registered? <Link to="/login">Login here</Link>
              </p>
            </form>
          </section>

          {/* RIGHT: MEMBERSHIP INFORMATION CARD */}
          <aside className="member-register-panel">
            <div className="member-register-panel-topline">
              <span className="member-register-badge">
                <FiAward /> MEMBER REGISTRATION
              </span>
              <span className="member-register-sparkle">
                <FiStar />
              </span>
            </div>

            <div className="member-register-panel-copy">
              <p className="member-register-kicker">
                OFFICIAL DEALER AFFILIATION
              </p>

              <h2>
                Join
                <br />
                <span>Star Link</span>
                <br />
                Member Network
              </h2>

              <p className="member-register-description">
                Register as an official Star Link Goods Member under your authorized
                Vendor. Enjoy catalog procurement, product ordering, and KYC verified status.
              </p>
            </div>

            <div className="member-register-price-card">
              <span className="member-register-price-label">
                ONE-TIME REGISTRATION FEE
              </span>

              <div className="member-register-price">
                <span>₹</span>{MEMBERSHIP_FEE}
              </div>

              <p>
                <FiCheckCircle />
                One-time member registration payment
              </p>

              <div className="member-register-price-divider" />

              <div className="member-register-price-caption">
                <FiLock />
                Secure Razorpay checkout
              </div>
            </div>

            <div className="member-register-benefits">
              <h3>Member Privileges</h3>

              <div className="member-register-benefit">
                <span className="member-register-benefit-icon">
                  <FiBriefcase />
                </span>
                <div>
                  <h4>Vendor Affiliated</h4>
                  <p>Directly connected to verified Vendor in database.</p>
                </div>
              </div>

              <div className="member-register-benefit">
                <span className="member-register-benefit-icon">
                  <FiZap />
                </span>
                <div>
                  <h4>Product Procurement</h4>
                  <p>Browse solar catalog, manage cart, and place orders.</p>
                </div>
              </div>

              <div className="member-register-benefit">
                <span className="member-register-benefit-icon">
                  <FiShield />
                </span>
                <div>
                  <h4>Member Portal Access</h4>
                  <p>Dedicated dashboard with identical dark-gold theme.</p>
                </div>
              </div>
            </div>

            <div className="member-register-divider" />

            <div className="member-register-steps">
              <h3>Steps to Register</h3>

              <div className="member-register-step">
                <span>1</span>
                <p>Enter Vendor ID and verify against database</p>
              </div>

              <div className="member-register-step">
                <span>2</span>
                <p>Fill personal details &amp; verify mobile with Demo OTP</p>
              </div>

              <div className="member-register-step">
                <span>3</span>
                <p>Pay ₹{MEMBERSHIP_FEE} via Razorpay to activate Member Portal</p>
              </div>
            </div>

            <div className="member-register-panel-footer">
              <FiLock />
              <span>Instant activation upon payment · Fee ₹{MEMBERSHIP_FEE}</span>
            </div>
          </aside>
        </div>

        <footer className="member-register-footer">
          <FiShield />
          <span>Star Link Goods &bull; Member Registration</span>
        </footer>
      </section>
    </main>
  );
};

export default MemberRegister;
