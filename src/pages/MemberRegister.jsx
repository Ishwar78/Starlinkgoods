
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
  FiHome,
  FiUpload,
  FiCalendar,
  FiFileText,
  
  FiRefreshCw,
} from "react-icons/fi";
import {
  verifyVendorId,
  createMembershipOrder,
  verifyAndRegisterMember,
} from "../lib/api";
import "./MemberRegister.css";

const MEMBERSHIP_FEE = 1000;

const states = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
  "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
  "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
  "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
  "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh",
  "Puducherry",
];

const initialForm = {
  vendorId: "",
  vendorName: "",
  mobile: "",
  otp: "",
  pinCode: "",
  city: "",
  state: "",
  firstName: "",
  lastName: "",
  houseNo: "",
  landmark: "",
  alternateMobile: "",
  dateOfBirth: "",
  email: "",
  aadhaar: "",
  pan: "",
  bankName: "",
  ifscCode: "",
  password: "",
  confirmPassword: "",
};

export default function MemberRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);

  // Keep existing vendor verification state.
  const [verifyingVendor, setVerifyingVendor] = useState(false);
  const [verifiedVendor, setVerifiedVendor] = useState(null);

  // Keep the existing demo OTP workflow.
  const [demoOtp, setDemoOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const [processingPayment, setProcessingPayment] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [documents, setDocuments] = useState({
    aadhaarDocument: null,
    panDocument: null,
    bankDocument: null,
  });

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
    } else if (name === "alternateMobile") {
      setForm((prev) => ({
        ...prev,
        alternateMobile: value.replace(/\D/g, "").slice(0, 10),
      }));
    } else if (name === "otp") {
      setForm((prev) => ({
        ...prev,
        otp: value.replace(/\D/g, "").slice(0, 6),
      }));
    } else if (name === "pinCode") {
      setForm((prev) => ({
        ...prev,
        pinCode: value.replace(/\D/g, "").slice(0, 6),
      }));
    } else if (name === "aadhaar") {
      setForm((prev) => ({
        ...prev,
        aadhaar: value.replace(/\D/g, "").slice(0, 12),
      }));
    } else if (name === "pan") {
      setForm((prev) => ({
        ...prev,
        pan: value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10),
      }));
    } else if (name === "ifscCode") {
      setForm((prev) => ({
        ...prev,
        ifscCode: value.toUpperCase().replace(/\s/g, "").slice(0, 11),
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }

    setMessage({ type: "", text: "" });
  };

  // Existing vendor verification function.
  const handleVerifyVendor = async (silent = false) => {
    const cleanId = form.vendorId.trim();

    if (!cleanId) {
      if (!silent) {
        setMessage({
          type: "error",
          text: "Please enter a Vendor ID to verify.",
        });
      }
      return false;
    }

    try {
      setVerifyingVendor(true);
      if (!silent) setMessage({ type: "", text: "" });

      const res = await verifyVendorId(cleanId);

      if (res && res.success && res.vendor) {
        setVerifiedVendor(res.vendor);

        if (!form.vendorName.trim()) {
          setForm((prev) => ({
            ...prev,
            vendorName: res.vendor.name || "",
          }));
        }

        if (!silent) {
          setMessage({
            type: "success",
            text: `Vendor verified: ${res.vendor.name} (${res.vendor.vendorId})`,
          });
        }

        return true;
      }

      setVerifiedVendor(null);
      setMessage({
        type: "error",
        text: res?.message || `Vendor ID "${cleanId}" not found in database.`,
      });
      return false;
    } catch (err) {
      setVerifiedVendor(null);
      setMessage({
        type: "error",
        text: err.message || "Failed to verify Vendor ID. Please try again.",
      });
      return false;
    } finally {
      setVerifyingVendor(false);
    }
  };

  // Existing demo OTP behavior.
  const sendDemoOtp = () => {
    if (!/^[6-9]\d{9}$/.test(form.mobile)) {
      setMessage({
        type: "error",
        text: "Please enter a valid 10-digit Indian mobile number.",
      });
      return;
    }

    const generatedCode = String(
      Math.floor(1000 + Math.random() * 9000)
    );

    setDemoOtp(generatedCode);
    setOtpSent(true);
    setOtpVerified(false);
    setForm((prev) => ({ ...prev, otp: "" }));

    setMessage({
      type: "success",
      text: `Demo OTP generated: ${generatedCode}.`,
    });
  };

  const verifyDemoOtp = () => {
    if (!otpSent || !form.otp.trim()) {
      setMessage({
        type: "error",
        text: "Please generate and enter your OTP first.",
      });
      return;
    }

    setVerifyingOtp(true);

    window.setTimeout(() => {
      if (form.otp === demoOtp || form.otp === "1234") {
        setOtpVerified(true);
        setMessage({
          type: "success",
          text: "Mobile number verified successfully.",
        });
      } else {
        setOtpVerified(false);
        setMessage({
          type: "error",
          text: "Invalid OTP. Please check the generated code.",
        });
      }

      setVerifyingOtp(false);
    }, 400);
  };

  const handleDocumentChange = (event) => {
    const { name, files } = event.target;
    const file = files?.[0] || null;

    if (file && file.size > 5 * 1024 * 1024) {
      setMessage({
        type: "error",
        text: "Please choose a document smaller than 5 MB.",
      });
      event.target.value = "";
      return;
    }

    if (
      file &&
      !["application/pdf", "image/jpeg", "image/png", "image/webp"].includes(
        file.type
      )
    ) {
      setMessage({
        type: "error",
        text: "Upload a PDF, JPG, PNG or WebP document.",
      });
      event.target.value = "";
      return;
    }

    setDocuments((prev) => ({ ...prev, [name]: file }));
    setMessage({ type: "", text: "" });
  };

  const validateForm = () => {
    if (!form.vendorId.trim() || !form.vendorName.trim()) {
      setMessage({
        type: "error",
        text: "Please enter your Vendor ID and Vendor Name.",
      });
      return false;
    }

    if (!/^[6-9]\d{9}$/.test(form.mobile)) {
      setMessage({
        type: "error",
        text: "Enter a valid 10-digit mobile number.",
      });
      return false;
    }

    if (!otpVerified) {
      setMessage({
        type: "error",
        text: "Please verify your mobile number with OTP.",
      });
      return false;
    }

    if (!/^\d{6}$/.test(form.pinCode)) {
      setMessage({
        type: "error",
        text: "Enter a valid 6-digit PIN Code.",
      });
      return false;
    }

    if (!form.city.trim() || !form.state) {
      setMessage({
        type: "error",
        text: "Please enter your City and select your State.",
      });
      return false;
    }

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setMessage({
        type: "error",
        text: "Please enter your First Name and Last Name.",
      });
      return false;
    }

    if (!form.houseNo.trim()) {
      setMessage({
        type: "error",
        text: "Please enter your House No. / Building details.",
      });
      return false;
    }

    if (
      form.alternateMobile &&
      !/^[6-9]\d{9}$/.test(form.alternateMobile)
    ) {
      setMessage({
        type: "error",
        text: "Enter a valid alternate mobile number.",
      });
      return false;
    }

    if (!form.dateOfBirth) {
      setMessage({
        type: "error",
        text: "Please select your Date of Birth.",
      });
      return false;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      setMessage({
        type: "error",
        text: "Please enter a valid email address.",
      });
      return false;
    }

    if (!/^\d{12}$/.test(form.aadhaar)) {
      setMessage({
        type: "error",
        text: "Please enter a valid 12-digit Aadhaar number.",
      });
      return false;
    }

    if (!/^[A-Z]{5}\d{4}[A-Z]$/.test(form.pan)) {
      setMessage({
        type: "error",
        text: "Please enter a valid PAN number.",
      });
      return false;
    }

    if (
      form.bankName.trim() &&
      !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifscCode)
    ) {
      setMessage({
        type: "error",
        text: "Enter a valid IFSC code for the bank details provided.",
      });
      return false;
    }

    if (!form.password || form.password.length < 6) {
      setMessage({
        type: "error",
        text: "Password must contain at least 6 characters.",
      });
      return false;
    }

    if (form.password !== form.confirmPassword) {
      setMessage({
        type: "error",
        text: "Password and Confirm Password do not match.",
      });
      return false;
    }

    return true;
  };

  const startPayment = async (event) => {
    event.preventDefault();

    if (processingPayment || !validateForm()) return;

    // Keep the existing server-side vendor verification.
    const isVendorValid = await handleVerifyVendor(true);

    if (!isVendorValid) {
      setMessage({
        type: "error",
        text: `Vendor ID "${form.vendorId}" is invalid or not registered.`,
      });
      return;
    }

    if (!window.Razorpay) {
      setMessage({
        type: "error",
        text: "Payment gateway is loading. Please try again shortly.",
      });
      return;
    }

    setProcessingPayment(true);
    setMessage({ type: "", text: "" });

    const memberPayload = {
      vendorId: form.vendorId.trim(),
      vendorName: form.vendorName.trim(),
      mobile: form.mobile,
      pinCode: form.pinCode,
      city: form.city.trim(),
      state: form.state,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      fullName: `${form.firstName.trim()} ${form.lastName.trim()}`,
      name: `${form.firstName.trim()} ${form.lastName.trim()}`,
      houseNo: form.houseNo.trim(),
      landmark: form.landmark.trim(),
      address: [form.houseNo.trim(), form.landmark.trim()]
        .filter(Boolean)
        .join(", "),
      alternateMobile: form.alternateMobile,
      dateOfBirth: form.dateOfBirth,
      email: form.email.trim(),
      aadhaar: form.aadhaar,
      pan: form.pan,
      bankName: form.bankName.trim(),
      ifscCode: form.ifscCode.trim(),
      password: form.password,
      fee: MEMBERSHIP_FEE,
    };

    try {
      const orderData = await createMembershipOrder(memberPayload);

      if (!orderData?.success || !orderData?.orderId) {
        throw new Error(
          orderData?.message || "Failed to create payment order."
        );
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
          name: memberPayload.fullName,
          email: memberPayload.email,
          contact: memberPayload.mobile,
        },
        notes: {
          vendorId: memberPayload.vendorId,
          vendorName: memberPayload.vendorName,
          purpose: "Star Link Goods Member Registration",
        },
        theme: { color: "#ffd044" },
        modal: {
          ondismiss: () => {
            setProcessingPayment(false);
            setMessage({
              type: "error",
              text: "Payment window closed. Registration was not completed.",
            });
          },
        },
        handler: async (paymentResponse) => {
          try {
            setMessage({
              type: "info",
              text: "Payment successful. Completing registration...",
            });

            const regData = await verifyAndRegisterMember({
              ...memberPayload,
              role: "Member",
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
            });

            if (!regData?.success || !regData?.token) {
              throw new Error(
                regData?.message ||
                  "Payment was completed, but registration could not be saved."
              );
            }

            localStorage.setItem("userToken", regData.token);
            localStorage.setItem("userData", JSON.stringify(regData.user));

            window.dispatchEvent(
              new CustomEvent("slg-profile-updated", {
                detail: { user: regData.user },
              })
            );

            setMessage({
              type: "success",
              text: "Registration successful. Redirecting to your dashboard...",
            });

            window.setTimeout(() => {
              navigate("/user/dashboard");
            }, 1200);
          } catch (error) {
            console.error("Member registration error:", error);
            setMessage({
              type: "error",
              text: error.message || "Registration failed after payment.",
            });
          } finally {
            setProcessingPayment(false);
          }
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", (response) => {
        setProcessingPayment(false);
        setMessage({
          type: "error",
          text:
            response.error?.description ||
            "Payment failed. Registration was not completed.",
        });
      });

      razorpay.open();
    } catch (error) {
      console.error("Payment initiation error:", error);
      setProcessingPayment(false);
      setMessage({
        type: "error",
        text: error.message || "Unable to initiate payment.",
      });
    }
  };

  const renderInput = ({
    label,
    name,
    placeholder,
    icon: Icon = FiFileText,
    type = "text",
    required = true,
    autoComplete,
    max,
    min,
  }) => (
    <div className="member-register-field" key={name}>
      <label htmlFor={name}>
        {label} {required && <span className="mr-required">*</span>}
      </label>

      <div className="member-register-input-wrap">
        <Icon aria-hidden="true" />

        <input
          id={name}
          name={name}
          type={type}
          value={form[name]}
          onChange={updateField}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          max={max}
          min={min}
        />
      </div>
    </div>
  );

  const renderDocument = (name, label, description, required = false) => (
    <div className="member-register-field" key={name}>
      <label htmlFor={name}>
        {label} {required && <span className="mr-required">*</span>}
        {!required && <span className="mr-optional">Optional</span>}
      </label>

      <label className="mr-upload-box" htmlFor={name}>
        <FiUpload />
        <span>
          <strong>
            {documents[name]?.name || "Choose a document"}
          </strong>
          <small>{description}</small>
        </span>
        <input
          id={name}
          name={name}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          onChange={handleDocumentChange}
        />
      </label>
    </div>
  );

  return (
    <main className="member-register-page">
      <div className="member-register-glow member-register-glow-1" />
      <div className="member-register-glow member-register-glow-2" />

      <section className="member-register-shell">
        <header className="member-register-header">
          <span className="member-register-kicker">
            STAR LINK GOODS · MEMBER NETWORK
          </span>
          <h1>Member <span>Registration</span></h1>
          <p>
            Complete your details in the order below, verify your mobile
            number and continue to the existing registration payment.
          </p>
        </header>

        <div className="member-register-grid-layout">
          <section className="member-register-form-card">
            <div className="mr-card-heading">
              <div className="mr-card-heading-icon"><FiUser /></div>
              <div>
                <h2>Member Details</h2>
                <p>Fields marked with * are required.</p>
              </div>
            </div>

            <form onSubmit={startPayment} noValidate>
              {/* 01 — Existing vendor verification. Logic unchanged. */}
              <div className="member-register-section-title">
                <span>01</span>
                <h3>Vendor Verification</h3>
              </div>

              <div className="member-register-grid">
                <div className="member-register-field">
                  <label htmlFor="vendorId">Vendor ID *</label>
                  <div className="member-register-input-wrap mr-vendor-wrap">
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
                      placeholder="Enter Vendor ID"
                      autoComplete="off"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => handleVerifyVendor(false)}
                      disabled={verifyingVendor || !form.vendorId.trim()}
                    >
                      {verifyingVendor
                        ? "Verifying..."
                        : verifiedVendor
                          ? "Verified ✓"
                          : "Verify ID"}
                    </button>
                  </div>

                  {verifiedVendor && (
                    <small className="mr-verified-vendor">
                      <FiCheckCircle />
                      Vendor Found: {verifiedVendor.name} (
                      {verifiedVendor.vendorId})
                    </small>
                  )}
                </div>

                {renderInput({
                  label: "Vendor Name",
                  name: "vendorName",
                  placeholder: "Enter Vendor Name",
                  icon: FiBriefcase,
                })}
              </div>

              {/* 02 — Mobile number and OTP */}
              <div className="member-register-section-title">
                <span>02</span>
                <h3>Mobile Number Verification</h3>
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
                    value={form.mobile}
                    onChange={updateField}
                    placeholder="Enter 10-digit mobile number"
                    maxLength={10}
                    autoComplete="tel-national"
                    required
                  />
                  <button
                    type="button"
                    className="member-register-otp-button"
                    onClick={sendDemoOtp}
                    disabled={otpVerified}
                  >
                    {otpSent ? "Resend OTP" : "Send OTP"}
                  </button>
                </div>
              </div>

              {otpSent && !otpVerified && (
                <div className="member-register-otp-area">
                  <div className="member-register-field">
                    <label htmlFor="otp">Enter OTP *</label>
                    <div className="member-register-input-wrap">
                      <FiShield />
                      <input
                        id="otp"
                        name="otp"
                        inputMode="numeric"
                        value={form.otp}
                        onChange={updateField}
                        placeholder="Enter 4-digit OTP"
                        maxLength={6}
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    className="member-register-verify-button"
                    onClick={verifyDemoOtp}
                    disabled={verifyingOtp}
                  >
                    {verifyingOtp ? "Verifying..." : "Verify OTP"}
                  </button>
                </div>
              )}

              {otpVerified && (
                <div className="member-register-verified">
                  <FiCheckCircle /> Mobile number verified successfully.
                </div>
              )}

              {/* 03 — PIN code */}
              <div className="member-register-section-title">
                <span>03</span>
                <h3>PIN Code</h3>
              </div>

              <div className="member-register-grid">
                {renderInput({
                  label: "PIN Code",
                  name: "pinCode",
                  placeholder: "Enter 6-digit PIN Code",
                  icon: FiMapPin,
                  max: undefined,
                })}
              </div>

              {/* 04 — City and state */}
              <div className="member-register-section-title">
                <span>04</span>
                <h3>Location Details</h3>
              </div>

              <div className="member-register-grid">
                {renderInput({
                  label: "City",
                  name: "city",
                  placeholder: "Enter your city",
                  icon: FiMapPin,
                  autoComplete: "address-level2",
                })}

                <div className="member-register-field">
                  <label htmlFor="state">State *</label>
                  <div className="member-register-input-wrap">
                    <FiMapPin />
                    <select
                      id="state"
                      name="state"
                      value={form.state}
                      onChange={updateField}
                      required
                    >
                      <option value="">Select your state</option>
                      {states.map((state) => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 05 — First name and last name */}
              <div className="member-register-section-title">
                <span>05</span>
                <h3>Personal Details</h3>
              </div>

              <div className="member-register-grid">
                {renderInput({
                  label: "First Name",
                  name: "firstName",
                  placeholder: "Enter first name",
                  icon: FiUser,
                  autoComplete: "given-name",
                })}

                {renderInput({
                  label: "Last Name",
                  name: "lastName",
                  placeholder: "Enter last name",
                  icon: FiUser,
                  autoComplete: "family-name",
                })}

                {renderInput({
                  label: "House No. / Building",
                  name: "houseNo",
                  placeholder: "House number, street or building",
                  icon: FiHome,
                  autoComplete: "address-line1",
                })}

                {renderInput({
                  label: "Near Landmark",
                  name: "landmark",
                  placeholder: "Nearby landmark",
                  icon: FiMapPin,
                  required: false,
                })}

                {renderInput({
                  label: "Alternate Mobile Number",
                  name: "alternateMobile",
                  placeholder: "Enter alternate mobile number",
                  icon: FiPhone,
                  type: "tel",
                  required: false,
                  autoComplete: "tel-national",
                })}

                {renderInput({
                  label: "Date of Birth",
                  name: "dateOfBirth",
                  placeholder: "",
                  icon: FiCalendar,
                  type: "date",
                  max: new Date().toISOString().split("T")[0],
                })}

                <div className="member-register-field member-register-full">
                  <label htmlFor="email">Email ID *</label>
                  <div className="member-register-input-wrap">
                    <FiMail />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={updateField}
                      placeholder="Enter email address"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* 06 — Identity details */}
              <div className="member-register-section-title">
                <span>06</span>
                <h3>Identity Details</h3>
              </div>

              <div className="member-register-grid">
                {renderInput({
                  label: "Aadhaar Number",
                  name: "aadhaar",
                  placeholder: "Enter 12-digit Aadhaar number",
                  icon: FiShield,
                })}

                {renderInput({
                  label: "PAN Number",
                  name: "pan",
                  placeholder: "ABCDE1234F",
                  icon: FiCreditCard,
                })}
              </div>

              {/* 07 — Optional bank details */}
              <div className="member-register-section-title">
                <span>07</span>
                <h3>Bank Details <small>(Optional)</small></h3>
              </div>

              <div className="member-register-grid">
                {renderInput({
                  label: "Name of Bank",
                  name: "bankName",
                  placeholder: "Enter bank name",
                  icon: FiHome,
                  required: false,
                })}

                {renderInput({
                  label: "IFSC Code",
                  name: "ifscCode",
                  placeholder: "Enter IFSC code",
                  icon: FiHash,
                  required: false,
                })}
              </div>

              {/* 08 — Document selection */}
              <div className="member-register-section-title">
                <span>08</span>
                <h3>Upload Documents</h3>
              </div>

              <p className="mr-upload-note">
                PDF, JPG, PNG or WebP · Maximum 5 MB per file
              </p>

              <div className="member-register-grid">
                {renderDocument(
                  "aadhaarDocument",
                  "Aadhaar Document",
                  "Upload Aadhaar PDF or image"
                )}

                {renderDocument(
                  "panDocument",
                  "PAN Document",
                  "Upload PAN PDF or image"
                )}

                {renderDocument(
                  "bankDocument",
                  "Bank Proof",
                  "Cancelled cheque or bank proof"
                )}
              </div>

              {/* 09 — Account credentials */}
              <div className="member-register-section-title">
                <span>09</span>
                <h3>Account Security</h3>
              </div>

              <div className="member-register-grid">
                {renderInput({
                  label: "Password",
                  name: "password",
                  placeholder: "Create a password",
                  icon: FiShield,
                  type: "password",
                  autoComplete: "new-password",
                })}

                {renderInput({
                  label: "Confirm Password",
                  name: "confirmPassword",
                  placeholder: "Confirm your password",
                  icon: FiShield,
                  type: "password",
                  autoComplete: "new-password",
                })}
              </div>

              {message.text && (
                <div
                  className={`member-register-message ${message.type}`}
                  role="status"
                  aria-live="polite"
                >
                  {message.text}
                </div>
              )}

              <div className="member-register-payment-note">
                <FiShield />
                <p>
                  Your registration is completed only after vendor
                  verification and successful payment verification.
                </p>
              </div>

              <div className="mr-fee-summary">
                <div>
                  <span>One-time membership fee</span>
                  <small>Secure Razorpay checkout</small>
                </div>
                <strong>₹{MEMBERSHIP_FEE}</strong>
              </div>

              <button
                type="submit"
                className="member-register-submit"
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

              <p className="member-register-login">
                Already have an account? <Link to="/login">Login here</Link>
              </p>
            </form>
          </section>

          <aside className="member-register-membership">
            <div className="vendor-membership-topline">
              <span className="vendor-membership-star">✦</span>
              <span>STAR LINK GOODS</span>
            </div>

            <div className="vendor-membership-label">MEMBERSHIP PROGRAM</div>
            <h2>Become a <span>Member.</span></h2>

            <p className="vendor-membership-description">
              Complete your profile, verify your mobile number and join the
              Star Link Goods member network.
            </p>

            

            <div className="vendor-membership-benefits-title">
              Registration checklist
            </div>

            <ul className="vendor-membership-benefits">
              <li><FiCheckCircle /><span>Vendor verification</span></li>
              <li><FiCheckCircle /><span>Mobile OTP verification</span></li>
              <li><FiCheckCircle /><span>Personal and address details</span></li>
              <li><FiCheckCircle /><span>Identity and optional bank details</span></li>
              <li><FiCheckCircle /><span>Secure payment verification</span></li>
            </ul>
          </aside>
        </div>
      </section>
    </main>
  );
}
