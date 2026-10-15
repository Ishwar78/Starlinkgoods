import React, { useState, useEffect } from "react";
import {
  FiCreditCard,
  FiShoppingBag,
  FiShield,
  FiArrowUpRight,
  FiArrowRight,
  FiClock,
  FiUser,
  FiUsers,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCheckCircle,
  FiAlertCircle,
  FiXCircle,
  FiRefreshCw,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { getMyKYCStatus, getMyVendorUsers } from "../../lib/api";
import "./Dashboard.css";

const recentOrders = [
  { id: "#HS1025", product: "Premium Wooden Chair", date: "12 Oct 2026", amount: "₹4,500", status: "Delivered" },
  { id: "#HS1024", product: "Modern Coffee Table", date: "10 Oct 2026", amount: "₹6,200", status: "Processing" },
  { id: "#HS1023", product: "Luxury Sofa Set", date: "08 Oct 2026", amount: "₹24,999", status: "Shipped" },
];

export default function Dashboard() {
  const [userData, setUserData] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("userData") || "{}");
    } catch {
      return {};
    }
  });

  const [kycStatus, setKycStatus] = useState("Loading...");
  const [myUsersCount, setMyUsersCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchDashboardStats = async () => {
    try {
      setLoadingStats(true);
      const userToken = localStorage.getItem("userToken");

      // 1. Refresh latest user profile
      if (userToken) {
        try {
          const meRes = await fetch("http://localhost:5000/api/vendors/me", {
            headers: { Authorization: `Bearer ${userToken}` },
          }).then((r) => r.json());

          if (meRes.success && meRes.user) {
            localStorage.setItem("userData", JSON.stringify(meRes.user));
            setUserData(meRes.user);
          }
        } catch {
          // ignore profile sync network error
        }
      }

      // 2. Fetch logged-in user's KYC status
      const kycRes = await getMyKYCStatus({
        email: userData.email,
        userId: userData._id || userData.id,
      });

      if (kycRes.success && kycRes.submitted && kycRes.kyc) {
        setKycStatus(kycRes.kyc.status || "Pending");
      } else {
        setKycStatus("Not Submitted");
      }

      // 3. Fetch count of users added by this logged-in vendor
      const usersRes = await getMyVendorUsers({
        vendorId: userData._id || userData.id,
        vendorEmail: userData.email,
      });

      if (usersRes.success && Array.isArray(usersRes.users)) {
        setMyUsersCount(usersRes.users.length);
      } else {
        setMyUsersCount(0);
      }
    } catch (err) {
      console.warn("Error fetching dashboard statistics:", err.message);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, [userData.email, userData._id]);

  const memberDate = userData.createdAt
    ? new Date(userData.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Active Member";

  return (
    <div className="user-dashboard-page">
      <div className="user-page-heading">
        <div>
          <span className="user-eyebrow">SLG / VENDOR PORTAL</span>
          <h1>Welcome back, {userData.name || "Vendor"}!</h1>
          <p>
            Logged in as <strong>{userData.email || "Vendor Account"}</strong> &bull; All your personal documents, added users and catalog are isolated to your account.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            className="user-outline-button"
            onClick={fetchDashboardStats}
            disabled={loadingStats}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <FiRefreshCw className={loadingStats ? "spin-icon" : ""} /> Refresh
          </button>
          <Link to="/user/orders" className="user-primary-button">
            View Orders <FiArrowRight />
          </Link>
        </div>
      </div>

      {/* Logged in Vendor Profile Card */}
      <section className="user-dashboard-panel user-vendor-details-card">
        <div className="user-panel-heading">
          <div>
            <span className="user-eyebrow">AUTHENTICATED PROFILE</span>
            <h2>Vendor Profile &amp; Account Details</h2>
            <p>Your unique verified credentials and registered business information.</p>
          </div>
          <span
            className="user-status-pill delivered"
            style={{
              textTransform: "capitalize",
              fontSize: "12px",
              padding: "6px 14px",
              fontWeight: "700",
            }}
          >
            ● {userData.status || "Active"}
          </span>
        </div>

        <div className="vendor-info-grid">
          <div className="vendor-info-item">
            <span className="vendor-info-label">Full Name</span>
            <strong className="vendor-info-value">{userData.name || "N/A"}</strong>
          </div>
          <div className="vendor-info-item">
            <span className="vendor-info-label">Registered Email</span>
            <strong className="vendor-info-value">{userData.email || "N/A"}</strong>
          </div>
          <div className="vendor-info-item">
            <span className="vendor-info-label">Mobile Number</span>
            <strong className="vendor-info-value">{userData.mobile || "N/A"}</strong>
          </div>
          <div className="vendor-info-item">
            <span className="vendor-info-label">City &amp; State</span>
            <strong className="vendor-info-value">
              {userData.city && userData.state
                ? `${userData.city}, ${userData.state}`
                : userData.city || userData.state || "N/A"}
            </strong>
          </div>
          <div className="vendor-info-item" style={{ gridColumn: "span 2" }}>
            <span className="vendor-info-label">Registered Address</span>
            <strong className="vendor-info-value">{userData.address || "N/A"}</strong>
          </div>
          <div className="vendor-info-item">
            <span className="vendor-info-label">Account Role</span>
            <strong className="vendor-info-value">{userData.role || "Vendor"}</strong>
          </div>
          <div className="vendor-info-item">
            <span className="vendor-info-label">KYC Status</span>
            <strong
              className="vendor-info-value"
              style={{
                color:
                  kycStatus === "Verified"
                    ? "#2ecc71"
                    : kycStatus === "Pending"
                    ? "#f39c12"
                    : kycStatus === "Rejected"
                    ? "#e74c3c"
                    : "#a89d8d",
              }}
            >
              ● {kycStatus}
            </strong>
          </div>
          <div className="vendor-info-item">
            <span className="vendor-info-label">Member Since</span>
            <strong className="vendor-info-value">{memberDate}</strong>
          </div>
        </div>
      </section>

      {/* Welcome Banner */}
      <section className="user-welcome-banner">
        <div>
          <span className="user-banner-tag">
            WELCOME {userData.name ? userData.name.toUpperCase() : "PARTNER"}
          </span>
          <h2>Make yourself at home.</h2>
          <p>Everything you need to manage your SLG account, added customers, and storefront is right here.</p>
          <Link to="/user/orders" className="user-banner-link">
            Explore your orders <FiArrowUpRight />
          </Link>
        </div>
        <div className="user-banner-decoration">
          {(userData.name || "H").charAt(0).toUpperCase()}
        </div>
      </section>

      {/* Summary KPI Cards */}
      <section className="user-stats-grid">
        <article className="user-stat-card">
          <div className="user-stat-icon wallet-icon"><FiCreditCard /></div>
          <span className="user-stat-label">Wallet Balance</span>
          <h3>₹2,450.00</h3>
          <Link to="/user/wallet">Manage wallet <FiArrowRight /></Link>
        </article>

        <article className="user-stat-card">
          <div className="user-stat-icon" style={{ background: "rgba(52, 152, 219, 0.12)", color: "#3498db" }}>
            <FiUsers />
          </div>
          <span className="user-stat-label">Users Added By You</span>
          <h3>{myUsersCount}</h3>
          <Link to="/user/add-user">Manage users <FiArrowRight /></Link>
        </article>

        <article className="user-stat-card">
          <div className="user-stat-icon kyc-icon"><FiShield /></div>
          <span className="user-stat-label">KYC Verification</span>
          <h3
            className="user-stat-status"
            style={{
              color:
                kycStatus === "Verified"
                  ? "#2ecc71"
                  : kycStatus === "Pending"
                  ? "#f39c12"
                  : kycStatus === "Rejected"
                  ? "#e74c3c"
                  : "#a89d8d",
            }}
          >
            {kycStatus}
          </h3>
          <Link to="/user/kyc">
            {kycStatus === "Verified" ? "View KYC Details" : "Complete KYC"} <FiArrowRight />
          </Link>
        </article>

        <article className="user-stat-card">
          <div className="user-stat-icon orders-icon"><FiShoppingBag /></div>
          <span className="user-stat-label">Total Orders</span>
          <h3>12</h3>
          <Link to="/user/orders">Track orders <FiArrowRight /></Link>
        </article>
      </section>

      {/* Recent Orders Panel */}
      <section className="user-dashboard-panel">
        <div className="user-panel-heading">
          <div>
            <h2>Recent Orders</h2>
            <p>A quick look at your latest purchases.</p>
          </div>
          <Link to="/user/orders" className="user-text-link">View all <FiArrowRight /></Link>
        </div>

        <div className="user-table-container">
          <table className="user-data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Product</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td className="user-order-id">{order.id}</td>
                  <td>{order.product}</td>
                  <td>{order.date}</td>
                  <td className="user-amount">{order.amount}</td>
                  <td>
                    <span className={`user-status-pill ${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Quick KYC Callout */}
      {kycStatus !== "Verified" && (
        <section className="user-dashboard-panel user-activity-panel">
          <div className="user-activity-icon"><FiClock /></div>
          <div>
            <h3>
              {kycStatus === "Pending"
                ? "Your KYC is currently under review by Admin"
                : kycStatus === "Rejected"
                ? "Your KYC was rejected. Please resubmit your document."
                : "Complete your KYC Verification"}
            </h3>
            <p>
              {kycStatus === "Pending"
                ? "Admin is verifying your uploaded identity proof. Once approved, you get full verified vendor status."
                : "Submit your government ID proof to activate full dealership privileges and payouts."}
            </p>
          </div>
          <Link to="/user/kyc" className="user-outline-button">
            {kycStatus === "Pending" ? "Check Status" : "Verify Account"}
          </Link>
        </section>
      )}
    </div>
  );
}
