
import React, { useState } from "react";
import {
  FiMail,
  FiPhone,
  FiMessageCircle,
  FiRefreshCw,
  FiMapPin,
  FiCheckCircle,
  FiArrowRight,
} from "react-icons/fi";
import "./EnquireNow.css";

const investmentOptions = [
  "2 kW Solar",
  "3 kW Solar",
  "4 kW Solar",
  "5 kW Solar",
  "6 kW Solar",
  "8 kW Solar",
  "10 kW Solar",
  "10 kW Above Solar",
  "Commercial Solar",
  "Not Sure Yet",
];

const initialForm = {
  name: "",
  email: "",
  phone: "",
  state: "",
  investment: "",
  remarks: "",
  privacyAccepted: false,
};

const generateCaptcha = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from(
    { length: 6 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
};

export default function EnquireNow() {
  const [form, setForm] = useState(initialForm);
  const [captcha, setCaptcha] = useState(generateCaptcha);
  const [captchaInput, setCaptchaInput] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const updateField = (event) => {
    const { name, value, checked, type } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setMessage("");
  };

  const refreshCaptcha = () => {
    setCaptcha(generateCaptcha());
    setCaptchaInput("");
    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!form.privacyAccepted) {
      setMessage("Please accept the Privacy Policy and Terms & Conditions.");
      setMessageType("error");
      return;
    }

    if (captchaInput.trim() !== captcha) {
      setMessage("Captcha does not match. Please try again.");
      setMessageType("error");
      refreshCaptcha();
      return;
    }

    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) {
      setMessage("Please enter a valid 10-digit Indian mobile number.");
      setMessageType("error");
      return;
    }

    setSubmitting(true);

    try {
      /*
       * Connect your backend API here to save enquiries.
       * Example:
       *
       * const response = await fetch(
       *   "https://your-domain.com/api/enquiries",
       *   {
       *     method: "POST",
       *     headers: { "Content-Type": "application/json" },
       *     body: JSON.stringify(form),
       *   }
       * );
       *
       * if (!response.ok) throw new Error("Submission failed");
       */

      setMessage(
        "Form validated successfully. Connect your enquiry API to submit and save this request."
      );
      setMessageType("success");
    } catch {
      setMessage("Unable to submit your enquiry. Please try again.");
      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="enquiry-page">
      

      <section className="enquiry-contact-cards" aria-label="Contact options">
        <a className="enquiry-contact-card" href="mailto:info@gautamsolar.com">
          <span className="enquiry-contact-icon">
            <FiMail />
          </span>
          <strong>Email</strong>
          <span>info@slgsolar.com</span>
          <FiArrowRight className="enquiry-contact-arrow" />
        </a>

        <a className="enquiry-contact-card" href="tel:18005320800">
          <span className="enquiry-contact-icon">
            <FiPhone />
          </span>
          <strong>Service Support</strong>
          <span>1800-532-0800</span>
          <FiArrowRight className="enquiry-contact-arrow" />
        </a>

        <a
          className="enquiry-contact-card"
          href="https://wa.me/919311797248"
          target="_blank"
          rel="noreferrer"
        >
          <span className="enquiry-contact-icon">
            <FiMessageCircle />
          </span>
          <strong>WhatsApp</strong>
          <span>+91 93117 97248</span>
          <FiArrowRight className="enquiry-contact-arrow" />
        </a>
      </section>

      <section className="enquiry-form-section">
        <div className="enquiry-form-heading">
          <span className="enquiry-form-heading-icon">
            <FiMessageCircle />
          </span>

          <div>
            <span className="enquiry-section-label">WE'RE HERE TO HELP</span>
            <h2>Submit Your Enquiry</h2>
            <p>
              Share a few details and let us understand your solar
              requirements.
            </p>
          </div>
        </div>

        <form className="enquiry-form" onSubmit={handleSubmit}>
          <div className="enquiry-field enquiry-field-full">
            <label htmlFor="enquiry-name">Full Name <span>*</span></label>
            <input
              id="enquiry-name"
              type="text"
              name="name"
              value={form.name}
              onChange={updateField}
              placeholder="Enter your full name"
              autoComplete="name"
              maxLength={100}
              required
            />
          </div>

          <div className="enquiry-field">
            <label htmlFor="enquiry-email">Email Address <span>*</span></label>
            <input
              id="enquiry-email"
              type="email"
              name="email"
              value={form.email}
              onChange={updateField}
              placeholder="Enter your email address"
              autoComplete="email"
              maxLength={150}
              required
            />
          </div>

          <div className="enquiry-field">
            <label htmlFor="enquiry-phone">Mobile Number <span>*</span></label>
            <div className="enquiry-phone-input">
              <span>+91</span>
              <input
                id="enquiry-phone"
                type="tel"
                name="phone"
                value={form.phone}
                onChange={(event) => {
                  const value = event.target.value.replace(/\D/g, "").slice(0, 10);
                  setForm((previous) => ({ ...previous, phone: value }));
                  setMessage("");
                }}
                placeholder="Enter 10-digit mobile number"
                autoComplete="tel-national"
                inputMode="numeric"
                maxLength={10}
                pattern="[6-9][0-9]{9}"
                required
              />
            </div>
          </div>

          <div className="enquiry-field">
            <label htmlFor="enquiry-state">State <span>*</span></label>
            <input
              id="enquiry-state"
              type="text"
              name="state"
              value={form.state}
              onChange={updateField}
              placeholder="Enter your state"
              autoComplete="address-level1"
              maxLength={80}
              required
            />
          </div>

          <div className="enquiry-field">
            <label htmlFor="enquiry-investment">
              Willing to Invest <span>*</span>
            </label>

            <select
              id="enquiry-investment"
              name="investment"
              value={form.investment}
              onChange={updateField}
              required
            >
              <option value="" disabled>
                Select your solar requirement
              </option>

              {investmentOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="enquiry-field enquiry-field-full">
            <label htmlFor="enquiry-remarks">Remarks / Message</label>
            <textarea
              id="enquiry-remarks"
              name="remarks"
              value={form.remarks}
              onChange={updateField}
              placeholder="Tell us about your location, electricity usage or solar requirements..."
              rows={4}
              maxLength={1500}
            />
          </div>

          <div className="enquiry-captcha-section">
            <label className="enquiry-captcha-label" htmlFor="enquiry-captcha">
              Security Verification <span>*</span>
            </label>

            <div className="enquiry-captcha-row">
              <span className="enquiry-captcha-code" aria-label="Captcha code">
                {captcha}
              </span>

              <button
                className="enquiry-captcha-refresh"
                type="button"
                onClick={refreshCaptcha}
                aria-label="Generate a new captcha"
                title="Refresh captcha"
              >
                <FiRefreshCw />
              </button>

              <input
                id="enquiry-captcha"
                type="text"
                value={captchaInput}
                onChange={(event) => setCaptchaInput(event.target.value)}
                placeholder="Enter captcha"
                autoComplete="off"
                maxLength={6}
                required
              />
            </div>
          </div>

          <label className="enquiry-privacy">
            <input
              type="checkbox"
              name="privacyAccepted"
              checked={form.privacyAccepted}
              onChange={updateField}
              required
            />

            <span>
              I agree to the{" "}
              <a href="/privacy-policy" target="_blank" rel="noreferrer">
                Privacy Policy
              </a>{" "}
              and{" "}
              <a href="/terms-conditions" target="_blank" rel="noreferrer">
                Terms &amp; Conditions
              </a>.
            </span>
          </label>

          {message && (
            <div
              className={`enquiry-feedback ${messageType}`}
              role="status"
              aria-live="polite"
            >
              {message}
            </div>
          )}

          <button
            className="enquiry-submit-button"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Send Enquiry"}
            {!submitting && <FiArrowRight />}
          </button>

          <p className="enquiry-form-footnote">
            <FiMapPin />
            Your information helps us understand your solar requirements.
          </p>
        </form>
      </section>
    </main>
  );
}
