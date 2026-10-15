
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
} from "react-icons/fi";

import {
  createVendorUser,
  getMyVendorUsers,
  deleteVendorUser,
} from "../../lib/api";

import "./AddUser.css";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const EMPTY_FORM = {
  name: "",
  email: "",
  mobile: "",
  city: "",
  state: "",
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
  {
    key: "aadhaar",
    label: "Aadhaar Card",
  },
  {
    key: "pan",
    label: "PAN Card",
  },
  {
    key: "familyId",
    label: "Family ID",
  },
  {
    key: "bankProof",
    label: "Bank Passbook / Cancelled Cheque",
  },
];

const SAVED_DOCUMENT_FIELDS = [
  { key: "aadhaar", label: "Aadhaar Card" },
  { key: "pan", label: "PAN Card" },
  { key: "familyId", label: "Family ID" },
  { key: "bankProof", label: "Bank Proof" },
  { key: "ownerCertificate", label: "House Owner Certificate" },
];

/* Safely read the logged-in user */
const getLoggedInUser = () => {
  try {
    return JSON.parse(localStorage.getItem("userData") || "{}");
  } catch {
    return {};
  }
};

/* Safely read a document URL */
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

/* Safely read a user's document */
const getDocument = (user, key) => {
  if (!user || !key) return null;

  const documents =
    user.documents && typeof user.documents === "object"
      ? user.documents
      : {};

  const nestedDocument = documents[key];

  // Never access properties on null or undefined.
  if (nestedDocument) return nestedDocument;

  const directDocument = user[key];

  return directDocument || null;
};

/* Safely format dates */
const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/* Mask sensitive identification and bank numbers */
const maskValue = (value, visibleDigits = 4) => {
  if (!value) return "—";

  const text = String(value);

  if (text.length <= visibleDigits) {
    return "••••";
  }

  return (
    "•".repeat(Math.min(text.length - visibleDigits, 8)) +
    text.slice(-visibleDigits)
  );
};

