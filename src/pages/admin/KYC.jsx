import React, { useEffect, useMemo, useState } from "react";
import {
  FiShield,
  FiSearch,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiFileText,
  FiEye,
  FiDownload,
  FiRefreshCw,
  FiTrash2,
  FiCheck,
  FiX,
  FiAlertCircle,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiExternalLink,
} from "react-icons/fi";
import {
  getAllKYCSubmissions,
  updateKYCStatus,
  deleteKYC,
  formatImageUrl,
} from "../../lib/api.js";
import "./KYC.css";

export default function AdminKYC() {
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    verified: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Selected Submission Modal
  const [selectedKyc, setSelectedKyc] = useState(null);
  const [remarksInput, setRemarksInput] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Reject Modal
  const [rejectingKyc, setRejectingKyc] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  // Notification message
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  // Fetch all submissions from backend
  const fetchKYCList = async () => {
    try {
      setLoading(true);
      const res = await getAllKYCSubmissions();
      if (res.success && Array.isArray(res.submissions)) {
        setSubmissions(res.submissions);
        if (res.stats) {
          setStats(res.stats);
        }
      } else {
        setSubmissions([]);
      }
    } catch (err) {
      console.error("Error fetching KYC list:", err);
      setMessage(err.message || "Failed to load KYC applications.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKYCList();
  }, []);

  // Filtered submissions
  const filteredSubmissions = useMemo(() => {
    const q = search.toLowerCase().trim();
    return submissions.filter((sub) => {
      const matchesSearch =
        !q ||
        (sub.fullName && sub.fullName.toLowerCase().includes(q)) ||
        (sub.email && sub.email.toLowerCase().includes(q)) ||
        (sub.mobile && sub.mobile.toLowerCase().includes(q)) ||
        (sub.documentNumber && sub.documentNumber.toLowerCase().includes(q)) ||
        (sub.businessName && sub.businessName.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === "All" || sub.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [submissions, search, statusFilter]);

  // Handle Verify / Approve
  const handleVerify = async (kyc, remarks = "") => {
    try {
      setActionLoading(true);
      const res = await updateKYCStatus(kyc._id, {
        status: "Verified",
        remarks: remarks || "Documents verified and approved by Admin.",
      });

      if (res.success) {
        setMessage(`KYC application for "${kyc.fullName}" has been verified!`);
        setMessageType("success");
        if (selectedKyc && selectedKyc._id === kyc._id) {
          setSelectedKyc(res.kyc);
        }
        await fetchKYCList();
      }
    } catch (err) {
      console.error("Verification error:", err);
      setMessage(err.message || "Failed to update KYC status.");
      setMessageType("error");
    } finally {
      setActionLoading(false);
    }
  };

  // Open Reject Dialog
  const handleOpenReject = (kyc) => {
    setRejectingKyc(kyc);
    setRejectReason(
      kyc.remarks || "Uploaded document photo is blurry or document number does not match name."
    );
  };

  // Confirm Reject
  const handleConfirmReject = async () => {
    if (!rejectingKyc) return;

    try {
      setActionLoading(true);
      const res = await updateKYCStatus(rejectingKyc._id, {
        status: "Rejected",
        remarks: rejectReason.trim() || "Documents rejected by Admin.",
      });

      if (res.success) {
        setMessage(`KYC application for "${rejectingKyc.fullName}" was marked as Rejected.`);
        setMessageType("success");
        if (selectedKyc && selectedKyc._id === rejectingKyc._id) {
          setSelectedKyc(res.kyc);
        }
        setRejectingKyc(null);
        await fetchKYCList();
      }
    } catch (err) {
      console.error("Rejection error:", err);
      setMessage(err.message || "Failed to reject KYC application.");
      setMessageType("error");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete KYC record
  const handleDelete = async (kyc) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the KYC record for "${kyc.fullName}"? Uploaded documents will be permanently removed.`
      )
    ) {
      return;
    }

    try {
      await deleteKYC(kyc._id);
      setMessage(`KYC record for "${kyc.fullName}" was deleted successfully.`);
      setMessageType("success");
      if (selectedKyc && selectedKyc._id === kyc._id) {
        setSelectedKyc(null);
      }
      await fetchKYCList();
    } catch (err) {
      console.error("Delete error:", err);
      setMessage(err.message || "Failed to delete KYC record.");
      setMessageType("error");
    }
  };

  // Check if file is image
  const isImageFile = (filePath = "") => {
    const ext = filePath.split(".").pop().toLowerCase();
    return ["jpg", "jpeg", "png", "webp", "gif"].includes(ext);
  };

  return (
    <section className="admin-kyc-page">
      {/* Top Header */}
      <div className="admin-page-heading">
        <div>
          <h2>KYC Verification Management</h2>
          <p>Review submitted vendor & user identity proofs, inspect credentials, and manage account approvals.</p>
        </div>

        <button
          type="button"
          className="admin-secondary-button"
          onClick={fetchKYCList}
          disabled={loading}
          title="Refresh applications"
        >
          <FiRefreshCw className={loading ? "spin-icon" : ""} /> Refresh
        </button>
      </div>

      {/* Global Alert Notification */}
      {message && (
        <div className={`admin-kyc-alert ${messageType}`}>
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

      {/* KPI Stats Grid */}
      <div className="admin-kyc-stats-grid">
        <div className="admin-kyc-stat-card">
          <div className="stat-icon-wrap total">
            <FiShield />
          </div>
          <div>
            <span className="stat-label">Total Applications</span>
            <strong className="stat-value">{stats.total || submissions.length}</strong>
          </div>
        </div>

        <div className="admin-kyc-stat-card">
          <div className="stat-icon-wrap pending">
            <FiClock />
          </div>
          <div>
            <span className="stat-label">Pending Verification</span>
            <strong className="stat-value text-amber">
              {stats.pending || submissions.filter((s) => s.status === "Pending").length}
            </strong>
          </div>
        </div>

        <div className="admin-kyc-stat-card">
          <div className="stat-icon-wrap verified">
            <FiCheckCircle />
          </div>
          <div>
            <span className="stat-label">Verified Accounts</span>
            <strong className="stat-value text-green">
              {stats.verified || submissions.filter((s) => s.status === "Verified").length}
            </strong>
          </div>
        </div>

        <div className="admin-kyc-stat-card">
          <div className="stat-icon-wrap rejected">
            <FiXCircle />
          </div>
          <div>
            <span className="stat-label">Rejected Submissions</span>
            <strong className="stat-value text-red">
              {stats.rejected || submissions.filter((s) => s.status === "Rejected").length}
            </strong>
          </div>
        </div>
      </div>

      {/* Applications Table Panel */}
      <div className="admin-panel admin-kyc-table-panel">
        <div className="admin-toolbar">
          <div>
            <strong>{filteredSubmissions.length} Verification Records</strong>
            <p className="admin-kyc-helper">
              Live identity proofs uploaded directly from vendor dashboard
            </p>
          </div>

          <div className="admin-kyc-toolbar-actions">
            <div className="status-select-wrap">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="admin-kyc-status-select"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending Review</option>
                <option value="Verified">Verified Only</option>
                <option value="Rejected">Rejected Only</option>
              </select>
            </div>

            <label className="admin-kyc-search">
              <FiSearch />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, document #..."
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

        {loading ? (
          <div className="admin-loading-box">
            <div className="spinner"></div>
            <p>Loading KYC submissions from database...</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Applicant / User</th>
                  <th>Contact Info</th>
                  <th>Document Type & #</th>
                  <th>Proof File</th>
                  <th>Submitted On</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredSubmissions.map((sub) => {
                  const dateStr = sub.createdAt
                    ? new Date(sub.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "—";

                  const fileUrl = formatImageUrl(sub.documentFile);
                  const isImg = isImageFile(sub.documentFile);

                  return (
                    <tr key={sub._id}>
                      <td>
                        <div className="kyc-applicant-cell">
                          <div className="kyc-user-avatar">
                            {(sub.fullName || "U").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <strong>{sub.fullName}</strong>
                            {sub.businessName && (
                              <span className="kyc-business-tag">
                                {sub.businessName}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="kyc-contact-col">
                          <span>
                            <FiMail /> {sub.email}
                          </span>
                          <span>
                            <FiPhone /> {sub.mobile}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="kyc-doc-meta">
                          <span className="kyc-doc-type-badge">
                            {sub.documentType}
                          </span>
                          <span className="kyc-doc-num">
                            {sub.documentNumber}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="kyc-file-cell">
                          {isImg ? (
                            <img
                              src={fileUrl}
                              alt="ID Proof"
                              className="kyc-table-file-thumb"
                              onClick={() => setSelectedKyc(sub)}
                              title="Click to zoom proof"
                            />
                          ) : (
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="kyc-pdf-link"
                              title="Open PDF document"
                            >
                              <FiFileText /> PDF Doc <FiExternalLink />
                            </a>
                          )}
                        </div>
                      </td>

                      <td>
                        <span className="kyc-date-text">{dateStr}</span>
                      </td>

                      <td>
                        <span
                          className={`admin-kyc-status-pill ${sub.status.toLowerCase()}`}
                        >
                          ● {sub.status}
                        </span>
                      </td>

                      <td style={{ textAlign: "right" }}>
                        <div className="admin-kyc-action-buttons">
                          <button
                            type="button"
                            className="kyc-btn view"
                            onClick={() => {
                              setSelectedKyc(sub);
                              setRemarksInput(sub.remarks || "");
                            }}
                            title="Inspect complete details & proof"
                          >
                            <FiEye /> View
                          </button>

                          {sub.status !== "Verified" && (
                            <button
                              type="button"
                              className="kyc-btn approve"
                              onClick={() => handleVerify(sub)}
                              title="Verify & Approve Account"
                            >
                              <FiCheck /> Verify
                            </button>
                          )}

                          {sub.status !== "Rejected" && (
                            <button
                              type="button"
                              className="kyc-btn reject"
                              onClick={() => handleOpenReject(sub)}
                              title="Reject Submission"
                            >
                              <FiX /> Reject
                            </button>
                          )}

                          <button
                            type="button"
                            className="kyc-btn delete"
                            onClick={() => handleDelete(sub)}
                            title="Delete Record"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredSubmissions.length === 0 && !loading && (
              <div className="admin-empty">
                <FiShield style={{ fontSize: "36px", color: "#ffd044", marginBottom: "8px" }} />
                <p>No KYC verification records found.</p>
                {search && (
                  <button
                    type="button"
                    className="admin-secondary-button"
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("All");
                    }}
                    style={{ marginTop: "10px" }}
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Inspect & Review Detail Modal */}
      {selectedKyc && (
        <div
          className="admin-kyc-modal-backdrop"
          onClick={() => setSelectedKyc(null)}
        >
          <div
            className="admin-kyc-modal-window"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-kyc-modal-header">
              <div>
                <span className="modal-eyebrow">KYC APPLICATION DETAILS</span>
                <h3>{selectedKyc.fullName}</h3>
                <p>ID: {selectedKyc._id} · Registered Email: {selectedKyc.email}</p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span
                  className={`admin-kyc-status-pill ${selectedKyc.status.toLowerCase()}`}
                  style={{ fontSize: "12px", padding: "6px 14px" }}
                >
                  ● {selectedKyc.status}
                </span>

                <button
                  type="button"
                  className="modal-close-icon"
                  onClick={() => setSelectedKyc(null)}
                >
                  <FiX />
                </button>
              </div>
            </div>

            <div className="admin-kyc-modal-body">
              {/* Left Column: Applicant & Doc Details */}
              <div className="modal-meta-col">
                <div className="modal-info-section">
                  <h4>Applicant Information</h4>
                  <div className="modal-info-row">
                    <span>Full Legal Name:</span>
                    <strong>{selectedKyc.fullName}</strong>
                  </div>
                  <div className="modal-info-row">
                    <span>Email Address:</span>
                    <strong>{selectedKyc.email}</strong>
                  </div>
                  <div className="modal-info-row">
                    <span>Mobile Phone:</span>
                    <strong>{selectedKyc.mobile}</strong>
                  </div>
                  <div className="modal-info-row">
                    <span>Date of Birth:</span>
                    <strong>{selectedKyc.dob || "—"}</strong>
                  </div>
                  {selectedKyc.businessName && (
                    <div className="modal-info-row">
                      <span>Store / Firm Name:</span>
                      <strong>{selectedKyc.businessName}</strong>
                    </div>
                  )}
                  <div className="modal-info-row full">
                    <span>Registered Address:</span>
                    <p className="modal-address-box">{selectedKyc.address}</p>
                  </div>
                </div>

                <div className="modal-info-section">
                  <h4>Document Verification Data</h4>
                  <div className="modal-info-row">
                    <span>Document Type:</span>
                    <span className="kyc-doc-type-badge">{selectedKyc.documentType}</span>
                  </div>
                  <div className="modal-info-row">
                    <span>Document Number:</span>
                    <strong className="text-gold" style={{ fontSize: "15px" }}>
                      {selectedKyc.documentNumber}
                    </strong>
                  </div>
                  <div className="modal-info-row">
                    <span>Submitted On:</span>
                    <strong>
                      {selectedKyc.createdAt
                        ? new Date(selectedKyc.createdAt).toLocaleString("en-IN")
                        : "—"}
                    </strong>
                  </div>
                  {selectedKyc.verifiedAt && (
                    <div className="modal-info-row">
                      <span>Verified On:</span>
                      <strong className="text-green">
                        {new Date(selectedKyc.verifiedAt).toLocaleString("en-IN")}
                      </strong>
                    </div>
                  )}
                </div>

                {/* Admin Remarks Input */}
                <div className="modal-info-section">
                  <h4>Admin Audit Remarks</h4>
                  <textarea
                    rows="3"
                    className="modal-remarks-input"
                    placeholder="Enter approval note or rejection reasons visible to applicant..."
                    value={remarksInput}
                    onChange={(e) => setRemarksInput(e.target.value)}
                  />
                </div>
              </div>

              {/* Right Column: High-Res Document Preview */}
              <div className="modal-doc-col">
                <h4>Uploaded Document Proof</h4>
                <div className="modal-proof-container">
                  {isImageFile(selectedKyc.documentFile) ? (
                    <img
                      src={formatImageUrl(selectedKyc.documentFile)}
                      alt="Uploaded Document"
                      className="modal-proof-img"
                    />
                  ) : (
                    <div className="modal-pdf-box">
                      <FiFileText className="pdf-big-icon" />
                      <p>Portable Document Format (PDF)</p>
                      <span>{selectedKyc.documentOriginalName || "Document.pdf"}</span>
                      <a
                        href={formatImageUrl(selectedKyc.documentFile)}
                        target="_blank"
                        rel="noreferrer"
                        className="admin-primary-button"
                        style={{ marginTop: "14px" }}
                      >
                        <FiExternalLink /> Open in Fullscreen
                      </a>
                    </div>
                  )}
                </div>

                <div className="proof-action-strip">
                  <a
                    href={formatImageUrl(selectedKyc.documentFile)}
                    target="_blank"
                    rel="noreferrer"
                    className="proof-link-btn"
                  >
                    <FiDownload /> Download Original Proof
                  </a>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="admin-kyc-modal-footer">
              <button
                type="button"
                className="admin-secondary-button"
                onClick={() => setSelectedKyc(null)}
              >
                Close
              </button>

              <div style={{ display: "flex", gap: "10px" }}>
                {selectedKyc.status !== "Rejected" && (
                  <button
                    type="button"
                    className="kyc-action-danger-btn"
                    onClick={() => handleOpenReject(selectedKyc)}
                    disabled={actionLoading}
                  >
                    <FiX /> Reject Application
                  </button>
                )}

                {selectedKyc.status !== "Verified" && (
                  <button
                    type="button"
                    className="admin-primary-button"
                    onClick={() => handleVerify(selectedKyc, remarksInput)}
                    disabled={actionLoading}
                  >
                    <FiCheck /> Approve & Verify
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Prompt Modal */}
      {rejectingKyc && (
        <div
          className="admin-kyc-modal-backdrop"
          onClick={() => setRejectingKyc(null)}
        >
          <div
            className="admin-kyc-modal-window reject-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-kyc-modal-header">
              <div>
                <span className="modal-eyebrow text-red">ACTION REQUIRED</span>
                <h3>Reject KYC Submission</h3>
                <p>For applicant: {rejectingKyc.fullName} ({rejectingKyc.email})</p>
              </div>
              <button
                type="button"
                className="modal-close-icon"
                onClick={() => setRejectingKyc(null)}
              >
                <FiX />
              </button>
            </div>

            <div style={{ padding: "20px 24px" }}>
              <p style={{ margin: "0 0 10px", fontSize: "13.5px", color: "#b5aba0" }}>
                Please provide the reason for rejection. This will be visible on the user's KYC page so they can re-upload correct proofs.
              </p>
              <textarea
                rows="4"
                className="modal-remarks-input"
                placeholder="e.g. Document image is not readable or document number did not match PAN/Aadhaar database."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>

            <div className="admin-kyc-modal-footer">
              <button
                type="button"
                className="admin-secondary-button"
                onClick={() => setRejectingKyc(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="kyc-action-danger-btn"
                onClick={handleConfirmReject}
                disabled={actionLoading}
              >
                <FiX /> Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
