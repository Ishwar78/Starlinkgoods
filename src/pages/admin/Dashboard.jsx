import React from "react";
import {
  FiUsers,
  FiPackage,
  FiShoppingBag,
  FiDollarSign,
  FiArrowUpRight,
  FiArrowRight,
} from "react-icons/fi";
import { Link } from "react-router-dom";

import "./Dashboard.css";

const metrics = [
  {
    label: "Total Revenue",
    value: "₹2,48,650",
    change: "+12.8%",
    note: "compared to last month",
    icon: FiDollarSign,
    tone: "sand",
  },
  {
    label: "Total Orders",
    value: "384",
    change: "+8.2%",
    note: "compared to last month",
    icon: FiShoppingBag,
    tone: "olive",
  },
  {
    label: "Total Products",
    value: "126",
    change: "+4 new",
    note: "products in catalogue",
    icon: FiPackage,
    tone: "clay",
  },
  {
    label: "Registered Users",
    value: "1,842",
    change: "+16.4%",
    note: "customer accounts",
    icon: FiUsers,
    tone: "gold",
  },
];

const orders = [
  {
    id: "#HS-1048",
    customer: "Aarav Sharma",
    item: "Nordic 3-Seater Sofa",
    amount: "₹42,999",
    status: "Delivered",
    tone: "success",
  },
  {
    id: "#HS-1047",
    customer: "Meera Kapoor",
    item: "CloudRest Mattress",
    amount: "₹18,500",
    status: "Processing",
    tone: "warning",
  },
  {
    id: "#HS-1046",
    customer: "Rohan Verma",
    item: "Oak Dining Set",
    amount: "₹31,200",
    status: "Pending",
    tone: "neutral",
  },
  {
    id: "#HS-1045",
    customer: "Ananya Singh",
    item: "Luna Accent Chair",
    amount: "₹12,750",
    status: "Cancelled",
    tone: "danger",
  },
];

const chartBars = [
  42, 57, 49, 76, 61, 88, 69, 95, 72, 83, 64, 100,
];

const chartMonths = [
  "N", "D", "J", "F", "M", "A",
  "M", "J", "J", "A", "S", "O",
];

export default function Dashboard() {
  return (
    <div className="admin-dashboard">
      <div className="admin-page-heading">
        <div>
          <h2>Store overview</h2>
          <p>
            Here’s what’s happening with your furniture store today.
          </p>
        </div>

        <span className="dashboard-date">
          OVERVIEW · THIS MONTH
        </span>
      </div>

      <section className="dashboard-metrics">
        {metrics.map(
          ({ label, value, change, note, icon: Icon, tone }) => (
            <article className="dashboard-metric-card" key={label}>
              <div className="dashboard-metric-top">
                <span>{label}</span>
                <span className={`dashboard-metric-icon ${tone}`}>
                  <Icon />
                </span>
              </div>

              <strong className="dashboard-metric-value">
                {value}
              </strong>

              <div className="dashboard-metric-foot">
                <span>{change}</span>
                <small>{note}</small>
              </div>
            </article>
          )
        )}
      </section>

      <section className="dashboard-main-grid">
        <article className="admin-panel dashboard-sales-panel">
          <div className="admin-panel-title">
            <div>
              <h3>Sales overview</h3>
              <p>Illustrative monthly revenue trend</p>
            </div>

            <span className="dashboard-period">
              Last 12 months
            </span>
          </div>

          <div className="dashboard-chart-summary">
            <strong>₹2.48L</strong>
            <span>
              <FiArrowUpRight />
              12.8%
            </span>
          </div>

          <div
            className="dashboard-chart"
            role="img"
            aria-label="Illustrative monthly sales bar chart"
          >
            {chartBars.map((height, index) => (
              <div
                className="dashboard-chart-column"
                key={`${chartMonths[index]}-${index}`}
              >
                <span style={{ height: `${height}%` }} />
                <small>{chartMonths[index]}</small>
              </div>
            ))}
          </div>

          <p className="dashboard-chart-note">
            Demo visualization — connect your sales API for live figures.
          </p>
        </article>

        <article className="admin-panel dashboard-shortcuts-panel">
          <div className="admin-panel-title">
            <div>
              <h3>Quick actions</h3>
              <p>Manage your store faster</p>
            </div>
          </div>

          <div className="dashboard-shortcuts">
            <Link to="/admin/products">
              <span className="shortcut-icon">
                <FiPackage />
              </span>
              <span>
                <strong>Add a product</strong>
                <small>Update your catalogue</small>
              </span>
              <FiArrowRight />
            </Link>

            <Link to="/admin/orders">
              <span className="shortcut-icon">
                <FiShoppingBag />
              </span>
              <span>
                <strong>Review orders</strong>
                <small>Track customer purchases</small>
              </span>
              <FiArrowRight />
            </Link>

            <Link to="/admin/users">
              <span className="shortcut-icon">
                <FiUsers />
              </span>
              <span>
                <strong>Manage users</strong>
                <small>View customer accounts</small>
              </span>
              <FiArrowRight />
            </Link>
          </div>
        </article>
      </section>

      <section className="admin-panel dashboard-orders-panel">
        <div className="admin-panel-title">
          <div>
            <h3>Recent orders</h3>
            <p>Latest sample transactions from your store</p>
          </div>

          <Link to="/admin/orders" className="dashboard-view-all">
            View all <FiArrowRight />
          </Link>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td><strong>{order.id}</strong></td>
                  <td>{order.customer}</td>
                  <td>{order.item}</td>
                  <td><strong>{order.amount}</strong></td>
                  <td>
                    <span className={`admin-status ${order.tone}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}