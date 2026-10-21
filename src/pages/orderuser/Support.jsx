import React, { useState } from "react";
import {
  FiHeadphones,
  FiPhoneCall,
  FiMail,
  FiMessageSquare,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiSend,
  FiHelpCircle,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { submitOrderUserSupport } from "../../lib/api";
import "./Support.css";

export default function Support({ prefilledOrderId = "" }) {
  const [formData, setFormData] = useState({
    orderId: prefilledOrderId || "",
    subject: "Installation Inquiry",
    phone: "",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      q: "When will my solar installation begin after paying ₹1,000 token?",
      a: "Once your ₹1,000 token booking is verified, our engineering team performs a site survey verification within 24 to 48 hours. After technical clearance, the solar equipment is dispatched and scheduled for installation.",
    },
    {
      q: "How and when is the remaining balance payable?",
      a: "The remaining balance is payable upon delivery and inspection of the solar equipment at your installation site before mounting/commissioning begins. You can pay via UPI, Net Banking, or Cheque.",
    },
    {
      q: "What documents are required for government subsidy & Net Metering?",
      a: "You need your Electricity Bill (latest 3 months), Aadhaar Card, Property Registry/House ownership proof, and a passport-size photograph. Our team assists you with the complete DISCOM paperwork.",
    },
    {
      q: "What is the warranty period for solar panels and inverters?",
      a: "All solar panels come with a 25-year performance warranty (minimum 80% output after 25 years), and solar inverters have a 5 to 10 year manufacturer warranty.",
    },
    {
      q: "Can I modify or reschedule my installation date?",
      a: "Yes! You can contact your dedicated solar manager via helpline or raise a request right here through this support form with your Order ID.",
    },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!formData.message.trim()) {
      setErrorMsg("Please write your message or describe your inquiry.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await submitOrderUserSupport(formData);

      if (res && res.success) {
        setSuccessMsg(
          res.message ||
            "Support ticket submitted successfully! Our executive will contact you shortly."
        );
        setFormData({
          orderId: "",
          subject: "Installation Inquiry",
          phone: "",
          message: "",
        });
      } else {
        setErrorMsg(res?.message || "Failed to submit request. Please try again.");
      }
    } catch (err) {
      console.error("Support form error:", err);
      setErrorMsg(err.message || "Failed to submit support request.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleFaq = (index) => {
    setOpenFaq((prev) => (prev === index ? null : index));
  };

  return (
    <div className="orderuser-support">
      <div className="support-header">
        <h2 className="support-title">Customer Support &amp; Assistance</h2>
        <p className="support-subtitle">
          Have questions about your solar order, technical installation, or billing? We are here to help.
        </p>
      </div>

      {/* Support Channels Row */}
      <div className="support-channels-grid">
        <div className="channel-card">
          <div className="channel-icon-wrap phone">
            <FiPhoneCall />
          </div>
          <h3>Customer Helpline</h3>
          <p>Direct call assistance for active bookings</p>
          <a href="tel:+919876543210" className="channel-contact-btn">
            +91 98765 43210
          </a>
        </div>

        <div className="channel-card">
          <div className="channel-icon-wrap chat">
            <FiMessageSquare />
          </div>
          <h3>WhatsApp Support</h3>
          <p>Instant chat with solar engineers</p>
          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noopener noreferrer"
            className="channel-contact-btn whatsapp"
          >
            Chat on WhatsApp
          </a>
        </div>

        <div className="channel-card">
          <div className="channel-icon-wrap email">
            <FiMail />
          </div>
          <h3>Email Desk</h3>
          <p>Official correspondence &amp; document queries</p>
          <a href="mailto:support@starlinkgoods.com" className="channel-contact-btn">
            support@starlinkgoods.com
          </a>
        </div>

        <div className="channel-card">
          <div className="channel-icon-wrap clock">
            <FiClock />
          </div>
          <h3>Support Hours</h3>
          <p>Monday to Saturday</p>
          <span className="timing-badge">09:00 AM – 07:00 PM</span>
        </div>
      </div>

      {/* Support Ticket Form & FAQ Section */}
      <div className="support-main-layout">
        <div className="support-form-card">
          <div className="form-card-title-row">
            <FiHeadphones className="form-title-icon" />
            <div>
              <h3>Raise a Support Request</h3>
              <p>Submit a ticket and our technical team will respond within 4 business hours</p>
            </div>
          </div>

          {errorMsg && (
            <div className="support-alert error">
              <FiAlertCircle /> <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="support-alert success">
              <FiCheckCircle /> <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="ticket-form">
            <div className="ticket-form-grid-2">
              <div className="ticket-form-group">
                <label>Related Order ID (Optional)</label>
                <input
                  type="text"
                  name="orderId"
                  value={formData.orderId}
                  onChange={handleChange}
                  placeholder="e.g. SLG-ORD-123456"
                />
              </div>

              <div className="ticket-form-group">
                <label>Alternate Mobile / WhatsApp</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. 9876543210"
                />
              </div>
            </div>

            <div className="ticket-form-group">
              <label>Issue Subject / Department *</label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
              >
                <option value="Installation Inquiry">Installation &amp; Site Survey Inquiry</option>
                <option value="Order Tracking & Delivery">Order Tracking &amp; Dispatch Update</option>
                <option value="Payment & Billing">₹1,000 Token Payment / Balance Billing</option>
                <option value="Net Metering & Subsidy">Government Subsidy &amp; Net Metering</option>
                <option value="Technical Support & Warranty">Warranty, Equipment &amp; Technical Support</option>
                <option value="Other">Other Query</option>
              </select>
            </div>

            <div className="ticket-form-group">
              <label>Detailed Message *</label>
              <textarea
                name="message"
                rows={5}
                value={formData.message}
                onChange={handleChange}
                placeholder="Please describe your query or problem in detail..."
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="ticket-submit-btn"
              disabled={submitting}
            >
              {submitting ? (
                "Submitting Request..."
              ) : (
                <>
                  <FiSend /> Send Support Request
                </>
              )}
            </button>
          </form>
        </div>

        {/* FAQs Accordion */}
        <div className="support-faqs-card">
          <div className="faq-card-title-row">
            <FiHelpCircle className="form-title-icon" />
            <div>
              <h3>Frequently Asked Questions</h3>
              <p>Quick answers to common questions</p>
            </div>
          </div>

          <div className="faq-accordion-list">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className={`faq-accordion-item ${openFaq === idx ? "open" : ""}`}
              >
                <button
                  type="button"
                  className="faq-question-btn"
                  onClick={() => toggleFaq(idx)}
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? <FiChevronUp /> : <FiChevronDown />}
                </button>
                {openFaq === idx && (
                  <div className="faq-answer-pane">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

