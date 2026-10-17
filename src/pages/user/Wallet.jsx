import React, { useState, useEffect } from "react";
import {
  FiCreditCard,
  FiArrowDownLeft,
  FiArrowUpRight,
  FiPlus,
  FiInfo,
  FiRefreshCw,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiSmartphone,
  FiBriefcase,
  FiX,
  FiAlertCircle,
  FiList,
  FiSend,
} from "react-icons/fi";
import {
  getMyWalletBalance,
  getMyWalletRequests,
  submitWalletRequest,
} from "../../lib/api";
import "./Wallet.css";

const Wallet = () => {
  const [userData, setUserData] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("userData") || "{}");
    } catch {
      return {};
    }
  });

  const [walletBalance, setWalletBalance] = useState(() => userData?.walletBalance || 0);
  const [transactions, setTransactions] = useState([]);
  const [payoutRequests, setPayoutRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("transactions"); // 'transactions' | 'requests'

  // Notification Banner
  const [notification, setNotification] = useState("");
  const [notificationType, setNotificationType] = useState("success");

  // Modal State
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [modalError, setModalError] = useState("");

  // Form State
  const [reqAmount, setReqAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("UPI"); // 'UPI' | 'Bank Account'

  // UPI Fields
  const [upiId, setUpiId] = useState("");
  const [upiName, setUpiName] = useState(userData?.name || "");

  // Bank Fields
  const [accountHolderName, setAccountHolderName] = useState(userData?.name || "");
  const [accountNumber, setAccountNumber] = useState("");
  const [confirmAccountNumber, setConfirmAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [userRemarks, setUserRemarks] = useState("");

  const showToast = (msg, type = "success") => {
    setNotification(msg);
    setNotificationType(type);
    setTimeout(() => setNotification(""), 5000);
  };

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const res = await getMyWalletBalance({
        userId: userData._id || userData.id,
        email: userData.email,
      });

      if (res && res.success) {
        const bal = typeof res.walletBalance === "number" ? res.walletBalance : 0;
        setWalletBalance(bal);

        // Update local storage so other components (Header, Dashboard) stay in sync
        try {
          const stored = JSON.parse(localStorage.getItem("userData") || "{}");
          stored.walletBalance = bal;
          localStorage.setItem("userData", JSON.stringify(stored));
        } catch {}

        if (Array.isArray(res.transactions)) {
          const formatted = res.transactions.map((t, idx) => ({
            id: t.transactionId || `TXN${idx + 1000}`,
            title: t.title || (t.type === "Debit" ? "Wallet Debit" : "Wallet Topup"),
            description: t.description || "",
            date: t.createdAt
              ? new Date(t.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Recent",
            amount: Number(t.amount) || 0,
            type: t.type === "Debit" ? "Debit" : "Credit",
            status: t.status || "Completed",
          }));
          setTransactions(formatted);
        }
      }

      // Also fetch payout requests
      const reqRes = await getMyWalletRequests({
        userId: userData._id || userData.id,
        email: userData.email,
      });

      if (reqRes && reqRes.success && Array.isArray(reqRes.requests)) {
        setPayoutRequests(reqRes.requests);
      }
    } catch (err) {
      console.warn("Error fetching wallet details:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, [userData.email, userData._id]);

  const totalCredits = transactions
    .filter((t) => t.type === "Credit")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDebits = transactions
    .filter((t) => t.type === "Debit")
    .reduce((sum, t) => sum + t.amount, 0);

  const filteredTransactions = transactions.filter((transaction) =>
    filter === "All" ? true : transaction.type === filter
  );

  const last4 = userData?.mobile
    ? String(userData.mobile).slice(-4)
    : userData?._id
    ? String(userData._id).slice(-4)
    : "2026";

  // Handle Quick Percentage Pill Click
  const handleQuickPercent = (pct) => {
    if (walletBalance <= 0) return;
    const calc = Math.floor((walletBalance * pct) / 100);
    setReqAmount(String(calc));
    setModalError("");
  };

  // Open Withdraw Modal
  const openModal = () => {
    setReqAmount("");
    setModalError("");
    setUpiName(userData?.name || "");
    setAccountHolderName(userData?.name || "");
    setUserRemarks("");
    setShowWithdrawModal(true);
  };

  // Submit Payout Request
  const handleSubmitWithdrawal = async (e) => {
    e.preventDefault();
    setModalError("");

    const numAmount = Number(reqAmount);
    if (!reqAmount || isNaN(numAmount) || numAmount <= 0) {
      setModalError("Please enter a valid amount greater than ₹0.");
      return;
    }

    if (numAmount > walletBalance) {
      setModalError(
        `Amount cannot exceed your available balance of ₹${walletBalance.toLocaleString(
          "en-IN"
        )}.`
      );
      return;
    }

    if (paymentMode === "UPI") {
      if (!upiId.trim()) {
        setModalError("Please enter your UPI ID (e.g. mobile@upi, username@okhdfcbank).");
        return;
      }
    } else {
      // Bank Account
      if (!accountHolderName.trim()) {
        setModalError("Account holder name is required.");
        return;
      }
      if (!accountNumber.trim()) {
        setModalError("Bank account number is required.");
        return;
      }
      if (accountNumber.trim() !== confirmAccountNumber.trim()) {
        setModalError("Account numbers do not match. Please verify.");
        return;
      }
      if (!ifscCode.trim()) {
        setModalError("Bank IFSC code is required.");
        return;
      }
    }

    try {
      setSubmittingRequest(true);
      const payload = {
        userId: userData._id || userData.id,
        userEmail: userData.email,
        amount: numAmount,
        paymentMode,
        upiId: upiId.trim(),
        upiName: upiName.trim(),
        accountHolderName: accountHolderName.trim(),
        accountNumber: accountNumber.trim(),
        ifscCode: ifscCode.trim().toUpperCase(),
        bankName: bankName.trim(),
        userRemarks: userRemarks.trim(),
      };

      const res = await submitWalletRequest(payload);

      if (res && res.success) {
        showToast(
          `Withdrawal request of ₹${numAmount.toLocaleString(
            "en-IN"
          )} submitted successfully! It is now under admin review.`,
          "success"
        );
        setShowWithdrawModal(false);
        setActiveTab("requests");
        fetchWallet();
      } else {
        setModalError(res?.message || "Failed to submit request.");
      }
    } catch (err) {
      setModalError(err.message || "Failed to submit withdrawal request.");
    } finally {
      setSubmittingRequest(false);
    }
  };

  return (
    <div className="wallet-page">
      {/* Top Heading */}
      <div className="wallet-page-heading">
        <div>
          <span className="wallet-eyebrow">SLG / ACCOUNT WALLET</span>
          <h1>My Wallet</h1>
          <p>
            Real-time balance and withdrawal management for{" "}
            <strong>{userData.name || "Vendor Account"}</strong> ({userData.email || "Authenticated User"}).
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            className="wallet-withdraw-btn"
            onClick={openModal}
            title="Request a withdrawal / payout from your wallet balance"
          >
            <FiArrowUpRight /> Request Payout
          </button>

          <button
            type="button"
            className="user-outline-button"
            onClick={fetchWallet}
            disabled={loading}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <FiRefreshCw className={loading ? "spin-icon" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* Global Notification Banner */}
      {notification && (
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
              notificationType === "error"
                ? "rgba(239, 68, 68, 0.15)"
                : "rgba(16, 185, 129, 0.15)",
            color: notificationType === "error" ? "#f87171" : "#34d399",
            border: `1px solid ${
              notificationType === "error"
                ? "rgba(239, 68, 68, 0.3)"
                : "rgba(16, 185, 129, 0.3)"
            }`,
          }}
        >
          {notificationType === "error" ? <FiAlertCircle /> : <FiCheckCircle />}
          <span>{notification}</span>
        </div>
      )}

      {/* Top Balance & Summary Grid */}
      <div className="wallet-top-grid">
        <section className="wallet-balance-card">
          <div className="wallet-balance-top">
            <span>Available Balance</span>
            <FiCreditCard />
          </div>
          <h2>₹{(walletBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ margin: 0 }}>SLG Account Wallet</p>
            {walletBalance > 0 && (
              <button
                type="button"
                onClick={openModal}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#ffd044",
                  fontSize: "12px",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  textDecoration: "underline",
                }}
              >
                Withdraw <FiArrowUpRight />
              </button>
            )}
          </div>
          <div className="wallet-card-footer">
            <span>{userData.name || "Account Holder"}</span>
            <span>•••• •••• {last4}</span>
          </div>
        </section>

        <section className="wallet-summary-card">
          <div className="wallet-summary-icon credit"><FiArrowDownLeft /></div>
          <span>Total Credits</span>
          <h3>₹{totalCredits.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          <p>Money credited into your wallet</p>
        </section>

        <section className="wallet-summary-card">
          <div className="wallet-summary-icon debit"><FiArrowUpRight /></div>
          <span>Total Debits / Withdrawals</span>
          <h3>₹{totalDebits.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          <p>Money debited or requested for payout</p>
        </section>
      </div>

      <section className="wallet-info-note">
        <FiCheckCircle style={{ color: "#2ecc71", flexShrink: 0 }} />
        <p>
          <strong>Fast Payouts:</strong> You can request withdrawal of your wallet funds anytime to your{" "}
          <strong>UPI ID</strong> or <strong>Bank Account</strong>. Admin reviews and disburses payout directly.
        </p>
      </section>

      {/* Tabs Switcher: Transactions vs Payout Requests */}
      <div className="wallet-view-tabs">
        <button
          type="button"
          className={`wallet-view-tab ${activeTab === "transactions" ? "active" : ""}`}
          onClick={() => setActiveTab("transactions")}
        >
          <FiList /> Transaction History ({transactions.length})
        </button>
        <button
          type="button"
          className={`wallet-view-tab ${activeTab === "requests" ? "active" : ""}`}
          onClick={() => setActiveTab("requests")}
        >
          <FiSend /> My Withdrawal Requests ({payoutRequests.length})
        </button>
      </div>

      {/* TAB 1: TRANSACTIONS HISTORY */}
      {activeTab === "transactions" && (
        <section className="wallet-transactions-card">
          <div className="wallet-transactions-heading">
            <div>
              <h2>Transaction History</h2>
              <p>Review all credit and debit records for your account.</p>
            </div>

            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              aria-label="Filter transactions"
            >
              <option value="All">All Transactions ({transactions.length})</option>
              <option value="Credit">Credits</option>
              <option value="Debit">Debits</option>
            </select>
          </div>

          <div className="wallet-table-wrap">
            <table className="wallet-table">
              <thead>
                <tr>
                  <th>Transaction</th>
                  <th>Date &amp; Time</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>
                      <div className="wallet-transaction-name">
                        <span className={`wallet-transaction-icon ${transaction.type.toLowerCase()}`}>
                          {transaction.type === "Credit" ? <FiArrowDownLeft /> : <FiArrowUpRight />}
                        </span>
                        <div>
                          <strong>{transaction.title}</strong>
                          {transaction.description && (
                            <div style={{ fontSize: "11px", color: "var(--color-muted, #7c7468)", marginTop: "2px" }}>
                              {transaction.description}
                            </div>
                          )}
                          <small>{transaction.id}</small>
                        </div>
                      </div>
                    </td>
                    <td>{transaction.date}</td>
                    <td>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 8px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: "600",
                          background:
                            transaction.type === "Credit"
                              ? "rgba(46, 204, 113, 0.15)"
                              : "rgba(231, 76, 60, 0.15)",
                          color: transaction.type === "Credit" ? "#2ecc71" : "#e74c3c",
                        }}
                      >
                        {transaction.type}
                      </span>
                    </td>
                    <td className={transaction.type === "Credit" ? "wallet-credit-amount" : "wallet-debit-amount"}>
                      {transaction.type === "Credit" ? "+" : "-"}₹{transaction.amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td>
                      <span className={`wallet-transaction-status ${transaction.status.toLowerCase()}`}>
                        ● {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan="5" className="wallet-empty-state">
                      {loading ? "Loading transactions..." : "No transactions recorded for this wallet yet."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 2: MY WITHDRAWAL REQUESTS */}
      {activeTab === "requests" && (
        <section className="wallet-transactions-card">
          <div className="wallet-transactions-heading">
            <div>
              <h2>Withdrawal &amp; Payout Requests</h2>
              <p>Track the approval and disbursement status of your withdrawal requests.</p>
            </div>

            <button
              type="button"
              className="wallet-withdraw-btn"
              style={{ minHeight: "36px", padding: "0 16px", fontSize: "13px" }}
              onClick={openModal}
            >
              <FiPlus /> New Request
            </button>
          </div>

          <div className="wallet-table-wrap">
            <table className="wallet-table">
              <thead>
                <tr>
                  <th>Requested Amount</th>
                  <th>Payment Mode</th>
                  <th>Payout Destination</th>
                  <th>Date &amp; Time</th>
                  <th>Status</th>
                  <th>Admin Remarks / Ref</th>
                </tr>
              </thead>
              <tbody>
                {payoutRequests.map((req) => {
                  const isUPI = req.paymentMode === "UPI";
                  const reqDate = req.createdAt
                    ? new Date(req.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "N/A";

                  return (
                    <tr key={req._id}>
                      <td>
                        <strong style={{ color: "#ffd044", fontSize: "15px" }}>
                          ₹{Number(req.amount).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </strong>
                      </td>

                      <td>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            fontSize: "11.5px",
                            fontWeight: "700",
                            background: isUPI ? "rgba(147, 51, 234, 0.15)" : "rgba(59, 130, 246, 0.15)",
                            color: isUPI ? "#c084fc" : "#60a5fa",
                            border: `1px solid ${isUPI ? "rgba(147, 51, 234, 0.3)" : "rgba(59, 130, 246, 0.3)"}`,
                          }}
                        >
                          {isUPI ? <FiSmartphone /> : <FiBriefcase />} {req.paymentMode}
                        </span>
                      </td>

                      <td>
                        {isUPI ? (
                          <div style={{ fontSize: "12.5px" }}>
                            <div style={{ fontFamily: "monospace", color: "#ffd044" }}>
                              {req.upiDetails?.upiId}
                            </div>
                            <small style={{ color: "#a89d8d" }}>
                              {req.upiDetails?.accountHolderName || req.userName}
                            </small>
                          </div>
                        ) : (
                          <div style={{ fontSize: "12.5px" }}>
                            <div>
                              <strong>{req.bankDetails?.accountHolderName}</strong>
                            </div>
                            <div style={{ fontFamily: "monospace", color: "#60a5fa" }}>
                              A/C: {req.bankDetails?.accountNumber}
                            </div>
                            <small style={{ color: "#ffd044", fontFamily: "monospace" }}>
                              IFSC: {req.bankDetails?.ifscCode}
                            </small>
                            {req.bankDetails?.bankName && (
                              <div style={{ color: "#a89d8d", fontSize: "11px" }}>
                                {req.bankDetails.bankName}
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      <td style={{ color: "#a89d8d", fontSize: "12px" }}>
                        {reqDate}
                      </td>

                      <td>
                        <span className={`wallet-status-badge ${req.status.toLowerCase()}`}>
                          {req.status === "Pending" && <FiClock />}
                          {req.status === "Approved" && <FiCheckCircle />}
                          {req.status === "Rejected" && <FiXCircle />}
                          {req.status}
                        </span>
                      </td>

                      <td>
                        {req.adminTransactionId && (
                          <div style={{ fontSize: "11.5px", color: "#ffd044", fontFamily: "monospace" }}>
                            Ref: {req.adminTransactionId}
                          </div>
                        )}
                        {req.adminRemarks && (
                          <div style={{ fontSize: "12px", color: "#d1b777", marginTop: "2px" }}>
                            {req.adminRemarks}
                          </div>
                        )}
                        {!req.adminTransactionId && !req.adminRemarks && (
                          <span style={{ color: "#666", fontSize: "12px" }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {payoutRequests.length === 0 && (
                  <tr>
                    <td colSpan="6" className="wallet-empty-state">
                      {loading
                        ? "Loading requests..."
                        : "You have not submitted any withdrawal requests yet."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* WITHDRAWAL REQUEST MODAL */}
      {showWithdrawModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card" style={{ maxWidth: "560px" }}>
            <div className="admin-modal-header">
              <h3>
                <FiArrowUpRight style={{ color: "#ffd044" }} /> Request Wallet Payout
              </h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setShowWithdrawModal(false)}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmitWithdrawal}>
              <div className="admin-modal-body">
                {/* Available balance banner */}
                <div className="wallet-modal-balance-hint">
                  <span>Available Wallet Balance</span>
                  <strong>₹{walletBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong>
                </div>

                {modalError && (
                  <div
                    style={{
                      background: "rgba(239, 68, 68, 0.15)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      color: "#f87171",
                      fontSize: "13px",
                      marginBottom: "14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <FiAlertCircle style={{ flexShrink: 0 }} />
                    <span>{modalError}</span>
                  </div>
                )}

                {/* Amount Field */}
                <div className="wallet-modal-field">
                  <label>Amount to Withdraw (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    max={walletBalance}
                    placeholder="Enter amount (e.g. 1000)"
                    value={reqAmount}
                    onChange={(e) => setReqAmount(e.target.value)}
                    required
                  />

                  {/* Quick percentage pills */}
                  <div className="wallet-amount-pills">
                    {[25, 50, 75, 100].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        className="wallet-amount-pill"
                        onClick={() => handleQuickPercent(pct)}
                      >
                        {pct === 100 ? "MAX (100%)" : `${pct}%`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Mode Selector */}
                <div className="wallet-modal-field">
                  <label>Select Payment Mode *</label>
                  <div className="wallet-mode-selector">
                    <div
                      className={`wallet-mode-option ${paymentMode === "UPI" ? "selected" : ""}`}
                      onClick={() => setPaymentMode("UPI")}
                    >
                      <div className="wallet-mode-option-icon">
                        <FiSmartphone />
                      </div>
                      <div className="wallet-mode-option-copy">
                        <strong>UPI Transfer</strong>
                        <small>Instant to your UPI ID</small>
                      </div>
                    </div>

                    <div
                      className={`wallet-mode-option ${paymentMode === "Bank Account" ? "selected" : ""}`}
                      onClick={() => setPaymentMode("Bank Account")}
                    >
                      <div className="wallet-mode-option-icon">
                        <FiBriefcase />
                      </div>
                      <div className="wallet-mode-option-copy">
                        <strong>Bank Account</strong>
                        <small>Direct NEFT / IMPS transfer</small>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Conditional Fields based on Mode */}
                {paymentMode === "UPI" ? (
                  <div className="wallet-form-grid">
                    <div className="wallet-modal-field wallet-form-full">
                      <label>UPI ID *</label>
                      <input
                        type="text"
                        placeholder="e.g. yourname@okhdfcbank or 9876543210@paytm"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        required
                      />
                    </div>
                    <div className="wallet-modal-field wallet-form-full">
                      <label>Name on UPI Account</label>
                      <input
                        type="text"
                        placeholder="e.g. Rahul Sharma"
                        value={upiName}
                        onChange={(e) => setUpiName(e.target.value)}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="wallet-form-grid">
                    <div className="wallet-modal-field wallet-form-full">
                      <label>Account Holder Name *</label>
                      <input
                        type="text"
                        placeholder="As shown in Bank Passbook"
                        value={accountHolderName}
                        onChange={(e) => setAccountHolderName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="wallet-modal-field">
                      <label>Bank Account Number *</label>
                      <input
                        type="text"
                        placeholder="Enter Account Number"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        required
                      />
                    </div>

                    <div className="wallet-modal-field">
                      <label>Confirm Account Number *</label>
                      <input
                        type="text"
                        placeholder="Re-enter Account Number"
                        value={confirmAccountNumber}
                        onChange={(e) => setConfirmAccountNumber(e.target.value)}
                        required
                      />
                    </div>

                    <div className="wallet-modal-field">
                      <label>IFSC Code *</label>
                      <input
                        type="text"
                        placeholder="e.g. HDFC0001234"
                        value={ifscCode}
                        onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                        required
                      />
                    </div>

                    <div className="wallet-modal-field">
                      <label>Bank Name (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. State Bank of India, HDFC"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div className="wallet-modal-field">
                  <label>Note / Remarks (Optional)</label>
                  <input
                    type="text"
                    placeholder="Any specific instructions for payout..."
                    value={userRemarks}
                    onChange={(e) => setUserRemarks(e.target.value)}
                  />
                </div>
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => setShowWithdrawModal(false)}
                  disabled={submittingRequest}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn-primary"
                  disabled={submittingRequest || walletBalance <= 0}
                >
                  {submittingRequest ? "Submitting Request..." : "Submit Payout Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
