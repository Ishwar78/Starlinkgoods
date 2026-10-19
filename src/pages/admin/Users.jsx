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
  createVendor,
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
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
  });

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
      !form.password
    ) {
      setMessage("Please fill in all required fields.");
      setMessageType("error");
      return;
    }

    try {
      setSubmitting(true);
      const res = await createVendor(form);

      if (res.success) {
        setMessage(`Vendor "${form.name}" created successfully and saved in database!`);
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
        });

        setShowForm(false);
        // Refresh list
        fetchVendorsList();
      }
    } catch (err) {
      console.error("Create vendor error:", err);
      setMessage(err.message || "Error creating vendor.");
      setMessageType("error");
    } finally {
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

          <div className="admin-form-actions">
            <button
              type="submit"
              className="admin-primary-button"
              disabled={submitting}
            >
              <FiSave />
              <span>{submitting ? "Saving to Database..." : "Save Vendor"}</span>
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
                      <strong>{vendor.name}</strong>
                      {vendor.vendorId && (
                        <span
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
                          }}
                          title={`Unique Vendor ID: ${vendor.vendorId}`}
                        >
                          {vendor.vendorId}
                        </span>
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
    </section>
  );
}