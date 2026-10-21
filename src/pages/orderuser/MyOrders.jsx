import React, { useState, useEffect } from "react";
import {
  FiPackage,
  FiClock,
  FiCheckCircle,
  FiTruck,
  FiMapPin,
  FiPhone,
  FiMail,
  FiRefreshCw,
  FiAlertCircle,
  FiChevronDown,
  FiChevronUp,
  FiShield,
  FiHeadphones,
} from "react-icons/fi";
import { getOrderUserOrders, formatImageUrl } from "../../lib/api";
import "./MyOrders.css";

export default function MyOrders({ onNavigateToSupport }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getOrderUserOrders();
      if (res && res.success) {
        setOrders(res.orders || []);
      } else {
        // Fallback to client orders
        const rawUserData = localStorage.getItem("orderUserData");
        const userData = rawUserData ? JSON.parse(rawUserData) : {};
        const localKey = `slg_orders_${userData.id || userData.email || "guest"}`;
        const localOrders = JSON.parse(localStorage.getItem(localKey) || "[]");
        setOrders(localOrders);
      }
    } catch (err) {
      console.error("Error loading customer orders:", err);
      // Try local fallback
      try {
        const rawUserData = localStorage.getItem("orderUserData");
        const userData = rawUserData ? JSON.parse(rawUserData) : {};
        const localKey = `slg_orders_${userData.id || userData.email || "guest"}`;
        const localOrders = JSON.parse(localStorage.getItem(localKey) || "[]");
        if (localOrders.length > 0) {
          setOrders(localOrders);
        } else {
          setError(err.message || "Failed to load orders. Please try again.");
        }
      } catch {
        setError(err.message || "Failed to load orders. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const toggleExpand = (orderId) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  const filteredOrders = orders.filter((ord) => {
    if (filterStatus === "All") return true;
    return (ord.orderStatus || "Processing").toLowerCase() === filterStatus.toLowerCase();
  });

  const getStatusClass = (status) => {
    const s = (status || "Processing").toLowerCase();
    if (s === "delivered") return "status-delivered";
    if (s === "shipped") return "status-shipped";
    if (s === "confirmed") return "status-confirmed";
    if (s === "cancelled") return "status-cancelled";
    return "status-processing";
  };

  const getStepProgress = (status) => {
    const s = (status || "Processing").toLowerCase();
    if (s === "delivered") return 4;
    if (s === "shipped") return 3;
    if (s === "confirmed") return 2;
    if (s === "processing") return 1;
    return 1;
  };

  return (
    <div className="orderuser-my-orders">
      <div className="orders-header-row">
        <div>
          <h2 className="orders-title">My Solar Orders</h2>
          <p className="orders-subtitle">
            Track your solar product bookings, order status, and installation updates
          </p>
        </div>

        <button
          type="button"
          onClick={loadOrders}
          className="orders-refresh-btn"
          disabled={loading}
          title="Refresh orders"
        >
          <FiRefreshCw className={loading ? "spin-icon" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="orders-filter-bar">
        {["All", "Processing", "Confirmed", "Shipped", "Delivered"].map((st) => (
          <button
            key={st}
            type="button"
            className={`filter-chip ${filterStatus === st ? "active" : ""}`}
            onClick={() => setFilterStatus(st)}
          >
            {st}
          </button>
        ))}
      </div>

      {error && (
        <div className="orders-error-banner">
          <FiAlertCircle />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="orders-loading-state">
          <div className="spinner-ring"></div>
          <p>Loading your orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="orders-empty-card">
          <div className="empty-icon-box">
            <FiPackage />
          </div>
          <h3>No Orders Found</h3>
          <p>
            {filterStatus === "All"
              ? "You haven't placed any solar orders yet, or your orders are currently processing."
              : `No orders found with status "${filterStatus}".`}
          </p>
        </div>
      ) : (
        <div className="orders-cards-list">
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrderId === (order.orderId || order._id);
            const step = getStepProgress(order.orderStatus);
            const total = order.totalAmount || 0;
            const tokenPaid = order.payableAmount || 1000;
            const remaining = Math.max(0, total - tokenPaid);
            const cust = order.customerDetails || order.shippingInfo || {};

            return (
              <div key={order.orderId || order._id} className="order-item-card">
                <div className="order-card-header">
                  <div className="order-card-id-block">
                    <span className="order-id-label">ORDER ID</span>
                    <strong className="order-id-text">{order.orderId || order._id}</strong>
                    <span className="order-date-text">
                      <FiClock /> {new Date(order.createdAt || Date.now()).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="order-card-badges">
                    <span className={`order-status-badge ${getStatusClass(order.orderStatus)}`}>
                      {order.orderStatus || "Processing"}
                    </span>
                    <span className="token-paid-badge">
                      <FiCheckCircle /> Token ₹{tokenPaid.toLocaleString("en-IN")} Paid
                    </span>
                  </div>
                </div>

                {/* Progress Steps Tracker */}
                <div className="order-tracker-container">
                  <div className="tracker-steps">
                    <div className={`tracker-step ${step >= 1 ? "completed" : ""}`}>
                      <div className="step-circle">{step >= 1 ? <FiCheckCircle /> : "1"}</div>
                      <span className="step-label">Booking Done</span>
                    </div>

                    <div className={`tracker-connector ${step >= 2 ? "active" : ""}`}></div>

                    <div className={`tracker-step ${step >= 2 ? "completed" : ""}`}>
                      <div className="step-circle">{step >= 2 ? <FiCheckCircle /> : "2"}</div>
                      <span className="step-label">Confirmed</span>
                    </div>

                    <div className={`tracker-connector ${step >= 3 ? "active" : ""}`}></div>

                    <div className={`tracker-step ${step >= 3 ? "completed" : ""}`}>
                      <div className="step-circle">{step >= 3 ? <FiCheckCircle /> : "3"}</div>
                      <span className="step-label">Dispatched</span>
                    </div>

                    <div className={`tracker-connector ${step >= 4 ? "active" : ""}`}></div>

                    <div className={`tracker-step ${step >= 4 ? "completed" : ""}`}>
                      <div className="step-circle">{step >= 4 ? <FiCheckCircle /> : "4"}</div>
                      <span className="step-label">Delivered</span>
                    </div>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="order-products-row">
                  {(order.items || []).slice(0, 3).map((it, idx) => (
                    <div key={idx} className="product-mini-item">
                      {it.image ? (
                        <img
                          src={formatImageUrl(it.image)}
                          alt={it.name}
                          className="product-mini-thumb"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="product-mini-thumb placeholder">
                          <FiPackage />
                        </div>
                      )}
                      <div className="product-mini-info">
                        <div className="product-name">{it.name || "Solar Product"}</div>
                        <div className="product-meta">
                          Qty: <strong>{it.quantity}</strong> × ₹{(it.price || 0).toLocaleString("en-IN")}
                        </div>
                      </div>
                    </div>
                  ))}

                  {(order.items || []).length > 3 && (
                    <div className="more-items-chip">
                      +{(order.items || []).length - 3} more item(s)
                    </div>
                  )}
                </div>

                {/* Card Summary Footer */}
                <div className="order-card-summary-footer">
                  <div className="summary-col">
                    <span className="summary-label">Total Amount</span>
                    <strong className="summary-value">₹{total.toLocaleString("en-IN")}</strong>
                  </div>

                  <div className="summary-col">
                    <span className="summary-label">Token Paid</span>
                    <strong className="summary-value token-text">₹{tokenPaid.toLocaleString("en-IN")}</strong>
                  </div>

                  <div className="summary-col">
                    <span className="summary-label">Balance on Delivery</span>
                    <strong className="summary-value balance-text">₹{remaining.toLocaleString("en-IN")}</strong>
                  </div>

                  <div className="summary-actions">
                    <button
                      type="button"
                      className="details-toggle-btn"
                      onClick={() => toggleExpand(order.orderId || order._id)}
                    >
                      {isExpanded ? (
                        <>
                          Hide Details <FiChevronUp />
                        </>
                      ) : (
                        <>
                          View Full Details <FiChevronDown />
                        </>
                      )}
                    </button>

                    {onNavigateToSupport && (
                      <button
                        type="button"
                        className="order-help-btn"
                        onClick={() => onNavigateToSupport(order.orderId || order._id)}
                      >
                        <FiHeadphones /> Need Help?
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="order-expanded-details">
                    <div className="details-grid-2">
                      <div className="detail-box">
                        <h4>
                          <FiMapPin /> Delivery &amp; Installation Address
                        </h4>
                        <div className="detail-content">
                          <p><strong>{cust.fullName || "Customer"}</strong></p>
                          <p>{cust.address || "Registered Address"}</p>
                          <p>
                            {[cust.city, cust.state, cust.pincode].filter(Boolean).join(", ")}
                          </p>
                          <p className="contact-line">
                            <FiPhone /> {cust.mobile || "N/A"} &nbsp;|&nbsp; <FiMail /> {cust.email || "N/A"}
                          </p>
                          <p className="house-owner-tag">
                            House Owner: <strong>{cust.isHouseOwner === "Yes" ? "Yes (Verified)" : "No"}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="detail-box">
                        <h4>
                          <FiShield /> Payment &amp; Transaction Details
                        </h4>
                        <div className="detail-content">
                          <p>Method: <strong>{order.paymentMethod || "Online (Razorpay)"}</strong></p>
                          <p>Status: <strong style={{ color: "#34d399" }}>{order.paymentStatus || "Paid"}</strong></p>
                          {order.onlineTransactionId && (
                            <p>Transaction ID: <code>{order.onlineTransactionId}</code></p>
                          )}
                          {order.razorpayOrderId && (
                            <p>Payment Ref: <code>{order.razorpayOrderId}</code></p>
                          )}
                          <p className="token-note">
                            Note: ₹1,000 token is received. Remaining balance of ₹{remaining.toLocaleString("en-IN")} is payable at the time of solar system delivery/installation.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* All Items Detailed Table */}
                    <div className="items-table-container">
                      <h4>Ordered Solar Items</h4>
                      <table className="items-detailed-table">
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>Category</th>
                            <th>Unit Price</th>
                            <th>Quantity</th>
                            <th style={{ textAlign: "right" }}>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(order.items || []).map((item, idx) => (
                            <tr key={idx}>
                              <td>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                  {item.image && (
                                    <img
                                      src={formatImageUrl(item.image)}
                                      alt={item.name}
                                      style={{ width: "36px", height: "36px", objectFit: "cover", borderRadius: "6px" }}
                                    />
                                  )}
                                  <span>{item.name}</span>
                                </div>
                              </td>
                              <td>{item.category || "Solar System"}</td>
                              <td>₹{(item.price || 0).toLocaleString("en-IN")}</td>
                              <td>{item.quantity}</td>
                              <td style={{ textAlign: "right", fontWeight: "700", color: "#ffd044" }}>
                                ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString("en-IN")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

