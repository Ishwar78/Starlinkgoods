
import React, { useState, useEffect, useMemo } from "react";
import {
  FiUserPlus,
  FiSearch,
  FiTrash2,
  FiUsers,
  FiCheckCircle,
  FiAlertCircle,
  FiLoader,
  FiUploadCloud,
  FiFileText,
  FiExternalLink,
  FiShield,
  FiCalendar,
  FiEye,
  FiEyeOff,
  FiCreditCard,
  FiLock,
  FiMail,
  FiPhone,
  FiMapPin,
  FiHome,
} from "react-icons/fi";

import {
  createMembershipOrder,
  verifyAndRegisterMember,
  createVendorUser,
  getMyVendorUsers,
  deleteVendorUser,
} from "../../lib/api";

import "./AddUser.css";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const EMPTY_FORM = {
  name: "",
  lastName: "",
  email: "",
  mobile: "",
  city: "",
  state: "",
  address: "",
  password: "",
  confirmPassword: "",
  // Legacy / Commented out fields
  dob: "",
  aadhaarNumber: "",
  familyIdNumber: "",
  panNumber: "",
  bankAccountNumber: "",
  ifscCode: "",
  houseOwnerCertificate: "No",
  certificateAuthority: "",
};

const EMPTY_DOCUMENTS = {
  aadhaar: null,
  pan: null,
  familyId: null,
  bankProof: null,
  ownerCertificate: null,
};

const DOCUMENT_FIELDS = [
  { key: "aadhaar", label: "Aadhaar Card" },
  { key: "pan", label: "PAN Card" },
  { key: "familyId", label: "Family ID" },
  { key: "bankProof", label: "Bank Passbook / Cancelled Cheque" },
];

const SAVED_DOCUMENT_FIELDS = [
  { key: "aadhaar", label: "Aadhaar Card" },
  { key: "pan", label: "PAN Card" },
  { key: "familyId", label: "Family ID" },
  { key: "bankProof", label: "Bank Passbook / Cancelled Cheque" },
  { key: "ownerCertificate", label: "House Owner Certificate" },
];

const getLoggedInUser = () => {
  try {
    return JSON.parse(localStorage.getItem("userData") || "{}");
  } catch {
    return {};
  }
};

const getFullName = (user) => {
  if (!user) return "Unnamed";

  const first = String(user.name || "").trim();
  const last = String(user.lastName || "").trim();

  // Avoid repeating the surname if name already stores the full name.
  if (last && first.toLowerCase().endsWith(` ${last.toLowerCase()}`)) {
    return first;
  }

  return [first, last].filter(Boolean).join(" ") || "Unnamed";
};

const getDocumentUrl = (document) => {
  if (!document) return "";

  if (typeof document === "string") {
    return document;
  }

  if (typeof document !== "object") {
    return "";
  }

  return (
    document.dataUrl ||
    document.url ||
    document.secureUrl ||
    document.fileUrl ||
    ""
  );
};

const getDocument = (user, key) => {
  if (!user || !key) return null;

  const documents =
    user.documents && typeof user.documents === "object"
      ? user.documents
      : {};

  return documents[key] || user[key] || null;
};

const formatDate = (value) => {
  if (!value) return "—";

  // Avoid timezone shifting for date-only values such as YYYY-MM-DD.
  const dateOnly =
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value);

  const date = dateOnly
    ? new Date(`${value}T00:00:00`)
    : new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const calculateAge = (dob) => {
  if (!dob) return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob);

  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);

  const birthDate = new Date(year, month, day);
  const today = new Date();

  // Reject invalid dates, including impossible calendar dates.
  if (
    birthDate.getFullYear() !== year ||
    birthDate.getMonth() !== month ||
    birthDate.getDate() !== day ||
    birthDate > today
  ) {
    return null;
  }

  let years = today.getFullYear() - year;
  let months = today.getMonth() - month;
  let days = today.getDate() - day;

  if (days < 0) {
    months--;

    const daysInPreviousMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      0
    ).getDate();

    days += daysInPreviousMonth;
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  return { years, months, days };
};

