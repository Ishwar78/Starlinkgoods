import React, { useEffect, useState, useMemo } from "react";
import {
  FiCreditCard,
  FiSearch,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiDollarSign,
  FiRefreshCw,
  FiEye,
  FiCheck,
  FiX,
  FiTrash2,
  FiAlertCircle,
  FiArrowUpRight,
  FiSmartphone,
  FiBriefcase,
} from "react-icons/fi";
import {
  getAllWalletRequests,
  updateWalletRequestStatus,
  deleteWalletRequest,
} from "../../lib/api";
import "./WalletRequests.css";

export default function AdminWalletRequests() {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalAmount: 0,
    approvedAmount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");

  // Notifications
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  // Modals state
  const [approveModalReq, setApproveModalReq] = useState(null);
  const [approveUtr, setApproveUtr] = useState("");
  const [approveRemarks, setApproveRemarks] = useState("");

  const [rejectModalReq, setRejectModalReq] = useState(null);
  const [rejectRemarks, setRejectRemarks] = useState("");

  const [viewDetailsReq, setViewDetailsReq] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await getAllWalletRequests();
      if (res && res.success) {
        setRequests(Array.isArray(res.requests) ? res.requests : []);
        if (res.stats) {
          setStats(res.stats);
        }
      } else {
        setRequests([]);
      }
    } catch (err) {
      console.error("Error loading wallet requests:", err);
      setMessage(err.message || "Failed to load wallet requests.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const showNotification = (msg, type = "success") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 5000);
  };

  // Filter requests
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchesStatus =
        statusFilter === "All" ? true : r.status === statusFilter;

      if (!matchesStatus) return false;

      if (!search.trim()) return true;

      const q = search.toLowerCase().trim();
      const name = (r.userName || "").toLowerCase();
      const email = (r.userEmail || "").toLowerCase();
      const mobile = (r.userMobile || "").toLowerCase();
      const upi = (r.upiDetails?.upiId || "").toLowerCase();
      const upiName = (r.upiDetails?.accountHolderName || "").toLowerCase();
      const acc = (r.bankDetails?.accountNumber || "").toLowerCase();
      const holder = (r.bankDetails?.accountHolderName || "").toLowerCase();
      const ifsc = (r.bankDetails?.ifscCode || "").toLowerCase();
      const bank = (r.bankDetails?.bankName || "").toLowerCase();
      const utr = (r.adminTransactionId || "").toLowerCase();

      return (
        name.includes(q) ||
        email.includes(q) ||
        mobile.includes(q) ||
        upi.includes(q) ||
        upiName.includes(q) ||
        acc.includes(q) ||
        holder.includes(q) ||
        ifsc.includes(q) ||
        bank.includes(q) ||
        utr.includes(q)
      );
    });
  }, [requests, statusFilter, search]);

  // Handle Approve Request
  const handleApprove = async () => {
    if (!approveModalReq) return;
    try {
      setActionLoading(true);
      const res = await updateWalletRequestStatus(approveModalReq._id, {
        status: "Approved",
        adminTransactionId: approveUtr.trim(),
        adminRemarks: approveRemarks.trim(),
      });

      if (res && res.success) {
        showNotification(
          `Withdrawal request of ₹${approveModalReq.amount.toLocaleString(
            "en-IN"
          )} marked as Approved!`,
          "success"
        );
        setApproveModalReq(null);
        setApproveUtr("");
        setApproveRemarks("");
        fetchRequests();
      } else {
        showNotification(res?.message || "Failed to approve request", "error");
      }
    } catch (err) {
      showNotification(err.message || "Failed to approve request", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Reject Request
  const handleReject = async () => {
    if (!rejectModalReq) return;
    if (!rejectRemarks.trim()) {
      showNotification("Please provide a reason for rejection.", "error");
      return;
    }

    try {
      setActionLoading(true);
      const res = await updateWalletRequestStatus(rejectModalReq._id, {
        status: "Rejected",
        adminRemarks: rejectRemarks.trim(),
      });

      if (res && res.success) {
        showNotification(
          `Withdrawal request rejected. ₹${rejectModalReq.amount.toLocaleString(
            "en-IN"
          )} has been refunded back to user's wallet!`,
          "success"
        );
        setRejectModalReq(null);
        setRejectRemarks("");
        fetchRequests();
      } else {
        showNotification(res?.message || "Failed to reject request", "error");
      }
    } catch (err) {
      showNotification(err.message || "Failed to reject request", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete Request
  const handleDelete = async (reqItem) => {
    if (
      !window.confirm(
        `Are you sure you want to delete payout request of ₹${reqItem.amount} for ${reqItem.userName}?`
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);
      const res = await deleteWalletRequest(reqItem._id);
      if (res && res.success) {
        showNotification("Payout request record deleted successfully.", "success");
        fetchRequests();
      } else {
        showNotification(res?.message || "Failed to delete request.", "error");
      }
    } catch (err) {
      showNotification(err.message || "Failed to delete request.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="admin-wallet-page">
      {/* Page Heading */}
      <div className="admin-wallet-page-heading">
        <div>
          <span className="user-eyebrow">SLG / FINANCE &amp; PAYOUTS</span>
          <h1>Wallet &amp; Payout Requests</h1>
          <p>
            Review and process user withdrawal requests via UPI or Direct Bank Transfer.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            type="button"
            className="user-outline-button"
            onClick={fetchRequests}
            disabled={loading}
          >
            <FiRefreshCw className={loading ? "spin-icon" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* Global Notification Banner */}
      {message && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "20px",
            fontSize: "13.5px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background:
              messageType === "error"
                ? "rgba(239, 68, 68, 0.15)"
                : "rgba(16, 185, 129, 0.15)",
            color: messageType === "error" ? "#f87171" : "#34d399",
            border: `1px solid ${
              messageType === "error"
                ? "rgba(239, 68, 68, 0.3)"
                : "rgba(16, 185, 129, 0.3)"
            }`,
          }}
        >
          {messageType === "error" ? <FiAlertCircle /> : <FiCheckCircle />}
          <span>{message}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="admin-wallet-stats-grid">
        <div className="admin-wallet-stat-card">
          <div className="admin-wallet-stat-icon total">
            <FiCreditCard />
          </div>
          <div className="admin-wallet-stat-info">
            <span>Total Requests</span>
            <h3>{stats.total}</h3>
          </div>
        </div>

        <div className="admin-wallet-stat-card">
          <div className="admin-wallet-stat-icon pending">
            <FiClock />
          </div>
          <div className="admin-wallet-stat-info">
            <span>Pending Review</span>
            <h3 style={{ color: "#f59e0b" }}>{stats.pending}</h3>
          </div>
        </div>

        <div className="admin-wallet-stat-card">
          <div className="admin-wallet-stat-icon approved">
            <FiCheckCircle />
          </div>
          <div className="admin-wallet-stat-info">
            <span>Approved Payouts</span>
            <h3 style={{ color: "#10b981" }}>{stats.approved}</h3>
          </div>
        </div>

        <div className="admin-wallet-stat-card">
          <div className="admin-wallet-stat-icon rejected">
            <FiXCircle />
          </div>
          <div className="admin-wallet-stat-info">
            <span>Rejected</span>
            <h3 style={{ color: "#ef4444" }}>{stats.rejected}</h3>
          </div>
        </div>

        <div className="admin-wallet-stat-card">
          <div className="admin-wallet-stat-icon amount">
            <FiArrowUpRight />
          </div>
          <div className="admin-wallet-stat-info">
            <span>Total Disbursed</span>
            <h3 style={{ color: "#ffd044" }}>
              ₹
              {stats.approvedAmount.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h3>
          </div>
        </div>
      </div>

      {/* Panel with Filter Tabs & Search */}
      <div className="admin-wallet-panel">
        <div className="admin-wallet-controls">
          <div className="admin-wallet-tabs">
            {["All", "Pending", "Approved", "Rejected"].map((tab) => (
              <button
                key={tab}
                type="button"
                className={`admin-wallet-tab ${statusFilter === tab ? "active" : ""}`}
                onClick={() => setStatusFilter(tab)}
              >
                {tab}{" "}
                {tab === "All"
                  ? `(${stats.total})`
                  : tab === "Pending"
                  ? `(${stats.pending})`
                  : tab === "Approved"
                  ? `(${stats.approved})`
                  : `(${stats.rejected})`}
              </button>
            ))}
          </div>

          <div className="admin-wallet-search-box">
            <FiSearch style={{ color: "#ffd044", fontSize: "16px" }} />
            <input
              type="text"
              placeholder="Search by user, email, UPI, bank acc..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Requests Table */}
        <div className="admin-wallet-table-wrap">
          <table className="admin-wallet-table">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Requested Amount</th>
                <th>Payment Mode</th>
                <th>Account / Payout Details</th>
                <th>Date &amp; Time</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((r) => {
                const isUPI = r.paymentMode === "UPI";
                const isBank = r.paymentMode === "Bank Account";
                const formattedDate = r.createdAt
                  ? new Date(r.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "N/A";

                return (
                  <tr key={r._id}>
                    <td>
                      <div className="admin-req-user-cell">
                        <span className="admin-req-user-name">{r.userName}</span>
                        <span className="admin-req-user-meta">{r.userEmail}</span>
                        <span className="admin-req-user-meta">{r.userMobile}</span>
                      </div>
                    </td>

                    <td>
                      <span className="admin-req-amount">
                        ₹
                        {Number(r.amount).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </td>

                    <td>
                      <span className={`admin-mode-pill ${isUPI ? "upi" : "bank"}`}>
                        {isUPI ? <FiSmartphone /> : <FiBriefcase />}
                        {r.paymentMode}
                      </span>
                    </td>

                    <td>
                      {isUPI ? (
                        <div className="admin-req-details-box">
                          <div>
                            <strong>UPI ID: </strong>
                            <span>{r.upiDetails?.upiId || "N/A"}</span>
                          </div>
                          <div>
                            <strong>Name: </strong>
                            {r.upiDetails?.accountHolderName || r.userName}
                          </div>
                        </div>
                      ) : isBank ? (
                        <div className="admin-req-details-box">
                          <div>
                            <strong>Acc Holder: </strong>
                            {r.bankDetails?.accountHolderName || r.userName}
                          </div>
                          <div>
                            <strong>Acc No: </strong>
                            <span>{r.bankDetails?.accountNumber || "N/A"}</span>
                          </div>
                          <div>
                            <strong>IFSC: </strong>
                            <span>{r.bankDetails?.ifscCode || "N/A"}</span>
                          </div>
                          {r.bankDetails?.bankName && (
                            <div>
                              <strong>Bank: </strong>
                              {r.bankDetails.bankName}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span>N/A</span>
                      )}
                    </td>

                    <td style={{ fontSize: "12.5px", color: "#a89d8d" }}>
                      {formattedDate}
                    </td>

                    <td>
                      <span
                        className={`admin-req-status ${r.status.toLowerCase()}`}
                      >
                        {r.status === "Pending" && <FiClock />}
                        {r.status === "Approved" && <FiCheckCircle />}
                        {r.status === "Rejected" && <FiXCircle />}
                        {r.status}
                      </span>
                      {r.adminTransactionId && (
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#ffd044",
                            marginTop: "3px",
                            fontFamily: "monospace",
                          }}
                        >
                          Ref: {r.adminTransactionId}
                        </div>
                      )}
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <div
                        className="admin-req-actions"
                        style={{ justifyContent: "flex-end" }}
                      >
                        {r.status === "Pending" ? (
                          <>
                            <button
                              type="button"
                              className="admin-action-btn approve"
                              title="Approve and mark as paid"
                              onClick={() => {
                                setApproveModalReq(r);
                                setApproveUtr("");
                                setApproveRemarks("");
                              }}
                            >
                              <FiCheck /> Approve
                            </button>
                            <button
                              type="button"
                              className="admin-action-btn reject"
                              title="Reject request and refund balance"
                              onClick={() => {
                                setRejectModalReq(r);
                                setRejectRemarks("");
                              }}
                            >
                              <FiX /> Reject
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            className="admin-action-btn view"
                            title="View complete payout details"
                            onClick={() => setViewDetailsReq(r)}
                          >
                            <FiEye /> View
                          </button>
                        )}

                        <button
                          type="button"
                          className="admin-action-btn delete"
                          title="Delete request"
                          onClick={() => handleDelete(r)}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan="7" className="admin-wallet-empty">
                    {loading
                      ? "Loading payout requests..."
                      : "No wallet withdrawal requests found matching your filter."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* APPROVE MODAL */}
      {approveModalReq && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h3>
                <FiCheckCircle style={{ color: "#10b981" }} /> Approve Withdrawal Request
              </h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setApproveModalReq(null)}
              >
                <FiX />
              </button>
            </div>

            <div className="admin-modal-body">
              <div className="admin-modal-summary-box">
                <div className="admin-modal-summary-row">
                  <span>User</span>
                  <span>{approveModalReq.userName} ({approveModalReq.userEmail})</span>
                </div>
                <div className="admin-modal-summary-row">
                  <span>Amount to Disburse</span>
                  <span style={{ color: "#ffd044", fontSize: "16px", fontWeight: "800" }}>
                    ₹{approveModalReq.amount.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="admin-modal-summary-row">
                  <span>Payment Mode</span>
                  <span>{approveModalReq.paymentMode}</span>
                </div>
                {approveModalReq.paymentMode === "UPI" ? (
                  <div className="admin-modal-summary-row">
                    <span>UPI ID</span>
                    <span style={{ color: "#c084fc", fontFamily: "monospace" }}>
                      {approveModalReq.upiDetails?.upiId}
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="admin-modal-summary-row">
                      <span>Bank Account No</span>
                      <span style={{ color: "#60a5fa", fontFamily: "monospace" }}>
                        {approveModalReq.bankDetails?.accountNumber}
                      </span>
                    </div>
                    <div className="admin-modal-summary-row">
                      <span>IFSC Code</span>
                      <span style={{ color: "#60a5fa", fontFamily: "monospace" }}>
                        {approveModalReq.bankDetails?.ifscCode}
                      </span>
                    </div>
                    <div className="admin-modal-summary-row">
                      <span>Holder Name</span>
                      <span>{approveModalReq.bankDetails?.accountHolderName}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="admin-modal-field">
                <label>UTR Number / Transaction Reference ID</label>
                <input
                  type="text"
                  placeholder="e.g. UPI Ref / Bank UTR: 429381029384"
                  value={approveUtr}
                  onChange={(e) => setApproveUtr(e.target.value)}
                />
                <small>Optional reference number visible to the user.</small>
              </div>

              <div className="admin-modal-field">
                <label>Admin Remarks / Note</label>
                <input
                  type="text"
                  placeholder="e.g. Paid successfully via HDFC Netbanking"
                  value={approveRemarks}
                  onChange={(e) => setApproveRemarks(e.target.value)}
                />
              </div>
            </div>

            <div className="admin-modal-actions">
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => setApproveModalReq(null)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn-primary"
                onClick={handleApprove}
                disabled={actionLoading}
              >
                {actionLoading ? "Processing..." : "Confirm & Mark Paid"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectModalReq && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h3>
                <FiXCircle style={{ color: "#ef4444" }} /> Reject Withdrawal Request
              </h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setRejectModalReq(null)}
              >
                <FiX />
              </button>
            </div>

            <div className="admin-modal-body">
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.12)",
                  border: "1px solid rgba(239, 68, 68, 0.28)",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  color: "#fca5a5",
                  fontSize: "13px",
                  marginBottom: "16px",
                  lineHeight: "1.5",
                }}
              >
                <strong>Automatic Wallet Refund:</strong> Rejecting this request will immediately refund{" "}
                <strong>₹{rejectModalReq.amount.toLocaleString("en-IN")}</strong> back into{" "}
                <strong>{rejectModalReq.userName}'s</strong> wallet balance.
              </div>

              <div className="admin-modal-field">
                <label>Reason for Rejection *</label>
                <textarea
                  rows="3"
                  placeholder="e.g. Invalid bank account details / IFSC code does not match account name."
                  value={rejectRemarks}
                  onChange={(e) => setRejectRemarks(e.target.value)}
                  required
                />
                <small>This reason will be visible to the user on their wallet dashboard.</small>
              </div>
            </div>

            <div className="admin-modal-actions">
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => setRejectModalReq(null)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn-danger"
                onClick={handleReject}
                disabled={actionLoading}
              >
                {actionLoading ? "Processing..." : "Reject & Refund Funds"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {viewDetailsReq && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h3>
                <FiEye style={{ color: "#ffd044" }} /> Withdrawal Request Details
              </h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setViewDetailsReq(null)}
              >
                <FiX />
              </button>
            </div>

            <div className="admin-modal-body">
              <div className="admin-modal-summary-box">
                <div className="admin-modal-summary-row">
                  <span>User Name</span>
                  <span>{viewDetailsReq.userName}</span>
                </div>
                <div className="admin-modal-summary-row">
                  <span>Email &amp; Mobile</span>
                  <span>{viewDetailsReq.userEmail} | {viewDetailsReq.userMobile}</span>
                </div>
                <div className="admin-modal-summary-row">
                  <span>Requested Amount</span>
                  <span style={{ color: "#ffd044", fontSize: "16px", fontWeight: "800" }}>
                    ₹{viewDetailsReq.amount.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="admin-modal-summary-row">
                  <span>Payment Mode</span>
                  <span>{viewDetailsReq.paymentMode}</span>
                </div>
                {viewDetailsReq.paymentMode === "UPI" ? (
                  <>
                    <div className="admin-modal-summary-row">
                      <span>UPI ID</span>
                      <span style={{ color: "#c084fc", fontFamily: "monospace" }}>
                        {viewDetailsReq.upiDetails?.upiId || "N/A"}
                      </span>
                    </div>
                    <div className="admin-modal-summary-row">
                      <span>Account Holder Name</span>
                      <span>{viewDetailsReq.upiDetails?.accountHolderName || "N/A"}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="admin-modal-summary-row">
                      <span>Account Holder</span>
                      <span>{viewDetailsReq.bankDetails?.accountHolderName || "N/A"}</span>
                    </div>
                    <div className="admin-modal-summary-row">
                      <span>Account Number</span>
                      <span style={{ color: "#60a5fa", fontFamily: "monospace" }}>
                        {viewDetailsReq.bankDetails?.accountNumber || "N/A"}
                      </span>
                    </div>
                    <div className="admin-modal-summary-row">
                      <span>IFSC Code</span>
                      <span style={{ color: "#60a5fa", fontFamily: "monospace" }}>
                        {viewDetailsReq.bankDetails?.ifscCode || "N/A"}
                      </span>
                    </div>
                    {viewDetailsReq.bankDetails?.bankName && (
                      <div className="admin-modal-summary-row">
                        <span>Bank Name</span>
                        <span>{viewDetailsReq.bankDetails.bankName}</span>
                      </div>
                    )}
                  </>
                )}

                <div className="admin-modal-summary-row">
                  <span>Status</span>
                  <span
                    className={`admin-req-status ${viewDetailsReq.status.toLowerCase()}`}
                    style={{ padding: "2px 10px", fontSize: "11.5px" }}
                  >
                    ● {viewDetailsReq.status}
                  </span>
                </div>

                {viewDetailsReq.adminTransactionId && (
                  <div className="admin-modal-summary-row">
                    <span>UTR / Ref No</span>
                    <span style={{ color: "#ffd044", fontFamily: "monospace" }}>
                      {viewDetailsReq.adminTransactionId}
                    </span>
                  </div>
                )}

                {viewDetailsReq.adminRemarks && (
                  <div className="admin-modal-summary-row">
                    <span>Admin Remarks</span>
                    <span>{viewDetailsReq.adminRemarks}</span>
                  </div>
                )}

                {viewDetailsReq.userRemarks && (
                  <div className="admin-modal-summary-row">
                    <span>User Remarks</span>
                    <span>{viewDetailsReq.userRemarks}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="admin-modal-actions">
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => setViewDetailsReq(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
