import React, { useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";

import "./Orders.css";

const initialOrders = [
  {
    id: "#HS-1048",
    customer: "Aarav Sharma",
    product: "Nordic 3-Seater Sofa",
    amount: 42999,
    date: "12 Oct 2026",
    status: "Delivered",
  },
  {
    id: "#HS-1047",
    customer: "Meera Kapoor",
    product: "CloudRest Mattress",
    amount: 18500,
    date: "12 Oct 2026",
    status: "Processing",
  },
  {
    id: "#HS-1046",
    customer: "Rohan Verma",
    product: "Oak Dining Set",
    amount: 31200,
    date: "11 Oct 2026",
    status: "Pending",
  },
  {
    id: "#HS-1045",
    customer: "Ananya Singh",
    product: "Luna Accent Chair",
    amount: 12750,
    date: "10 Oct 2026",
    status: "Cancelled",
  },
];

const formatPrice = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const statusClass = {
  Delivered: "success",
  Processing: "warning",
  Pending: "neutral",
  Cancelled: "danger",
  Shipped: "success",
};

export default function Orders() {
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredOrders = useMemo(() => {
    const query = search.toLowerCase().trim();

    return orders.filter((order) => {
      const matchesSearch =
        `${order.id} ${order.customer} ${order.product}`
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "All" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const updateStatus = (orderId, status) => {
    setOrders((previous) =>
      previous.map((order) =>
        order.id === orderId ? { ...order, status } : order
      )
    );
  };

  return (
    <section className="orders-page">
      <div className="admin-page-heading">
        <div>
          <h2>Order management</h2>
          <p>Review purchases and update order fulfillment status.</p>
        </div>
      </div>

      <div className="orders-summary">
        <article className="admin-panel">
          <span>Total orders</span>
          <strong>{orders.length}</strong>
        </article>

        <article className="admin-panel">
          <span>Processing</span>
          <strong>
            {orders.filter((order) => order.status === "Processing").length}
          </strong>
        </article>

        <article className="admin-panel">
          <span>Delivered</span>
          <strong>
            {orders.filter((order) => order.status === "Delivered").length}
          </strong>
        </article>
      </div>

      <div className="admin-panel orders-table-panel">
        <div className="admin-toolbar">
          <label className="orders-search">
            <FiSearch />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search order, customer or product..."
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
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td><strong>{order.id}</strong></td>
                  <td>{order.customer}</td>
                  <td>{order.product}</td>
                  <td>{formatPrice(order.amount)}</td>
                  <td>{order.date}</td>
                  <td>
                    <select
                      className={`orders-status-select ${
                        statusClass[order.status] || "neutral"
                      }`}
                      value={order.status}
                      onChange={(event) =>
                        updateStatus(order.id, event.target.value)
                      }
                      aria-label={`Update ${order.id} status`}
                    >
                      <option>Pending</option>
                      <option>Processing</option>
                      <option>Shipped</option>
                      <option>Delivered</option>
                      <option>Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredOrders.length === 0 && (
            <div className="admin-empty">No matching orders found.</div>
          )}
        </div>
      </div>
    </section>
  );
}