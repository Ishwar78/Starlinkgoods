
import React, { useState } from "react";
import {
  FiSearch,
  FiShoppingBag,
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiEye,
  FiX,
} from "react-icons/fi";
import "./Orders.css";

const initialOrders = [
  {
    id: "HS1025",
    product: "Premium Wooden Chair",
    category: "Living Room",
    date: "12 Oct 2026",
    amount: 4500,
    status: "Delivered",
    quantity: 1,
  },
  {
    id: "HS1024",
    product: "Modern Coffee Table",
    category: "Furniture",
    date: "10 Oct 2026",
    amount: 6200,
    status: "Processing",
    quantity: 1,
  },
  {
    id: "HS1023",
    product: "Luxury Sofa Set",
    category: "Living Room",
    date: "08 Oct 2026",
    amount: 24999,
    status: "Shipped",
    quantity: 1,
  },
  {
    id: "HS1022",
    product: "Bedside Table",
    category: "Bedroom",
    date: "05 Oct 2026",
    amount: 3200,
    status: "Cancelled",
    quantity: 2,
  },
];

const Orders = () => {
  const [orders] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem("userData") || "{}");
      const userOrdersKey = `slg_orders_${u._id || u.id || u.email || "guest"}`;
      const saved = JSON.parse(localStorage.getItem(userOrdersKey) || "[]");
      if (Array.isArray(saved) && saved.length > 0) {
        const formatted = saved.map((o) => ({
          id: o.id.startsWith("#") ? o.id : `#${o.id}`,
          product: o.items?.[0]?.name
            ? `${o.items[0].name}${o.items.length > 1 ? ` (+${o.items.length - 1} more)` : ""}`
            : "Furniture Procurement",
          category: o.items?.[0]?.category || "Furniture",
          date: o.date,
          amount: o.amount,
          status: o.status || "Processing",
          quantity: o.items?.reduce((s, it) => s + (it.quantity || 1), 0) || 1,
          items: o.items,
          shippingInfo: o.shippingInfo,
          paymentMethod: o.paymentMethod,
        }));
        return [...formatted, ...initialOrders];
      }
    } catch {
      // fallback
    }
    return initialOrders;
  });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      `${order.id} ${order.product} ${order.category}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const deliveredCount = orders.filter((order) => order.status === "Delivered").length;
  const activeCount = orders.filter((order) =>
    ["Processing", "Shipped"].includes(order.status)
  ).length;
  const totalOrders = orders.length;

  return (
    <div className="orders-page">
      <div className="orders-page-heading">
        <div>
          <span className="orders-eyebrow">PURCHASE MANAGEMENT</span>
          <h1>My Orders</h1>
          <p>View your purchases and check their current status.</p>
        </div>
      </div>

      <section className="orders-summary-grid">
        <article className="orders-summary-card">
          <span className="orders-summary-icon"><FiShoppingBag /></span>
          <div>
            <p>Total Orders</p>
            <h3>{totalOrders}</h3>
          </div>
        </article>

        <article className="orders-summary-card">
          <span className="orders-summary-icon processing"><FiPackage /></span>
          <div>
            <p>In Progress</p>
            <h3>{activeCount}</h3>
          </div>
        </article>

        <article className="orders-summary-card">
          <span className="orders-summary-icon delivered"><FiCheckCircle /></span>
          <div>
            <p>Delivered</p>
            <h3>{deliveredCount}</h3>
          </div>
        </article>
      </section>

      <section className="orders-list-card">
        <div className="orders-list-heading">
          <div>
            <h2>Order History</h2>
            <p>Find and review your previous orders.</p>
          </div>

          <div className="orders-filters">
            <label className="orders-search">
              <FiSearch />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search orders..."
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
                <th>Order</th>
                <th>Product</th>
                <th>Order Date</th>
                <th>Quantity</th>
                <th>Total</th>
                <th>Status</th>
                <th>Details</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td className="orders-id">#{order.id}</td>
                  <td>
                    <div className="orders-product">
                      <span className="orders-product-icon"><FiPackage /></span>
                      <div>
                        <strong>{order.product}</strong>
                        <small>{order.category}</small>
                      </div>
                    </div>
                  </td>
                  <td>{order.date}</td>
                  <td>{order.quantity}</td>
                  <td className="orders-amount">
                    ₹{order.amount.toLocaleString("en-IN")}
                  </td>
                  <td>
                    <span className={`orders-status ${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="orders-view-button"
                      onClick={() => setSelectedOrder(order)}
                      aria-label={`View order ${order.id}`}
                    >
                      <FiEye /> View
                    </button>
                  </td>
                </tr>
              ))}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="7" className="orders-empty">
                    No orders match your search or selected status.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedOrder && (
        <div
          className="orders-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedOrder(null);
          }}
        >
          <section
            className="orders-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="orders-modal-title"
          >
            <div className="orders-modal-heading">
              <div>
                <span>ORDER DETAILS</span>
                <h2 id="orders-modal-title">#{selectedOrder.id}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                aria-label="Close order details"
              >
                <FiX />
              </button>
            </div>

            <div className="orders-modal-product">
              <span className="orders-product-icon large"><FiPackage /></span>
              <div>
                <h3>{selectedOrder.product}</h3>
                <p>{selectedOrder.category}</p>
              </div>
            </div>

            <div className="orders-detail-row">
              <span>Order date</span>
              <strong>{selectedOrder.date}</strong>
            </div>
            <div className="orders-detail-row">
              <span>Quantity</span>
              <strong>{selectedOrder.quantity}</strong>
            </div>
            <div className="orders-detail-row">
              <span>Payment total</span>
              <strong>₹{selectedOrder.amount.toLocaleString("en-IN")}</strong>
            </div>
            <div className="orders-detail-row">
              <span>Order status</span>
              <strong className={`orders-detail-status ${selectedOrder.status.toLowerCase()}`}>
                {selectedOrder.status}
              </strong>
            </div>

            {selectedOrder.status === "Shipped" && (
              <p className="orders-modal-note"><FiTruck /> This is sample tracking information. Connect your shipping API for live updates.</p>
            )}

            <button
              type="button"
              className="orders-modal-close"
              onClick={() => setSelectedOrder(null)}
            >
              Close Details
            </button>
          </section>
        </div>
      )}
    </div>
  );
};

export default Orders;
