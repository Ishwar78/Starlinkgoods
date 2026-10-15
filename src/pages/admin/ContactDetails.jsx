import React, { useEffect, useState } from "react";
import {
  FiSave,
  FiPhone,
  FiMail,
  FiMapPin,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiLoader,
  FiInfo,
  FiExternalLink,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { getContactInfo, updateContactInfo } from "../../lib/api.js";

export default function ContactDetails() {
  const [form, setForm] = useState({
    phone: "",
    email: "",
    address: "",
    timing: "",
    days: "",
    supportNote: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        setLoading(true);
        const res = await getContactInfo();
        if (res.success && res.info) {
          setForm({
            phone: res.info.phone || "",
            email: res.info.email || "",
            address: res.info.address || "",
            timing: res.info.timing || "",
            days: res.info.days || "",
            supportNote: res.info.supportNote || "",
          });
        }
      } catch (err) {
        console.error("Error fetching contact details:", err);
        setMessage("Failed to load existing contact information.");
        setMessageType("error");
      } finally {
        setLoading(false);
      }
    };

    fetchInfo();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!form.phone.trim() || !form.email.trim() || !form.address.trim()) {
      setMessage("Phone, Email, and Store Address are required.");
      setMessageType("error");
      return;
    }

    try {
      setSaving(true);
      const res = await updateContactInfo(form);
      if (res.success) {
        setMessage("Store contact details updated successfully and live on the website!");
        setMessageType("success");
      } else {
        setMessage(res.message || "Failed to update contact details.");
        setMessageType("error");
      }
    } catch (err) {
      console.error("Error saving contact details:", err);
      setMessage(err.message || "Error saving contact details.");
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-heading">
        <div>
          <h2>Contact Page Details Settings</h2>
          <p>
            Update contact numbers, email, showroom address, and operating hours shown on the Contact page.
          </p>
        </div>

        <Link
          to="/contact"
          target="_blank"
          rel="noopener noreferrer"
          className="admin-secondary-button"
          title="Preview Contact Page"
        >
          <FiExternalLink />
          <span>View Live Contact Page</span>
        </Link>
      </div>

      {message && (
        <div
          className={`admin-inline-message ${
            messageType === "error" ? "error" : ""
          }`}
          role="status"
          style={{ marginBottom: 22 }}
        >
          {messageType === "error" ? (
            <FiAlertCircle style={{ marginRight: 6, verticalAlign: "middle" }} />
          ) : (
            <FiCheckCircle style={{ marginRight: 6, verticalAlign: "middle" }} />
          )}
          {message}
        </div>
      )}

      {loading ? (
        <div className="admin-panel" style={{ textAlign: "center", padding: "45px", color: "#a89d8d" }}>
          <FiLoader className="spinning" style={{ marginRight: 8, verticalAlign: "middle" }} />
          Loading contact information...
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "24px", alignItems: "start" }}>
          {/* Edit Form */}
          <form className="admin-panel" onSubmit={handleSubmit}>
            <div className="admin-panel-title">
              <div>
                <h3>Edit Contact Details</h3>
                <p>Modify the values below and save changes.</p>
              </div>
            </div>

            <div className="admin-form-grid">
              <div className="admin-form-field">
                <label htmlFor="contact-phone">
                  <FiPhone style={{ marginRight: 5, verticalAlign: "middle" }} />
                  Customer Support Phone / Mobile *
                </label>
                <input
                  id="contact-phone"
                  name="phone"
                  type="text"
                  placeholder="+91 93062 82979"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="admin-form-field">
                <label htmlFor="contact-email">
                  <FiMail style={{ marginRight: 5, verticalAlign: "middle" }} />
                  Support Email Address *
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  placeholder="support@starlinkgoods.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="admin-form-field">
                <label htmlFor="contact-days">
                  <FiClock style={{ marginRight: 5, verticalAlign: "middle" }} />
                  Operating Days
                </label>
                <input
                  id="contact-days"
                  name="days"
                  type="text"
                  placeholder="e.g. Monday – Saturday"
                  value={form.days}
                  onChange={handleChange}
                />
              </div>

              <div className="admin-form-field">
                <label htmlFor="contact-timing">
                  <FiClock style={{ marginRight: 5, verticalAlign: "middle" }} />
                  Business Hours / Timing
                </label>
                <input
                  id="contact-timing"
                  name="timing"
                  type="text"
                  placeholder="e.g. 10:00 AM – 7:00 PM"
                  value={form.timing}
                  onChange={handleChange}
                />
              </div>

              <div className="admin-form-field full">
                <label htmlFor="contact-address">
                  <FiMapPin style={{ marginRight: 5, verticalAlign: "middle" }} />
                  Store / Showroom Address *
                </label>
                <textarea
                  id="contact-address"
                  name="address"
                  placeholder="Store / Showroom name, Street, City, State, Pincode"
                  value={form.address}
                  onChange={handleChange}
                  rows={3}
                  required
                />
              </div>

              <div className="admin-form-field full">
                <label htmlFor="contact-supportNote">
                  <FiInfo style={{ marginRight: 5, verticalAlign: "middle" }} />
                  Support Note / Callout Description
                </label>
                <textarea
                  id="contact-supportNote"
                  name="supportNote"
                  placeholder="Brief note shown on the contact page callout"
                  value={form.supportNote}
                  onChange={handleChange}
                  rows={2}
                />
              </div>
            </div>

            <div style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
              <button
                type="submit"
                className="admin-primary-button"
                disabled={saving}
                style={{ opacity: saving ? 0.75 : 1, cursor: saving ? "not-allowed" : "pointer" }}
              >
                {saving ? (
                  <>
                    <FiLoader className="spinning" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <FiSave />
                    <span>Save Contact Details</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Live Preview Card */}
          <div className="admin-panel" style={{ background: "#0e0e0e" }}>
            <div className="admin-panel-title">
              <div>
                <span style={{ fontSize: "11px", fontWeight: "800", color: "#ffd044", letterSpacing: "1px" }}>
                  LIVE PREVIEW
                </span>
                <h3 style={{ marginTop: "4px" }}>How it appears on website</h3>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                marginTop: "16px",
              }}
            >
              {/* Phone Preview */}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  padding: "14px",
                  background: "#161616",
                  borderRadius: "9px",
                  border: "1px solid rgba(255, 199, 45, 0.2)",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    background: "rgba(255, 208, 68, 0.15)",
                    color: "#ffd044",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                    fontSize: "16px",
                  }}
                >
                  <FiPhone />
                </div>
                <div>
                  <div style={{ fontSize: "11px", textTransform: "uppercase", color: "#ffd044", fontWeight: "700" }}>
                    Call Us
                  </div>
                  <strong style={{ color: "#ffffff", fontSize: "14px", display: "block", marginTop: "2px" }}>
                    {form.phone || "+91 93062 82979"}
                  </strong>
                </div>
              </div>

              {/* Email Preview */}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  padding: "14px",
                  background: "#161616",
                  borderRadius: "9px",
                  border: "1px solid rgba(255, 199, 45, 0.2)",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    background: "rgba(255, 208, 68, 0.15)",
                    color: "#ffd044",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                    fontSize: "16px",
                  }}
                >
                  <FiMail />
                </div>
                <div>
                  <div style={{ fontSize: "11px", textTransform: "uppercase", color: "#ffd044", fontWeight: "700" }}>
                    Email Us
                  </div>
                  <strong style={{ color: "#ffffff", fontSize: "14px", display: "block", marginTop: "2px" }}>
                    {form.email || "support@starlinkgoods.com"}
                  </strong>
                </div>
              </div>

              {/* Address Preview */}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  padding: "14px",
                  background: "#161616",
                  borderRadius: "9px",
                  border: "1px solid rgba(255, 199, 45, 0.2)",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    background: "rgba(255, 208, 68, 0.15)",
                    color: "#ffd044",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                    fontSize: "16px",
                  }}
                >
                  <FiMapPin />
                </div>
                <div>
                  <div style={{ fontSize: "11px", textTransform: "uppercase", color: "#ffd044", fontWeight: "700" }}>
                    Store Location
                  </div>
                  <p style={{ color: "#ffffff", margin: "2px 0 0", fontSize: "13px", lineHeight: "1.5" }}>
                    {form.address || "Main Market, Rohtak, Haryana, India"}
                  </p>
                </div>
              </div>

              {/* Hours Preview */}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  padding: "14px",
                  background: "#161616",
                  borderRadius: "9px",
                  border: "1px solid rgba(255, 199, 45, 0.2)",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    background: "rgba(255, 208, 68, 0.15)",
                    color: "#ffd044",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                    fontSize: "16px",
                  }}
                >
                  <FiClock />
                </div>
                <div>
                  <div style={{ fontSize: "11px", textTransform: "uppercase", color: "#ffd044", fontWeight: "700" }}>
                    Business Hours
                  </div>
                  <span style={{ color: "#a89d8d", fontSize: "12px", display: "block" }}>
                    {form.days || "Monday – Saturday"}
                  </span>
                  <strong style={{ color: "#ffd044", fontSize: "13px" }}>
                    {form.timing || "10:00 AM – 7:00 PM"}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
