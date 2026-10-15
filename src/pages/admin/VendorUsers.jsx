import React, { useEffect, useMemo, useState } from "react";
import {
  FiUsers,
  FiSearch,
  FiTrash2,
  FiCheckCircle,
  FiAlertCircle,
  FiPhone,
  FiMapPin,
  FiUserCheck,
  FiRefreshCw,
  FiShield,
  FiLoader,
} from "react-icons/fi";
import {
  getAllVendorUsers,
  deleteVendorUser,
  toggleVendorUserStatus,
} from "../../lib/api.js";
import "./VendorUsers.css";

export default function VendorUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      const res = await getAllVendorUsers();
      if (res.success && Array.isArray(res.users)) {
        setUsers(res.users);
      }
    } catch (err) {
      console.error("Error fetching vendor users:", err);
      setMessage(err.message || "Failed to load vendor users from database.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete user "${name}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      const res = await deleteVendorUser(id);
      if (res.success) {
        setMessage(`User "${name}" deleted successfully.`);
        setMessageType("success");
        fetchAllUsers();
      }
    } catch (err) {
      console.error("Delete user error:", err);
      setMessage(err.message || "Failed to delete user.");
      setMessageType("error");
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === "Active" ? "Inactive" : "Active";
    try {
      const res = await toggleVendorUserStatus(id, nextStatus);
      if (res.success) {
        setMessage(`User status updated to ${nextStatus}.`);
        setMessageType("success");
        fetchAllUsers();
      }
    } catch (err) {
      console.error("Toggle status error:", err);
      setMessage(err.message || "Failed to update status.");
      setMessageType("error");
    }
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;

    return users.filter((u) =>
      [
        u.name,
        u.email,
        u.mobile,
        u.city,
        u.state,
        u.vendorName,
        u.vendorEmail,
        u.vendorMobile,
        u.status,
      ]
        .filter(Boolean)
        .some((val) => val.toLowerCase().includes(query))
    );
  }, [users, search]);

  // Unique vendors count
  const uniqueVendorsCount = useMemo(() => {
    const vendorSet = new Set();
    users.forEach((u) => {
      if (u.vendorName || u.vendorEmail) {
        vendorSet.add(u.vendorEmail || u.vendorName);
      }
    });
    return vendorSet.size;
  }, [users]);

  const activeCount = users.filter((u) => u.status === "Active").length;

  return (
    <section className="vendor-users-page">
      {/* Page Header */}
      <div className="vu-page-header">
        <div className="vu-header-title">
          <h2>Vendor Users Management</h2>
          <p>View and manage all customer accounts created by vendors across the platform.</p>
        </div>

        <button
          type="button"
          className="vu-refresh-button"
          onClick={fetchAllUsers}
          title="Refresh database records"
        >
          <FiRefreshCw />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Alert / Status Message */}
      {message && (
        <div className={`vu-alert ${messageType}`} role="status">
          {messageType === "error" ? (
            <FiAlertCircle style={{ flexShrink: 0, fontSize: 16 }} />
          ) : (
            <FiCheckCircle style={{ flexShrink: 0, fontSize: 16 }} />
          )}
          <span>{message}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="vu-stats-grid">
        <div className="vu-stat-card">
          <div className="vu-stat-icon gold">
            <FiUsers />
          </div>
          <div className="vu-stat-info">
            <span className="vu-stat-label">Total Vendor Users</span>
            <h3 className="vu-stat-value">{users.length}</h3>
          </div>
        </div>

        <div className="vu-stat-card">
          <div className="vu-stat-icon green">
            <FiUserCheck />
          </div>
          <div className="vu-stat-info">
            <span className="vu-stat-label">Active Users</span>
            <h3 className="vu-stat-value">{activeCount}</h3>
          </div>
        </div>

        <div className="vu-stat-card">
          <div className="vu-stat-icon blue">
            <FiShield />
          </div>
          <div className="vu-stat-info">
            <span className="vu-stat-label">Contributing Vendors</span>
            <h3 className="vu-stat-value">{uniqueVendorsCount}</h3>
          </div>
        </div>
      </div>

      {/* Main Table Panel */}
      <div className="vu-panel">
        <div className="vu-toolbar">
          <div className="vu-toolbar-title">
            <h3>Registered Users Directory ({filteredUsers.length})</h3>
            <p>Real-time database list of users added by vendors</p>
          </div>

          <label className="vu-search-bar">
            <FiSearch />
            <input
              type="search"
              placeholder="Search user, vendor, mobile, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        </div>

        <div className="vu-table-wrap">
          <table className="vu-table">
            <thead>
              <tr>
                <th className="vu-col-idx">#</th>
                <th>User Profile</th>
                <th>Mobile No</th>
                <th>Location</th>
                <th>Created By Vendor</th>
                <th>Status</th>
                <th>Registered On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="vu-empty-cell">
                    <FiLoader className="spinning" style={{ marginRight: 8, verticalAlign: "middle" }} />
                    Loading vendor users from database...
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((u, idx) => {
                  const dateStr = u.createdAt
                    ? new Date(u.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "—";

                  const initial = (u.name || "U").charAt(0).toUpperCase();

                  return (
                    <tr key={u._id}>
                      <td className="vu-col-idx">{idx + 1}</td>

                      {/* User Profile */}
                      <td>
                        <div className="vu-user-cell">
                          <span className="vu-user-avatar">{initial}</span>
                          <div className="vu-user-meta">
                            <strong>{u.name}</strong>
                            <small>{u.email}</small>
                          </div>
                        </div>
                      </td>

                      {/* Mobile */}
                      <td>
                        <div className="vu-icon-meta">
                          <FiPhone />
                          <strong>{u.mobile}</strong>
                        </div>
                      </td>

                      {/* Location */}
                      <td>
                        <div className="vu-icon-meta">
                          <FiMapPin />
                          <span>{u.city}, {u.state}</span>
                        </div>
                      </td>

                      {/* Created By Vendor */}
                      <td>
                        <div className="vu-vendor-badge">
                          <span className="vu-vendor-name">{u.vendorName || "Direct Vendor"}</span>
                          {u.vendorEmail && (
                            <span className="vu-vendor-contact">{u.vendorEmail}</span>
                          )}
                          {u.vendorMobile && (
                            <span className="vu-vendor-contact">📞 {u.vendorMobile}</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        <button
                          type="button"
                          className="vu-status-btn"
                          onClick={() => handleToggleStatus(u._id, u.status)}
                          title="Click to toggle status"
                        >
                          <span
                            className={`vu-status-pill ${
                              u.status === "Active" ? "active" : "inactive"
                            }`}
                          >
                            ● {u.status || "Active"}
                          </span>
                        </button>
                      </td>

                      {/* Registered Date */}
                      <td>
                        <span className="vu-date">{dateStr}</span>
                      </td>

                      {/* Actions */}
                      <td>
                        <button
                          type="button"
                          className="vu-delete-btn"
                          title={`Delete ${u.name}`}
                          onClick={() => handleDelete(u._id, u.name)}
                          aria-label={`Delete ${u.name}`}
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="vu-empty-cell">
                    {users.length === 0
                      ? "No vendor users added yet in the database."
                      : "No users match your search query."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
