import React, { useEffect, useMemo, useState } from "react";
import {
  FiUsers,
  FiPlus,
  FiSearch,
  FiX,
  FiEdit2,
  FiTrash2,
  FiRefreshCw,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCheckCircle,
  FiAlertCircle,
  FiSave,
  FiDatabase,
  FiDownload,
  FiFilter,
} from "react-icons/fi";
import {
  getVendorDataList,
  createVendorData,
  updateVendorData,
  deleteVendorData,
} from "../../lib/api.js";
import "./VendorData.css";

export default function VendorData() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("All");
  const [selectedState, setSelectedState] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Filter options from API
  const [filterOptions, setFilterOptions] = useState({ cities: [], states: [] });

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null); // null when adding new
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  // Form Fields
  const [vendorName, setVendorName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("Active");
  const [notes, setNotes] = useState("");

  // Load vendors list from API
  const fetchVendors = async () => {
    try {
      setLoading(true);
      const res = await getVendorDataList({
        search,
        city: selectedCity,
        state: selectedState,
        status: statusFilter,
      });

      if (res.success && Array.isArray(res.vendors)) {
        setVendors(res.vendors);
        if (res.filterOptions) {
          setFilterOptions(res.filterOptions);
        }
      } else {
        setVendors([]);
      }
    } catch (err) {
      console.error("Error loading vendor data:", err);
      setMessage(err.message || "Failed to load vendor records.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [selectedCity, selectedState, statusFilter]);

  // Handle client-side instant search
  const filteredVendors = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return vendors;

    return vendors.filter((v) => {
      const matchName = v.vendorName && v.vendorName.toLowerCase().includes(q);
      const matchEmail = v.email && v.email.toLowerCase().includes(q);
      const matchMobile = v.mobile && v.mobile.toLowerCase().includes(q);
      const matchCity = v.city && v.city.toLowerCase().includes(q);
      const matchState = v.state && v.state.toLowerCase().includes(q);
      const matchAddress = v.address && v.address.toLowerCase().includes(q);
      return (
        matchName ||
        matchEmail ||
        matchMobile ||
        matchCity ||
        matchState ||
        matchAddress
      );
    });
  }, [vendors, search]);

  // Open Modal for Create
  const handleOpenCreate = () => {
    setEditingVendor(null);
    setVendorName("");
    setEmail("");
    setMobile("");
    setCity("");
    setState("");
    setAddress("");
    setStatus("Active");
    setNotes("");
    setMessage("");
    setShowModal(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (item) => {
    setEditingVendor(item);
    setVendorName(item.vendorName || "");
    setEmail(item.email || "");
    setMobile(item.mobile || "");
    setCity(item.city || "");
    setState(item.state || "");
    setAddress(item.address || "");
    setStatus(item.status || "Active");
    setNotes(item.notes || "");
    setMessage("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingVendor(null);
    setVendorName("");
    setEmail("");
    setMobile("");
    setCity("");
    setState("");
    setAddress("");
    setStatus("Active");
    setNotes("");
  };

  // Submit Add / Edit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!vendorName.trim()) {
      setMessage("Vendor Name is required.");
      setMessageType("error");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        vendorName: vendorName.trim(),
        email: email.trim(),
        mobile: mobile.trim(),
        city: city.trim(),
        state: state.trim(),
        address: address.trim(),
        status,
        notes: notes.trim(),
      };

      const targetId = editingVendor?._id || editingVendor?.id;
      if (editingVendor && targetId) {
        await updateVendorData(targetId, payload);
        setMessage(`Vendor "${vendorName.trim()}" updated successfully!`);
      } else {
        await createVendorData(payload);
        setMessage(`Vendor "${vendorName.trim()}" saved to database successfully!`);
      }

      setMessageType("success");
      handleCloseModal();
      await fetchVendors();
    } catch (err) {
      console.error("Save error:", err);
      setMessage(err.message || "Failed to save vendor data.");
      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Vendor
  const handleDelete = async (item) => {
    if (
      !window.confirm(
        `Are you sure you want to delete vendor "${item.vendorName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await deleteVendorData(item._id);
      setVendors((prev) => prev.filter((v) => v._id !== item._id));
      setMessage(`Vendor "${item.vendorName}" deleted successfully.`);
      setMessageType("success");
    } catch (err) {
      console.error("Delete error:", err);
      setMessage(err.message || "Failed to delete vendor.");
      setMessageType("error");
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredVendors.length === 0) return;

    const headers = [
      "Vendor Name",
      "Email",
      "Mobile",
      "City",
      "State",
      "Address",
      "Status",
      "Created At",
    ];

    const rows = filteredVendors.map((v) => [
      `"${(v.vendorName || "").replace(/"/g, '""')}"`,
      `"${(v.email || "").replace(/"/g, '""')}"`,
      `"${(v.mobile || "").replace(/"/g, '""')}"`,
      `"${(v.city || "").replace(/"/g, '""')}"`,
      `"${(v.state || "").replace(/"/g, '""')}"`,
      `"${(v.address || "").replace(/"/g, '""')}"`,
      `"${v.status || "Active"}"`,
      `"${v.createdAt ? new Date(v.createdAt).toLocaleDateString("en-IN") : ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Vendor_Data_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Compute unique cities & states from current vendors
  const uniqueCities = useMemo(() => {
    const set = new Set();
    vendors.forEach((v) => {
      if (v.city && v.city.trim()) set.add(v.city.trim());
    });
    return Array.from(set).sort();
  }, [vendors]);

  const uniqueStates = useMemo(() => {
    const set = new Set();
    vendors.forEach((v) => {
      if (v.state && v.state.trim()) set.add(v.state.trim());
    });
    return Array.from(set).sort();
  }, [vendors]);

  return (
    <section className="vendor-data-page">
      {/* Top Heading */}
      <div className="admin-page-heading">
        <div>
          <h2>Vendor Data Management</h2>
          <p>
            Create, save, and manage registered vendor contact and location
            records in the database.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {filteredVendors.length > 0 && (
            <button
              type="button"
              className="admin-secondary-button"
              onClick={handleExportCSV}
              title="Download CSV report"
            >
              <FiDownload /> Export CSV
            </button>
          )}

          <button
            type="button"
            className="admin-secondary-button"
            onClick={fetchVendors}
            disabled={loading}
            title="Refresh vendor data"
          >
            <FiRefreshCw className={loading ? "spin-icon" : ""} /> Refresh
          </button>

          <button
            type="button"
            className="admin-primary-button"
            onClick={handleOpenCreate}
          >
            <FiPlus /> Add Vendor Data
          </button>
        </div>
      </div>

      {/* Global Alert Notification */}
      {message && (
        <div className={`vendor-data-alert ${messageType}`}>
          {messageType === "success" ? <FiCheckCircle /> : <FiAlertCircle />}
          <span>{message}</span>
          <button
            type="button"
            className="alert-close-btn"
            onClick={() => setMessage("")}
          >
            <FiX />
          </button>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="vendor-data-stats-row">
        <div className="vd-stat-card">
          <div className="vd-stat-icon">
            <FiUsers />
          </div>
          <div>
            <span className="vd-stat-label">Total Saved Vendors</span>
            <strong className="vd-stat-val">{vendors.length}</strong>
          </div>
        </div>

        <div className="vd-stat-card">
          <div className="vd-stat-icon gold">
            <FiMapPin />
          </div>
          <div>
            <span className="vd-stat-label">Cities Represented</span>
            <strong className="vd-stat-val">{uniqueCities.length}</strong>
          </div>
        </div>

        <div className="vd-stat-card">
          <div className="vd-stat-icon green">
            <FiDatabase />
          </div>
          <div>
            <span className="vd-stat-label">States Covered</span>
            <strong className="vd-stat-val">{uniqueStates.length}</strong>
          </div>
        </div>
      </div>

      {/* Main Vendor Data Panel */}
      <div className="admin-panel vendor-data-panel">
        {/* Toolbar & Filters */}
        <div className="admin-toolbar">
          <div>
            <strong>{filteredVendors.length} Vendors Listed</strong>
            <p className="vendor-data-helper">
              Direct database records with full contact details
            </p>
          </div>

          <div className="vendor-data-toolbar-actions">
            {/* Filter by City */}
            {uniqueCities.length > 0 && (
              <div className="vd-filter-wrap">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="vd-filter-select"
                >
                  <option value="All">All Cities ({uniqueCities.length})</option>
                  {uniqueCities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Filter by State */}
            {uniqueStates.length > 0 && (
              <div className="vd-filter-wrap">
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="vd-filter-select"
                >
                  <option value="All">All States ({uniqueStates.length})</option>
                  {uniqueStates.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Search Input */}
            <label className="vendor-data-search">
              <FiSearch />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search vendor, email, mobile, city, state..."
              />
              {search && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={() => setSearch("")}
                >
                  <FiX />
                </button>
              )}
            </label>
          </div>
        </div>

        {/* Vendors Table */}
        {loading ? (
          <div className="admin-loading-box">
            <FiRefreshCw className="spin-icon" style={{ fontSize: "28px", color: "#e5aa0a" }} />
            <p>Loading vendor database records...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table vendor-data-table">
              <thead>
                <tr>
                  <th style={{ width: "6%" }}>#</th>
                  <th style={{ width: "22%" }}>Vendor Name</th>
                  <th style={{ width: "22%" }}>Contact Info</th>
                  <th style={{ width: "18%" }}>City &amp; State</th>
                  <th style={{ width: "20%" }}>Address</th>
                  <th style={{ width: "12%", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVendors.map((item, index) => (
                  <tr key={item._id || index}>
                    <td>
                      <span className="vd-index-badge">{index + 1}</span>
                    </td>

                    <td>
                      <div className="vd-name-cell">
                        <div className="vd-avatar-circle">
                          {(item.vendorName || "V").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <strong>{item.vendorName}</strong>
                          {item.status && (
                            <span
                              className={`vd-status-dot ${
                                item.status === "Active" ? "active" : "inactive"
                              }`}
                            >
                              {item.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="vd-contact-cell">
                        {item.email ? (
                          <div className="vd-contact-line">
                            <FiMail className="vd-icon-subtle" />
                            <a href={`mailto:${item.email}`}>{item.email}</a>
                          </div>
                        ) : (
                          <span className="vd-empty-subtle">No email</span>
                        )}

                        {item.mobile ? (
                          <div className="vd-contact-line">
                            <FiPhone className="vd-icon-subtle" />
                            <a href={`tel:${item.mobile}`}>{item.mobile}</a>
                          </div>
                        ) : (
                          <span className="vd-empty-subtle">No phone</span>
                        )}
                      </div>
                    </td>

                    <td>
                      <div className="vd-location-cell">
                        <span className="vd-city-badge">
                          <FiMapPin /> {item.city || "—"}
                        </span>
                        {item.state && (
                          <span className="vd-state-text">, {item.state}</span>
                        )}
                      </div>
                    </td>

                    <td>
                      <div className="vd-address-cell" title={item.address}>
                        {item.address || "—"}
                      </div>
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <div className="vd-actions-row">
                        <button
                          type="button"
                          className="vd-action-btn edit"
                          onClick={() => handleOpenEdit(item)}
                          title="Edit Vendor Data"
                        >
                          <FiEdit2 /> Edit
                        </button>

                        <button
                          type="button"
                          className="vd-action-btn delete"
                          onClick={() => handleDelete(item)}
                          title="Delete Vendor Record"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredVendors.length === 0 && !loading && (
              <div className="admin-empty">
                <FiUsers style={{ fontSize: "36px", color: "#e5aa0a", marginBottom: "8px" }} />
                <h3>No vendor data found</h3>
                <p>
                  {search || selectedCity !== "All" || selectedState !== "All"
                    ? "No vendor records matched your search or filters."
                    : "No vendor records saved in database yet. Click '+ Add Vendor Data' to save your first vendor."}
                </p>
                {(search || selectedCity !== "All" || selectedState !== "All") && (
                  <button
                    type="button"
                    className="admin-secondary-button"
                    onClick={() => {
                      setSearch("");
                      setSelectedCity("All");
                      setSelectedState("All");
                    }}
                    style={{ marginTop: "12px" }}
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add / Edit Vendor Modal */}
      {showModal && (
        <div className="vd-modal-backdrop" onClick={handleCloseModal}>
          <div className="vd-modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="vd-modal-header">
              <div>
                <h3>
                  {editingVendor ? "Edit Vendor Data" : "Add New Vendor Data"}
                </h3>
                <p>
                  {editingVendor
                    ? `Update record details for "${editingVendor.vendorName}"`
                    : "Enter vendor information to save directly into the database."}
                </p>
              </div>
              <button
                type="button"
                className="vd-modal-close"
                onClick={handleCloseModal}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="vd-modal-form">
              <div className="vd-form-grid">
                {/* Vendor Name */}
                <div className="vd-form-group full-width">
                  <label htmlFor="vd-name">
                    Vendor Name <span className="req-star">*</span>
                  </label>
                  <input
                    id="vd-name"
                    type="text"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    placeholder="e.g. Rameshwar Furniture &amp; Solar Traders"
                    required
                  />
                </div>

                {/* Email */}
                <div className="vd-form-group">
                  <label htmlFor="vd-email">Email Address</label>
                  <input
                    id="vd-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vendor@example.com"
                  />
                </div>

                {/* Mobile */}
                <div className="vd-form-group">
                  <label htmlFor="vd-mobile">Mobile / Phone Number</label>
                  <input
                    id="vd-mobile"
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="e.g. +91 9876543210"
                  />
                </div>

                {/* City */}
                <div className="vd-form-group">
                  <label htmlFor="vd-city">City</label>
                  <input
                    id="vd-city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Jaipur, Delhi, Mumbai"
                  />
                </div>

                {/* State */}
                <div className="vd-form-group">
                  <label htmlFor="vd-state">State</label>
                  <input
                    id="vd-state"
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Rajasthan, Haryana, UP"
                  />
                </div>

                {/* Full Address */}
                <div className="vd-form-group full-width">
                  <label htmlFor="vd-address">Full Address</label>
                  <textarea
                    id="vd-address"
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter shop, street, area, landmark, and pin code..."
                  />
                </div>

                {/* Status */}
                <div className="vd-form-group">
                  <label htmlFor="vd-status">Status</label>
                  <select
                    id="vd-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                {/* Notes (Optional) */}
                <div className="vd-form-group">
                  <label htmlFor="vd-notes">Notes / Remarks</label>
                  <input
                    id="vd-notes"
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Optional business notes..."
                  />
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="vd-modal-actions">
                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={handleCloseModal}
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-primary-button"
                  disabled={submitting}
                >
                  <FiSave />
                  {submitting
                    ? "Saving to Database..."
                    : editingVendor
                    ? "Update Vendor Data"
                    : "Save Vendor Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

