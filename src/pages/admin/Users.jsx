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
} from "react-icons/fi";
import {
  getVendors,
  createVendor,
  deleteVendor,
  toggleVendorStatus,
} from "../../lib/api.js";

import "./Users.css";

export default function Users() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
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
      [v.name, v.email, v.mobile, v.city, v.state, v.address, v.status]
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
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredVendors.map((vendor) => (
                <tr key={vendor._id}>
                  <td>
                    <strong>{vendor.name}</strong>
                    <br />
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
                        maxWidth: 220,
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
    </section>
  );
}