const formatAge = (dob) => {
  const age = calculateAge(dob);

  if (!age) return "—";

  return [
    `${age.years} ${age.years === 1 ? "year" : "years"}`,
    `${age.months} ${age.months === 1 ? "month" : "months"}`,
    `${age.days} ${age.days === 1 ? "day" : "days"}`,
  ].join(", ");
};

const maskValue = (value, visibleDigits = 4) => {
  if (!value) return "—";

  const text = String(value);

  if (text.length <= visibleDigits) return "••••";

  return (
    "•".repeat(Math.min(text.length - visibleDigits, 8)) +
    text.slice(-visibleDigits)
  );
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Unable to read the selected file."));
        return;
      }

      resolve(reader.result);
    };

    reader.onerror = () => {
      reject(new Error("Unable to read the selected file."));
    };

    reader.readAsDataURL(file);
  });

const AddUser = () => {
  const [userData] = useState(getLoggedInUser);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [documents, setDocuments] = useState({ ...EMPTY_DOCUMENTS });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const vendorId = userData._id || userData.id || "";

  // Load Razorpay script if not already present
  useEffect(() => {
    if (window.Razorpay) return;
    const scriptId = "razorpay-checkout-script";
    if (document.getElementById(scriptId)) return;
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const response = await getMyVendorUsers({
        vendorId,
        vendorUniqueId: userData.vendorId || "",
        vendorEmail: userData.email || "",
      });

      if (response?.success && Array.isArray(response.users)) {
        setUsers(response.users);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Fetch users error:", error);
      showMessage(
        error?.message || "Unable to load registered users.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendorId, userData.email, userData.vendorId]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        name === "panNumber" || name === "ifscCode"
          ? value.toUpperCase()
          : value,
      ...(name === "houseOwnerCertificate" && value === "No"
        ? { certificateAuthority: "" }
        : {}),
    }));

    setMessage("");
  };

  const handleDocumentChange = async (event, key) => {
    const input = event.target;
    const file = input.files?.[0];

    // Allows the same file to be selected again.
    input.value = "";

    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    if (!allowedTypes.includes(file.type)) {
      showMessage("Upload a PDF, JPG, JPEG or PNG document.", "error");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      showMessage("Each document must be 5 MB or smaller.", "error");
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);

      setDocuments((previous) => ({
        ...previous,
        [key]: {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          dataUrl,
        },
      }));

      setMessage("");
    } catch (error) {
      showMessage(error?.message || "Unable to read document.", "error");
    }
  };

  const removeDocument = (key) => {
    setDocuments((previous) => ({
      ...previous,
      [key]: null,
    }));
  };

  const validateForm = () => {
    if (!form.name.trim() || !form.lastName.trim()) {
      return "Please enter both First Name and Last Name.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      return "Please enter a valid email address.";
    }

    if (!/^\d{10}$/.test(form.mobile.trim())) {
      return "Mobile number must be exactly 10 digits.";
    }

    if (!form.city.trim() || !form.state.trim()) {
      return "City and State are required.";
    }

    if (!form.address?.trim()) {
      return "Address is required.";
    }

    if (!form.password || form.password.length < 6) {
      return "Password must be at least 6 characters long.";
    }

    if (form.password !== form.confirmPassword) {
      return "Password and Confirm Password do not match.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    const validationError = validateForm();
    if (validationError) {
      showMessage(validationError, "error");
      return;
    }

    if (!window.Razorpay) {
      showMessage("Payment gateway is loading. Please check your internet connection.", "error");
      return;
    }

    try {
      setSubmitting(true);

      const parentVendorId = userData.vendorId || userData.id || userData._id || "";
      const parentVendorName = userData.name || "Vendor";

      // 1. Create ₹500 Razorpay Order
      const orderData = await createMembershipOrder({
        vendorId: parentVendorId,
        vendorName: parentVendorName,
        firstName: form.name.trim(),
        lastName: form.lastName.trim(),
        fullName: `${form.name.trim()} ${form.lastName.trim()}`,
        name: `${form.name.trim()} ${form.lastName.trim()}`,
        email: form.email.trim(),
        mobile: form.mobile.trim(),
        password: form.password,
        city: form.city.trim(),
        state: form.state.trim(),
        address: form.address.trim(),
        fee: 500,
      });

      if (!orderData || !orderData.success || !orderData.orderId) {
        throw new Error(orderData?.message || "Failed to initialize ₹500 payment order.");
      }

      // 2. Open Razorpay Checkout modal
      const options = {
        key: orderData.keyId,
        order_id: orderData.orderId,
        amount: orderData.amount, // 50000 paise
        currency: orderData.currency || "INR",
        name: "Star Link Goods",
        description: "Member Registration Fee (₹500)",
        image: "/Logo.jpeg",
        prefill: {
          name: `${form.name} ${form.lastName}`.trim(),
          email: form.email.trim(),
          contact: form.mobile.trim(),
        },
        notes: {
          vendorId: parentVendorId,
          vendorName: parentVendorName,
          purpose: `Member Registration by Vendor ${parentVendorId}`,
        },
        theme: { color: "#ffd044" },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
            showMessage("Payment window closed. User registration was not completed.", "error");
          },
        },
        handler: async (paymentResponse) => {
          try {
            setSubmitting(true);
            showMessage("Payment verified! Saving member to database...", "success");

            // 3. Verify payment and create member in DB
            const regData = await verifyAndRegisterMember({
              vendorId: parentVendorId,
              vendorName: parentVendorName,
              firstName: form.name.trim(),
              lastName: form.lastName.trim(),
              fullName: `${form.name.trim()} ${form.lastName.trim()}`,
              name: `${form.name.trim()} ${form.lastName.trim()}`,
              email: form.email.trim(),
              mobile: form.mobile.trim(),
              city: form.city.trim(),
              state: form.state.trim(),
              address: form.address.trim(),
              password: form.password,
              fee: 500,
              role: "Member",
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
            });

            if (!regData || !regData.success) {
              throw new Error(regData?.message || "Payment verified, but registration failed.");
            }

            showMessage(
              `Member "${regData.user.name}" registered successfully with ID: ${regData.user.vendorId}!`,
              "success"
            );

            setForm({ ...EMPTY_FORM });
            setDocuments({ ...EMPTY_DOCUMENTS });
            await fetchUsers();
          } catch (regErr) {
            console.error("Member registration error:", regErr);
            showMessage(regErr.message || "Failed to complete member registration.", "error");
          } finally {
            setSubmitting(false);
          }
        },
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.on("payment.failed", (response) => {
        setSubmitting(false);
        showMessage(
          `Payment failed: ${response.error?.description || "Transaction declined"}. Member was not registered.`,
          "error"
        );
      });

      rzpInstance.open();
    } catch (error) {
      console.error("Add user error:", error);
      showMessage(
        error?.message || "Unable to register user.",
        "error"
      );
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (user) => {
    const userId = user?._id || user?.id;

    if (!userId) {
      showMessage("User ID is missing.", "error");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${getFullName(user)}"?`
    );

    if (!confirmed) return;

    try {
      const response = await deleteVendorUser(userId);

      if (!response?.success) {
        throw new Error(
          response?.message || "Unable to delete user."
        );
      }

      showMessage("User deleted successfully.", "success");
      await fetchUsers();
    } catch (error) {
      console.error("Delete user error:", error);
      showMessage(
        error?.message || "Unable to delete user.",
        "error"
      );
    }
  };

  const getSearchValues = (user) => {
    if (!user) return [];

    const values = [
      user.name,
      user.firstName,
      user.lastName,
      getFullName(user),
      user.dob,
      formatDate(user.dob),
      formatAge(user.dob),
      user.email,
      user.mobile,
      user.city,
      user.state,
      user.aadhaarNumber,
      user.familyIdNumber,
      user.panNumber,
      user.bankAccountNumber,
      user.ifscCode,
      user.houseOwnerCertificate,
      user.certificateAuthority,
    ];

    SAVED_DOCUMENT_FIELDS.forEach(({ key }) => {
      const document = getDocument(user, key);

      if (!document) return;

      if (typeof document === "string") {
        values.push(document);
        return;
      }

      if (typeof document === "object") {
        values.push(document.fileName, document.name);
      }
    });

    return values
      .filter(
        (value) =>
          value !== null &&
          value !== undefined &&
          typeof value !== "object"
      )
      .map(String);
  };

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return users;

    return users.filter((user) =>
      getSearchValues(user).some((value) =>
        value.toLowerCase().includes(query)
      )
    );
  }, [users, search]);

  const openDocument = (document) => {
    const url = getDocumentUrl(document);

    if (!url) {
      showMessage("This document has not been uploaded.", "error");
      return;
    }

    if (!url.startsWith("data:") && !url.startsWith("https://")) {
      showMessage("This document URL is invalid or unsupported.", "error");
      return;
    }

    const newWindow = window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );

    if (!newWindow) {
      showMessage("Please allow pop-ups to open this document.", "error");
    }
  };

  const renderUploadField = (key, label, required = false) => {
    const file = documents[key];
    const inputId = `document-${key}`;

    return (
      <div className="add-user-field add-user-document-field" key={key}>
        <label htmlFor={inputId}>
          {label}{required ? " *" : ""}
        </label>

        <input
          id={inputId}
          className="add-user-file-input"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(event) => handleDocumentChange(event, key)}
        />

        <label
          className={`add-user-upload-box ${file ? "has-file" : ""}`}
          htmlFor={inputId}
        >
          <FiUploadCloud className="add-user-upload-icon" />

          <span className="add-user-upload-copy">
            <strong>
              {file ? "Document selected" : "Choose document"}
            </strong>
            <small>
              {file
                ? file.fileName
                : "PDF, JPG or PNG · Maximum 5 MB"}
            </small>
          </span>
        </label>

        {file && (
          <div className="add-user-selected-file">
            <span>
              <FiFileText />
              {file.fileName}
            </span>
            <button type="button" onClick={() => removeDocument(key)}>
              Remove
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderSavedDocument = (user, key, label) => {
    const document = getDocument(user, key);
    const url = getDocumentUrl(document);

    const fileName =
      document && typeof document === "object"
        ? document.fileName || document.name || label
        : label;

    return (
      <div className="add-user-saved-document" key={key}>
        <div className="add-user-saved-document-icon">
          <FiFileText />
        </div>

        <div className="add-user-saved-document-info">
          <strong>{label}</strong>
          <small>{url ? fileName : "Not uploaded"}</small>
        </div>

        {url ? (
          <button
            type="button"
            className="add-user-document-open"
            onClick={() => openDocument(document)}
            title={`Open ${label}`}
          >
            <FiExternalLink />
            <span>View</span>
          </button>
        ) : (
          <span className="add-user-document-missing">Missing</span>
        )}
      </div>
    );
  };

  return (
    <div className="add-user-page">
      <div className="add-user-heading">
        <div>
          <span className="add-user-eyebrow">USER MANAGEMENT</span>
          <h1>Add User</h1>
          <p>
            Register users and manage their personal details,
            banking information and supporting documents.
          </p>
        </div>

        <div className="add-user-count">
          <FiUsers />
          <span>{users.length} Registered Users</span>
        </div>
      </div>

      {message && (
        <div
          className={`add-user-message ${messageType}`}
          role="status"
        >
          {messageType === "error" ? (
            <FiAlertCircle />
          ) : (
            <FiCheckCircle />
          )}

          <span>{message}</span>

          <button
            type="button"
            className="add-user-message-close"
            onClick={() => setMessage("")}
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}

      <section className="add-user-form-card">
        <div className="add-user-section-heading">
          <div className="add-user-heading-icon">
            <FiUserPlus />
          </div>
          <div>
            <h2>Member Information</h2>
            <p>
              Enter member's basic details, create an account password, and complete ₹500 registration fee.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="add-user-form-grid">
            <div className="add-user-form-section-title">
              <span>01</span>
              <div>
                <h3>Personal Information</h3>
                <p>Basic contact and location details</p>
              </div>
            </div>

            <div className="add-user-field">
              <label htmlFor="add-user-name">First Name *</label>
              <input
                id="add-user-name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter first name"
                autoComplete="given-name"
                required
              />
            </div>

            <div className="add-user-field">
              <label htmlFor="add-user-last-name">Last Name *</label>
              <input
                id="add-user-last-name"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Enter last name"
                autoComplete="family-name"
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
                autoComplete="email"
                required
              />
            </div>

            <div className="add-user-field">
              <label htmlFor="add-user-mobile">Mobile Number *</label>
              <input
                id="add-user-mobile"
                name="mobile"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={form.mobile}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                autoComplete="tel"
                required
              />
            </div>

            <div className="add-user-field">
              <label htmlFor="add-user-city">City / Village *</label>
              <input
                id="add-user-city"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Enter city or village"
                required
              />
            </div>

            <div className="add-user-field">
              <label htmlFor="add-user-state">State *</label>
              <input
                id="add-user-state"
                name="state"
                value={form.state}
                onChange={handleChange}
                placeholder="Enter state"
                required
              />
            </div>

            <div className="add-user-field" style={{ gridColumn: "1 / -1" }}>
              <label htmlFor="add-user-address">Full Address *</label>
              <input
                id="add-user-address"
                name="address"
                value={form.address || ""}
                onChange={handleChange}
                placeholder="House no., street, area, landmark..."
                autoComplete="street-address"
                required
              />
            </div>

            <div className="add-user-form-section-title">
              <span>02</span>
              <div>
                <h3>Account Password</h3>
                <p>Create login credentials for the member</p>
              </div>
            </div>

            <div className="add-user-field">
              <label htmlFor="add-user-password">Create Password *</label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input
                  id="add-user-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password || ""}
                  onChange={handleChange}
                  placeholder="Min 6 characters"
                  autoComplete="new-password"
                  style={{ paddingRight: "42px", width: "100%" }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    color: "#ffd044",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    fontSize: "16px",
                    padding: "4px",
                  }}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className="add-user-field">
              <label htmlFor="add-user-confirm-password">Confirm Password *</label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input
                  id="add-user-confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword || ""}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  style={{ paddingRight: "42px", width: "100%" }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    color: "#ffd044",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    fontSize: "16px",
                    padding: "4px",
                  }}
                  title={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {/* ==============================================================
                DOCUMENT & IDENTITY DETAILS (COMMENTED OUT AS PER REQUIREMENT)
                ============================================================== */}
            {/*
            <div className="add-user-field">
              <label htmlFor="add-user-dob">Date of Birth</label>
              <div className="add-user-date-wrap">
                <input
                  id="add-user-dob"
                  name="dob"
                  type="date"
                  value={form.dob}
                  max={new Date().toLocaleDateString("en-CA")}
                  onChange={handleChange}
                  autoComplete="bday"
                />
                <FiCalendar />
              </div>
            </div>

            <div className="add-user-form-section-title">
              <span>03</span>
              <div>
                <h3>Identity Details</h3>
                <p>Identification numbers and documents</p>
              </div>
            </div>

            <div className="add-user-field">
              <label htmlFor="add-user-aadhaar">Aadhaar Card Number</label>
              <input
                id="add-user-aadhaar"
                name="aadhaarNumber"
                type="password"
                inputMode="numeric"
                maxLength={12}
                autoComplete="off"
                value={form.aadhaarNumber}
                onChange={handleChange}
                placeholder="12-digit Aadhaar number"
              />
            </div>

            <div className="add-user-field">
              <label htmlFor="add-user-family">Family ID Number</label>
              <input
                id="add-user-family"
                name="familyIdNumber"
                value={form.familyIdNumber}
                onChange={handleChange}
                placeholder="Enter Family ID"
                autoComplete="off"
              />
            </div>

            <div className="add-user-field">
              <label htmlFor="add-user-pan">PAN Card Number</label>
              <input
                id="add-user-pan"
                name="panNumber"
                maxLength={10}
                value={form.panNumber}
                onChange={handleChange}
                placeholder="ABCDE1234F"
                autoComplete="off"
              />
            </div>

            <div className="add-user-form-section-title">
              <span>04</span>
              <div>
                <h3>Bank Details</h3>
                <p>Account and IFSC information</p>
              </div>
            </div>

            <div className="add-user-field">
              <label htmlFor="add-user-bank">Bank Account Number</label>
              <input
                id="add-user-bank"
                name="bankAccountNumber"
                type="password"
                inputMode="numeric"
                value={form.bankAccountNumber}
                onChange={handleChange}
                placeholder="Enter bank account number"
                autoComplete="off"
              />
            </div>

            <div className="add-user-field">
              <label htmlFor="add-user-ifsc">IFSC Code</label>
              <input
                id="add-user-ifsc"
                name="ifscCode"
                maxLength={11}
                value={form.ifscCode}
                onChange={handleChange}
                placeholder="e.g. SBIN0001234"
                autoComplete="off"
              />
            </div>

            <div className="add-user-form-section-title">
              <span>05</span>
              <div>
                <h3>House Owner Certificate</h3>
                <p>If available, select the issuing authority and upload the certificate.</p>
              </div>
            </div>

            <div className="add-user-field">
              <label htmlFor="add-user-owner-certificate">House Owner Certificate Available?</label>
              <select
                id="add-user-owner-certificate"
                name="houseOwnerCertificate"
                value={form.houseOwnerCertificate}
                onChange={handleChange}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>

            {form.houseOwnerCertificate === "Yes" && (
              <>
                <div className="add-user-field">
                  <label htmlFor="add-user-authority">Certificate Issued By *</label>
                  <select
                    id="add-user-authority"
                    name="certificateAuthority"
                    value={form.certificateAuthority}
                    onChange={handleChange}
                  >
                    <option value="">Select issuing authority</option>
                    <option value="Sarpanch">Sarpanch</option>
                    <option value="Municipal Council (MC)">Municipal Council (MC)</option>
                    <option value="Registrar">Registrar</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="add-user-certificate-upload">
                  {renderUploadField("ownerCertificate", "Upload House Owner Certificate")}
                </div>
              </>
            )}

            <div className="add-user-form-section-title">
              <span>06</span>
              <div>
                <h3>Upload Documents</h3>
                <p>Upload PDF, JPG or PNG files up to 5 MB each.</p>
              </div>
            </div>

            {DOCUMENT_FIELDS.map(({ key, label }) => renderUploadField(key, label))}
            */}
          </div>

          <div className="add-user-form-note">
            <FiShield />
            <p>
              Member will be registered under Vendor ID{" "}
              <strong style={{ color: "#ffd044" }}>{userData.vendorId || userData.name}</strong>. A one-time ₹500 registration fee via Razorpay is required to activate the account.
            </p>
          </div>

          <button
            type="submit"
            className="add-user-submit"
            disabled={submitting}
            style={{
              background: "linear-gradient(135deg, #ffd044, #e5aa0a)",
              color: "#080808",
              fontWeight: 800,
              fontSize: "14.5px",
              padding: "13px 26px",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? (
              <>
                <FiLoader className="spinning" />
                Processing Registration &amp; ₹500 Payment...
              </>
            ) : (
              <>
                <FiCreditCard />
                Next &amp; Pay ₹500 (Register Member)
              </>
            )}
          </button>
        </form>
      </section>

      <section className="add-user-list-card">
        <div className="add-user-list-heading">
          <div>
            <h2>Registered Members &amp; Users</h2>
            <p>Members who joined using your Vendor ID or registered through your portal.</p>
          </div>

          <label className="add-user-search">
            <FiSearch />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, member ID, email, mobile..."
              aria-label="Search registered users"
            />
            {search && (
              <button
                type="button"
                className="add-user-clear-search"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </label>
        </div>

        <p className="add-user-search-summary">
          Showing {filteredUsers.length} of {users.length} members
        </p>

        <div className="add-user-table-wrap">
          <table className="add-user-table">
            <thead>
              <tr>
                <th>Member / User</th>
                <th>Member ID</th>
                <th>Contact</th>
                <th>Location</th>
                <th>Fee Paid</th>
                <th>Status</th>
                <th>Registered Date</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="add-user-empty">
                    <FiLoader className="spinning" />
                    Loading registered members...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="add-user-empty">
                    {search
                      ? "No members match your search."
                      : "No registered members found under your vendor ID yet."}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const userId = user._id || user.id;
                  const fullName = getFullName(user);

                  return (
                    <React.Fragment key={userId}>
                      <tr>
                        <td>
                          <div className="add-user-person">
                            <span>
                              {fullName.charAt(0).toUpperCase()}
                            </span>
                            <div>
                              <strong>{fullName}</strong>
                              <small>{user.email || "—"}</small>
                            </div>
                          </div>
                        </td>

                        <td>
                          {user.vendorId ? (
                            <span
                              style={{
                                background: "rgba(255, 199, 45, 0.15)",
                                color: "#ffd044",
                                border: "1px solid rgba(255, 199, 45, 0.35)",
                                padding: "3px 8px",
                                borderRadius: "5px",
                                fontSize: "12px",
                                fontFamily: "monospace",
                                fontWeight: "800",
                                letterSpacing: "0.5px",
                                display: "inline-block",
                              }}
                            >
                              {user.vendorId}
                            </span>
                          ) : (
                            <span style={{ color: "#a89d8d", fontSize: 12 }}>—</span>
                          )}
                        </td>

                        <td>
                          <div>
                            <FiPhone style={{ marginRight: 4, color: "#ffd044", fontSize: 11 }} />
                            <span>{user.mobile || "—"}</span>
                          </div>
                          {user.email && (
                            <div style={{ color: "#a89d8d", fontSize: 11 }}>
                              <FiMail style={{ marginRight: 4, color: "#ffd044", fontSize: 10 }} />
                              <span>{user.email}</span>
                            </div>
                          )}
                        </td>

                        <td>
                          <div style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                            <FiMapPin style={{ color: "#ffd044", fontSize: 12 }} />
                            <span>{[user.city, user.state].filter(Boolean).join(", ") || "—"}</span>
                          </div>
                        </td>

                        <td>
                          <span style={{ color: "#34d399", fontWeight: 700, fontSize: "12px" }}>
                            ₹500 Paid
                          </span>
                        </td>

                        <td>
                          <span
                            className={`add-user-role-badge ${
                              user.status === "Inactive"
                                ? "is-inactive"
                                : ""
                            }`}
                          >
                            {user.status || "Active"}
                          </span>
                        </td>

                        <td style={{ color: "#a89d8d", fontSize: 12 }}>
                          {formatDate(user.createdAt)}
                        </td>

                        <td>
                          <button
                            type="button"
                            className="add-user-delete"
                            onClick={() => handleDeleteUser(user)}
                            aria-label={`Delete ${fullName}`}
                            title="Delete member"
                          >
                            <FiTrash2 />
                          </button>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AddUser;