/* Safely convert a selected file into a data URL */
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
  const [documents, setDocuments] = useState({
    ...EMPTY_DOCUMENTS,
  });

  const vendorId = userData._id || userData.id || "";

  /* ------------------------------------------
     Notifications
  ------------------------------------------ */

  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);
  };

  /* ------------------------------------------
     Fetch registered users
  ------------------------------------------ */

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const response = await getMyVendorUsers({
        vendorId,
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

    // Fetch when the logged-in vendor changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendorId, userData.email]);

  /* ------------------------------------------
     Form input handling
  ------------------------------------------ */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
      ...(name === "houseOwnerCertificate" && value === "No"
        ? { certificateAuthority: "" }
        : {}),
    }));

    setMessage("");
  };

  /* ------------------------------------------
     Document upload
  ------------------------------------------ */

  const handleDocumentChange = async (event, key) => {
    const input = event.target;
    const file = input.files?.[0];

    // Reset so the same file can be selected again.
    input.value = "";

    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    if (!allowedTypes.includes(file.type)) {
      showMessage(
        "Please upload a PDF, JPG, JPEG or PNG document.",
        "error"
      );
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      showMessage(
        "Each document must be 5 MB or smaller.",
        "error"
      );
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
      showMessage(
        error?.message || "Unable to read document.",
        "error"
      );
    }
  };

  const removeDocument = (key) => {
    setDocuments((previous) => ({
      ...previous,
      [key]: null,
    }));
  };

  /* ------------------------------------------
     Validation
  ------------------------------------------ */

  const validateForm = () => {
    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.mobile.trim() ||
      !form.city.trim() ||
      !form.state.trim()
    ) {
      return "Name, email, mobile, city and state are required.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      return "Please enter a valid email address.";
    }

    if (!/^\d{10}$/.test(form.mobile.trim())) {
      return "Mobile number must contain exactly 10 digits.";
    }

    if (
      form.aadhaarNumber &&
      !/^\d{12}$/.test(form.aadhaarNumber.trim())
    ) {
      return "Aadhaar number must contain exactly 12 digits.";
    }

    if (
      form.panNumber &&
      !/^[A-Z]{5}\d{4}[A-Z]$/i.test(form.panNumber.trim())
    ) {
      return "Please enter a valid PAN card number.";
    }

    if (
      form.ifscCode &&
      !/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(form.ifscCode.trim())
    ) {
      return "Please enter a valid IFSC code.";
    }

    if (
      form.houseOwnerCertificate === "Yes" &&
      !form.certificateAuthority
    ) {
      return "Please select the certificate issuing authority.";
    }

    if (
      form.houseOwnerCertificate === "Yes" &&
      !documents.ownerCertificate
    ) {
      return "Please upload the house owner certificate.";
    }

    return "";
  };

  /* ------------------------------------------
     Add user
  ------------------------------------------ */

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    const validationError = validateForm();

    if (validationError) {
      showMessage(validationError, "error");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        ...form,

        name: form.name.trim(),
        email: form.email.trim(),
        mobile: form.mobile.trim(),
        city: form.city.trim(),
        state: form.state.trim(),

        aadhaarNumber: form.aadhaarNumber.trim(),
        familyIdNumber: form.familyIdNumber.trim(),
        panNumber: form.panNumber.trim().toUpperCase(),
        bankAccountNumber: form.bankAccountNumber.trim(),
        ifscCode: form.ifscCode.trim().toUpperCase(),

        vendorId,
        vendorName: userData.name || "Vendor",
        vendorEmail: userData.email || "",
        vendorMobile: userData.mobile || "",

        documents: {
          aadhaar: documents.aadhaar,
          pan: documents.pan,
          familyId: documents.familyId,
          bankProof: documents.bankProof,

          ownerCertificate:
            form.houseOwnerCertificate === "Yes"
              ? documents.ownerCertificate
              : null,
        },
      };

      const response = await createVendorUser(payload);

      if (!response?.success) {
        throw new Error(
          response?.message || "Failed to register user."
        );
      }

      showMessage(
        `User "${form.name.trim()}" added successfully.`,
        "success"
      );

      setForm({ ...EMPTY_FORM });
      setDocuments({ ...EMPTY_DOCUMENTS });
      setSearch("");

      await fetchUsers();
    } catch (error) {
      console.error("Add user error:", error);

      showMessage(
        error?.message || "Unable to register user.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ------------------------------------------
     Delete user
  ------------------------------------------ */

  const handleDeleteUser = async (user) => {
    const userId = user?._id || user?.id;

    if (!userId) {
      showMessage("User ID is missing.", "error");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${user.name || "this user"}"?`
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

  /* ------------------------------------------
     Search
  ------------------------------------------ */

  const getSearchValues = (user) => {
    if (!user) return [];

    const values = [
      user.name,
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
        values.push(
          document.fileName,
          document.name
        );
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

  /* ------------------------------------------
     Open saved document
  ------------------------------------------ */

  const openDocument = (document) => {
    // Handles null, undefined, strings and objects safely.
    const url = getDocumentUrl(document);

    if (!url) {
      showMessage(
        "This document has not been uploaded or has no saved URL.",
        "error"
      );
      return;
    }

    // Avoid opening arbitrary protocols.
    const isDataUrl = url.startsWith("data:");
    const isHttpsUrl = url.startsWith("https://");

    if (!isDataUrl && !isHttpsUrl) {
      showMessage(
        "This document URL is invalid or unsupported.",
        "error"
      );
      return;
    }

    const newWindow = window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );

    if (!newWindow) {
      showMessage(
        "Please allow pop-ups to open this document.",
        "error"
      );
    }
  };

  /* ------------------------------------------
     Upload field
  ------------------------------------------ */

  const renderUploadField = (
    key,
    label,
    required = false
  ) => {
    const file = documents[key];

    return (
      <div
        className="add-user-field add-user-document-field"
        key={key}
      >
        <label htmlFor={`document-${key}`}>
          {label}
          {required ? " *" : ""}
        </label>

        <input
          id={`document-${key}`}
          className="add-user-file-input"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(event) =>
            handleDocumentChange(event, key)
          }
        />

        <label
          className={`add-user-upload-box ${
            file ? "has-file" : ""
          }`}
          htmlFor={`document-${key}`}
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

            <button
              type="button"
              onClick={() => removeDocument(key)}
            >
              Remove
            </button>
          </div>
        )}
      </div>
    );
  };

  /* ------------------------------------------
     Saved document card
     FIX: null documents never access fileName
  ------------------------------------------ */

  const renderSavedDocument = (user, key, label) => {
    const document = getDocument(user, key);

    // Safe for null, undefined and empty document values.
    const url = getDocumentUrl(document);

    const fileName =
      document && typeof document === "object"
        ? document.fileName || document.name || label
        : label;

    return (
      <div
        className="add-user-saved-document"
        key={key}
      >
        <div className="add-user-saved-document-icon">
          <FiFileText />
        </div>

        <div className="add-user-saved-document-info">
          <strong>{label}</strong>

          <small>
            {url ? fileName : "Not uploaded"}
          </small>
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
          <span className="add-user-document-missing">
            Missing
          </span>
        )}
      </div>
    );
  };

  /* ------------------------------------------
     Render
  ------------------------------------------ */

  return (
    <div className="add-user-page">
      <div className="add-user-heading">
        <div>
          <span className="add-user-eyebrow">
            USER MANAGEMENT
          </span>

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

      {/* ADD USER FORM */}

      <section className="add-user-form-card">
        <div className="add-user-section-heading">
          <div className="add-user-heading-icon">
            <FiUserPlus />
          </div>

          <div>
            <h2>User Information</h2>
            <p>
              Enter personal details and upload supporting documents.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="add-user-form-grid">
            {/* 01: Personal information */}

            <div className="add-user-form-section-title">
              <span>01</span>
              <div>
                <h3>Personal Information</h3>
                <p>Basic contact and location details</p>
              </div>
            </div>

            <div className="add-user-field">
              <label htmlFor="add-user-name">
                Full Name *
              </label>

              <input
                id="add-user-name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter full name"
                autoComplete="name"
                required
              />
            </div>

            <div className="add-user-field">
              <label htmlFor="add-user-email">
                Email Address *
              </label>

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
              <label htmlFor="add-user-mobile">
                Mobile Number *
              </label>

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
              <label htmlFor="add-user-city">
                City / Village *
              </label>

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
              <label htmlFor="add-user-state">
                State *
              </label>

              <input
                id="add-user-state"
                name="state"
                value={form.state}
                onChange={handleChange}
                placeholder="Enter state"
                required
              />
            </div>

            {/* 02: Identity */}

            <div className="add-user-form-section-title">
              <span>02</span>
              <div>
                <h3>Identity Details</h3>
                <p>Identification numbers</p>
              </div>
            </div>

            <div className="add-user-field">
              <label htmlFor="add-user-aadhaar">
                Aadhaar Card Number
              </label>

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
              <label htmlFor="add-user-family">
                Family ID Number
              </label>

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
              <label htmlFor="add-user-pan">
                PAN Card Number
              </label>

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

            {/* 03: Bank details */}

            <div className="add-user-form-section-title">
              <span>03</span>
              <div>
                <h3>Bank Details</h3>
                <p>Account and IFSC information</p>
              </div>
            </div>

            <div className="add-user-field">
              <label htmlFor="add-user-bank">
                Bank Account Number
              </label>

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
              <label htmlFor="add-user-ifsc">
                IFSC Code
              </label>

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

            {/* 04: House owner certificate */}

            <div className="add-user-form-section-title">
              <span>04</span>
              <div>
                <h3>House Owner Certificate</h3>
                <p>
                  Select Yes to provide the issuing authority
                  and upload the certificate.
                </p>
              </div>
            </div>

            <div className="add-user-field">
              <label htmlFor="add-user-owner-certificate">
                House Owner Certificate Available? *
              </label>

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
                  <label htmlFor="add-user-authority">
                    Certificate Issued By *
                  </label>

                  <select
                    id="add-user-authority"
                    name="certificateAuthority"
                    value={form.certificateAuthority}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Select issuing authority
                    </option>

                    <option value="Sarpanch">
                      Sarpanch
                    </option>

                    <option value="MC">
                      Municipal Committee (MC)
                    </option>

                    <option value="Registrar">
                      Registrar
                    </option>

                    <option value="Other">
                      Other Authorized Authority
                    </option>
                  </select>
                </div>

                {renderUploadField(
                  "ownerCertificate",
                  "House Owner Certificate",
                  true
                )}
              </>
            )}

            {/* 05: Documents */}

            <div className="add-user-form-section-title">
              <span>05</span>
              <div>
                <h3>Document Uploads</h3>
                <p>
                  PDF, JPG or PNG files · Maximum 5 MB per document
                </p>
              </div>
            </div>

            {DOCUMENT_FIELDS.map((document) =>
              renderUploadField(
                document.key,
                document.label
              )
            )}
          </div>

          <div className="add-user-form-note">
            <FiShield />

            <p>
              Upload only necessary documents. Identity and bank
              information should be stored securely and accessible
              only to authorized users.
            </p>
          </div>

          <button
            type="submit"
            className="add-user-submit"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <FiLoader className="spinning" />
                Saving User...
              </>
            ) : (
              <>
                <FiUserPlus />
                Add User
              </>
            )}
          </button>
        </form>
      </section>

      {/* REGISTERED USERS */}

      <section className="add-user-list-card">
        <div className="add-user-list-heading">
          <div>
            <h2>My Registered Users</h2>
            <p>
              Search registered users and access their document records.
            </p>
          </div>

          <div className="add-user-search">
            <FiSearch />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search name, email, mobile, ID..."
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
          </div>
        </div>

        <div className="add-user-search-summary">
          Showing {filteredUsers.length} of {users.length} users
        </div>

        <div className="add-user-table-wrap">
          <table className="add-user-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Mobile</th>
                <th>City &amp; State</th>
                <th>Aadhaar</th>
                <th>Family ID</th>
                <th>PAN</th>
                <th>Bank Account</th>
                <th>IFSC</th>
                <th>House Owner Certificate</th>
                <th>Documents</th>
                <th>Status</th>
                <th>Added Date</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={13}
                    className="add-user-empty"
                  >
                    <FiLoader className="spinning" />
                    <span> Loading registered users...</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={13}
                    className="add-user-empty"
                  >
                    {users.length === 0
                      ? "No registered users found. Add your first user above."
                      : "No matching users found. Try another search."}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const userId = user._id || user.id;

                  const certificateStatus =
                    user.houseOwnerCertificate || "No";

                  const uploadedCount =
                    SAVED_DOCUMENT_FIELDS.filter(
                      ({ key }) =>
                        Boolean(
                          getDocumentUrl(
                            getDocument(user, key)
                          )
                        )
                    ).length;

                  return (
                    <React.Fragment key={userId}>
                      <tr>
                        <td>
                          <div className="add-user-person">
                            <span>
                              {(user.name || "U")
                                .charAt(0)
                                .toUpperCase()}
                            </span>

                            <div>
                              <strong>
                                {user.name || "Unnamed"}
                              </strong>

                              <small>
                                {user.email || "—"}
                              </small>
                            </div>
                          </div>
                        </td>

                        <td>{user.mobile || "—"}</td>

                        <td>
                          {[user.city, user.state]
                            .filter(Boolean)
                            .join(", ") || "—"}
                        </td>

                        <td>
                          {maskValue(user.aadhaarNumber)}
                        </td>

                        <td>
                          {user.familyIdNumber || "—"}
                        </td>

                        <td>
                          {maskValue(user.panNumber)}
                        </td>

                        <td>
                          {maskValue(user.bankAccountNumber)}
                        </td>

                        <td>
                          {user.ifscCode || "—"}
                        </td>

                        <td>
                          <span
                            className={`add-user-status ${
                              certificateStatus === "Yes"
                                ? "is-yes"
                                : "is-no"
                            }`}
                          >
                            {certificateStatus}
                          </span>

                          {certificateStatus === "Yes" &&
                            user.certificateAuthority && (
                              <small className="add-user-authority">
                                {user.certificateAuthority}
                              </small>
                            )}
                        </td>

                        <td>
                          <span className="add-user-doc-count">
                            {uploadedCount}/5 uploaded
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

                        <td>
                          {formatDate(user.createdAt)}
                        </td>

                        <td>
                          <button
                            type="button"
                            className="add-user-delete"
                            onClick={() =>
                              handleDeleteUser(user)
                            }
                            aria-label={`Delete ${
                              user.name || "user"
                            }`}
                            title="Delete user"
                          >
                            <FiTrash2 />
                          </button>
                        </td>
                      </tr>

                      {/* Expandable document list */}

                      <tr className="add-user-documents-row">
                        <td colSpan={13}>
                          <details className="add-user-documents-details">
                            <summary>
                              <FiFileText />

                              <span>
                                Documents — {user.name || "User"}
                              </span>

                              <span className="add-user-summary-hint">
                                View document list
                              </span>
                            </summary>

                            <div className="add-user-saved-documents-grid">
                              {SAVED_DOCUMENT_FIELDS.map(
                                ({ key, label }) =>
                                  renderSavedDocument(
                                    user,
                                    key,
                                    label
                                  )
                              )}
                            </div>
                          </details>
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
