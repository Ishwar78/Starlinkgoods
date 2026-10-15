import React, { useEffect, useMemo, useState } from "react";
import {
  FiSearch,
  FiEye,
  FiX,
  FiTrash2,
  FiRefreshCw,
  FiMail,
  FiPhone,
  FiLoader,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import {
  getContactMessages,
  markContactMessageAsRead,
  deleteContactMessage,
} from "../../lib/api.js";

import "./ContactMessages.css";

export default function ContactMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [filter, setFilter] = useState("All");
  const [alertMsg, setAlertMsg] = useState("");

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await getContactMessages();
      if (res.success && Array.isArray(res.messages)) {
        setMessages(res.messages);
      }
    } catch (err) {
      console.error("Error fetching contact messages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const filteredMessages = useMemo(() => {
    const query = search.toLowerCase().trim();

    return messages.filter((message) => {
      const matchesSearch =
        `${message.name} ${message.email} ${message.phone || ""} ${message.subject} ${message.message}`
          .toLowerCase()
          .includes(query);

      const matchesFilter = filter === "All" || message.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [messages, search, filter]);

  const openMessage = async (message) => {
    setSelectedMessage(message);

    if (message.status === "Unread") {
      try {
        await markContactMessageAsRead(message._id);
        setMessages((previous) =>
          previous.map((item) =>
            item._id === message._id ? { ...item, status: "Read" } : item
          )
        );
      } catch (err) {
        console.error("Error marking message as read:", err);
      }
    }
  };

  const closeMessage = () => setSelectedMessage(null);

  const handleDelete = async (id, subject) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete message "${subject}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      const res = await deleteContactMessage(id);
      if (res.success) {
        setAlertMsg("Message deleted successfully.");
        setMessages((prev) => prev.filter((m) => m._id !== id));
        if (selectedMessage?._id === id) {
          setSelectedMessage(null);
        }
        setTimeout(() => setAlertMsg(""), 3000);
      }
    } catch (err) {
      console.error("Error deleting message:", err);
      alert(err.message || "Failed to delete message.");
    }
  };

  return (
    <section className="messages-page">
      <div className="admin-page-heading">
        <div>
          <h2>Contact Messages & Inquiries</h2>
          <p>Read, respond and manage customer enquiries submitted from the contact page.</p>
        </div>

        <button
          type="button"
          className="admin-primary-button"
          onClick={fetchMessages}
          title="Refresh messages"
        >
          <FiRefreshCw />
          <span>Refresh</span>
        </button>
      </div>

      {alertMsg && (
        <div className="admin-inline-message" role="status" style={{ marginBottom: 18 }}>
          <FiCheckCircle style={{ marginRight: 6 }} />
          <span>{alertMsg}</span>
        </div>
      )}

      <div className="messages-summary">
        <article className="admin-panel">
          <span>Total Inquiries</span>
          <strong>{messages.length}</strong>
        </article>

        <article className="admin-panel">
          <span>Unread Inquiries</span>
          <strong style={{ color: "#ffd044" }}>
            {messages.filter((item) => item.status === "Unread").length}
          </strong>
        </article>
      </div>

      <div className="admin-panel messages-table-panel">
        <div className="admin-toolbar">
          <label className="messages-search">
            <FiSearch />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, email, phone, subject..."
            />
          </label>

          <select
            className="admin-filter-select"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            aria-label="Filter messages"
          >
            <option value="All">All Inquiries ({messages.length})</option>
            <option value="Unread">
              Unread ({messages.filter((m) => m.status === "Unread").length})
            </option>
            <option value="Read">
              Read ({messages.filter((m) => m.status === "Read").length})
            </option>
          </select>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact</th>
                <th>Subject</th>
                <th>Inquiry Snippet</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "35px", color: "#a89d8d" }}>
                    <FiLoader className="spinning" style={{ marginRight: 8, verticalAlign: "middle" }} />
                    Loading contact messages from database...
                  </td>
                </tr>
              ) : filteredMessages.length > 0 ? (
                filteredMessages.map((message) => {
                  const dateStr = message.createdAt
                    ? new Date(message.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "Recently";

                  return (
                    <tr key={message._id}>
                      <td>
                        <strong>{message.name}</strong>
                      </td>
                      <td>
                        <div>
                          <FiMail style={{ marginRight: 5, fontSize: 11, color: "#ffd044" }} />
                          <small style={{ color: "#ffffff" }}>{message.email}</small>
                        </div>
                        {message.phone && (
                          <div style={{ marginTop: 2 }}>
                            <FiPhone style={{ marginRight: 5, fontSize: 11, color: "#ffd044" }} />
                            <small style={{ color: "#b5aba0" }}>{message.phone}</small>
                          </div>
                        )}
                      </td>
                      <td>
                        <strong style={{ color: "#ffd044" }}>{message.subject}</strong>
                      </td>
                      <td>
                        <span
                          title={message.message}
                          style={{
                            display: "inline-block",
                            maxWidth: "240px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            color: "#c4bba8",
                          }}
                        >
                          {message.message}
                        </span>
                      </td>
                      <td>{dateStr}</td>
                      <td>
                        <span
                          className={`admin-status ${
                            message.status === "Read" ? "success" : "warning"
                          }`}
                        >
                          ● {message.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <button
                            type="button"
                            className="message-view-button"
                            onClick={() => openMessage(message)}
                            title="View inquiry details"
                          >
                            <FiEye />
                            View
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(message._id, message.subject)}
                            className="admin-secondary-button"
                            style={{
                              padding: "6px 9px",
                              minHeight: "auto",
                              fontSize: 12,
                              color: "#f87171",
                              borderColor: "rgba(248, 113, 113, 0.4)",
                            }}
                            title="Delete inquiry"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="admin-empty">
                    {messages.length === 0
                      ? "No contact inquiries received yet from storefront."
                      : "No matching messages found for your search."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inquiry Detail Modal */}
      {selectedMessage && (
        <div
          className="message-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeMessage();
            }
          }}
        >
          <section
            className="message-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="message-modal-title"
          >
            <div className="message-modal-heading">
              <div>
                <span className="messages-modal-label">CUSTOMER INQUIRY</span>
                <h3 id="message-modal-title">{selectedMessage.subject}</h3>
              </div>

              <button
                type="button"
                onClick={closeMessage}
                aria-label="Close message"
                style={{
                  background: "transparent",
                  border: 0,
                  color: "#ffd044",
                  fontSize: 20,
                  cursor: "pointer",
                }}
              >
                <FiX />
              </button>
            </div>

            <div className="message-modal-customer">
              <strong>{selectedMessage.name}</strong>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 4 }}>
                <a
                  href={`mailto:${selectedMessage.email}`}
                  style={{ color: "#ffd044", display: "inline-flex", alignItems: "center", gap: 5 }}
                >
                  <FiMail /> {selectedMessage.email}
                </a>
                {selectedMessage.phone && (
                  <a
                    href={`tel:${selectedMessage.phone}`}
                    style={{ color: "#ffd044", display: "inline-flex", alignItems: "center", gap: 5 }}
                  >
                    <FiPhone /> {selectedMessage.phone}
                  </a>
                )}
              </div>
              <small style={{ display: "block", marginTop: 6, color: "#8c8376" }}>
                Received on:{" "}
                {selectedMessage.createdAt
                  ? new Date(selectedMessage.createdAt).toLocaleString("en-IN")
                  : "Recently"}
              </small>
            </div>

            <div
              className="message-modal-body"
              style={{
                background: "#181818",
                padding: "16px",
                borderRadius: "9px",
                border: "1px solid rgba(255, 199, 45, 0.2)",
                color: "#f5f5f5",
                lineHeight: 1.7,
                whiteSpace: "pre-wrap",
                margin: "16px 0",
              }}
            >
              {selectedMessage.message}
            </div>

            <div className="message-modal-actions" style={{ display: "flex", gap: 10 }}>
              {/* <a
                className="admin-primary-button"
                href={`mailto:${selectedMessage.email}?subject=${encodeURIComponent(
                  `Re: ${selectedMessage.subject}`
                )}`}
              >
                Reply via Email
              </a> */}

              <button
                type="button"
                className="admin-secondary-button"
                onClick={() => handleDelete(selectedMessage._id, selectedMessage.subject)}
                style={{ color: "#f87171", borderColor: "rgba(248, 113, 113, 0.4)" }}
              >
                <FiTrash2 /> Delete
              </button>

              <button
                type="button"
                className="admin-secondary-button"
                onClick={closeMessage}
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}