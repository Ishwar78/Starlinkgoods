import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
} from "react-icons/fi";
import "./VendorRegister.css";

const API_BASE_URL = "/api";
const MEMBERSHIP_FEE = 500;

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
  city: "",
  state: "",
};

const VendorRegister = () => {
  const [form, setForm] = useState(initialForm);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
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

    if (name === "mobile") {
      const mobile = value.replace(/\D/g, "").slice(0, 10);

      setForm((previous) => ({
        ...previous,
        mobile,
        otp: "",
      }));

      setOtpSent(false);
      setOtpVerified(false);
    } else {
      setForm((previous) => ({
        ...previous,
        [name]: value,
      }));
    }

    setMessage({ type: "", text: "" });
  };

  const validateBasicDetails = () => {
    if (!form.vendorId.trim()) {
      setMessage({
        type: "error",
        text: "Please enter your Vendor ID.",
      });
      return false;
    }

    if (!form.vendorName.trim()) {
      setMessage({
        type: "error",
        text: "Please enter your Vendor Name.",
      });
      return false;
    }

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setMessage({
        type: "error",
        text: "Please enter your first name and last name.",
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
        text: "Please enter a valid 10-digit Indian mobile number.",
      });
      return false;
    }

    if (!form.city.trim() || !form.state) {
      setMessage({
        type: "error",
        text: "Please enter your city and select your state.",
      });
      return false;
    }

    return true;
  };

  const sendOtp = async () => {
    if (!/^[6-9]\d{9}$/.test(form.mobile)) {
      setMessage({
        type: "error",
        text: "Please enter a valid 10-digit mobile number first.",
      });
      return;
    }

    setSendingOtp(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile: form.mobile,
          purpose: "vendor-registration",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to send OTP.");
      }

      setOtpSent(true);
      setOtpVerified(false);

      setMessage({
        type: "success",
        text: data.message || "OTP sent successfully to your mobile.",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "OTP service is unavailable.",
      });
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyOtp = async () => {
    if (!/^\d{4,8}$/.test(form.otp)) {
      setMessage({
        type: "error",
        text: "Please enter the OTP received on your mobile.",
      });
      return;
    }

    setVerifyingOtp(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile: form.mobile,
          otp: form.otp,
          purpose: "vendor-registration",
        }),
      });

      const data = await response.json();

      if (!response.ok || data.verified !== true) {
        throw new Error(data.message || "OTP verification failed.");
      }

      setOtpVerified(true);
      setMessage({
        type: "success",
        text: "Mobile number verified successfully.",
      });
    } catch (error) {
      setOtpVerified(false);
      setMessage({
        type: "error",
        text: error.message || "Unable to verify OTP.",
      });
    } finally {
      setVerifyingOtp(false);
    }
  };

  const startPayment = async (event) => {
    event.preventDefault();

    if (!validateBasicDetails()) return;

    if (!otpVerified) {
      setMessage({
        type: "error",
        text: "Please verify your mobile number before continuing.",
      });
      return;
    }

    if (!window.Razorpay) {
      setMessage({
        type: "error",
        text: "Payment service is loading. Please refresh and try again.",
      });
      return;
    }

    setProcessingPayment(true);
    setMessage({ type: "", text: "" });

    try {
      const orderResponse = await fetch(
        `${API_BASE_URL}/payments/create-order`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            purpose: "vendor-registration",
            vendorId: form.vendorId.trim(),
            vendorName: form.vendorName.trim(),
          }),
        }
      );

      const orderData = await orderResponse.json();

      if (!orderResponse.ok || !orderData.orderId || !orderData.keyId) {
        throw new Error(
          orderData.message || "Unable to create payment order."
        );
      }

      // Backend must create the Razorpay order for exactly ₹500.
      if (Number(orderData.amount) !== MEMBERSHIP_FEE * 100) {
        throw new Error(
          "Membership payment amount is not configured correctly. Please contact support."
        );
      }

      const options = {
        key: orderData.keyId,
        order_id: orderData.orderId,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "Star Link Goods",
        description: "Vendor Membership Registration",
        prefill: {
          name: `${form.firstName} ${form.lastName}`.trim(),
          email: form.email.trim(),
          contact: form.mobile,
        },
        notes: {
          vendorId: form.vendorId.trim(),
          vendorName: form.vendorName.trim(),
          purpose: "vendor-registration",
        },
        theme: {
          color: "#d6ad60",
        },
        modal: {
          ondismiss: () => {
            setProcessingPayment(false);
            setMessage({
              type: "error",
              text: "Payment window closed. You can try again.",
            });
          },
        },
        handler: async (paymentResponse) => {
          try {
            const registrationResponse = await fetch(
              `${API_BASE_URL}/auth/register-vendor`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  vendorId: form.vendorId.trim(),
                  vendorName: form.vendorName.trim(),
                  firstName: form.firstName.trim(),
                  lastName: form.lastName.trim(),
                  email: form.email.trim(),
                  mobile: form.mobile,
                  city: form.city.trim(),
                  state: form.state,
                  membershipFee: MEMBERSHIP_FEE,
                  paymentId: paymentResponse.razorpay_payment_id,
                  razorpayOrderId: paymentResponse.razorpay_order_id,
                  razorpaySignature: paymentResponse.razorpay_signature,
                }),
              }
            );

            const registrationData = await registrationResponse.json();

            if (!registrationResponse.ok) {
              throw new Error(
                registrationData.message ||
                  "Payment received, but registration could not be completed. Please contact support."
              );
            }

            setMessage({
              type: "success",
              text:
                registrationData.message ||
                "Congratulations! Your vendor membership registration is complete.",
            });
          } catch (error) {
            setMessage({
              type: "error",
              text:
                error.message ||
                "Unable to complete vendor registration. Please contact support.",
            });
          } finally {
            setProcessingPayment(false);
          }
        },
      };

      const payment = new window.Razorpay(options);

      payment.on("payment.failed", (response) => {
        setProcessingPayment(false);
        setMessage({
          type: "error",
          text:
            response.error?.description ||
            "Payment failed. Please try again.",
        });
      });

      payment.open();
    } catch (error) {
      setProcessingPayment(false);
      setMessage({
        type: "error",
        text: error.message || "Unable to start payment.",
      });
    }
  };

  return (
    <main className="vendor-register-page">
      <div className="vendor-register-glow vendor-register-glow-one" />
      <div className="vendor-register-glow vendor-register-glow-two" />

      <section className="vendor-register-container">
        <header className="vendor-register-heading">
          <span className="vendor-register-eyebrow">
            <FiStar /> YOUR JOURNEY STARTS HERE
          </span>

          <h1>
            Become a <span>Member</span>
          </h1>

          <p>
            Join the Star Link Goods network and take the next step towards
            growing your business with us.
          </p>
        </header>

        <div className="vendor-register-layout">
          {/* LEFT SIDE: REGISTRATION FORM */}
          <section className="vendor-register-card">
            <div className="vendor-register-card-heading">
              <div className="vendor-register-heading-icon">
                <FiUser />
              </div>

              <div>
                <h2>Vendor Registration</h2>
                <p>Enter your details to get started.</p>
              </div>
            </div>

            <div className="vendor-register-progress">
              <span className="active">
                <b>01</b> Details
              </span>
              <i />
              <span className={otpVerified ? "active" : ""}>
                <b>02</b> Verify
              </span>
              <i />
              <span>
                <b>03</b> Payment
              </span>
            </div>

            <form onSubmit={startPayment}>
              <div className="vendor-register-section-title">
                <span>01</span>
                <h3>Vendor Information</h3>
              </div>

              <div className="vendor-register-grid">
                <div className="vendor-register-field">
                  <label htmlFor="vendorId">Vendor ID *</label>
                  <div className="vendor-register-input-wrap">
                    <FiHash />
                    <input
                      id="vendorId"
                      name="vendorId"
                      value={form.vendorId}
                      onChange={updateField}
                      placeholder="Enter Vendor ID"
                      autoComplete="off"
                      required
                    />
                  </div>
                </div>

                <div className="vendor-register-field">
                  <label htmlFor="vendorName">Vendor Name *</label>
                  <div className="vendor-register-input-wrap">
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

              <div className="vendor-register-section-title">
                <span>02</span>
                <h3>Personal Information</h3>
              </div>

              <div className="vendor-register-grid">
                <div className="vendor-register-field">
                  <label htmlFor="firstName">First Name *</label>
                  <div className="vendor-register-input-wrap">
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

                <div className="vendor-register-field">
                  <label htmlFor="lastName">Last Name *</label>
                  <div className="vendor-register-input-wrap">
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

                <div className="vendor-register-field vendor-register-full">
                  <label htmlFor="email">Email Address *</label>
                  <div className="vendor-register-input-wrap">
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

              <div className="vendor-register-section-title">
                <span>03</span>
                <h3>Mobile Verification</h3>
              </div>

              <div className="vendor-register-field">
                <label htmlFor="mobile">Mobile Number *</label>
                <div className="vendor-register-input-wrap vendor-register-mobile-wrap">
                  <FiPhone />
                  <span className="vendor-register-country-code">+91</span>

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
                    className="vendor-register-otp-button"
                    onClick={sendOtp}
                    disabled={sendingOtp || otpVerified}
                  >
                    {otpVerified
                      ? "Verified"
                      : sendingOtp
                      ? "Sending..."
                      : otpSent
                      ? "Resend OTP"
                      : "Get OTP"}
                  </button>
                </div>
              </div>

              {otpSent && !otpVerified && (
                <div className="vendor-register-otp-area">
                  <div className="vendor-register-field">
                    <label htmlFor="otp">Enter OTP *</label>
                    <div className="vendor-register-input-wrap">
                      <FiShield />
                      <input
                        id="otp"
                        name="otp"
                        type="text"
                        inputMode="numeric"
                        maxLength={8}
                        value={form.otp}
                        onChange={updateField}
                        placeholder="Enter received OTP"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    className="vendor-register-verify-button"
                    onClick={verifyOtp}
                    disabled={verifyingOtp}
                  >
                    {verifyingOtp ? "Verifying..." : "Verify OTP"}
                  </button>
                </div>
              )}

              {otpVerified && (
                <div className="vendor-register-verified">
                  <FiCheckCircle />
                  Mobile number verified successfully.
                </div>
              )}

              <div className="vendor-register-section-title">
                <span>04</span>
                <h3>Location Details</h3>
              </div>

              <div className="vendor-register-grid">
                <div className="vendor-register-field">
                  <label htmlFor="city">City *</label>
                  <div className="vendor-register-input-wrap">
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

                <div className="vendor-register-field">
                  <label htmlFor="state">State *</label>
                  <div className="vendor-register-input-wrap vendor-register-select-wrap">
                    <FiMapPin />
                    <select
                      id="state"
                      name="state"
                      value={form.state}
                      onChange={updateField}
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

              {message.text && (
                <div
                  className={`vendor-register-message ${
                    message.type === "success" ? "success" : "error"
                  }`}
                  role="status"
                >
                  {message.text}
                </div>
              )}

              <div className="vendor-register-mobile-note">
                <FiLock />
                <span>
                  Your details are protected. Verify your mobile number before
                  proceeding to payment.
                </span>
              </div>

              <button
                type="submit"
                className="vendor-register-submit"
                disabled={processingPayment}
              >
                <FiCreditCard />
                <span>
                  {processingPayment
                    ? "Processing..."
                    : `Pay ₹${MEMBERSHIP_FEE} & Become a Member`}
                </span>
                <FiArrowRight />
              </button>

              <p className="vendor-register-login">
                Already registered? <Link to="/login">Login here</Link>
              </p>
            </form>
          </section>

          {/* RIGHT SIDE: MEMBERSHIP OFFER */}
          <aside className="vendor-membership-panel">
            <div className="vendor-membership-topline">
              <span className="vendor-membership-badge">
                <FiAward /> MEMBERSHIP PLAN
              </span>
              <span className="vendor-membership-sparkle">
                <FiStar />
              </span>
            </div>

            <div className="vendor-membership-copy">
              <p className="vendor-membership-kicker">YOUR BUSINESS. YOUR FUTURE.</p>

              <h2>
                Become a
                <br />
                <span>Star Link</span>
                <br />
                Member
              </h2>

              <p className="vendor-membership-description">
                Take your first step towards joining our vendor network with a
                simple one-time registration fee.
              </p>
            </div>

            <div className="vendor-membership-price-card">
              <span className="vendor-membership-price-label">
                ONE-TIME MEMBERSHIP FEE
              </span>

              <div className="vendor-membership-price">
                <span>₹</span>500
              </div>

              <p>
                <FiCheckCircle /> One-time registration payment
              </p>
            </div>

            <div className="vendor-membership-benefits">
              <h3>Why become a member?</h3>

              <div className="vendor-membership-benefit">
                <span className="vendor-membership-benefit-icon">
                  <FiBriefcase />
                </span>
                <div>
                  <h4>Join Our Vendor Network</h4>
                  <p>Register your details with Star Link Goods.</p>
                </div>
              </div>

              <div className="vendor-membership-benefit">
                <span className="vendor-membership-benefit-icon">
                  <FiZap />
                </span>
                <div>
                  <h4>Simple Registration Process</h4>
                  <p>Complete your details and verify your mobile number.</p>
                </div>
              </div>

              <div className="vendor-membership-benefit">
                <span className="vendor-membership-benefit-icon">
                  <FiShield />
                </span>
                <div>
                  <h4>Secure Online Payment</h4>
                  <p>Pay securely through the Razorpay checkout.</p>
                </div>
              </div>
            </div>

            <div className="vendor-membership-divider" />

            <div className="vendor-membership-steps">
              <h3>Get started in 3 steps</h3>

              <div className="vendor-membership-step">
                <span>1</span>
                <p>Fill in your vendor details</p>
              </div>

              <div className="vendor-membership-step">
                <span>2</span>
                <p>Verify your mobile number with OTP</p>
              </div>

              <div className="vendor-membership-step">
                <span>3</span>
                <p>Pay ₹500 to complete registration</p>
              </div>
            </div>

            <div className="vendor-membership-bottom">
              <FiLock />
              <span>Secure checkout · Transparent one-time fee</span>
            </div>
          </aside>
        </div>

        <footer className="vendor-register-footer-note">
          <FiShield />
          <span>Star Link Goods · Secure Vendor Registration</span>
        </footer>
      </section>
    </main>
  );
};

export default VendorRegister;