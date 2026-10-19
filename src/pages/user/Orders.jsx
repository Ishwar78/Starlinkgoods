import React, { useState, useEffect, useMemo } from "react";
import {
  FiSearch,
  FiShoppingBag,
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiEye,
  FiX,
  FiFileText,
  FiRefreshCw,
  FiUser,
  FiMapPin,
  FiCreditCard,
  FiHome,
} from "react-icons/fi";
import { getMyOrders, formatImageUrl } from "../../lib/api";
import "./Orders.css";

const statusClass = {
  Delivered: "delivered",
  Processing: "processing",
  Confirmed: "delivered",
  Pending: "processing",
  Cancelled: "cancelled",
  Shipped: "shipped",
};

export default function UserOrders() {
  const [userData] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("userData") || "{}");
    } catch {
      return {};
    }
  });

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await getMyOrders({
        vendorId: userData._id || userData.id,
        vendorEmail: userData.email,
      });

      if (res && res.success && Array.isArray(res.orders) && res.orders.length > 0) {
        setOrders(res.orders);
        return;
      }

      // Fallback to localStorage if API returned empty or during offline development
      const ordersKey = `slg_orders_${userData._id || userData.id || userData.email || "guest"}`;
      try {
        const local = JSON.parse(localStorage.getItem(ordersKey) || "[]");
        if (Array.isArray(local) && local.length > 0) {
          setOrders(local);
          return;
        }
      } catch {}

      setOrders([]);
    } catch (err) {
      console.warn("Failed to load user orders via API, checking localStorage fallback:", err);
      const ordersKey = `slg_orders_${userData._id || userData.id || userData.email || "guest"}`;
      try {
        const local = JSON.parse(localStorage.getItem(ordersKey) || "[]");
        setOrders(Array.isArray(local) ? local : []);
      } catch {
        setOrders([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [userData._id, userData.email]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderId = (order.orderId || order.id || "").toLowerCase();
      const customerName = (order.customerDetails?.fullName || order.shippingInfo?.firstName || "").toLowerCase();
      const firstItem = (order.items && order.items[0]) || {};
      const productName = (firstItem.name || order.product || "").toLowerCase();

      const matchesSearch =
        orderId.includes(search.toLowerCase()) ||
        customerName.includes(search.toLowerCase()) ||
        productName.includes(search.toLowerCase());

      const st = order.orderStatus || order.status || "Processing";
      const matchesStatus =
        statusFilter === "All" || st.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const totalOrders = orders.length;
  const deliveredCount = orders.filter(
    (o) => (o.orderStatus || o.status) === "Delivered"
  ).length;
  const activeCount = orders.filter((o) =>
    ["Processing", "Pending", "Confirmed", "Shipped"].includes(o.orderStatus || o.status)
  ).length;

  return (
    <div className="orders-page">
      <div className="orders-page-heading">
        <div>
          <span className="orders-eyebrow">SLG / ORDER MANAGEMENT</span>
          <h1>My Orders</h1>
          <p>
            Track your solar system orders, customer details, and booking payment status for{" "}
            <strong>{userData.name || "Vendor User"}</strong>.
          </p>
        </div>

        <button
          type="button"
          className="user-outline-button"
          onClick={fetchOrders}
          disabled={loading}
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <FiRefreshCw className={loading ? "spin-icon" : ""} /> Refresh
        </button>
      </div>

      <section className="orders-summary-grid">
        <article className="orders-summary-card">
          <span className="orders-summary-icon">
            <FiShoppingBag />
          </span>
          <div>
            <p>Total Orders</p>
            <h3>{totalOrders}</h3>
          </div>
        </article>

        <article className="orders-summary-card">
          <span className="orders-summary-icon processing">
            <FiPackage />
          </span>
          <div>
            <p>In Progress / Confirmed</p>
            <h3>{activeCount}</h3>
          </div>
        </article>

        <article className="orders-summary-card">
          <span className="orders-summary-icon delivered">
            <FiCheckCircle />
          </span>
          <div>
            <p>Delivered / Installed</p>
            <h3>{deliveredCount}</h3>
          </div>
        </article>
      </section>

      <section className="orders-list-card">
        <div className="orders-list-heading">
          <div>
            <h2>Order History</h2>
            <p>Review customer installation details, documents, and fulfillment status.</p>
          </div>

          <div className="orders-filters">
            <label className="orders-search">
              <FiSearch />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by order ID, customer or product..."
                aria-label="Search orders"
              />
            </label>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter orders by status"
            >
              <option value="All">All Statuses</option>
              <option value="Processing">Processing</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="orders-table-wrap">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID &amp; Date</th>
                <th>Product &amp; Image</th>
                <th>Customer Name</th>
                <th>Total Value</th>
                <th>Paid Now (Token)</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Details</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((order) => {
                const oid = order.orderId || order.id || "SLG-ORD";
                const firstItem = (order.items && order.items[0]) || {};
                const extraItems = (order.items?.length || 1) - 1;
                const dateStr = order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : order.date || "Recent";

                const currentStatus = order.orderStatus || order.status || "Processing";
                const totalVal = order.totalAmount ?? order.amount ?? 0;
                const paidVal = order.payableAmount ?? 1000;
                const customerName =
                  order.customerDetails?.fullName ||
                  (order.shippingInfo?.firstName
                    ? `${order.shippingInfo.firstName} ${order.shippingInfo.lastName || ""}`
                    : "Direct Customer");

                return (
                  <tr key={order._id || order.id || oid}>
                    {/* Order ID & Date */}
                    <td className="orders-id">
                      <strong style={{ color: "#ffd044" }}>{oid}</strong>
                      <div style={{ color: "#a89d8d", fontSize: "11px", marginTop: "2px" }}>
                        {dateStr}
                      </div>
                    </td>

                    {/* Product & Image */}
                    <td>
                      <div className="orders-product" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
                          style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "6px",
                            overflow: "hidden",
                            background: "#222",
                            flexShrink: 0,
                            border: "1px solid rgba(255,208,68,0.2)",
                          }}
                        >
                          <img
                            src={formatImageUrl(firstItem.image)}
                            alt={firstItem.name || "Product"}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={(e) => {
                              e.currentTarget.src =
                                "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=300&q=80";
                            }}
                          />
                        </div>
                        <div>
                          <strong>{firstItem.name || order.product || "Solar System Product"}</strong>
                          <small style={{ color: "#ffd044" }}>
                            Qty: {firstItem.quantity || order.quantity || 1}
                            {extraItems > 0 && ` (+${extraItems} more)`}
                          </small>
                        </div>
                      </div>
                    </td>

                    {/* Customer Name */}
                    <td>
                      <div style={{ fontSize: "13px" }}>
                        <strong>{customerName}</strong>
                        <div style={{ color: "#a89d8d", fontSize: "11px" }}>
                          {order.customerDetails?.city || order.shippingInfo?.city || "India"}
                        </div>
                      </div>
                    </td>

                    {/* Total Catalog Value */}
                    <td>
                      <span style={{ color: "#ffd044", fontWeight: "700" }}>
                        ₹{totalVal.toLocaleString("en-IN")}
                      </span>
                    </td>

                    {/* Paid Token */}
                    <td>
                      <span style={{ color: "#34d399", fontWeight: "800", fontSize: "13.5px" }}>
                        ₹{paidVal.toLocaleString("en-IN")}
                      </span>
                      <div style={{ fontSize: "10.5px", color: "#a89d8d" }}>Online Payment</div>
                    </td>

                    {/* Order Status */}
                    <td>
                      <span
                        className={`orders-status ${
                          statusClass[currentStatus] || "processing"
                        }`}
                      >
                        ● {currentStatus}
                      </span>
                    </td>

                    {/* Details View Button */}
                    <td style={{ textAlign: "right" }}>
                      <button
                        type="button"
                        className="orders-view-button"
                        onClick={() => setSelectedOrder(order)}
                        aria-label={`View order ${oid}`}
                      >
                        <FiEye /> View
                      </button>
                    </td>
                  </tr>
                );
              })}

              {!loading && filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="7" className="orders-empty">
                    No orders found matching your filter. Place orders from "My Products"!
                  </td>
                </tr>
              )}

              {loading && (
                <tr>
                  <td colSpan="7" className="orders-empty" style={{ color: "#ffd044" }}>
                    Loading your orders...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* DETAILED MODAL */}
      {selectedOrder && (
        <div
          className="orders-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedOrder(null);
          }}
        >
          <section
            className="orders-modal"
            style={{ maxWidth: "680px" }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="orders-modal-title"
          >
            <div className="orders-modal-heading">
              <div>
                <span>ORDER SUMMARY</span>
                <h2 id="orders-modal-title">
                  {selectedOrder.orderId || selectedOrder.id}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                aria-label="Close order details"
              >
                <FiX />
              </button>
            </div>

            {/* Customer Details */}
            <div
              style={{
                background: "#161616",
                padding: "12px 14px",
                borderRadius: "8px",
                marginBottom: "16px",
                border: "1px solid rgba(255,208,68,0.2)",
                fontSize: "13px",
                lineHeight: "1.6",
              }}
            >
              <h4 style={{ color: "#ffd044", fontSize: "13px", marginBottom: "6px" }}>
                <FiUser style={{ verticalAlign: "middle", marginRight: "6px" }} />
                Customer &amp; Installation Details
              </h4>
              <div>
                <strong>Name: </strong>
                {selectedOrder.customerDetails?.fullName ||
                  (selectedOrder.shippingInfo?.firstName
                    ? `${selectedOrder.shippingInfo.firstName} ${selectedOrder.shippingInfo.lastName || ""}`
                    : "Direct Customer")}
              </div>
              {selectedOrder.customerDetails?.mobile && (
                <div>
                  <strong>Phone: </strong> {selectedOrder.customerDetails.mobile}
                </div>
              )}
              {selectedOrder.customerDetails?.address && (
                <div>
                  <strong>Address: </strong> {selectedOrder.customerDetails.address},{" "}
                  {selectedOrder.customerDetails.city}, {selectedOrder.customerDetails.state} -{" "}
                  {selectedOrder.customerDetails.pincode}
                </div>
              )}
              <div>
                <strong>House Owner: </strong>
                <span
                  style={{
                    color:
                      selectedOrder.customerDetails?.isHouseOwner === "Yes"
                        ? "#34d399"
                        : "#a89d8d",
                    fontWeight: "700",
                  }}
                >
                  {selectedOrder.customerDetails?.isHouseOwner || "No"}
                </span>
              </div>
            </div>

            {/* Product items list */}
            <div style={{ marginBottom: "16px" }}>
              <h4 style={{ color: "#ffd044", fontSize: "13px", marginBottom: "8px" }}>
                Ordered Products
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {(selectedOrder.items || []).map((it, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "#1a1a1a",
                      padding: "8px 12px",
                      borderRadius: "6px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <img
                        src={formatImageUrl(it.image)}
                        alt={it.name}
                        style={{
                          width: "42px",
                          height: "42px",
                          borderRadius: "4px",
                          objectFit: "cover",
                          background: "#222",
                        }}
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=300&q=80";
                        }}
                      />
                      <div>
                        <strong style={{ fontSize: "12.5px", color: "#fff" }}>{it.name}</strong>
                        <div style={{ fontSize: "11px", color: "#a89d8d" }}>
                          ₹{it.price?.toLocaleString("en-IN")} × {it.quantity}
                        </div>
                      </div>
                    </div>
                    <strong style={{ color: "#ffd044", fontSize: "13px" }}>
                      ₹{(it.total || it.price * it.quantity).toLocaleString("en-IN")}
                    </strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Financials & Status */}
            <div className="orders-detail-row">
              <span>Total Catalog Value</span>
              <strong style={{ color: "#ffd044" }}>
                ₹{(selectedOrder.totalAmount ?? selectedOrder.amount ?? 0).toLocaleString("en-IN")}
              </strong>
            </div>

            <div className="orders-detail-row">
              <span style={{ color: "#34d399", fontWeight: "700" }}>Paid Online (Token)</span>
              <strong style={{ color: "#34d399", fontSize: "16px" }}>
                ₹{(selectedOrder.payableAmount || 1000).toLocaleString("en-IN")}
              </strong>
            </div>

            <div className="orders-detail-row">
              <span style={{ color: "#f87171" }}>Remaining on Delivery</span>
              <strong style={{ color: "#f87171" }}>
                ₹{Math.max(
                  0,
                  (selectedOrder.totalAmount ?? selectedOrder.amount ?? 0) -
                    (selectedOrder.payableAmount || 1000)
                ).toLocaleString("en-IN")}
              </strong>
            </div>

            <div className="orders-detail-row">
              <span>Fulfillment Status</span>
              <strong
                className={`orders-detail-status ${
                  statusClass[selectedOrder.orderStatus || selectedOrder.status] || "processing"
                }`}
              >
                ● {selectedOrder.orderStatus || selectedOrder.status || "Processing"}
              </strong>
            </div>

            {/* Uploaded Documents if present */}
            {selectedOrder.documents && (
              <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <span style={{ color: "#a89d8d", fontSize: "12px", display: "block", marginBottom: "6px" }}>
                  Uploaded Documents:
                </span>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {selectedOrder.documents.houseOwnerCertificate && (
                    <a
                      href={formatImageUrl(selectedOrder.documents.houseOwnerCertificate)}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        padding: "5px 10px",
                        borderRadius: "6px",
                        background: "rgba(255,208,68,0.12)",
                        border: "1px solid rgba(255,208,68,0.3)",
                        color: "#ffd044",
                        fontSize: "11.5px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        textDecoration: "none",
                      }}
                    >
                      <FiFileText /> House Owner Certificate
                    </a>
                  )}

                  {selectedOrder.documents.aadhaarCard && (
                    <a
                      href={formatImageUrl(selectedOrder.documents.aadhaarCard)}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        padding: "5px 10px",
                        borderRadius: "6px",
                        background: "rgba(96,165,250,0.12)",
                        border: "1px solid rgba(96,165,250,0.3)",
                        color: "#60a5fa",
                        fontSize: "11.5px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        textDecoration: "none",
                      }}
                    >
                      <FiFileText /> Aadhaar Card
                    </a>
                  )}

                  {selectedOrder.documents.electricityBill && (
                    <a
                      href={formatImageUrl(selectedOrder.documents.electricityBill)}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        padding: "5px 10px",
                        borderRadius: "6px",
                        background: "rgba(52,211,153,0.12)",
                        border: "1px solid rgba(52,211,153,0.3)",
                        color: "#34d399",
                        fontSize: "11.5px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        textDecoration: "none",
                      }}
                    >
                      <FiFileText /> Electricity Bill
                    </a>
                  )}
                </div>
              </div>
            )}

            <button
              type="button"
              className="orders-modal-close"
              style={{ marginTop: "18px" }}
              onClick={() => setSelectedOrder(null)}
            >
              Close Details
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
