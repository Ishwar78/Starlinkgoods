
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowRight,
  FiMapPin,
  FiPhone,
  FiMail,
  FiClock,
  FiSend,
  FiMessageCircle,
  FiCheckCircle,
  FiAlertCircle,
  FiLoader,
} from "react-icons/fi";
import { submitContactMessage, getContactInfo } from "../lib/api";

import "./Contact.css";
import Footer from "../components/Footer";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [contactInfo, setContactInfo] = useState({
    phone: "+91 93062 82979",
    email: "support@starlinkgoods.com",
    address: "Star Link Goods, Main Market, Rohtak, Haryana, India",
    timing: "10:00 AM – 7:00 PM",
    days: "Monday – Saturday",
    supportNote: "Need help choosing furniture? Tell us what you need and our team will assist you.",
  });

  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState("success");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await getContactInfo();
        if (res.success && res.info) {
          setContactInfo(res.info);
        }
      } catch (err) {
        console.error("Error loading contact info:", err);
      }
    };
    fetchInfo();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setStatus("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("");

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.message.trim()
    ) {
      setStatus("Please fill in all required fields (Name, Email, Message).");
      setStatusType("error");
      return;
    }

    try {
      setSubmitting(true);
      const res = await submitContactMessage(formData);
      if (res.success) {
        setStatus("Thank you! Your message has been sent successfully. Our team will contact you soon.");
        setStatusType("success");
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
      } else {
        setStatus(res.message || "Failed to submit message. Please try again.");
        setStatusType("error");
      }
    } catch (err) {
      console.error("Contact form error:", err);
      setStatus(err.message || "Failed to submit message. Please try again.");
      setStatusType("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
   <>
    
    <main className="contact-page">
      {/* Page Heading */}
      <section className="contact-hero">
        <div className="container contact-hero-inner">
          <Link to="/" className="contact-back-link">
            <FiArrowLeft />
            Back to Home
          </Link>

          <span className="contact-eyebrow">
            WE WOULD LOVE TO HEAR FROM YOU
          </span>

          <h1>
            Let's Talk About
            <br />
            Your Dream Home.
          </h1>

          <p>
            Have a question about our furniture or need help choosing
            the right piece? Our team is here to help.
          </p>

          <div className="contact-breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <strong>Contact Us</strong>
          </div>
        </div>
      </section>

      {/* Contact Information and Form */}
      <section className="container contact-main-section">
        <div className="contact-info-panel">
          <span className="contact-section-label">GET IN TOUCH</span>

          <h2>We are here to help.</h2>

          <p className="contact-info-description">
            From product questions to delivery assistance, reach out
            to us and we will guide you through your shopping journey.
          </p>

          <div className="contact-info-list">
            <div className="contact-info-item">
              <span className="contact-info-icon">
                <FiPhone />
              </span>

              <div>
                <h3>Call Us</h3>
                <p>Speak with our customer support team.</p>
                <a href={`tel:${contactInfo.phone.replace(/[^0-9+]/g, "")}`}>
                  {contactInfo.phone}
                </a>
              </div>
            </div>

            <div className="contact-info-item">
              <span className="contact-info-icon">
                <FiMail />
              </span>

              <div>
                <h3>Email Us</h3>
                <p>Send us your questions anytime.</p>
                <a href={`mailto:${contactInfo.email}`}>
                  {contactInfo.email}
                </a>
              </div>
            </div>

            <div className="contact-info-item">
              <span className="contact-info-icon">
                <FiMapPin />
              </span>

              <div>
                <h3>Visit Our Store</h3>
                <p style={{ whiteSpace: "pre-line" }}>
                  {contactInfo.address}
                </p>
              </div>
            </div>

            <div className="contact-info-item">
              <span className="contact-info-icon">
                <FiClock />
              </span>

              <div>
                <h3>Business Hours</h3>
                <p>{contactInfo.days}</p>
                <strong>{contactInfo.timing}</strong>
              </div>
            </div>
          </div>

          <div className="contact-support-note">
            <FiMessageCircle />

            <div>
              <strong>Need help choosing furniture?</strong>
              <p>{contactInfo.supportNote}</p>
            </div>
          </div>
        </div>

        <div className="contact-form-panel">
          <span className="contact-section-label">SEND US A MESSAGE</span>

          <h2>How can we help you?</h2>

          <p className="contact-form-description">
            Fill out the form below and tell us how we can assist you.
          </p>

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="contact-form-row">
              <div className="contact-field">
                <label htmlFor="contact-name">
                  Full Name <span>*</span>
                </label>

                <input
                  id="contact-name"
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                />
              </div>

              <div className="contact-field">
                <label htmlFor="contact-email">
                  Email Address <span>*</span>
                </label>

                <input
                  id="contact-email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="contact-form-row">
              <div className="contact-field">
                <label htmlFor="contact-phone">
                  Phone Number
                </label>

                <input
                  id="contact-phone"
                  type="tel"
                  name="phone"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                />
              </div>

              <div className="contact-field">
                <label htmlFor="contact-subject">
                  Subject
                </label>

                <select
                  id="contact-subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                >
                  <option value="">Select a subject</option>
                  <option value="Product Enquiry">
                    Product Enquiry
                  </option>
                  <option value="Order Status">
                    Order Status
                  </option>
                  <option value="Delivery Support">
                    Delivery Support
                  </option>
                  <option value="Returns and Refunds">
                    Returns &amp; Refunds
                  </option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="contact-field">
              <label htmlFor="contact-message">
                Your Message <span>*</span>
              </label>

              <textarea
                id="contact-message"
                name="message"
                rows="5"
                placeholder="Tell us how we can help you..."
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>

            {status && (
              <div
                className={`contact-status ${statusType === "error" ? "contact-status-error" : ""}`}
                role="status"
                aria-live="polite"
                style={{
                  background: statusType === "error" ? "#fef2f2" : "#edfbf3",
                  color: statusType === "error" ? "#b91c1c" : "#147443",
                  borderColor: statusType === "error" ? "#fecaca" : "#c3edd3",
                }}
              >
                {statusType === "error" ? <FiAlertCircle /> : <FiCheckCircle />}
                <span>{status}</span>
              </div>
            )}

            <button
              type="submit"
              className="contact-submit-button"
              disabled={submitting}
              style={{ opacity: submitting ? 0.75 : 1, cursor: submitting ? "not-allowed" : "pointer" }}
            >
              {submitting ? (
                <>
                  <FiLoader className="spinning" />
                  <span>Sending Message...</span>
                </>
              ) : (
                <>
                  Send Message
                  <FiSend />
                </>
              )}
            </button>

            <p className="contact-form-footnote">
              <FiCheckCircle />
              We value your privacy and your time.
            </p>
          </form>
        </div>
      </section>

      {/* Bottom Call to Action */}
      <section className="container contact-bottom-banner">
        <div>
          <span>LET'S MAKE YOUR HOME BEAUTIFUL</span>
          <h2>Looking for the perfect furniture?</h2>
          <p>
            Explore our collection and discover furniture made for
            comfortable living.
          </p>
        </div>

        <Link to="/" className="contact-shop-button">
          Explore Collection
          <FiArrowRight />
        </Link>
      </section>
    </main>
    {/* <Footer /> */}
    </>
  );
}
