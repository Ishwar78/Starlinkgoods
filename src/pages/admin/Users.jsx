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

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    city: "",
    state: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

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
      [v.vendorId, v.name, v.email, v.mobile, v.city, v.state, v.address, v.status]
        .filter(Boolean)
        .some((val) => val.toLowerCase().includes(query))
    );
  }, [vendors, search]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    // Validate inputs
    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.mobile.trim() ||
      !form.city.trim() ||
      !form.state.trim() ||
      !form.address.trim() ||
      !form.password ||
      !form.confirmPassword
    ) {
      setMessage("Please fill in all required fields.");
      setMessageType("error");
      return;
    }

    const cleanMobile = form.mobile.replace(/\D/g, "").trim();
    if (cleanMobile.length !== 10) {
      setMessage("Please enter a valid 10-digit mobile number.");
      setMessageType("error");
      return;
    }

    if (form.password.length < 6) {
      setMessage("Password must be at least 6 characters long.");
      setMessageType("error");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setMessage("Password and Confirm Password do not match.");
      setMessageType("error");
      return;
    }

    if (!window.Razorpay) {
      setMessage("Payment gateway is loading. Please check your internet connection.");
      setMessageType("error");
      return;
    }

    try {
      setSubmitting(true);
      setMessage("Initiating ₹5,000 Razorpay payment order...");
      setMessageType("info");

      // 1. Create ₹5,000 Razorpay order
      const orderData = await createVendorOrder({
        name: form.name.trim(),
        email: form.email.trim(),
        mobile: cleanMobile,
        city: form.city.trim(),
        state: form.state.trim(),
        address: form.address.trim(),
        password: form.password,
        fee: 5000,
      });

      if (!orderData || !orderData.success) {
        setMessage(orderData?.message || "Failed to create payment order.");
        setMessageType("error");
        setSubmitting(false);
        return;
      }

      // 2. Open Razorpay Checkout modal
      const options = {
        key: orderData.keyId,
        order_id: orderData.orderId,
        amount: orderData.amount, // 500000 paise
        currency: orderData.currency || "INR",
        name: "Star Link Goods",
        description: `Vendor Registration Fee (₹5,000) - ${form.name.trim()}`,
        image: "/Logo.jpeg",
        prefill: {
          name: form.name.trim(),
          email: form.email.trim(),
          contact: cleanMobile,
        },
        theme: {
          color: "#ffd044",
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
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
              name: form.name.trim(),
              email: form.email.trim(),
              mobile: cleanMobile,
              city: form.city.trim(),
              state: form.state.trim(),
              address: form.address.trim(),
              password: form.password,
              fee: 5000,
              role: "Vendor",
              status: "Active",
            });

            if (!regData || !regData.success) {
              throw new Error(regData?.message || "Payment verified, but saving vendor failed.");
            }

            setMessage(
              `Vendor "${regData.vendor?.name}" (${regData.vendor?.vendorId || "New"}) successfully created and saved in database after ₹5,000 payment!`
            );
            setMessageType("success");

            // Reset form
            setForm({
              name: "",
              email: "",
              mobile: "",
              city: "",
              state: "",
              address: "",
              password: "",
              confirmPassword: "",
            });

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
    } catch (err) {
      console.error("Create vendor error:", err);
      setMessage(err.message || "Error creating vendor payment order.");
      setMessageType("error");
      setSubmitting(false);
    }
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
          <p>Create and manage verified vendor accounts stored in the database.</p>
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

      {showForm && (
        <form
          className="admin-panel users-form-panel"
          onSubmit={handleSubmit}
        >
          <div className="admin-panel-title">
            <div>
              <h3>Add New Vendor</h3>
              <p>Fill out the vendor details below to save into the database.</p>
            </div>
          </div>

          <div className="admin-form-grid">
            <div className="admin-form-field">
              <label htmlFor="vendor-name">User Name / Vendor Name *</label>
              <input
                id="vendor-name"
                name="name"
                placeholder="e.g. Aarav Sharma / Starlink Furnishings"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="admin-form-field">
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

            <div className="admin-form-field">
              <label htmlFor="vendor-mobile">Mobile No *</label>
              <input
                id="vendor-mobile"
                name="mobile"
                type="tel"
                placeholder="+91 98765 43210"
                value={form.mobile}
                onChange={handleChange}
                required
              />
            </div>

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

            <div className="admin-form-field">
              <label htmlFor="vendor-password">Password *</label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input
                  id="vendor-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter vendor password (min 6 chars)"
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
                    color: "#ffd044",
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
                    color: "#ffd044",
                    cursor: "pointer",
                    fontSize: 16,
                  }}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className="admin-form-field full">
              <label htmlFor="vendor-address">Address *</label>
              <textarea
                id="vendor-address"
                name="address"
                placeholder="Shop No., Street Name, Area / Landmark, Pincode"
                value={form.address}
                onChange={handleChange}
                rows={2}
                required
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 18px",
              background: "rgba(255, 208, 68, 0.08)",
              border: "1px solid rgba(255, 208, 68, 0.28)",
              borderRadius: "8px",
              marginTop: "16px",
              marginBottom: "20px",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                color: "#ffd044",
                fontSize: "14px",
                fontWeight: "700",
              }}
            >
              <FiCreditCard size={20} />
              <span>
                Vendor Registration Fee:{" "}
                <strong style={{ color: "#ffffff", fontSize: "15px" }}>₹5,000</strong>
              </span>
            </div>
            <span style={{ fontSize: "12px", color: "#b5aba0" }}>
              Secure Razorpay gateway will open. Vendor is saved and activated upon successful payment of ₹5,000.
            </span>
          </div>

          <div className="admin-form-actions">
            <button
              type="submit"
              className="admin-primary-button"
              disabled={submitting}
            >
              <FiCreditCard />
              <span>{submitting ? "Processing ₹5,000 Payment..." : "Pay ₹5,000 & Save Vendor"}</span>
            </button>

            <button
              type="button"
              className="admin-secondary-button"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="admin-panel users-table-panel">
        <div className="admin-toolbar">
          <div>
            <strong>
              <FiUsers style={{ marginRight: 6, verticalAlign: "middle", color: "#ffd044" }} />
              {filteredVendors.length} {filteredVendors.length === 1 ? "Vendor" : "Vendors"}
            </strong>
            <p className="users-helper">Registered vendor directory from MongoDB</p>
          </div>

          <label className="users-search">
            <FiSearch />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, email, city, mobile..."
            />
          </label>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Vendor / Name</th>
                <th>Contact</th>
                <th>Location</th>
                <th>Address</th>
                <th>Joined Members</th>
                <th>Wallet</th>
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
                        onClick={() => handleOpenMembers(vendor)}
                        style={{ cursor: "pointer", transition: "color 0.2s" }}
                        title="Click to view affiliated members"
                        className="vendor-name-link"
                      >
                        {vendor.name}
                      </strong>
                      {vendor.vendorId && (
                        <button
                          type="button"
                          onClick={() => handleOpenMembers(vendor)}
                          style={{
                            background: "rgba(255, 199, 45, 0.15)",
                            color: "#ffd044",
                            border: "1px solid rgba(255, 199, 45, 0.35)",
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
                    <small style={{ color: "#ffd044", fontSize: 11 }}>
                      {vendor.role || "Vendor"}
                    </small>
                  </td>

                  <td>
                    <div>
                      <FiMail style={{ marginRight: 5, fontSize: 12, color: "#ffd044" }} />
                      <span>{vendor.email}</span>
                    </div>
                    <div>
                      <FiPhone style={{ marginRight: 5, fontSize: 12, color: "#ffd044" }} />
                      <span>{vendor.mobile}</span>
                    </div>
                  </td>

                  <td>
                    <FiMapPin style={{ marginRight: 4, fontSize: 12, color: "#ffd044" }} />
                    <strong>{vendor.city}</strong>, {vendor.state}
                  </td>

                  <td>
                    <span
                      title={vendor.address}
                      style={{
                        display: "inline-block",
                        maxWidth: 180,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {vendor.address}
                    </span>
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
                        <span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {loading && (
            <div className="admin-empty">
              Loading vendors from database...
            </div>
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

      {/* Wallet Management Modal */}
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
              {/* Type Switcher */}
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

              {/* Amount Input */}
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

              {/* Quick Amount Chips */}
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

              {/* Description / Note */}
              <div className="admin-form-group">
                <label>Transaction Note / Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Bonus, Advance, Payment Topup..."
                  value={walletDesc}
                  onChange={(e) => setWalletDesc(e.target.value)}
                />
              </div>

              {/* Footer Buttons */}
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

      {/* Affiliated Members Modal */}
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
                        background: "rgba(255, 199, 45, 0.15)",
                        color: "#ffd044",
                        border: "1px solid rgba(255, 199, 45, 0.35)",
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
                borderBottom: "1px solid rgba(255,199,45,0.15)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <div style={{ fontSize: 13, color: "#d5cbbe" }}>
                <span>Total Registered Members: </span>
                <strong style={{ color: "#ffd044", fontSize: 15 }}>{vendorMembers.length}</strong>
              </div>
              <div style={{ fontSize: 12, color: "#a89d8d" }}>
                Vendor Email: {selectedVendorForMembers.email} &bull; Mobile: {selectedVendorForMembers.mobile}
              </div>
            </div>

            <div className="members-modal-body" style={{ maxHeight: "60vh", overflowY: "auto", padding: "16px" }}>
              {loadingMembers && (
                <div style={{ padding: "40px 0", textAlign: "center", color: "#ffd044" }}>
                  Loading affiliated members...
                </div>
              )}

              {!loadingMembers && vendorMembers.length === 0 && (
                <div style={{ padding: "40px 0", textAlign: "center", color: "#8c8376" }}>
                  <FiUsers style={{ fontSize: 40, color: "#ffd044", opacity: 0.5, marginBottom: 12 }} />
                  <p style={{ margin: 0, fontSize: 15, color: "#ffffff", fontWeight: 600 }}>
                    No members have registered under Vendor{" "}
                    <span style={{ color: "#ffd044" }}>{selectedVendorForMembers.vendorId || selectedVendorForMembers.name}</span> yet.
                  </p>
                  <p style={{ margin: "8px auto 0", fontSize: 12.5, color: "#a89d8d", maxWidth: 480 }}>
                    When someone signs up via <strong>Member Register</strong> using Vendor ID{" "}
                    <span style={{ color: "#ffd044", fontFamily: "monospace" }}>{selectedVendorForMembers.vendorId}</span>, their generated Member ID (e.g.{" "}
                    <span style={{ color: "#ffd044", fontFamily: "monospace" }}>{selectedVendorForMembers.vendorId}-01</span>) and profile details will be listed here.
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
                                background: "rgba(255, 199, 45, 0.2)",
                                color: "#ffd044",
                                border: "1px solid rgba(255, 199, 45, 0.4)",
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
                              <FiPhone style={{ marginRight: 4, color: "#ffd044", fontSize: 11 }} />
                              {m.mobile}
                            </div>
                            {m.email && (
                              <div style={{ color: "#a89d8d", fontSize: 11 }}>
                                <FiMail style={{ marginRight: 4, color: "#ffd044", fontSize: 10 }} />
                                {m.email}
                              </div>
                            )}
                          </td>
                          <td>
                            <FiMapPin style={{ marginRight: 4, color: "#ffd044", fontSize: 11 }} />
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

            <div className="admin-modal-footer" style={{ borderTop: "1px solid rgba(255,199,45,0.15)", padding: "12px 16px" }}>
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