import React, { useEffect, useState, useMemo } from "react";
import {
  FiSearch,
  FiShoppingBag,
  FiPackage,
  FiCheckCircle,
  FiClock,
  FiTruck,
  FiXCircle,
  FiEye,
  FiX,
  FiFileText,
  FiDownload,
  FiRefreshCw,
  FiUser,
  FiMapPin,
  FiCreditCard,
  FiHome,
} from "react-icons/fi";
import { getAllOrders, updateOrderStatus, formatImageUrl } from "../../lib/api";
import "./Orders.css";

const statusClass = {
  Delivered: "success",
  Processing: "warning",
  Confirmed: "success",
  Pending: "neutral",
  Cancelled: "danger",
  Shipped: "warning",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    delivered: 0,
    cancelled: 0,
    totalOrderValue: 0,
    totalPaidBooking: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Selected order for detailed modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [notification, setNotification] = useState("");

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 4000);
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await getAllOrders({ search, status: statusFilter });
      if (res && res.success) {
        setOrders(Array.isArray(res.orders) ? res.orders : []);
        if (res.stats) {
          setStats(res.stats);
        }
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Failed to load admin orders:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  // Handle Search submit / on Enter or typing
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const filteredOrders = useMemo(() => {
    if (!search.trim()) return orders;
    const q = search.toLowerCase().trim();
    return orders.filter((order) => {
      const customerName = (order.customerDetails?.fullName || "").toLowerCase();
      const customerMobile = (order.customerDetails?.mobile || "").toLowerCase();
      const customerCity = (order.customerDetails?.city || "").toLowerCase();
      const orderId = (order.orderId || "").toLowerCase();
      const vendor = (order.vendorName || "").toLowerCase();
      const itemNames = (order.items || []).map((i) => i.name).join(" ").toLowerCase();

      return (
        customerName.includes(q) ||
        customerMobile.includes(q) ||
        customerCity.includes(q) ||
        orderId.includes(q) ||
        vendor.includes(q) ||
        itemNames.includes(q)
      );
    });
  }, [orders, search]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      const res = await updateOrderStatus(orderId, { orderStatus: newStatus });
      if (res && res.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
        );
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder((prev) => ({ ...prev, orderStatus: newStatus }));
        }
        showNotification(`Order status updated to ${newStatus}`);
      }
    } catch (err) {
      alert("Failed to update status: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <section className="orders-page">
      <div className="admin-page-heading">
        <div>
          <h2>Order Management</h2>
          <p>Review customer orders, verify uploaded documents, and manage fulfillment.</p>
        </div>

        <button
          type="button"
          className="admin-btn-secondary"
          onClick={fetchOrders}
          disabled={loading}
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <FiRefreshCw className={loading ? "spin-icon" : ""} /> Refresh Orders
        </button>
      </div>

      {notification && (
        <div
          style={{
            background: "rgba(16, 185, 129, 0.15)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            color: "#34d399",
            padding: "10px 16px",
            borderRadius: "8px",
            marginBottom: "16px",
            fontWeight: "700",
            fontSize: "13.5px",
          }}
        >
          {notification}
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="orders-summary">
        <article className="admin-panel">
          <span>Total Orders</span>
          <strong>{stats.total}</strong>
        </article>

        <article className="admin-panel">
          <span>Pending / Processing</span>
          <strong style={{ color: "#ffd044" }}>{stats.pending}</strong>
        </article>

        <article className="admin-panel">
          <span>Delivered / Installed</span>
          <strong style={{ color: "#34d399" }}>{stats.delivered}</strong>
        </article>
      </div>

      <div className="admin-panel orders-table-panel">
        <div className="admin-toolbar">
          <label className="orders-search">
            <FiSearch />
            <input
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by customer, phone, order ID, product..."
            />
          </label>

          <select
            className="admin-filter-select"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter orders by status"
          >
            <option value="All">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID &amp; Date</th>
                <th>Product &amp; Image</th>
                <th>Customer Details</th>
                <th>House Owner</th>
                <th>Total / Paid (Token)</th>
                <th>Documents</th>
                <th>Vendor (Booked By)</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((order) => {
                const firstItem = (order.items && order.items[0]) || {};
                const extraItemsCount = (order.items?.length || 1) - 1;
                const formattedDate = order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "N/A";

                const isHouseOwner = order.customerDetails?.isHouseOwner === "Yes";

                return (
                  <tr key={order._id}>
                    {/* Order ID & Date */}
                    <td>
                      <strong style={{ color: "#ffd044", fontSize: "13px" }}>
                        {order.orderId}
                      </strong>
                      <div style={{ color: "#a89d8d", fontSize: "11px", marginTop: "2px" }}>
                        {formattedDate}
                      </div>
                    </td>

                    {/* Product & Image */}
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
                          style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "8px",
                            overflow: "hidden",
                            background: "#222",
                            flexShrink: 0,
                            border: "1px solid rgba(255, 208, 68, 0.2)",
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
                          <strong style={{ color: "#ffffff", fontSize: "13px", display: "block" }}>
                            {firstItem.name || "Solar System Product"}
                          </strong>
                          <span style={{ color: "#ffd044", fontSize: "11px" }}>
                            Qty: {firstItem.quantity || 1}
                            {extraItemsCount > 0 && ` (+${extraItemsCount} more)`}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Customer Details */}
                    <td>
                      <div style={{ fontSize: "12.5px" }}>
                        <strong>{order.customerDetails?.fullName}</strong>
                        <div style={{ color: "#a89d8d", fontSize: "11.5px" }}>
                          {order.customerDetails?.mobile}
                        </div>
                        <div style={{ color: "#777", fontSize: "11px" }}>
                          {order.customerDetails?.city}, {order.customerDetails?.state}
                        </div>
                      </div>
                    </td>

                    {/* House Owner Badge */}
                    <td>
                      {isHouseOwner ? (
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            fontSize: "11.5px",
                            fontWeight: "700",
                            background: "rgba(52, 211, 153, 0.15)",
                            color: "#34d399",
                            border: "1px solid rgba(52, 211, 153, 0.3)",
                          }}
                        >
                          Yes (Owner)
                        </span>
                      ) : (
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            fontSize: "11.5px",
                            fontWeight: "600",
                            background: "rgba(255, 255, 255, 0.08)",
                            color: "#a89d8d",
                          }}
                        >
                          No (Tenant)
                        </span>
                      )}
                    </td>

                    {/* Total / Paid */}
                    <td>
                      <div style={{ fontSize: "12.5px" }}>
                        <div style={{ color: "#a89d8d", fontSize: "11px" }}>
                          Total: ₹{(order.totalAmount || 0).toLocaleString("en-IN")}
                        </div>
                        <strong style={{ color: "#34d399", fontSize: "13.5px" }}>
                          Paid: ₹{(order.payableAmount || 1000).toLocaleString("en-IN")}
                        </strong>
                        <div style={{ color: "#f87171", fontSize: "10.5px" }}>
                          Bal: ₹{Math.max(0, (order.totalAmount || 0) - (order.payableAmount || 1000)).toLocaleString("en-IN")}
                        </div>
                      </div>
                    </td>

                    {/* Documents */}
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        {order.documents?.houseOwnerCertificate && (
                          <a
                            href={formatImageUrl(order.documents.houseOwnerCertificate)}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              fontSize: "11px",
                              color: "#ffd044",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              textDecoration: "underline",
                            }}
                          >
                            <FiFileText /> House Certificate
                          </a>
                        )}

                        {order.documents?.aadhaarCard && (
                          <a
                            href={formatImageUrl(order.documents.aadhaarCard)}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              fontSize: "11px",
                              color: "#60a5fa",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              textDecoration: "underline",
                            }}
                          >
                            <FiFileText /> Aadhaar Card
                          </a>
                        )}

                        {order.documents?.electricityBill && (
                          <a
                            href={formatImageUrl(order.documents.electricityBill)}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              fontSize: "11px",
                              color: "#34d399",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              textDecoration: "underline",
                            }}
                          >
                            <FiFileText /> Electricity Bill
                          </a>
                        )}

                        {!order.documents?.houseOwnerCertificate &&
                          !order.documents?.aadhaarCard &&
                          !order.documents?.electricityBill && (
                            <span style={{ color: "#666", fontSize: "11px" }}>No documents</span>
                          )}
                      </div>
                    </td>

                    {/* Vendor Booked By */}
                    <td>
                      <div style={{ fontSize: "12px" }}>
                        <strong style={{ color: "#ffffff" }}>
                          {order.vendorName || "Vendor"}
                        </strong>
                        {order.vendorCode && (
                          <span
                            style={{
                              display: "block",
                              fontFamily: "monospace",
                              color: "#ffd044",
                              fontSize: "11px",
                            }}
                          >
                            {order.vendorCode}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status dropdown */}
                    <td>
                      <select
                        className={`orders-status-select ${
                          statusClass[order.orderStatus] || "neutral"
                        }`}
                        value={order.orderStatus}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        disabled={updatingId === order._id}
                        aria-label={`Update ${order.orderId} status`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>

                    {/* Action Button */}
                    <td style={{ textAlign: "right" }}>
                      <button
                        type="button"
                        className="admin-btn-secondary"
                        style={{ padding: "5px 10px", fontSize: "12px" }}
                        onClick={() => setSelectedOrder(order)}
                        title="View Full Order Details"
                      >
                        <FiEye /> View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {!loading && filteredOrders.length === 0 && (
            <div className="admin-empty">No matching orders found.</div>
          )}

          {loading && (
            <div className="admin-empty" style={{ color: "#ffd044" }}>
              Loading orders...
            </div>
          )}
        </div>
      </div>

      {/* DETAILED ORDER MODAL */}
      {selectedOrder && (
        <div
          className="admin-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedOrder(null);
          }}
        >
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h3>
                <FiPackage style={{ color: "#ffd044" }} /> Order Details: {selectedOrder.orderId}
              </h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setSelectedOrder(null)}
              >
                <FiX />
              </button>
            </div>

            <div className="admin-modal-body">
              {/* Top Meta Bar */}
              <div
                style={{
                  background: "#181818",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  marginBottom: "16px",
                  border: "1px solid rgba(255,208,68,0.2)",
                  display: "flex",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                <div>
                  <span style={{ color: "#a89d8d", fontSize: "11px" }}>Order Date</span>
                  <div style={{ color: "#fff", fontWeight: "700", fontSize: "13px" }}>
                    {new Date(selectedOrder.createdAt).toLocaleString("en-IN")}
                  </div>
                </div>
                <div>
                  <span style={{ color: "#a89d8d", fontSize: "11px" }}>Status</span>
                  <div>
                    <span
                      className={`orders-status-select ${
                        statusClass[selectedOrder.orderStatus] || "neutral"
                      }`}
                      style={{ padding: "3px 10px", fontSize: "11.5px" }}
                    >
                      ● {selectedOrder.orderStatus}
                    </span>
                  </div>
                </div>
                <div>
                  <span style={{ color: "#a89d8d", fontSize: "11px" }}>Booked By (Vendor)</span>
                  <div style={{ color: "#ffd044", fontWeight: "700", fontSize: "13px" }}>
                    {selectedOrder.vendorName} ({selectedOrder.vendorCode || "N/A"})
                  </div>
                </div>
              </div>

              {/* Customer Details */}
              <div style={{ marginBottom: "18px" }}>
                <h4 style={{ color: "#ffd044", fontSize: "14px", marginBottom: "8px" }}>
                  <FiUser style={{ verticalAlign: "middle", marginRight: "6px" }} />
                  Customer Information
                </h4>
                <div
                  style={{
                    background: "#121212",
                    padding: "12px 14px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    fontSize: "13px",
                    lineHeight: "1.6",
                  }}
                >
                  <div>
                    <strong>Name: </strong> {selectedOrder.customerDetails?.fullName}
                  </div>
                  <div>
                    <strong>Mobile: </strong> {selectedOrder.customerDetails?.mobile}
                  </div>
                  {selectedOrder.customerDetails?.email && (
                    <div>
                      <strong>Email: </strong> {selectedOrder.customerDetails.email}
                    </div>
                  )}
                  <div>
                    <strong>Installation Address: </strong>{" "}
                    {selectedOrder.customerDetails?.address}, {selectedOrder.customerDetails?.city},{" "}
                    {selectedOrder.customerDetails?.state} - {selectedOrder.customerDetails?.pincode}
                  </div>
                  <div>
                    <strong>House Owner: </strong>{" "}
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
              </div>

              {/* Products in this order */}
              <div style={{ marginBottom: "18px" }}>
                <h4 style={{ color: "#ffd044", fontSize: "14px", marginBottom: "8px" }}>
                  <FiPackage style={{ verticalAlign: "middle", marginRight: "6px" }} />
                  Ordered Products ({selectedOrder.items?.length || 0})
                </h4>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {(selectedOrder.items || []).map((it, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: "#181818",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid rgba(255,208,68,0.15)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <img
                          src={formatImageUrl(it.image)}
                          alt={it.name}
                          style={{
                            width: "50px",
                            height: "50px",
                            borderRadius: "6px",
                            objectFit: "cover",
                            background: "#222",
                          }}
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=300&q=80";
                          }}
                        />
                        <div>
                          <strong style={{ color: "#fff", fontSize: "13px" }}>{it.name}</strong>
                          <div style={{ color: "#a89d8d", fontSize: "11.5px" }}>
                            ₹{it.price?.toLocaleString("en-IN")} × {it.quantity}
                          </div>
                        </div>
                      </div>
                      <strong style={{ color: "#ffd044", fontSize: "14px" }}>
                        ₹{(it.total || it.price * it.quantity).toLocaleString("en-IN")}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financials & Payment */}
              <div style={{ marginBottom: "18px" }}>
                <h4 style={{ color: "#ffd044", fontSize: "14px", marginBottom: "8px" }}>
                  <FiCreditCard style={{ verticalAlign: "middle", marginRight: "6px" }} />
                  Payment Summary
                </h4>
                <div
                  style={{
                    background: "#141414",
                    padding: "12px 14px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,208,68,0.2)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: "13px" }}>
                    <span style={{ color: "#a89d8d" }}>Total Order Catalog Value:</span>
                    <strong style={{ color: "#fff" }}>
                      ₹{selectedOrder.totalAmount?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: "13.5px" }}>
                    <span style={{ color: "#34d399", fontWeight: "700" }}>Paid Online (Booking Token):</span>
                    <strong style={{ color: "#34d399" }}>
                      ₹{(selectedOrder.payableAmount || 1000).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: "13px" }}>
                    <span style={{ color: "#f87171" }}>Remaining Balance (Due on Delivery):</span>
                    <strong style={{ color: "#f87171" }}>
                      ₹{Math.max(0, (selectedOrder.totalAmount || 0) - (selectedOrder.payableAmount || 1000)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </strong>
                  </div>
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: "6px", paddingTop: "6px", display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                    <span style={{ color: "#a89d8d" }}>Payment Mode:</span>
                    <span style={{ color: "#ffd044", fontWeight: "700" }}>{selectedOrder.paymentMethod || "Online Payment"}</span>
                  </div>
                </div>
              </div>

              {/* Uploaded Documents preview & download */}
              <div style={{ marginBottom: "18px" }}>
                <h4 style={{ color: "#ffd044", fontSize: "14px", marginBottom: "8px" }}>
                  <FiFileText style={{ verticalAlign: "middle", marginRight: "6px" }} />
                  Uploaded Verification Documents
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
                  {selectedOrder.documents?.houseOwnerCertificate && (
                    <div
                      style={{
                        padding: "10px 12px",
                        background: "rgba(255,208,68,0.08)",
                        border: "1px solid rgba(255,208,68,0.25)",
                        borderRadius: "8px",
                      }}
                    >
                      <strong style={{ color: "#ffd044", fontSize: "12px", display: "block" }}>
                        House Owner Certificate
                      </strong>
                      <a
                        href={formatImageUrl(selectedOrder.documents.houseOwnerCertificate)}
                        target="_blank"
                        rel="noreferrer"
                        className="admin-btn-secondary"
                        style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 8px", fontSize: "11px", marginTop: "6px" }}
                      >
                        <FiEye /> View Document
                      </a>
                    </div>
                  )}

                  {selectedOrder.documents?.aadhaarCard && (
                    <div
                      style={{
                        padding: "10px 12px",
                        background: "rgba(96,165,250,0.08)",
                        border: "1px solid rgba(96,165,250,0.25)",
                        borderRadius: "8px",
                      }}
                    >
                      <strong style={{ color: "#60a5fa", fontSize: "12px", display: "block" }}>
                        Aadhaar Card
                      </strong>
                      <a
                        href={formatImageUrl(selectedOrder.documents.aadhaarCard)}
                        target="_blank"
                        rel="noreferrer"
                        className="admin-btn-secondary"
                        style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 8px", fontSize: "11px", marginTop: "6px" }}
                      >
                        <FiEye /> View Document
                      </a>
                    </div>
                  )}

                  {selectedOrder.documents?.electricityBill && (
                    <div
                      style={{
                        padding: "10px 12px",
                        background: "rgba(52,211,153,0.08)",
                        border: "1px solid rgba(52,211,153,0.25)",
                        borderRadius: "8px",
                      }}
                    >
                      <strong style={{ color: "#34d399", fontSize: "12px", display: "block" }}>
                        Electricity Bill
                      </strong>
                      <a
                        href={formatImageUrl(selectedOrder.documents.electricityBill)}
                        target="_blank"
                        rel="noreferrer"
                        className="admin-btn-secondary"
                        style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 8px", fontSize: "11px", marginTop: "6px" }}
                      >
                        <FiEye /> View Document
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Update Quick Select */}
              <div style={{ marginTop: "16px" }}>
                <label style={{ color: "#ffd044", fontWeight: "700", fontSize: "13px", display: "block", marginBottom: "6px" }}>
                  Update Fulfillment Status:
                </label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {["Pending", "Processing", "Confirmed", "Shipped", "Delivered", "Cancelled"].map((st) => (
                    <button
                      key={st}
                      type="button"
                      className={`admin-btn-secondary ${selectedOrder.orderStatus === st ? "active" : ""}`}
                      style={{
                        padding: "6px 12px",
                        fontSize: "12px",
                        borderColor: selectedOrder.orderStatus === st ? "#ffd044" : undefined,
                        background: selectedOrder.orderStatus === st ? "#ffd044" : undefined,
                        color: selectedOrder.orderStatus === st ? "#000" : undefined,
                      }}
                      onClick={() => handleStatusChange(selectedOrder._id, st)}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="admin-modal-actions">
              <button
                type="button"
                className="admin-btn-primary"
                onClick={() => setSelectedOrder(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}