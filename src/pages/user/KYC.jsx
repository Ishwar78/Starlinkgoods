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
  FiCreditCard,
  FiCamera,
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
    // Bank Details
    accountHolderName: userData.name || "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: "",
    bankName: "",
  });

  // Identity document file & preview
  const [documentFile, setDocumentFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");

  // Passbook image file & preview (Separate upload)
  const [passbookFile, setPassbookFile] = useState(null);
  const [passbookPreview, setPassbookPreview] = useState("");

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
        // Prefill bank details if available
        if (res.kyc.accountHolderName || res.kyc.accountNumber) {
          setForm((prev) => ({
            ...prev,
            fullName: res.kyc.fullName || prev.fullName,
            dob: res.kyc.dob || prev.dob,
            documentType: res.kyc.documentType || prev.documentType,
            documentNumber: res.kyc.documentNumber || prev.documentNumber,
            address: res.kyc.address || prev.address,
            accountHolderName: res.kyc.accountHolderName || prev.accountHolderName,
            accountNumber: res.kyc.accountNumber || prev.accountNumber,
            confirmAccountNumber: res.kyc.accountNumber || prev.confirmAccountNumber,
            ifscCode: res.kyc.ifscCode || prev.ifscCode,
            bankName: res.kyc.bankName || prev.bankName,
          }));
        }
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

  // Handler for Identity Document (Aadhaar / PAN etc.)
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
      setMessage("Please upload an image (JPG, PNG, WEBP) or PDF file for Identity Document.");
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

  // Handler for Bank Passbook / Cheque Image (Separate Upload)
  const handlePassbookChange = (e) => {
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
      setMessage("Please upload an image (JPG, PNG, WEBP) or PDF for Bank Passbook.");
      setMessageType("error");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage("Passbook file must be smaller than 10 MB.");
      setMessageType("error");
      return;
    }

    setPassbookFile(file);
    if (file.type.startsWith("image/")) {
      setPassbookPreview(URL.createObjectURL(file));
    } else {
      setPassbookPreview("");
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

    // Identity Document validation
    if (!documentFile && !kycRecord?.documentFile) {
      setMessage("Please upload your identity document file (Aadhaar / PAN etc.).");
      setMessageType("error");
      return;
    }

    // Bank Account Details validation
    if (!form.accountHolderName.trim()) {
      setMessage("Please enter Account Holder Name.");
      setMessageType("error");
      return;
    }
    if (!form.accountNumber.trim()) {
      setMessage("Please enter Bank Account Number.");
      setMessageType("error");
      return;
    }
    if (form.accountNumber.trim() !== form.confirmAccountNumber.trim()) {
      setMessage("Bank Account Numbers do not match. Please verify.");
      setMessageType("error");
      return;
    }
    if (!form.ifscCode.trim()) {
      setMessage("Please enter Bank IFSC Code.");
      setMessageType("error");
      return;
    }

    // Passbook Image validation
    if (!passbookFile && !kycRecord?.passbookFile) {
      setMessage("Please upload your Bank Passbook or Cancelled Cheque image.");
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

      // Bank Details
      data.append("accountHolderName", form.accountHolderName.trim());
      data.append("accountNumber", form.accountNumber.trim());
      data.append("ifscCode", form.ifscCode.trim().toUpperCase());
      data.append("bankName", form.bankName.trim());

      if (userData._id || userData.id) {
        data.append("userId", userData._id || userData.id);
      }

      if (documentFile) {
        data.append("documentFile", documentFile);
      }
      if (passbookFile) {
        data.append("passbookFile", passbookFile);
      }

      const res = await submitKYC(data);
      if (res.success) {
        setMessage("KYC documents and bank details submitted successfully! Admin will verify your application soon.");
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
          <span className="kyc-eyebrow">ACCOUNT COMPLIANCE &amp; SECURITY</span>
          <h1>KYC &amp; Bank Verification</h1>
          <p>Submit and track official identity documents and bank credentials for your vendor account.</p>
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
            ● {kycRecord?.status || "Not Submitted"}
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

      {/* Status Hero Banner */}
      <section className="kyc-status-banner">
        <div
          className={`kyc-status-icon-wrap ${
            isVerified
              ? "verified"
              : isPending
              ? "pending"
              : isRejected
              ? "rejected"
              : "unsubmitted"
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

        <div className="kyc-status-copy">
          <div className="kyc-status-tag-row">
            <span
              className={`kyc-tag ${
                isVerified
                  ? "verified"
                  : isPending
                  ? "pending"
                  : isRejected
                  ? "rejected"
                  : "unsubmitted"
              }`}
            >
              {isVerified
                ? "KYC Verified & Approved"
                : isPending
                ? "Under Review by Admin"
                : isRejected
                ? "Verification Rejected"
                : "Action Required"}
            </span>

            {kycRecord?.createdAt && (
              <span className="kyc-date">
                Submitted on {new Date(kycRecord.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            )}
          </div>

          <h2>
            {isVerified
              ? "Your Identity & Bank Credentials are Fully Verified"
              : isPending
              ? "Your KYC & Bank Details are Under Active Review"
              : isRejected
              ? "KYC Verification Rejected by Admin"
              : "Complete Your KYC & Bank Account Verification"}
          </h2>
          <p>
            {isVerified
              ? "Your business, identity, and bank account details have been authenticated by the Starlink admin team."
              : isPending
              ? "We have received your identity submission and bank account proof. Starlink admins are reviewing the submitted documents."
              : isRejected
              ? `Reason for rejection: "${kycRecord.remarks || "Uploaded document was unclear or details did not match."}" Please re-upload updated documents.`
              : "Upload your official government-issued ID (Aadhaar, PAN) and Bank Passbook / Cheque to activate full dealer benefits and payouts."}
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
            {/* Identity Information */}
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

            {/* Bank Account Details Grid in View Mode */}
            <div className="kyc-info-item">
              <span className="kyc-info-label">Bank Account Holder</span>
              <strong className="kyc-info-val">{kycRecord.accountHolderName || "—"}</strong>
            </div>

            <div className="kyc-info-item">
              <span className="kyc-info-label">Bank Account Number</span>
              <strong className="kyc-info-val" style={{ fontFamily: "monospace", color: "#60a5fa" }}>
                {kycRecord.accountNumber || "—"}
              </strong>
            </div>

            <div className="kyc-info-item">
              <span className="kyc-info-label">Bank IFSC Code</span>
              <strong className="kyc-info-val" style={{ fontFamily: "monospace", color: "#ffd044" }}>
                {kycRecord.ifscCode || "—"}
              </strong>
            </div>

            <div className="kyc-info-item">
              <span className="kyc-info-label">Bank Name</span>
              <strong className="kyc-info-val">{kycRecord.bankName || "—"}</strong>
            </div>

            {/* Dual Documents View */}
            <div className="kyc-docs-dual-display">
              {/* Identity Document Card */}
              <div className="kyc-doc-card-view">
                <div className="kyc-doc-card-title">
                  <span>Identity Proof ({kycRecord.documentType})</span>
                  <FiFileText style={{ color: "#ffd044" }} />
                </div>
                <div className="kyc-doc-file-row">
                  <span className="kyc-file-name">
                    {kycRecord.documentOriginalName || "Identity Document"}
                  </span>
                  <a
                    href={formatImageUrl(kycRecord.documentFile)}
                    target="_blank"
                    rel="noreferrer"
                    className="kyc-view-doc-btn"
                  >
                    <FiEye /> View / Download
                  </a>
                </div>
              </div>

              {/* Passbook Document Card */}
              <div className="kyc-doc-card-view passbook-card">
                <div className="kyc-doc-card-title">
                  <span>Bank Passbook / Cheque Photo</span>
                  <FiCreditCard style={{ color: "#60a5fa" }} />
                </div>
                <div className="kyc-doc-file-row">
                  <span className="kyc-file-name" style={{ color: "#93c5fd" }}>
                    {kycRecord.passbookOriginalName || "Passbook Photo"}
                  </span>
                  {kycRecord.passbookFile ? (
                    <a
                      href={formatImageUrl(kycRecord.passbookFile)}
                      target="_blank"
                      rel="noreferrer"
                      className="kyc-view-doc-btn"
                      style={{
                        background: "linear-gradient(135deg, #60a5fa, #2563eb)",
                        color: "#ffffff",
                        borderColor: "#3b82f6",
                      }}
                    >
                      <FiEye /> View Passbook
                    </a>
                  ) : (
                    <span style={{ fontSize: "12px", color: "#8c8376" }}>Not Uploaded</span>
                  )}
                </div>
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
              <h2>{isRejected ? "Re-submit KYC & Bank Details" : "Personal & Identity Information"}</h2>
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
            {/* Identity Info Inputs */}
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
                placeholder="e.g. 12-digit Aadhaar / 10-digit PAN"
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

            {/* =========================================================
                SECTION 2: BANK ACCOUNT DETAILS
            ========================================================= */}
            <div className="kyc-section-divider">
              <div className="kyc-section-divider-icon">
                <FiCreditCard />
              </div>
              <div className="kyc-section-divider-text">
                <h3>Bank Account Details</h3>
                <p>Provide your official bank account credentials for verification and payouts.</p>
              </div>
            </div>

            <div className="kyc-field">
              <label htmlFor="kyc-acc-holder">Account Holder Name *</label>
              <input
                id="kyc-acc-holder"
                name="accountHolderName"
                value={form.accountHolderName}
                onChange={handleChange}
                placeholder="As printed on Bank Passbook"
                required
              />
            </div>

            <div className="kyc-field">
              <label htmlFor="kyc-bank-name">Bank Name</label>
              <input
                id="kyc-bank-name"
                name="bankName"
                value={form.bankName}
                onChange={handleChange}
                placeholder="e.g. State Bank of India, HDFC Bank"
              />
            </div>

            <div className="kyc-field">
              <label htmlFor="kyc-acc-no">Bank Account Number *</label>
              <input
                id="kyc-acc-no"
                name="accountNumber"
                value={form.accountNumber}
                onChange={handleChange}
                placeholder="Enter Bank Account Number"
                required
              />
            </div>

            <div className="kyc-field">
              <label htmlFor="kyc-confirm-acc-no">Confirm Bank Account Number *</label>
              <input
                id="kyc-confirm-acc-no"
                name="confirmAccountNumber"
                value={form.confirmAccountNumber}
                onChange={handleChange}
                placeholder="Re-enter Bank Account Number"
                required
              />
            </div>

            <div className="kyc-field kyc-full-width">
              <label htmlFor="kyc-ifsc">Bank IFSC Code *</label>
              <input
                id="kyc-ifsc"
                name="ifscCode"
                value={form.ifscCode}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    ifscCode: e.target.value.toUpperCase(),
                  }))
                }
                placeholder="e.g. SBIN0001234 or HDFC0000123"
                style={{ textTransform: "uppercase", letterSpacing: "1px" }}
                required
              />
            </div>

            {/* =========================================================
                SECTION 3: DUAL FILE UPLOADS (AADHAAR + PASSBOOK SEPARATE)
            ========================================================= */}
            <div className="kyc-dual-upload-grid">
              {/* UPLOAD 1: IDENTITY DOCUMENT (AADHAAR / PAN) */}
              <div className="kyc-upload-box">
                <label htmlFor="kyc-document-file">
                  <FiFileText /> Upload Identity Document (Aadhaar / PAN) *
                </label>

                <label className="kyc-upload-area" htmlFor="kyc-document-file">
                  <span className="kyc-upload-icon">
                    <FiUploadCloud />
                  </span>
                  <strong>
                    {documentFile
                      ? documentFile.name
                      : kycRecord?.documentOriginalName
                      ? `Selected: ${kycRecord.documentOriginalName}`
                      : "Click to select Identity Document"}
                  </strong>
                  <span>Supports JPG, PNG, WEBP or PDF · Max 10 MB</span>

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
                    <span>Selected: {documentFile?.name}</span>
                  </div>
                )}
              </div>

              {/* UPLOAD 2: BANK PASSBOOK / CHEQUE (SEPARATE UPLOAD) */}
              <div className="kyc-upload-box">
                <label htmlFor="kyc-passbook-file" style={{ color: "#60a5fa" }}>
                  <FiCreditCard /> Upload Bank Passbook / Cheque Photo *
                </label>

                <label className="kyc-upload-area passbook-zone" htmlFor="kyc-passbook-file">
                  <span className="kyc-upload-icon">
                    <FiCamera />
                  </span>
                  <strong>
                    {passbookFile
                      ? passbookFile.name
                      : kycRecord?.passbookOriginalName
                      ? `Selected: ${kycRecord.passbookOriginalName}`
                      : "Click to select Bank Passbook Photo"}
                  </strong>
                  <span>Clear photo of front page or cheque · Max 10 MB</span>

                  <input
                    id="kyc-passbook-file"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={handlePassbookChange}
                  />
                </label>

                {passbookPreview && (
                  <div className="kyc-selected-preview passbook-preview">
                    <img src={passbookPreview} alt="Passbook preview" />
                    <span>Selected Passbook: {passbookFile?.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="kyc-privacy-note">
            <FiShield />
            <p>
              Your identity documents and bank credentials are securely encrypted and verified solely by authorized Starlink administrators for compliance and direct payout disbursement.
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
                ? "Uploading & Submitting Documents..."
                : isRejected
                ? "Re-submit KYC & Bank Details"
                : "Submit KYC & Bank Details for Verification"}
            </span>
          </button>
        </form>
      )}
    </div>
  );
}
