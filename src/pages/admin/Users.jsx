import React, { useEffect, useMemo, useState } from "react";
import {
  FiPlus,
  FiSearch,
  FiX,
  FiSave,
  FiTrash2,
  FiEye,
  FiEyeOff,
  FiUsers,
  FiCheckCircle,
  FiAlertCircle,
  FiPhone,
  FiMail,
  FiMapPin,
  FiCreditCard,
  FiDollarSign,
  FiArrowUpRight,
  FiArrowDownLeft,
  FiUpload,
  FiFileText,
  FiCheck,
  FiCalendar,
  FiShield,
  FiExternalLink,
  FiHome,
  FiUserCheck,
} from "react-icons/fi";
import {
  getVendors,
  getVendorMembers,
  createVendor,
  createVendorOrder,
  verifyAndCreateVendor,
  deleteVendor,
  toggleVendorStatus,
  addVendorWalletMoney,
  uploadVendorDocument,
} from "../../lib/api.js";

import "./Users.css";

export default function Users() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [walletVendor, setWalletVendor] = useState(null);
  const [walletAmount, setWalletAmount] = useState("");
  const [walletType, setWalletType] = useState("Credit");
  const [walletDesc, setWalletDesc] = useState("Admin Topup");
  const [walletSubmitting, setWalletSubmitting] = useState(false);
  const [selectedVendorForMembers, setSelectedVendorForMembers] = useState(null);
  const [vendorMembers, setVendorMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  // View Vendor Details Modal State
  const [viewingVendor, setViewingVendor] = useState(null);

  // Form State with all requested fields
  const [form, setForm] = useState({
    mobile: "",
    pincode: "",
    city: "",
    state: "",
    firstName: "",
    lastName: "",
    houseNo: "",
    landmark: "",
    alternateMobile: "",
    dob: "",
    email: "",
    aadharNo: "",
    panNo: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    nomineeFirstName: "",
    nomineeLastName: "",
    nomineeRelation: "",
    nomineeMobile: "",
    nomineeDob: "",
    password: "",
    confirmPassword: "",
    aadharCardFile: "",
    panCardFile: "",
    passbookFile: "",
  });

  // Primary Mobile OTP State
  const [mobileOtpSent, setMobileOtpSent] = useState(false);
  const [mobileOtpCode, setMobileOtpCode] = useState("");
  const [mobileOtpInput, setMobileOtpInput] = useState("");
  const [isMobileVerified, setIsMobileVerified] = useState(false);
  const [mobileOtpError, setMobileOtpError] = useState("");

  // Nominee Mobile OTP State
  const [nomineeOtpSent, setNomineeOtpSent] = useState(false);
  const [nomineeOtpCode, setNomineeOtpCode] = useState("");
  const [nomineeOtpInput, setNomineeOtpInput] = useState("");
  const [isNomineeMobileVerified, setIsNomineeMobileVerified] = useState(false);
  const [nomineeOtpError, setNomineeOtpError] = useState("");

  // Pincode auto-lookup state
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeMsg, setPincodeMsg] = useState("");

  // Document upload indicator
  const [uploadingDoc, setUploadingDoc] = useState("");

  // Ensure Razorpay checkout script is loaded
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

  // Fetch vendors from database on mount
  const fetchVendorsList = async () => {
    try {
      setLoading(true);
      const data = await getVendors();
      if (data.success && Array.isArray(data.vendors)) {
        setVendors(data.vendors);
      }
    } catch (err) {
      console.error("Error loading vendors:", err);
      setMessage(err.message || "Failed to load vendors from database.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorsList();
  }, []);

  const filteredVendors = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return vendors;

    return vendors.filter((v) =>
      [
        v.vendorId,
        v.name,
        v.firstName,
        v.lastName,
        v.email,
        v.mobile,
        v.city,
        v.state,
        v.pincode,
        v.address,
        v.panNo,
        v.aadharNo,
        v.status,
      ]
        .filter(Boolean)
        .some((val) => String(val).toLowerCase().includes(query))
    );
  }, [vendors, search]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Pincode change handler with automatic Postal API auto-fill
  const handlePincodeChange = async (event) => {
    const val = event.target.value.replace(/\D/g, "").slice(0, 6);
    setForm((prev) => ({ ...prev, pincode: val }));

    if (val.length === 6) {
      try {
        setPincodeLoading(true);
        setPincodeMsg("Fetching city and state from postal directory...");
        const res = await fetch(`https://api.postalpincode.in/pincode/${val}`);
        const data = await res.json();
        if (
          Array.isArray(data) &&
          data[0]?.Status === "Success" &&
          data[0]?.PostOffice?.length > 0
        ) {
          const po = data[0].PostOffice[0];
          const detectedCity = po.District || po.Block || po.Circle || po.Name || "";
          const detectedState = po.State || "";
          setForm((prev) => ({
            ...prev,
            city: detectedCity || prev.city,
            state: detectedState || prev.state,
          }));
          setPincodeMsg(`✓ Auto-detected: ${detectedCity}, ${detectedState}`);
        } else {
          setPincodeMsg("Pincode not found. You can enter City & State manually.");
        }
      } catch (err) {
        console.warn("Pincode API error:", err);
        setPincodeMsg("Postal service unavailable. Please enter City & State manually.");
      } finally {
        setPincodeLoading(false);
      }
    } else {
      setPincodeMsg("");
    }
  };

  // Primary Mobile OTP handlers
  const handleSendMobileOtp = () => {
    const clean = form.mobile.replace(/\D/g, "");
    if (clean.length !== 10) {
      setMobileOtpError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setMobileOtpError("");
    const demoCode = "1234";
    setMobileOtpCode(demoCode);
    setMobileOtpSent(true);
    setMobileOtpInput("");
  };

  const handleVerifyMobileOtp = () => {
    if (
      mobileOtpInput.trim() === mobileOtpCode ||
      mobileOtpInput.trim() === "1234"
    ) {
      setIsMobileVerified(true);
      setMobileOtpSent(false);
      setMobileOtpError("");
    } else {
      setMobileOtpError(`Invalid OTP. Please enter demo OTP: ${mobileOtpCode || "1234"}`);
    }
  };

  // Nominee Mobile OTP handlers
  const handleSendNomineeOtp = () => {
    const clean = form.nomineeMobile.replace(/\D/g, "");
    if (clean.length !== 10) {
      setNomineeOtpError("Please enter a valid 10-digit nominee mobile number.");
      return;
    }
    setNomineeOtpError("");
    const demoCode = "5678";
    setNomineeOtpCode(demoCode);
    setNomineeOtpSent(true);
    setNomineeOtpInput("");
  };

  const handleVerifyNomineeOtp = () => {
    if (
      nomineeOtpInput.trim() === nomineeOtpCode ||
      nomineeOtpInput.trim() === "5678" ||
      nomineeOtpInput.trim() === "1234"
    ) {
      setIsNomineeMobileVerified(true);
      setNomineeOtpSent(false);
      setNomineeOtpError("");
    } else {
      setNomineeOtpError(`Invalid OTP. Please enter demo OTP: ${nomineeOtpCode || "5678"}`);
    }
  };

  // Document upload handler (Optional)
  const handleDocUpload = async (docType, file) => {
    if (!file) return;
    try {
      setUploadingDoc(docType);
      const fd = new FormData();
      fd.append("document", file);
      const res = await uploadVendorDocument(fd);
      if (res.success && res.filePath) {
        if (docType === "aadhar") {
          setForm((prev) => ({ ...prev, aadharCardFile: res.filePath }));
        } else if (docType === "pan") {
          setForm((prev) => ({ ...prev, panCardFile: res.filePath }));
        } else if (docType === "passbook") {
          setForm((prev) => ({ ...prev, passbookFile: res.filePath }));
        }
      } else {
        alert(res.message || "Failed to upload document file.");
      }
    } catch (err) {
      console.error("Document upload error:", err);
      alert("Upload failed: " + err.message);
    } finally {
      setUploadingDoc("");
    }
  };

  // Form Submission & Payment
  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    // Validate inputs
    const cleanMobile = form.mobile.replace(/\D/g, "").trim();
    if (cleanMobile.length !== 10) {
      setMessage("Please enter a valid 10-digit mobile number.");
      setMessageType("error");
      return;
    }

    if (!isMobileVerified) {
      setMessage("Please verify the primary mobile number with OTP before proceeding.");
      setMessageType("error");
      return;
    }

    if (!form.pincode.trim() || form.pincode.replace(/\D/g, "").length !== 6) {
      setMessage("Please enter a valid 6-digit Pincode.");
      setMessageType("error");
      return;
    }

    if (!form.city.trim() || !form.state.trim()) {
      setMessage("Please enter City and State.");
      setMessageType("error");
      return;
    }

    if (!form.firstName.trim()) {
      setMessage("Please enter First Name.");
      setMessageType("error");
      return;
    }

    if (!form.houseNo.trim()) {
      setMessage("Please enter House No / Flat / Shop details.");
      setMessageType("error");
      return;
    }

    if (!form.dob.trim()) {
      setMessage("Please select Date of Birth.");
      setMessageType("error");
      return;
    }

    if (!form.email.trim()) {
      setMessage("Please enter Email Address.");
      setMessageType("error");
      return;
    }

    if (!form.password || form.password.length < 6) {
      setMessage("Password must be at least 6 characters long.");
      setMessageType("error");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setMessage("Password and Confirm Password do not match.");
      setMessageType("error");
      return;
    }

    const constructedName = `${form.firstName.trim()} ${form.lastName.trim()}`.trim();
    const constructedAddress = [
      form.houseNo.trim(),
      form.landmark.trim(),
      form.city.trim(),
      form.state.trim(),
      form.pincode.trim(),
    ]
      .filter(Boolean)
      .join(", ");

    const payload = {
      name: constructedName,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      mobile: cleanMobile,
      pincode: form.pincode.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      address: constructedAddress,
      houseNo: form.houseNo.trim(),
      landmark: form.landmark.trim(),
      alternateMobile: form.alternateMobile.replace(/\D/g, "").trim(),
      dob: form.dob.trim(),
      aadharNo: form.aadharNo.replace(/\D/g, "").trim(),
      panNo: form.panNo.trim().toUpperCase(),
      bankName: form.bankName.trim(),
      accountNumber: form.accountNumber.trim(),
      ifscCode: form.ifscCode.trim().toUpperCase(),
      nomineeFirstName: form.nomineeFirstName.trim(),
      nomineeLastName: form.nomineeLastName.trim(),
      nomineeRelation: form.nomineeRelation.trim(),
      nomineeMobile: form.nomineeMobile.replace(/\D/g, "").trim(),
      nomineeDob: form.nomineeDob.trim(),
      isMobileVerified: true,
      isNomineeMobileVerified: Boolean(isNomineeMobileVerified),
      aadharCardFile: form.aadharCardFile || "",
      panCardFile: form.panCardFile || "",
      passbookFile: form.passbookFile || "",
      password: form.password,
      fee: 5000,
      role: "Vendor",
      status: "Active",
    };

    // If Razorpay gateway is available, initiate ₹5,000 payment order
    if (window.Razorpay) {
      try {
        setSubmitting(true);
        setMessage("Initiating ₹5,000 Razorpay payment order...");
        setMessageType("info");

        const orderData = await createVendorOrder(payload);

        if (!orderData || !orderData.success) {
          // If payment gateway order fails, offer direct admin save fallback
          throw new Error(orderData?.message || "Failed to create payment order.");
        }

        const options = {
          key: orderData.keyId,
          order_id: orderData.orderId,
          amount: orderData.amount, // 500000 paise
          currency: orderData.currency || "INR",
          name: "Star Link Goods",
          description: `Vendor Registration Fee (₹5,000) - ${constructedName}`,
          image: "/Logo.jpeg",
          prefill: {
            name: constructedName,
            email: form.email.trim(),
            contact: cleanMobile,
          },
          theme: {
            color: "#e5aa0a",
          },
          modal: {
            ondismiss: () => {
              setSubmitting(false);
              setMessage("Payment cancelled. Vendor was not created.");
              setMessageType("error");
            },
          },
          handler: async (paymentResponse) => {
            try {
              setSubmitting(true);
              setMessage("Payment verified! Saving vendor to database...");
              setMessageType("info");

              const regData = await verifyAndCreateVendor({
                ...payload,
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
              });

              if (!regData || !regData.success) {
                throw new Error(regData?.message || "Payment verified, but saving vendor failed.");
              }

              setMessage(
                `Vendor "${regData.vendor?.name}" (${regData.vendor?.vendorId || "New"}) successfully created and saved in database after ₹5,000 payment!`
              );
              setMessageType("success");
              resetForm();
              setShowForm(false);
              fetchVendorsList();
            } catch (verifyErr) {
              console.error("Vendor verification error:", verifyErr);
              setMessage(verifyErr.message || "Failed to verify payment and save vendor.");
              setMessageType("error");
            } finally {
              setSubmitting(false);
            }
          },
        };

        const rzpInstance = new window.Razorpay(options);
        rzpInstance.on("payment.failed", (failedRes) => {
          setSubmitting(false);
          setMessage(
            `Payment failed: ${failedRes.error?.description || "Transaction declined"}. Vendor was not saved.`
          );
          setMessageType("error");
        });

        rzpInstance.open();
        return;
      } catch (err) {
        console.warn("Razorpay order failed, attempting direct admin creation:", err);
      }
    }

    // Direct Creation Fallback for Admin
    try {
      setSubmitting(true);
      setMessage("Saving vendor directly into database...");
      setMessageType("info");

      const res = await createVendor(payload);
      if (res.success) {
        setMessage(
          `Vendor "${res.vendor?.name}" (${res.vendor?.vendorId || "New"}) created and saved successfully in database!`
        );
        setMessageType("success");
        resetForm();
        setShowForm(false);
        fetchVendorsList();
      } else {
        setMessage(res.message || "Failed to create vendor.");
        setMessageType("error");
      }
    } catch (directErr) {
      setMessage(directErr.message || "Error saving vendor.");
      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      mobile: "",
      pincode: "",
      city: "",
      state: "",
      firstName: "",
      lastName: "",
      houseNo: "",
      landmark: "",
      alternateMobile: "",
      dob: "",
      email: "",
      aadharNo: "",
      panNo: "",
      bankName: "",
      accountNumber: "",
      ifscCode: "",
      nomineeFirstName: "",
      nomineeLastName: "",
      nomineeRelation: "",
      nomineeMobile: "",
      nomineeDob: "",
      password: "",
      confirmPassword: "",
      aadharCardFile: "",
      panCardFile: "",
      passbookFile: "",
    });
    setIsMobileVerified(false);
    setMobileOtpSent(false);
    setMobileOtpCode("");
    setMobileOtpInput("");
    setMobileOtpError("");
    setIsNomineeMobileVerified(false);
    setNomineeOtpSent(false);
    setNomineeOtpCode("");
    setNomineeOtpInput("");
    setNomineeOtpError("");
    setPincodeMsg("");
  };

  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete vendor "${name}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await deleteVendor(id);
      setMessage(`Vendor "${name}" deleted successfully.`);
      setMessageType("success");
      setVendors((prev) => prev.filter((v) => v._id !== id));
      if (viewingVendor && viewingVendor._id === id) {
        setViewingVendor(null);
      }
    } catch (err) {
      setMessage(err.message || "Failed to delete vendor.");
      setMessageType("error");
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const res = await toggleVendorStatus(id);
      if (res.success) {
        setVendors((prev) =>
          prev.map((v) => (v._id === id ? { ...v, status: res.vendor.status } : v))
        );
        if (viewingVendor && viewingVendor._id === id) {
          setViewingVendor((prev) => ({ ...prev, status: res.vendor.status }));
        }
      }
    } catch (err) {
      alert(err.message || "Failed to update status");
    }
  };

  const handleOpenWallet = (vendor) => {
    setWalletVendor(vendor);
    setWalletAmount("");
    setWalletType("Credit");
    setWalletDesc("Admin Wallet Topup");
    setMessage("");
  };

  const handleWalletSubmit = async (e) => {
    e.preventDefault();
    if (!walletVendor) return;

    const num = Number(walletAmount);
    if (isNaN(num) || num <= 0) {
      setMessage("Please enter a valid amount greater than 0.");
      setMessageType("error");
      return;
    }

    try {
      setWalletSubmitting(true);
      const res = await addVendorWalletMoney(walletVendor._id, {
        amount: num,
        type: walletType,
        description: walletDesc,
      });

      if (res.success) {
        setMessage(res.message || `Wallet updated for ${walletVendor.name}`);
        setMessageType("success");
        setWalletVendor(null);
        fetchVendorsList();
      } else {
        setMessage(res.message || "Failed to update wallet balance.");
        setMessageType("error");
      }
    } catch (err) {
      console.error("Wallet topup error:", err);
      setMessage(err.message || "Failed to update wallet.");
      setMessageType("error");
    } finally {
      setWalletSubmitting(false);
    }
  };

  const handleOpenMembers = async (vendor) => {
    setSelectedVendorForMembers(vendor);
    setLoadingMembers(true);
    setVendorMembers([]);
    try {
      const res = await getVendorMembers(vendor._id || vendor.vendorId);
      if (res.success && Array.isArray(res.members)) {
        setVendorMembers(res.members);
      } else {
        setVendorMembers([]);
      }
    } catch (err) {
      console.error("Error loading vendor members:", err);
      setVendorMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  };

  return (
    <section className="users-page">
      <div className="admin-page-heading">
        <div>
          <h2>Vendor Management</h2>
          <p>Register new vendors with OTP verification, KYC, and manage active accounts.</p>
        </div>

        <button
          type="button"
          className="admin-primary-button"
          onClick={() => {
            setShowForm((prev) => !prev);
            setMessage("");
          }}
        >
          {showForm ? <FiX /> : <FiPlus />}
          {showForm ? "Close Form" : "Add Vendor"}
        </button>
      </div>

      {message && (
        <div
          className={`admin-inline-message ${
            messageType === "error" ? "error" : ""
          }`}
          role="status"
        >
          {messageType === "error" ? (
            <FiAlertCircle style={{ marginRight: 6, verticalAlign: "middle" }} />
          ) : (
            <FiCheckCircle style={{ marginRight: 6, verticalAlign: "middle" }} />
          )}
          {message}
        </div>
      )}

      {/* ADD VENDOR FORM */}
      {showForm && (
        <form className="admin-panel users-form-panel" onSubmit={handleSubmit}>
          <div className="admin-panel-title">
            <div>
              <h3>Add New Vendor</h3>
              <p>Verify mobile, auto-fetch location via pincode, and fill vendor KYC details.</p>
            </div>
          </div>

          {/* SECTION 1: MOBILE & LOCATION & NAME */}
          <div className="vendor-form-section">
            <h4 className="vendor-section-title">
              <span className="section-step-num">1</span> Primary Mobile & Location Details
            </h4>

            <div className="admin-form-grid">
              {/* 1. Mobile Number with Demo OTP Verification */}
              <div className="admin-form-field full">
                <label htmlFor="vendor-mobile">
                  Primary Mobile No * {isMobileVerified && <span className="verified-badge"><FiCheck /> Verified</span>}
                </label>
                <div className="input-with-action-wrap">
                  <input
                    id="vendor-mobile"
                    name="mobile"
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    value={form.mobile}
                    onChange={(e) => {
                      setForm((prev) => ({
                        ...prev,
                        mobile: e.target.value.replace(/\D/g, "").slice(0, 10),
                      }));
                      if (isMobileVerified) setIsMobileVerified(false);
                    }}
                    disabled={isMobileVerified}
                    required
                  />
                  {!isMobileVerified ? (
                    <button
                      type="button"
                      className="admin-otp-btn"
                      onClick={handleSendMobileOtp}
                      disabled={form.mobile.replace(/\D/g, "").length !== 10}
                    >
                      {mobileOtpSent ? "Resend OTP" : "Send OTP"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="admin-otp-btn reset"
                      onClick={() => {
                        setIsMobileVerified(false);
                        setMobileOtpSent(false);
                      }}
                    >
                      Change No.
                    </button>
                  )}
                </div>

                {/* Demo OTP Notice & Input Box */}
                {mobileOtpSent && !isMobileVerified && (
                  <div className="otp-verification-card">
                    <div className="demo-otp-banner">
                      <span>Demo OTP for verification is: <strong>{mobileOtpCode}</strong></span>
                    </div>
                    <div className="otp-input-row">
                      <input
                        type="text"
                        placeholder="Enter 4-digit OTP"
                        maxLength={4}
                        value={mobileOtpInput}
                        onChange={(e) => setMobileOtpInput(e.target.value.replace(/\D/g, ""))}
                        autoFocus
                      />
                      <button
                        type="button"
                        className="admin-primary-button otp-verify-action"
                        onClick={handleVerifyMobileOtp}
                        disabled={mobileOtpInput.length !== 4}
                      >
                        Verify OTP
                      </button>
                    </div>
                    {mobileOtpError && <p className="otp-error-msg">{mobileOtpError}</p>}
                  </div>
                )}
              </div>

              {/* 2. Pincode with Auto-City & State Fetch */}
              <div className="admin-form-field">
                <label htmlFor="vendor-pincode">
                  Pincode * {pincodeLoading && <span className="detecting-label">Detecting...</span>}
                </label>
                <input
                  id="vendor-pincode"
                  name="pincode"
                  type="text"
                  placeholder="Enter 6-digit Pincode"
                  maxLength={6}
                  value={form.pincode}
                  onChange={handlePincodeChange}
                  required
                />
                {pincodeMsg && (
                  <small className={`pincode-feedback ${pincodeMsg.includes("✓") ? "success" : "muted"}`}>
                    {pincodeMsg}
                  </small>
                )}
              </div>

              {/* 3. City (Auto-filled / Editable) */}
              <div className="admin-form-field">
                <label htmlFor="vendor-city">City *</label>
                <input
                  id="vendor-city"
                  name="city"
                  placeholder="e.g. Jaipur"
                  value={form.city}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* 4. State (Auto-filled / Editable) */}
              <div className="admin-form-field">
                <label htmlFor="vendor-state">State *</label>
                <input
                  id="vendor-state"
                  name="state"
                  placeholder="e.g. Rajasthan"
                  value={form.state}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* 5. First Name */}
              <div className="admin-form-field">
                <label htmlFor="vendor-first-name">First Name *</label>
                <input
                  id="vendor-first-name"
                  name="firstName"
                  placeholder="e.g. Aarav"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* 6. Last Name */}
              <div className="admin-form-field">
                <label htmlFor="vendor-last-name">Last Name</label>
                <input
                  id="vendor-last-name"
                  name="lastName"
                  placeholder="e.g. Sharma"
                  value={form.lastName}
                  onChange={handleChange}
                />
              </div>

              {/* 7. House No / Flat / Shop */}
              <div className="admin-form-field">
                <label htmlFor="vendor-house-no">House No / Shop No / Flat *</label>
                <input
                  id="vendor-house-no"
                  name="houseNo"
                  placeholder="e.g. Plot No 42, Ground Floor"
                  value={form.houseNo}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* 8. Near Landmark */}
              <div className="admin-form-field">
                <label htmlFor="vendor-landmark">Near Landmark</label>
                <input
                  id="vendor-landmark"
                  name="landmark"
                  placeholder="e.g. Near Metro Station / Main Market"
                  value={form.landmark}
                  onChange={handleChange}
                />
              </div>

              {/* 9. Alternate Mobile No */}
              <div className="admin-form-field">
                <label htmlFor="vendor-alt-mobile">Alternate Mobile No</label>
                <input
                  id="vendor-alt-mobile"
                  name="alternateMobile"
                  type="tel"
                  placeholder="Optional alternate contact"
                  value={form.alternateMobile}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      alternateMobile: e.target.value.replace(/\D/g, "").slice(0, 10),
                    }))
                  }
                />
              </div>

              {/* 10. Date of Birth */}
              <div className="admin-form-field">
                <label htmlFor="vendor-dob">Date of Birth (D.O.B) *</label>
                <input
                  id="vendor-dob"
                  name="dob"
                  type="date"
                  value={form.dob}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* 11. Email Address */}
              <div className="admin-form-field full">
                <label htmlFor="vendor-email">Email Address *</label>
                <input
                  id="vendor-email"
                  name="email"
                  type="email"
                  placeholder="vendor@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: IDENTITY & BANK DETAILS */}
          <div className="vendor-form-section">
            <h4 className="vendor-section-title">
              <span className="section-step-num">2</span> Identity (KYC) & Bank Details
            </h4>

            <div className="admin-form-grid">
              {/* Aadhar No */}
              <div className="admin-form-field">
                <label htmlFor="vendor-aadhar">Aadhar Number (12 Digits)</label>
                <input
                  id="vendor-aadhar"
                  name="aadharNo"
                  type="text"
                  placeholder="e.g. 1234 5678 9012"
                  maxLength={12}
                  value={form.aadharNo}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      aadharNo: e.target.value.replace(/\D/g, "").slice(0, 12),
                    }))
                  }
                />
              </div>

              {/* PAN No */}
              <div className="admin-form-field">
                <label htmlFor="vendor-pan">PAN Number (10 Characters)</label>
                <input
                  id="vendor-pan"
                  name="panNo"
                  type="text"
                  placeholder="e.g. ABCDE1234F"
                  maxLength={10}
                  value={form.panNo}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      panNo: e.target.value.toUpperCase().slice(0, 10),
                    }))
                  }
                />
              </div>

              {/* Name of Bank */}
              <div className="admin-form-field">
                <label htmlFor="vendor-bank-name">Name of Bank</label>
                <input
                  id="vendor-bank-name"
                  name="bankName"
                  placeholder="e.g. State Bank of India / HDFC"
                  value={form.bankName}
                  onChange={handleChange}
                />
              </div>

              {/* Bank Account Number */}
              <div className="admin-form-field">
                <label htmlFor="vendor-account-no">Bank Account Number</label>
                <input
                  id="vendor-account-no"
                  name="accountNumber"
                  type="text"
                  placeholder="e.g. 012345678912"
                  value={form.accountNumber}
                  onChange={handleChange}
                />
              </div>

              {/* IFSC Code */}
              <div className="admin-form-field">
                <label htmlFor="vendor-ifsc">IFSC Code</label>
                <input
                  id="vendor-ifsc"
                  name="ifscCode"
                  type="text"
                  placeholder="e.g. SBIN0001234"
                  maxLength={11}
                  value={form.ifscCode}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      ifscCode: e.target.value.toUpperCase().slice(0, 11),
                    }))
                  }
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: NOMINEE DETAILS */}
          <div className="vendor-form-section">
            <h4 className="vendor-section-title">
              <span className="section-step-num">3</span> Nominee Details
            </h4>

            <div className="admin-form-grid">
              {/* Nominee First Name */}
              <div className="admin-form-field">
                <label htmlFor="nominee-first-name">Nominee First Name</label>
                <input
                  id="nominee-first-name"
                  name="nomineeFirstName"
                  placeholder="Nominee first name"
                  value={form.nomineeFirstName}
                  onChange={handleChange}
                />
              </div>

              {/* Nominee Last Name */}
              <div className="admin-form-field">
                <label htmlFor="nominee-last-name">Nominee Last Name</label>
                <input
                  id="nominee-last-name"
                  name="nomineeLastName"
                  placeholder="Nominee last name"
                  value={form.nomineeLastName}
                  onChange={handleChange}
                />
              </div>

              {/* Relation with Vendor */}
              <div className="admin-form-field">
                <label htmlFor="nominee-relation">Relation with Vendor</label>
                <select
                  id="nominee-relation"
                  name="nomineeRelation"
                  value={form.nomineeRelation}
                  onChange={handleChange}
                >
                  <option value="">Select Relationship</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Brother">Brother</option>
                  <option value="Sister">Sister</option>
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Nominee Mobile No with Demo OTP */}
              <div className="admin-form-field">
                <label htmlFor="nominee-mobile">
                  Nominee Mobile No {isNomineeMobileVerified && <span className="verified-badge"><FiCheck /> Verified</span>}
                </label>
                <div className="input-with-action-wrap">
                  <input
                    id="nominee-mobile"
                    name="nomineeMobile"
                    type="tel"
                    placeholder="10-digit nominee mobile"
                    value={form.nomineeMobile}
                    onChange={(e) => {
                      setForm((prev) => ({
                        ...prev,
                        nomineeMobile: e.target.value.replace(/\D/g, "").slice(0, 10),
                      }));
                      if (isNomineeMobileVerified) setIsNomineeMobileVerified(false);
                    }}
                    disabled={isNomineeMobileVerified}
                  />
                  {!isNomineeMobileVerified ? (
                    <button
                      type="button"
                      className="admin-otp-btn"
                      onClick={handleSendNomineeOtp}
                      disabled={form.nomineeMobile.replace(/\D/g, "").length !== 10}
                    >
                      {nomineeOtpSent ? "Resend" : "Verify OTP"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="admin-otp-btn reset"
                      onClick={() => {
                        setIsNomineeMobileVerified(false);
                        setNomineeOtpSent(false);
                      }}
                    >
                      Reset
                    </button>
                  )}
                </div>

                {nomineeOtpSent && !isNomineeMobileVerified && (
                  <div className="otp-verification-card nominee-otp">
                    <div className="demo-otp-banner">
                      <span>Demo OTP for Nominee: <strong>{nomineeOtpCode}</strong></span>
                    </div>
                    <div className="otp-input-row">
                      <input
                        type="text"
                        placeholder="Enter 4-digit OTP"
                        maxLength={4}
                        value={nomineeOtpInput}
                        onChange={(e) => setNomineeOtpInput(e.target.value.replace(/\D/g, ""))}
                        autoFocus
                      />
                      <button
                        type="button"
                        className="admin-primary-button otp-verify-action"
                        onClick={handleVerifyNomineeOtp}
                        disabled={nomineeOtpInput.length !== 4}
                      >
                        Verify
                      </button>
                    </div>
                    {nomineeOtpError && <p className="otp-error-msg">{nomineeOtpError}</p>}
                  </div>
                )}
              </div>

              {/* Nominee D.O.B */}
              <div className="admin-form-field">
                <label htmlFor="nominee-dob">Nominee Date of Birth (D.O.B)</label>
                <input
                  id="nominee-dob"
                  name="nomineeDob"
                  type="date"
                  value={form.nomineeDob}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: DOCUMENTS UPLOAD (ALL OPTIONAL) */}
          <div className="vendor-form-section">
            <h4 className="vendor-section-title">
              <span className="section-step-num">4</span> KYC Documents Upload{" "}
              <span className="optional-tag">(All Optional)</span>
            </h4>

            <div className="admin-doc-upload-grid">
              {/* Aadhar Card File */}
              <div className="doc-upload-box">
                <label>Aadhar Card Document</label>
                <p className="doc-sub">Upload image / PDF scan</p>
                <div className="doc-file-action">
                  <input
                    type="file"
                    id="doc-aadhar"
                    accept="image/*,application/pdf"
                    onChange={(e) => handleDocUpload("aadhar", e.target.files?.[0])}
                    style={{ display: "none" }}
                  />
                  <label htmlFor="doc-aadhar" className="admin-file-picker-btn">
                    <FiUpload /> {uploadingDoc === "aadhar" ? "Uploading..." : form.aadharCardFile ? "Change File" : "Choose File"}
                  </label>
                </div>
                {form.aadharCardFile && (
                  <div className="uploaded-file-indicator">
                    <FiCheckCircle />
                    <span title={form.aadharCardFile}>Uploaded</span>
                    <button
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, aadharCardFile: "" }))}
                      className="doc-remove-btn"
                    >
                      <FiX />
                    </button>
                  </div>
                )}
              </div>

              {/* PAN Card File */}
              <div className="doc-upload-box">
                <label>PAN Card Document</label>
                <p className="doc-sub">Upload image / PDF scan</p>
                <div className="doc-file-action">
                  <input
                    type="file"
                    id="doc-pan"
                    accept="image/*,application/pdf"
                    onChange={(e) => handleDocUpload("pan", e.target.files?.[0])}
                    style={{ display: "none" }}
                  />
                  <label htmlFor="doc-pan" className="admin-file-picker-btn">
                    <FiUpload /> {uploadingDoc === "pan" ? "Uploading..." : form.panCardFile ? "Change File" : "Choose File"}
                  </label>
                </div>
                {form.panCardFile && (
                  <div className="uploaded-file-indicator">
                    <FiCheckCircle />
                    <span title={form.panCardFile}>Uploaded</span>
                    <button
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, panCardFile: "" }))}
                      className="doc-remove-btn"
                    >
                      <FiX />
                    </button>
                  </div>
                )}
              </div>

              {/* Passbook / Cheque File */}
              <div className="doc-upload-box">
                <label>Bank Passbook / Cheque</label>
                <p className="doc-sub">Upload image / PDF scan</p>
                <div className="doc-file-action">
                  <input
                    type="file"
                    id="doc-passbook"
                    accept="image/*,application/pdf"
                    onChange={(e) => handleDocUpload("passbook", e.target.files?.[0])}
                    style={{ display: "none" }}
                  />
                  <label htmlFor="doc-passbook" className="admin-file-picker-btn">
                    <FiUpload /> {uploadingDoc === "passbook" ? "Uploading..." : form.passbookFile ? "Change File" : "Choose File"}
                  </label>
                </div>
                {form.passbookFile && (
                  <div className="uploaded-file-indicator">
                    <FiCheckCircle />
                    <span title={form.passbookFile}>Uploaded</span>
                    <button
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, passbookFile: "" }))}
                      className="doc-remove-btn"
                    >
                      <FiX />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 5: PASSWORD CREDENTIALS */}
          <div className="vendor-form-section">
            <h4 className="vendor-section-title">
              <span className="section-step-num">5</span> Vendor Account Password
            </h4>

            <div className="admin-form-grid">
              <div className="admin-form-field">
                <label htmlFor="vendor-password">Password *</label>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <input
                    id="vendor-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password (min 6 characters)"
                    value={form.password}
                    onChange={handleChange}
                    required
                    style={{ paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: 12,
                      background: "transparent",
                      border: "none",
                      color: "#e5aa0a",
                      cursor: "pointer",
                      fontSize: 16,
                    }}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div className="admin-form-field">
                <label htmlFor="vendor-confirm-password">Confirm Password *</label>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <input
                    id="vendor-confirm-password"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter password to confirm"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    style={{ paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: "absolute",
                      right: 12,
                      background: "transparent",
                      border: "none",
                      color: "#e5aa0a",
                      cursor: "pointer",
                      fontSize: 16,
                    }}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* PAYMENT BANNER & SUBMIT */}
          <div className="vendor-payment-cta-box">
            <div className="payment-cta-info">
              <FiCreditCard size={22} className="cta-icon" />
              <div>
                <strong>Vendor Registration Fee: ₹5,000</strong>
                <p>Complete vendor details will be securely saved and activated in the database upon successful payment.</p>
              </div>
            </div>

            <div className="admin-form-actions">
              <button
                type="button"
                className="admin-secondary-button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="admin-primary-button"
                disabled={submitting}
              >
                <FiCreditCard />
                <span>{submitting ? "Processing Payment..." : "Pay ₹5,000 & Add Vendor"}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* VENDORS TABLE */}
      <div className="admin-panel users-table-panel">
        <div className="admin-toolbar">
          <div>
            <strong>
              <FiUsers style={{ marginRight: 6, verticalAlign: "middle", color: "#e5aa0a" }} />
              {filteredVendors.length} {filteredVendors.length === 1 ? "Vendor" : "Vendors"}
            </strong>
            <p className="users-helper">Registered vendor directory from database</p>
          </div>

          <label className="users-search">
            <FiSearch />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, ID, mobile, city, PAN..."
            />
          </label>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Vendor / ID</th>
                <th>Contact</th>
                <th>Location</th>
                <th>KYC / Identity</th>
                <th>Affiliated Members</th>
                <th>Wallet Balance</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredVendors.map((vendor) => (
                <tr key={vendor._id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <strong
                        onClick={() => setViewingVendor(vendor)}
                        style={{ cursor: "pointer", transition: "color 0.2s" }}
                        title="Click to view full vendor details"
                        className="vendor-name-link"
                      >
                        {vendor.name || `${vendor.firstName || ""} ${vendor.lastName || ""}`.trim()}
                      </strong>
                      {vendor.vendorId && (
                        <button
                          type="button"
                          onClick={() => handleOpenMembers(vendor)}
                          style={{
                            background: "rgba(229, 170, 10, 0.15)",
                            color: "#e5aa0a",
                            border: "1px solid rgba(229, 170, 10, 0.35)",
                            padding: "2px 7px",
                            borderRadius: "4px",
                            fontSize: "11px",
                            fontFamily: "monospace",
                            fontWeight: "800",
                            letterSpacing: "0.5px",
                            cursor: "pointer",
                          }}
                          title={`Click to view members under ${vendor.vendorId}`}
                        >
                          {vendor.vendorId}
                        </button>
                      )}
                    </div>
                    <small style={{ color: "#e5aa0a", fontSize: 11 }}>
                      {vendor.role || "Vendor"}
                    </small>
                  </td>

                  <td>
                    <div>
                      <FiPhone style={{ marginRight: 5, fontSize: 12, color: "#e5aa0a" }} />
                      <span>{vendor.mobile}</span>
                    </div>
                    <div>
                      <FiMail style={{ marginRight: 5, fontSize: 12, color: "#e5aa0a" }} />
                      <span>{vendor.email}</span>
                    </div>
                  </td>

                  <td>
                    <FiMapPin style={{ marginRight: 4, fontSize: 12, color: "#e5aa0a" }} />
                    <strong>{vendor.city}</strong>, {vendor.state}
                    {vendor.pincode && <small style={{ display: "block", color: "#a89d8d" }}>PIN: {vendor.pincode}</small>}
                  </td>

                  <td>
                    <div style={{ fontSize: 12 }}>
                      {vendor.panNo && (
                        <div>
                          <span style={{ color: "#a89d8d" }}>PAN:</span>{" "}
                          <strong style={{ color: "#fff" }}>{vendor.panNo}</strong>
                        </div>
                      )}
                      {vendor.aadharNo && (
                        <div>
                          <span style={{ color: "#a89d8d" }}>Aadhar:</span>{" "}
                          <span>{vendor.aadharNo}</span>
                        </div>
                      )}
                      {!vendor.panNo && !vendor.aadharNo && (
                        <span style={{ color: "#8c8376", fontStyle: "italic" }}>Pending</span>
                      )}
                    </div>
                  </td>

                  <td>
                    <button
                      type="button"
                      onClick={() => handleOpenMembers(vendor)}
                      className="admin-members-badge-btn"
                      title={`Click to view members registered under ${vendor.vendorId || vendor.name}`}
                    >
                      <FiUsers style={{ marginRight: 5, fontSize: 13 }} />
                      <strong>{vendor.membersCount || 0}</strong>
                      <span style={{ marginLeft: 4 }}>Members</span>
                    </button>
                  </td>

                  <td>
                    <div className="admin-wallet-badge">
                      <FiCreditCard className="wallet-badge-icon" />
                      <strong>₹{(vendor.walletBalance || 0).toLocaleString("en-IN")}</strong>
                    </div>
                  </td>

                  <td>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(vendor._id, vendor.status)}
                      title="Click to toggle status"
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      <span
                        className={`admin-status ${
                          vendor.status === "Active" ? "success" : "danger"
                        }`}
                      >
                        {vendor.status || "Active"}
                      </span>
                    </button>
                  </td>

                  <td>
                    <div style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
                      {/* EYE BUTTON TO VIEW COMPLETE VENDOR DETAILS */}
                      <button
                        type="button"
                        onClick={() => setViewingVendor(vendor)}
                        className="admin-view-action-btn"
                        title={`View complete details of ${vendor.name}`}
                      >
                        <FiEye />
                        <span>View</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenWallet(vendor)}
                        className="admin-wallet-action-btn"
                        title={`Manage wallet balance for ${vendor.name}`}
                      >
                        <FiCreditCard />
                        <span>Wallet</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(vendor._id, vendor.name)}
                        className="admin-secondary-button"
                        style={{
                          padding: "6px 10px",
                          minHeight: "auto",
                          fontSize: "12px",
                          color: "#f87171",
                          borderColor: "rgba(248, 113, 113, 0.3)",
                        }}
                        title="Delete vendor"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {loading && (
            <div className="admin-empty">Loading vendors from database...</div>
          )}

          {!loading && filteredVendors.length === 0 && (
            <div className="admin-empty">
              {search
                ? "No matching vendors found."
                : "No vendors created yet. Click 'Add Vendor' above to add your first vendor!"}
            </div>
          )}
        </div>
      </div>

      {/* FULL VENDOR DETAILS MODAL (OPENED BY EYE BUTTON) */}
      {viewingVendor && (
        <div className="admin-modal-backdrop" onClick={() => setViewingVendor(null)}>
          <div
            className="admin-modal-card vendor-details-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div>
                <span className="admin-eyebrow">COMPLETE VENDOR PROFILE</span>
                <h3 style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
                  <span>{viewingVendor.name || `${viewingVendor.firstName || ""} ${viewingVendor.lastName || ""}`.trim()}</span>
                  {viewingVendor.vendorId && (
                    <span className="vendor-id-pill">{viewingVendor.vendorId}</span>
                  )}
                  <span className={`admin-status ${viewingVendor.status === "Active" ? "success" : "danger"}`}>
                    {viewingVendor.status || "Active"}
                  </span>
                </h3>
              </div>
              <button
                type="button"
                className="admin-modal-close-btn"
                onClick={() => setViewingVendor(null)}
              >
                <FiX />
              </button>
            </div>

            <div className="vendor-details-modal-body">
              {/* Card 1: Personal & Contact Details */}
              <div className="vendor-profile-detail-card">
                <h4><FiUserCheck /> Personal & Contact Details</h4>
                <div className="detail-rows-grid">
                  <div className="detail-item">
                    <span className="d-label">Full Name</span>
                    <strong className="d-val">{viewingVendor.name || `${viewingVendor.firstName || ""} ${viewingVendor.lastName || ""}`.trim()}</strong>
                  </div>
                  <div className="detail-item">
                    <span className="d-label">Date of Birth (D.O.B)</span>
                    <span className="d-val">{viewingVendor.dob || viewingVendor.dateOfBirth || "N/A"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="d-label">Primary Mobile No</span>
                    <strong className="d-val">
                      {viewingVendor.mobile}{" "}
                      <span className="verified-badge-pill">✓ Verified</span>
                    </strong>
                  </div>
                  <div className="detail-item">
                    <span className="d-label">Alternate Mobile No</span>
                    <span className="d-val">{viewingVendor.alternateMobile || "N/A"}</span>
                  </div>
                  <div className="detail-item full-width">
                    <span className="d-label">Email Address</span>
                    <span className="d-val email-val">{viewingVendor.email}</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Address & Location */}
              <div className="vendor-profile-detail-card">
                <h4><FiMapPin /> Address & Location Details</h4>
                <div className="detail-rows-grid">
                  <div className="detail-item">
                    <span className="d-label">Pincode</span>
                    <strong className="d-val">{viewingVendor.pincode || "N/A"}</strong>
                  </div>
                  <div className="detail-item">
                    <span className="d-label">City</span>
                    <span className="d-val">{viewingVendor.city}</span>
                  </div>
                  <div className="detail-item">
                    <span className="d-label">State</span>
                    <span className="d-val">{viewingVendor.state}</span>
                  </div>
                  <div className="detail-item">
                    <span className="d-label">House / Shop No</span>
                    <span className="d-val">{viewingVendor.houseNo || "N/A"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="d-label">Near Landmark</span>
                    <span className="d-val">{viewingVendor.landmark || "N/A"}</span>
                  </div>
                  <div className="detail-item full-width">
                    <span className="d-label">Complete Registered Address</span>
                    <span className="d-val">{viewingVendor.address}</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Identity & Bank Account */}
              <div className="vendor-profile-detail-card">
                <h4><FiCreditCard /> Identity (KYC) & Bank Details</h4>
                <div className="detail-rows-grid">
                  <div className="detail-item">
                    <span className="d-label">Aadhar Card Number</span>
                    <strong className="d-val">{viewingVendor.aadharNo || "N/A"}</strong>
                  </div>
                  <div className="detail-item">
                    <span className="d-label">PAN Number</span>
                    <strong className="d-val pan-code">{viewingVendor.panNo || "N/A"}</strong>
                  </div>
                  <div className="detail-item">
                    <span className="d-label">Bank Name</span>
                    <span className="d-val">{viewingVendor.bankName || "N/A"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="d-label">Account Number</span>
                    <span className="d-val">{viewingVendor.accountNumber || "N/A"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="d-label">IFSC Code</span>
                    <span className="d-val pan-code">{viewingVendor.ifscCode || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Card 4: Nominee Details */}
              <div className="vendor-profile-detail-card">
                <h4><FiUsers /> Nominee Details</h4>
                <div className="detail-rows-grid">
                  <div className="detail-item">
                    <span className="d-label">Nominee Name</span>
                    <strong className="d-val">
                      {`${viewingVendor.nomineeFirstName || ""} ${viewingVendor.nomineeLastName || ""}`.trim() || "N/A"}
                    </strong>
                  </div>
                  <div className="detail-item">
                    <span className="d-label">Relationship</span>
                    <span className="d-val">{viewingVendor.nomineeRelation || "N/A"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="d-label">Nominee Mobile No</span>
                    <span className="d-val">
                      {viewingVendor.nomineeMobile ? (
                        <>
                          {viewingVendor.nomineeMobile}
                          {viewingVendor.isNomineeMobileVerified && (
                            <span className="verified-badge-pill" style={{ marginLeft: 6 }}>
                              ✓ Verified
                            </span>
                          )}
                        </>
                      ) : (
                        "N/A"
                      )}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="d-label">Nominee D.O.B</span>
                    <span className="d-val">{viewingVendor.nomineeDob || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Card 5: Uploaded KYC Documents */}
              <div className="vendor-profile-detail-card">
                <h4><FiFileText /> Uploaded Documents</h4>
                <div className="docs-preview-row">
                  {/* Aadhar */}
                  <div className="doc-preview-item">
                    <span className="doc-preview-label">Aadhar Document</span>
                    {viewingVendor.aadharCardFile ? (
                      <a
                        href={viewingVendor.aadharCardFile}
                        target="_blank"
                        rel="noreferrer"
                        className="doc-view-link"
                      >
                        <FiExternalLink /> View Document
                      </a>
                    ) : (
                      <span className="doc-empty-label">Not Uploaded</span>
                    )}
                  </div>

                  {/* PAN */}
                  <div className="doc-preview-item">
                    <span className="doc-preview-label">PAN Document</span>
                    {viewingVendor.panCardFile ? (
                      <a
                        href={viewingVendor.panCardFile}
                        target="_blank"
                        rel="noreferrer"
                        className="doc-view-link"
                      >
                        <FiExternalLink /> View Document
                      </a>
                    ) : (
                      <span className="doc-empty-label">Not Uploaded</span>
                    )}
                  </div>

                  {/* Passbook */}
                  <div className="doc-preview-item">
                    <span className="doc-preview-label">Bank Passbook / Cheque</span>
                    {viewingVendor.passbookFile ? (
                      <a
                        href={viewingVendor.passbookFile}
                        target="_blank"
                        rel="noreferrer"
                        className="doc-view-link"
                      >
                        <FiExternalLink /> View Document
                      </a>
                    ) : (
                      <span className="doc-empty-label">Not Uploaded</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card 6: Wallet & Registration Payment History */}
              <div className="vendor-profile-detail-card">
                <h4><FiCreditCard /> Account Status & Payment Info</h4>
                <div className="detail-rows-grid">
                  <div className="detail-item">
                    <span className="d-label">Wallet Balance</span>
                    <strong className="d-val wallet-highlight">
                      ₹{(viewingVendor.walletBalance || 0).toLocaleString("en-IN")}
                    </strong>
                  </div>
                  <div className="detail-item">
                    <span className="d-label">Registration Fee</span>
                    <span className="d-val">₹{(viewingVendor.membershipFee || 5000).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="detail-item">
                    <span className="d-label">Payment Status</span>
                    <strong className="d-val" style={{ color: "#4ade80" }}>
                      {viewingVendor.paymentStatus || "Paid"}
                    </strong>
                  </div>
                  <div className="detail-item">
                    <span className="d-label">Razorpay Payment ID</span>
                    <span className="d-val pan-code">{viewingVendor.razorpayPaymentId || "Admin Enrolled"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="d-label">Razorpay Order ID</span>
                    <span className="d-val pan-code">{viewingVendor.razorpayOrderId || "N/A"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="d-label">Registered On</span>
                    <span className="d-val">
                      {viewingVendor.createdAt
                        ? new Date(viewingVendor.createdAt).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-secondary-button"
                onClick={() => setViewingVendor(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="admin-wallet-action-btn"
                onClick={() => {
                  const target = viewingVendor;
                  setViewingVendor(null);
                  handleOpenWallet(target);
                }}
              >
                <FiCreditCard /> Topup Wallet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WALLET MANAGEMENT MODAL */}
      {walletVendor && (
        <div className="admin-modal-backdrop" onClick={() => !walletSubmitting && setWalletVendor(null)}>
          <div className="admin-modal-card wallet-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <span className="admin-eyebrow">USER WALLET TOPUP</span>
                <h3>Manage Wallet Balance</h3>
              </div>
              <button
                type="button"
                className="admin-modal-close-btn"
                onClick={() => !walletSubmitting && setWalletVendor(null)}
              >
                <FiX />
              </button>
            </div>

            <div className="wallet-modal-user-info">
              <div className="wallet-user-details">
                <strong>{walletVendor.name}</strong>
                <span>{walletVendor.email} &bull; {walletVendor.mobile}</span>
              </div>
              <div className="wallet-current-bal-box">
                <span className="bal-lbl">Current Balance</span>
                <span className="bal-val">₹{(walletVendor.walletBalance || 0).toLocaleString("en-IN")}</span>
              </div>
            </div>

            <form onSubmit={handleWalletSubmit} className="admin-wallet-form">
              <div className="wallet-type-toggle">
                <button
                  type="button"
                  className={`wallet-type-btn ${walletType === "Credit" ? "active credit" : ""}`}
                  onClick={() => setWalletType("Credit")}
                >
                  <FiArrowDownLeft /> Add Money (Credit)
                </button>
                <button
                  type="button"
                  className={`wallet-type-btn ${walletType === "Debit" ? "active debit" : ""}`}
                  onClick={() => setWalletType("Debit")}
                >
                  <FiArrowUpRight /> Deduct (Debit)
                </button>
              </div>

              <div className="admin-form-group">
                <label>Amount to {walletType === "Credit" ? "Add" : "Deduct"} (₹) *</label>
                <div className="input-with-currency">
                  <span>₹</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    placeholder="e.g. 500"
                    value={walletAmount}
                    onChange={(e) => setWalletAmount(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>

              <div className="wallet-quick-chips">
                {[500, 1000, 2000, 5000, 10000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    className="quick-chip-btn"
                    onClick={() => setWalletAmount(String(amt))}
                  >
                    +₹{amt.toLocaleString("en-IN")}
                  </button>
                ))}
              </div>

              <div className="admin-form-group">
                <label>Transaction Note / Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Bonus, Advance, Payment Topup..."
                  value={walletDesc}
                  onChange={(e) => setWalletDesc(e.target.value)}
                />
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={() => setWalletVendor(null)}
                  disabled={walletSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`admin-primary-button ${walletType === "Debit" ? "debit-submit" : ""}`}
                  disabled={walletSubmitting || !walletAmount}
                >
                  {walletSubmitting ? (
                    "Processing..."
                  ) : (
                    <>
                      <FiCreditCard />
                      <span>{walletType === "Credit" ? "Add to Wallet" : "Deduct Balance"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AFFILIATED MEMBERS MODAL */}
      {selectedVendorForMembers && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setSelectedVendorForMembers(null)}
        >
          <div
            className="admin-modal-card members-modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 880, width: "95%" }}
          >
            <div className="admin-modal-header">
              <div>
                <span className="admin-eyebrow">AFFILIATED MEMBERS DIRECTORY</span>
                <h3 style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
                  <span>Members Under: {selectedVendorForMembers.name}</span>
                  {selectedVendorForMembers.vendorId && (
                    <span
                      style={{
                        background: "rgba(229, 170, 10, 0.15)",
                        color: "#e5aa0a",
                        border: "1px solid rgba(229, 170, 10, 0.35)",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontSize: "13px",
                        fontFamily: "monospace",
                        fontWeight: "800",
                      }}
                    >
                      {selectedVendorForMembers.vendorId}
                    </span>
                  )}
                </h3>
              </div>
              <button
                type="button"
                className="admin-modal-close-btn"
                onClick={() => setSelectedVendorForMembers(null)}
              >
                <FiX />
              </button>
            </div>

            <div
              className="members-modal-summary"
              style={{
                padding: "12px 16px",
                background: "#181714",
                borderBottom: "1px solid rgba(229,170,10,0.15)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <div style={{ fontSize: 13, color: "#d5cbbe" }}>
                <span>Total Registered Members: </span>
                <strong style={{ color: "#e5aa0a", fontSize: 15 }}>{vendorMembers.length}</strong>
              </div>
              <div style={{ fontSize: 12, color: "#a89d8d" }}>
                Vendor Email: {selectedVendorForMembers.email} &bull; Mobile: {selectedVendorForMembers.mobile}
              </div>
            </div>

            <div className="members-modal-body" style={{ maxHeight: "60vh", overflowY: "auto", padding: "16px" }}>
              {loadingMembers && (
                <div style={{ padding: "40px 0", textAlign: "center", color: "#e5aa0a" }}>
                  Loading affiliated members...
                </div>
              )}

              {!loadingMembers && vendorMembers.length === 0 && (
                <div style={{ padding: "40px 0", textAlign: "center", color: "#8c8376" }}>
                  <FiUsers style={{ fontSize: 40, color: "#e5aa0a", opacity: 0.5, marginBottom: 12 }} />
                  <p style={{ margin: 0, fontSize: 15, color: "#ffffff", fontWeight: 600 }}>
                    No members have registered under Vendor{" "}
                    <span style={{ color: "#e5aa0a" }}>{selectedVendorForMembers.vendorId || selectedVendorForMembers.name}</span> yet.
                  </p>
                  <p style={{ margin: "8px auto 0", fontSize: 12.5, color: "#a89d8d", maxWidth: 480 }}>
                    When someone signs up via <strong>Member Register</strong> using Vendor ID{" "}
                    <span style={{ color: "#e5aa0a", fontFamily: "monospace" }}>{selectedVendorForMembers.vendorId}</span>, their generated Member ID (e.g.{" "}
                    <span style={{ color: "#e5aa0a", fontFamily: "monospace" }}>{selectedVendorForMembers.vendorId}-01</span>) and profile details will be listed here.
                  </p>
                </div>
              )}

              {!loadingMembers && vendorMembers.length > 0 && (
                <div className="admin-table-wrap">
                  <table className="admin-table" style={{ fontSize: 13 }}>
                    <thead>
                      <tr>
                        <th>Member ID</th>
                        <th>Name</th>
                        <th>Contact</th>
                        <th>Location</th>
                        <th>Registered Date</th>
                        <th>Fee Paid</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendorMembers.map((m) => (
                        <tr key={m._id || m.vendorId}>
                          <td>
                            <span
                              style={{
                                background: "rgba(229, 170, 10, 0.2)",
                                color: "#e5aa0a",
                                border: "1px solid rgba(229, 170, 10, 0.4)",
                                padding: "3px 8px",
                                borderRadius: "4px",
                                fontSize: "12px",
                                fontFamily: "monospace",
                                fontWeight: "800",
                                letterSpacing: "0.5px",
                                display: "inline-block",
                              }}
                            >
                              {m.vendorId || "N/A"}
                            </span>
                          </td>
                          <td>
                            <strong style={{ color: "#fff" }}>{m.name}</strong>
                          </td>
                          <td>
                            <div>
                              <FiPhone style={{ marginRight: 4, color: "#e5aa0a", fontSize: 11 }} />
                              {m.mobile}
                            </div>
                            {m.email && (
                              <div style={{ color: "#a89d8d", fontSize: 11 }}>
                                <FiMail style={{ marginRight: 4, color: "#e5aa0a", fontSize: 10 }} />
                                {m.email}
                              </div>
                            )}
                          </td>
                          <td>
                            <FiMapPin style={{ marginRight: 4, color: "#e5aa0a", fontSize: 11 }} />
                            <span>
                              {m.city || m.state
                                ? `${m.city || ""}${m.city && m.state ? ", " : ""}${m.state || ""}`
                                : "-"}
                            </span>
                          </td>
                          <td style={{ color: "#a89d8d", fontSize: 12 }}>
                            {m.createdAt
                              ? new Date(m.createdAt).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "-"}
                          </td>
                          <td>
                            <span style={{ color: "#4ade80", fontWeight: 700 }}>₹500 Paid</span>
                          </td>
                          <td>
                            <span
                              className={`admin-status ${m.status === "Active" ? "success" : "danger"}`}
                              style={{ fontSize: 11, padding: "2px 8px" }}
                            >
                              {m.status || "Active"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="admin-modal-footer" style={{ borderTop: "1px solid rgba(229,170,10,0.15)", padding: "12px 16px" }}>
              <button
                type="button"
                className="admin-secondary-button"
                onClick={() => setSelectedVendorForMembers(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
