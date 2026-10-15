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
} from "react-icons/fi";
import { getMyWalletBalance } from "../../lib/api";
import "./Wallet.css";

const Wallet = () => {
  const [userData] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("userData") || "{}");
    } catch {
      return {};
    }
  });

  const [walletBalance, setWalletBalance] = useState(() => userData?.walletBalance || 0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const res = await getMyWalletBalance({
        userId: userData._id || userData.id,
        email: userData.email,
      });

      if (res && res.success) {
        setWalletBalance(typeof res.walletBalance === "number" ? res.walletBalance : 0);
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

  return (
    <div className="wallet-page">
      <div className="wallet-page-heading">
        <div>
          <span className="wallet-eyebrow">SLG / ACCOUNT WALLET</span>
          <h1>My Wallet</h1>
          <p>
            Real-time balance and transaction activity for{" "}
            <strong>{userData.name || "Vendor Account"}</strong> ({userData.email || "Authenticated User"}).
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
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

      <div className="wallet-top-grid">
        <section className="wallet-balance-card">
          <div className="wallet-balance-top">
            <span>Available Balance</span>
            <FiCreditCard />
          </div>
          <h2>₹{(walletBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
          <p>SLG Account Wallet</p>
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
          <span>Total Debits</span>
          <h3>₹{totalDebits.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          <p>Money debited / used from wallet</p>
        </section>
      </div>

      <section className="wallet-info-note">
        <FiCheckCircle style={{ color: "#2ecc71", flexShrink: 0 }} />
        <p>
          <strong>Secure User Wallet:</strong> Your wallet balance is strictly isolated to your account.
          Any funds added by Administrator via the Admin Panel reflect immediately in your account.
        </p>
      </section>

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
    </div>
  );
};

export default Wallet;
