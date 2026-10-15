import React, { useState, useEffect, useMemo } from "react";
import {
  FiUserPlus,
  FiSearch,
  FiTrash2,
  FiUsers,
  FiCheckCircle,
  FiAlertCircle,
  FiLoader,
} from "react-icons/fi";
import {
  createVendorUser,
  getMyVendorUsers,
  deleteVendorUser,
} from "../../lib/api";
import "./AddUser.css";

const AddUser = () => {
  const [userData] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("userData") || "{}");
    } catch {
      return {};
    }
  });

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    city: "",
    state: "",
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getMyVendorUsers({
        vendorId: userData._id || userData.id,
        vendorEmail: userData.email,
      });
      if (res.success && Array.isArray(res.users)) {
        setUsers(res.users);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error("Error fetching vendor users:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [userData._id, userData.email]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.mobile.trim() ||
      !form.city.trim() ||
      !form.state.trim()
    ) {
      setMessage("Please fill in all required fields (Name, Email, Mobile, City, State).");
      setMessageType("error");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        mobile: form.mobile.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        vendorId: userData._id || userData.id,
        vendorName: userData.name || "Vendor",
        vendorEmail: userData.email || "",
        vendorMobile: userData.mobile || "",
      };

      const res = await createVendorUser(payload);

      if (res.success) {
        setMessage(`User "${form.name}" added successfully and saved to database!`);
        setMessageType("success");
        setForm({
          name: "",
          email: "",
          mobile: "",
          city: "",
          state: "",
        });
        fetchUsers();
      } else {
        setMessage(res.message || "Failed to add user.");
        setMessageType("error");
      }
    } catch (err) {
      console.error("Create user error:", err);
      setMessage(err.message || "Failed to add user.");
      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  };

  const removeUser = async (id, userName) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove user "${userName}" from the database?`
    );
    if (!confirmed) return;

    try {
      const res = await deleteVendorUser(id);
      if (res.success) {
        setMessage(`User "${userName}" deleted successfully.`);
        setMessageType("success");
        fetchUsers();
      }
    } catch (err) {
      console.error("Delete user error:", err);
      setMessage(err.message || "Failed to delete user.");
      setMessageType("error");
    }
  };

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((user) =>
      [user.name, user.email, user.mobile, user.city, user.state]
        .filter(Boolean)
        .some((val) => val.toLowerCase().includes(q))
    );
  }, [users, search]);

  return (
    <div className="add-user-page">
      <div className="add-user-heading">
        <div>
          <span className="add-user-eyebrow">USER MANAGEMENT</span>
          <h1>Add User</h1>
          <p>Create and manage customer accounts directly linked to your vendor profile.</p>
        </div>
        <div className="add-user-count">
          <FiUsers />
          <span>{users.length} Registered Users</span>
        </div>
      </div>

      {message && (
        <div className={`add-user-message ${messageType}`} role="status">
          {messageType === "error" ? (
            <FiAlertCircle style={{ flexShrink: 0 }} />
          ) : (
            <FiCheckCircle style={{ flexShrink: 0 }} />
          )}
          <span>{message}</span>
        </div>
      )}

      {/* Add User Form */}
      <section className="add-user-form-card">
        <div className="add-user-section-heading">
          <div className="add-user-heading-icon">
            <FiUserPlus />
          </div>
          <div>
            <h2>User Information</h2>
            <p>Enter the details below to save the user into the database.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="add-user-form-grid">
            <div className="add-user-field">
              <label htmlFor="add-user-name">User Name *</label>
              <input
                id="add-user-name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter full name"
                required
              />
            </div>

            <div className="add-user-field">
              <label htmlFor="add-user-email">Email Address *</label>
              <input
                id="add-user-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="user@example.com"
                required
              />
            </div>

            <div className="add-user-field">
              <label htmlFor="add-user-mobile">Mobile Number *</label>
              <input
                id="add-user-mobile"
                name="mobile"
                type="tel"
                value={form.mobile}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                required
              />
            </div>

            <div className="add-user-field">
              <label htmlFor="add-user-city">City *</label>
              <input
                id="add-user-city"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Enter city (e.g. Rohtak, Delhi)"
                required
              />
            </div>

            <div className="add-user-field" style={{ gridColumn: "span 2" }}>
              <label htmlFor="add-user-state">State *</label>
              <input
                id="add-user-state"
                name="state"
                value={form.state}
                onChange={handleChange}
                placeholder="Enter state (e.g. Haryana, Rajasthan)"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="add-user-submit"
            disabled={submitting}
            style={{ opacity: submitting ? 0.75 : 1, cursor: submitting ? "not-allowed" : "pointer" }}
          >
            {submitting ? (
              <>
                <FiLoader className="spinning" /> Saving User...
              </>
            ) : (
              <>
                <FiUserPlus /> Add User
              </>
            )}
          </button>
        </form>
      </section>

      {/* Users List Table */}
      <section className="add-user-list-card">
        <div className="add-user-list-heading">
          <div>
            <h2>My Registered Users</h2>
            <p>All users added under your vendor account stored in database.</p>
          </div>

          <div className="add-user-search">
            <FiSearch />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, email, phone, city..."
              aria-label="Search users"
            />
          </div>
        </div>

        <div className="add-user-table-wrap">
          <table className="add-user-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Mobile</th>
                <th>City & State</th>
                <th>Status</th>
                <th>Added Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="add-user-empty">
                    <FiLoader className="spinning" style={{ marginRight: 8 }} /> Loading your users from database...
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const dateStr = user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "Recently";

                  return (
                    <tr key={user._id || user.id}>
                      <td>
                        <div className="add-user-person">
                          <span>{(user.name || "U").charAt(0).toUpperCase()}</span>
                          <div>
                            <strong>{user.name}</strong>
                            <small>{user.email}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <strong>{user.mobile}</strong>
                      </td>
                      <td>
                        {user.city}, {user.state}
                      </td>
                      <td>
                        <span
                          className="add-user-role-badge"
                          style={{
                            background: user.status === "Active" ? "#edfbf3" : "#fdf2f2",
                            color: user.status === "Active" ? "#147443" : "#b91c1c",
                            border: `1px solid ${user.status === "Active" ? "#c3edd3" : "#fecaca"}`,
                          }}
                        >
                          ● {user.status || "Active"}
                        </span>
                      </td>
                      <td>{dateStr}</td>
                      <td>
                        <button
                          type="button"
                          className="add-user-delete"
                          onClick={() => removeUser(user._id, user.name)}
                          aria-label={`Remove ${user.name}`}
                          title={`Delete ${user.name}`}
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="add-user-empty">
                    {users.length === 0
                      ? "No users added yet. Use the form above to add your first user into the database."
                      : "No matching users found."}
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

export default AddUser;
