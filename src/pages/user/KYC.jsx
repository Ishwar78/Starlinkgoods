import React, { useState, useEffect } from "react";
import {
  FiShield,
  FiUploadCloud,
  FiCheckCircle,
  FiFileText,
  FiAlertCircle,
  FiClock,
  FiXCircle,
  FiEye,
  FiDownload,
  FiRefreshCw,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiBriefcase,
  FiCheck,
  FiX,
} from "react-icons/fi";
import { submitKYC, getMyKYCStatus, formatImageUrl } from "../../lib/api";
import "./KYC.css";

export default function UserKYC() {
  const [userData] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("userData") || "{}");
    } catch {
      return {};
    }
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [kycRecord, setKycRecord] = useState(null);
  const [showResubmitForm, setShowResubmitForm] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  // Form state
  const [form, setForm] = useState({
    fullName: userData.name || "",
    dob: "",
    email: userData.email || "",
    mobile: userData.mobile || "",
    businessName: userData.businessName || "SLG Furnishings",
    documentType: "Aadhaar Card",
    documentNumber: "",
    address: userData.address || "",
  });

  const [documentFile, setDocumentFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");

  // Check current KYC status from backend
  const checkKYCStatus = async () => {
    try {
      setLoading(true);
      const res = await getMyKYCStatus({
        email: userData.email,
        userId: userData._id || userData.id,
      });

      if (res.success && res.submitted && res.kyc) {
        setKycRecord(res.kyc);
      } else {
        setKycRecord(null);
      }
    } catch (err) {
      console.warn("Could not check KYC status:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkKYCStatus();
  }, [userData.email]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
    ];

    if (!allowed.includes(file.type) && !file.type.startsWith("image/")) {
      setMessage("Please upload an image (JPG, PNG, WEBP) or PDF file.");
      setMessageType("error");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage("Document file must be smaller than 10 MB.");
      setMessageType("error");
      return;
    }

    setDocumentFile(file);
    if (file.type.startsWith("image/")) {
      setFilePreview(URL.createObjectURL(file));
    } else {
      setFilePreview("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!form.fullName.trim()) {
      setMessage("Please enter your full name.");
      setMessageType("error");
      return;
    }
    if (!form.email.trim()) {
      setMessage("Please enter your email address.");
      setMessageType("error");
      return;
    }
    if (!form.mobile.trim()) {
      setMessage("Please enter your mobile number.");
      setMessageType("error");
      return;
    }
    if (!form.documentNumber.trim()) {
      setMessage("Please enter your document number.");
      setMessageType("error");
      return;
    }
    if (!form.address.trim()) {
      setMessage("Please enter your full address.");
      setMessageType("error");
      return;
    }
    if (!documentFile) {
      setMessage("Please upload your identity document file.");
      setMessageType("error");
      return;
    }

    try {
      setSubmitting(true);
      const data = new FormData();
      data.append("fullName", form.fullName.trim());
      data.append("dob", form.dob);
      data.append("email", form.email.trim());
      data.append("mobile", form.mobile.trim());
      data.append("businessName", form.businessName.trim());
      data.append("documentType", form.documentType);
      data.append("documentNumber", form.documentNumber.trim());
      data.append("address", form.address.trim());
      if (userData._id || userData.id) {
        data.append("userId", userData._id || userData.id);
      }
      data.append("documentFile", documentFile);

      const res = await submitKYC(data);
      if (res.success) {
        setMessage("KYC documents submitted successfully! Admin will verify your application soon.");
        setMessageType("success");
        setKycRecord(res.kyc);
        setShowResubmitForm(false);
      }
    } catch (err) {
      console.error("KYC Submit error:", err);
      setMessage(err.message || "Failed to submit KYC documents.");
      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  };

  const isVerified = kycRecord && kycRecord.status === "Verified";
  const isPending = kycRecord && kycRecord.status === "Pending";
  const isRejected = kycRecord && kycRecord.status === "Rejected";
  const hasExistingSubmission = Boolean(kycRecord);

  return (
    <div className="kyc-page">
      {/* Top Heading */}
      <div className="kyc-page-heading">
        <div>
          <span className="kyc-eyebrow">ACCOUNT COMPLIANCE & SECURITY</span>
          <h1>KYC Verification</h1>
          <p>Submit and track official identity documents for your vendor account.</p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            type="button"
            className="user-outline-button"
            onClick={checkKYCStatus}
            disabled={loading}
            style={{ minHeight: "36px", padding: "0 14px", fontSize: "13px" }}
          >
            <FiRefreshCw className={loading ? "spin-icon" : ""} /> Refresh Status
          </button>

          <span
            className={`kyc-status-badge ${
              isVerified
                ? "submitted"
                : isPending
                ? "pending"
                : isRejected
                ? "rejected"
                : ""
            }`}
          >
            {isVerified
              ? "● KYC Verified"
              : isPending
              ? "● Pending Review"
              : isRejected
              ? "● Rejected"
              : "● Not Verified"}
          </span>
        </div>
      </div>

      {/* Global Alert Notification */}
      {message && (
        <div className={`user-kyc-alert ${messageType}`}>
          {messageType === "success" ? <FiCheckCircle /> : <FiAlertCircle />}
          <span>{message}</span>
          <button
            type="button"
            className="alert-close-btn"
            onClick={() => setMessage("")}
          >
            <FiX />
          </button>
        </div>
      )}

      {/* Status Banner */}
      <section className="kyc-status-banner">
        <div
          className={`kyc-banner-icon ${
            isVerified ? "active-green" : isPending ? "active-yellow" : isRejected ? "active-red" : ""
          }`}
        >
          {isVerified ? (
            <FiCheckCircle />
          ) : isPending ? (
            <FiClock />
          ) : isRejected ? (
            <FiXCircle />
          ) : (
            <FiShield />
          )}
        </div>
        <div>
          <h2>
            {isVerified
              ? "Account Fully Verified & Certified"
              : isPending
              ? "KYC Documents Under Review"
              : isRejected
              ? "KYC Verification Rejected by Admin"
              : "Complete Your KYC Verification"}
          </h2>
          <p>
            {isVerified
              ? "Your business and identity documents have been authenticated by the Starlink admin team."
              : isPending
              ? "We have received your identity submission. Starlink admins are reviewing the submitted documents."
              : isRejected
              ? `Reason for rejection: "${kycRecord.remarks || "Uploaded document was unclear or details did not match."}" Please re-upload updated documents.`
              : "Upload your official government-issued ID (Aadhaar, PAN, Passport, GST Certificate) to activate full dealer benefits."}
          </p>
        </div>
      </section>

      {/* Submitted Details Review Card (When user has already submitted and not editing) */}
      {hasExistingSubmission && !showResubmitForm ? (
        <div className="kyc-details-card">
          <div className="kyc-card-header">
            <div>
              <h3>Submitted Application Details</h3>
              <p>Reference submission stored securely in Starlink database</p>
            </div>
            {isRejected && (
              <button
                type="button"
                className="user-primary-button"
                onClick={() => setShowResubmitForm(true)}
              >
                Re-submit KYC Documents
              </button>
            )}
          </div>

          <div className="kyc-info-grid">
            <div className="kyc-info-item">
              <span className="kyc-info-label">Applicant Name</span>
              <strong className="kyc-info-val">{kycRecord.fullName}</strong>
            </div>

            <div className="kyc-info-item">
              <span className="kyc-info-label">Registered Email</span>
              <strong className="kyc-info-val">{kycRecord.email}</strong>
            </div>

            <div className="kyc-info-item">
              <span className="kyc-info-label">Mobile Number</span>
              <strong className="kyc-info-val">{kycRecord.mobile}</strong>
            </div>

            <div className="kyc-info-item">
              <span className="kyc-info-label">Date of Birth</span>
              <strong className="kyc-info-val">{kycRecord.dob || "—"}</strong>
            </div>

            <div className="kyc-info-item">
              <span className="kyc-info-label">Document Type</span>
              <strong className="kyc-info-val">{kycRecord.documentType}</strong>
            </div>

            <div className="kyc-info-item">
              <span className="kyc-info-label">Document Number</span>
              <strong className="kyc-info-val">{kycRecord.documentNumber}</strong>
            </div>

            <div className="kyc-info-item" style={{ gridColumn: "span 2" }}>
              <span className="kyc-info-label">Registered Address</span>
              <strong className="kyc-info-val">{kycRecord.address}</strong>
            </div>

            <div className="kyc-info-item" style={{ gridColumn: "span 2" }}>
              <span className="kyc-info-label">Uploaded Document</span>
              <div className="kyc-doc-file-row">
                <span className="kyc-file-name">
                  <FiFileText /> {kycRecord.documentOriginalName || "Identity Document File"}
                </span>
                <a
                  href={formatImageUrl(kycRecord.documentFile)}
                  target="_blank"
                  rel="noreferrer"
                  className="kyc-view-doc-btn"
                >
                  <FiEye /> View / Download Document
                </a>
              </div>
            </div>

            {kycRecord.remarks && (
              <div className="kyc-info-item rejection-box" style={{ gridColumn: "span 2" }}>
                <span className="kyc-info-label">Admin Remarks</span>
                <p className="kyc-remarks-text">{kycRecord.remarks}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Submission Form (Shown when new or re-submitting) */
        <form className="kyc-form-card" onSubmit={handleSubmit}>
          <div className="kyc-form-title">
            <div className="kyc-form-title-icon">
              <FiFileText />
            </div>
            <div>
              <h2>{isRejected ? "Re-submit Identity Details" : "Personal & Business Information"}</h2>
              <p>Enter your details exactly as shown on your government identity document.</p>
            </div>
            {hasExistingSubmission && showResubmitForm && (
              <button
                type="button"
                className="user-outline-button"
                onClick={() => setShowResubmitForm(false)}
                style={{ marginLeft: "auto", minHeight: "36px", padding: "0 14px", fontSize: "13px" }}
              >
                Cancel
              </button>
            )}
          </div>

          <div className="kyc-form-grid">
            <div className="kyc-field">
              <label htmlFor="kyc-full-name">Full Name (As on ID) *</label>
              <input
                id="kyc-full-name"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="e.g. Ramesh Kumar Sharma"
                required
              />
            </div>

            <div className="kyc-field">
              <label htmlFor="kyc-dob">Date of Birth</label>
              <input
                id="kyc-dob"
                name="dob"
                type="date"
                value={form.dob}
                onChange={handleChange}
              />
            </div>

            <div className="kyc-field">
              <label htmlFor="kyc-email">Registered Email *</label>
              <input
                id="kyc-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="vendor@example.com"
                required
              />
            </div>

            <div className="kyc-field">
              <label htmlFor="kyc-mobile">Mobile Number *</label>
              <input
                id="kyc-mobile"
                name="mobile"
                value={form.mobile}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                required
              />
            </div>

            <div className="kyc-field">
              <label htmlFor="kyc-document-type">Document Type *</label>
              <select
                id="kyc-document-type"
                name="documentType"
                value={form.documentType}
                onChange={handleChange}
                required
              >
                <option value="Aadhaar Card">Aadhaar Card</option>
                <option value="PAN Card">PAN Card</option>
                <option value="GST Certificate">GST Certificate</option>
                <option value="Passport">Passport</option>
                <option value="Driving Licence">Driving Licence</option>
                <option value="Voter ID">Voter ID</option>
              </select>
            </div>

            <div className="kyc-field">
              <label htmlFor="kyc-document-number">Document ID Number *</label>
              <input
                id="kyc-document-number"
                name="documentNumber"
                value={form.documentNumber}
                onChange={handleChange}
                placeholder="e.g. ABCD1234E or 12-digit Aadhaar"
                required
              />
            </div>

            <div className="kyc-field kyc-full-width">
              <label htmlFor="kyc-address">Full Registered Address *</label>
              <textarea
                id="kyc-address"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Shop/Office No, Street, Landmark, City, State, PIN Code"
                rows="3"
                required
              />
            </div>

            {/* Document Upload Area */}
            <div className="kyc-field kyc-full-width">
              <label htmlFor="kyc-document-file">Upload Identity Document *</label>

              <label className="kyc-upload-area" htmlFor="kyc-document-file">
                <span className="kyc-upload-icon">
                  <FiUploadCloud />
                </span>
                <strong>
                  {documentFile ? documentFile.name : "Click to select and upload document"}
                </strong>
                <span>Supports JPG, PNG, WEBP or PDF · Maximum 10 MB</span>

                <input
                  id="kyc-document-file"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={handleFileChange}
                />
              </label>

              {filePreview && (
                <div className="kyc-selected-preview">
                  <img src={filePreview} alt="Selected preview" />
                  <span>Preview: {documentFile?.name}</span>
                </div>
              )}
            </div>
          </div>

          <div className="kyc-privacy-note">
            <FiShield />
            <p>
              Your documents are encrypted and accessible only by verified Starlink administrators for compliance verification under governing trade laws.
            </p>
          </div>

          <button
            type="submit"
            className="kyc-submit-button"
            disabled={submitting}
          >
            <FiCheckCircle />
            <span>
              {submitting
                ? "Uploading & Submitting..."
                : isRejected
                ? "Re-submit for Verification"
                : "Submit for Verification"}
            </span>
          </button>
        </form>
      )}
    </div>
  );
}
