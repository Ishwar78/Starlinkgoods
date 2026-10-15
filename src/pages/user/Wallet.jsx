
import React, { useState } from "react";
import {
  FiCreditCard,
  FiArrowDownLeft,
  FiArrowUpRight,
  FiPlus,
  FiInfo,
} from "react-icons/fi";
import "./Wallet.css";

const initialTransactions = [
  { id: "TXN1001", title: "Order refund", date: "12 Oct 2026", amount: 1200, type: "Credit", status: "Completed" },
  { id: "TXN1002", title: "Order payment", date: "10 Oct 2026", amount: 650, type: "Debit", status: "Completed" },
  { id: "TXN1003", title: "Promotional credit", date: "08 Oct 2026", amount: 500, type: "Credit", status: "Completed" },
  { id: "TXN1004", title: "Order payment", date: "05 Oct 2026", amount: 300, type: "Debit", status: "Pending" },
];

const Wallet = () => {
  const [transactions] = useState(initialTransactions);
  const [filter, setFilter] = useState("All");

  const filteredTransactions = transactions.filter((transaction) =>
    filter === "All" ? true : transaction.type === filter
  );

  return (
    <div className="wallet-page">
      <div className="wallet-page-heading">
        <div>
          <span className="wallet-eyebrow">ACCOUNT MANAGEMENT</span>
          <h1>My Wallet</h1>
          <p>View your wallet balance and transaction history.</p>
        </div>
        <button
          type="button"
          className="wallet-add-button"
          onClick={() => window.alert("Connect your payment gateway to add money.")}
        >
          <FiPlus /> Add Money
        </button>
      </div>

      <div className="wallet-top-grid">
        <section className="wallet-balance-card">
          <div className="wallet-balance-top">
            <span>Available Balance</span>
            <FiCreditCard />
          </div>
          <h2>₹2,450.00</h2>
          <p>SLG Wallet</p>
          <div className="wallet-card-footer">
            <span>Account Wallet</span>
            <span>•••• •••• 2450</span>
          </div>
        </section>

        <section className="wallet-summary-card">
          <div className="wallet-summary-icon credit"><FiArrowDownLeft /></div>
          <span>Total Credits</span>
          <h3>₹1,700.00</h3>
          <p>Money credited to your wallet</p>
        </section>

        <section className="wallet-summary-card">
          <div className="wallet-summary-icon debit"><FiArrowUpRight /></div>
          <span>Total Debits</span>
          <h3>₹950.00</h3>
          <p>Money used from your wallet</p>
        </section>
      </div>

      <section className="wallet-info-note">
        <FiInfo />
        <p>
          <strong>Demo wallet:</strong> The balances and transactions shown here
          are sample data. Connect a secure backend and payment provider before
          accepting real payments or allowing withdrawals.
        </p>
      </section>

      <section className="wallet-transactions-card">
        <div className="wallet-transactions-heading">
          <div>
            <h2>Transaction History</h2>
            <p>Review your wallet activity.</p>
          </div>

          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            aria-label="Filter transactions"
          >
            <option value="All">All Transactions</option>
            <option value="Credit">Credits</option>
            <option value="Debit">Debits</option>
          </select>
        </div>

        <div className="wallet-table-wrap">
          <table className="wallet-table">
            <thead>
              <tr>
                <th>Transaction</th>
                <th>Date</th>
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
                        <small>{transaction.id}</small>
                      </div>
                    </div>
                  </td>
                  <td>{transaction.date}</td>
                  <td>{transaction.type}</td>
                  <td className={transaction.type === "Credit" ? "wallet-credit-amount" : "wallet-debit-amount"}>
                    {transaction.type === "Credit" ? "+" : "-"}₹{transaction.amount.toLocaleString("en-IN")}
                  </td>
                  <td>
                    <span className={`wallet-transaction-status ${transaction.status.toLowerCase()}`}>
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan="5" className="wallet-empty-state">No transactions found.</td>
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
