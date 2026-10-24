import React, { useEffect, useState, useRef } from "react";
import {
  FiImage,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiRefreshCw,
  FiCheckCircle,
  FiAlertCircle,
  FiSave,
  FiX,
  FiUploadCloud,
  FiExternalLink,
  FiLayers,
  FiEye,
} from "react-icons/fi";
import {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  formatImageUrl,
} from "../../lib/api.js";
import "./Banners.css";

export default function Banners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null); // null if adding new
  const [previewModalImg, setPreviewModalImg] = useState(""); // for full image lightbox preview

  // Form Fields
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [order, setOrder] = useState(0);
  const [status, setStatus] = useState("Active");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploadMode, setUploadMode] = useState("file"); // "file" or "url"

  const fileInputRef = useRef(null);

  // Load banners from API
  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await getBanners({ status: "All" });
      if (res.success && Array.isArray(res.banners)) {
        setBanners(res.banners);
      } else {
        setBanners([]);
      }
    } catch (err) {
      console.error("Error loading banners:", err);
      setMessage(err.message || "Failed to load banners.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingBanner(null);
    setTitle("");
    setLink("");
    setOrder(banners.length + 1);
    setStatus("Active");
    setImageFile(null);
    setImagePreview("");
    setImageUrl("");
    setUploadMode("file");
    setMessage("");
    setShowModal(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (b) => {
    setEditingBanner(b);
    setTitle(b.title || "");
    setLink(b.link || "");
    setOrder(b.order ?? 0);
    setStatus(b.status || "Active");
    setImageFile(null);
    setImagePreview(b.image ? formatImageUrl(b.image) : "");
    setImageUrl(b.image?.startsWith("http") ? b.image : "");
    setUploadMode("file");
    setMessage("");
    setShowModal(true);
  };

  // Close modal and reset
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBanner(null);
    setTitle("");
    setLink("");
    setOrder(0);
    setStatus("Active");
    setImageFile(null);
    setImagePreview("");
    setImageUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Handle image file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setMessage("Please select a valid image file (PNG, JPG, WEBP).");
        setMessageType("error");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setImageUrl("");
    }
  };

  // Remove chosen image file
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Submit Add / Edit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!imageFile && !imagePreview && !imageUrl.trim()) {
      setMessage("Please choose an image file or enter an image URL.");
      setMessageType("error");
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("link", link.trim());
      formData.append("order", String(order));
      formData.append("status", status);

      if (imageFile) {
        formData.append("image", imageFile);
      } else if (imageUrl.trim()) {
        formData.append("image", imageUrl.trim());
      }

      const targetId = editingBanner?._id || editingBanner?.id;
      if (editingBanner && targetId) {
        await updateBanner(targetId, formData);
        setMessage(`Banner "${title || "Hero Banner"}" updated successfully!`);
      } else {
        await createBanner(formData);
        setMessage(`Banner "${title || "Hero Banner"}" added successfully!`);
      }

      setMessageType("success");
      handleCloseModal();
      await fetchBanners();
    } catch (err) {
      console.error("Save error:", err);
      setMessage(err.message || "Failed to save banner.");
      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Banner Status (Active / Inactive)
  const handleToggleStatus = async (b) => {
    try {
      const newStatus = b.status === "Active" ? "Inactive" : "Active";
      await updateBanner(b._id, { status: newStatus });
      setBanners((prev) =>
        prev.map((item) =>
          item._id === b._id ? { ...item, status: newStatus } : item
        )
      );
      setMessage(`Banner "${b.title || "Banner"}" status changed to ${newStatus}.`);
      setMessageType("success");
    } catch (err) {
      console.error("Status toggle error:", err);
      setMessage(err.message || "Could not toggle banner status.");
      setMessageType("error");
    }
  };

  // Delete Banner
  const handleDelete = async (b) => {
    if (
      !window.confirm(
        `Are you sure you want to delete this banner "${b.title || "Hero Banner"}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await deleteBanner(b._id);
      setBanners((prev) => prev.filter((item) => item._id !== b._id));
      setMessage(`Banner deleted successfully.`);
      setMessageType("success");
    } catch (err) {
      console.error("Delete error:", err);
      setMessage(err.message || "Failed to delete banner.");
      setMessageType("error");
    }
  };

  const activeCount = banners.filter((b) => b.status === "Active").length;
  const inactiveCount = banners.filter((b) => b.status === "Inactive").length;

  return (
    <section className="banners-page">
      {/* Top Header */}
      <div className="admin-page-heading">
        <div>
          <h2>Hero Banners Management</h2>
          <p>
            Upload, update, and manage hero slider banners displayed on the
            Home Page.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button
            type="button"
            className="admin-secondary-button"
            onClick={fetchBanners}
            disabled={loading}
            title="Refresh banners"
          >
            <FiRefreshCw className={loading ? "spin-icon" : ""} /> Refresh
          </button>

          <button
            type="button"
            className="admin-primary-button"
            onClick={handleOpenCreate}
          >
            <FiPlus /> Add New Banner
          </button>
        </div>
      </div>

      {/* Global Message Banner */}
      {message && (
        <div className={`banners-alert ${messageType}`}>
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

      {/* KPI Stats Bar */}
      <div className="banners-stats-row">
        <div className="bn-stat-card">
          <div className="bn-stat-icon">
            <FiImage />
          </div>
          <div>
            <span className="bn-stat-label">Total Banners</span>
            <strong className="bn-stat-val">{banners.length}</strong>
          </div>
        </div>

        <div className="bn-stat-card">
          <div className="bn-stat-icon active-green">
            <FiCheckCircle />
          </div>
          <div>
            <span className="bn-stat-label">Active on Home Page</span>
            <strong className="bn-stat-val">{activeCount}</strong>
          </div>
        </div>

        <div className="bn-stat-card">
          <div className="bn-stat-icon inactive-gray">
            <FiAlertCircle />
          </div>
          <div>
            <span className="bn-stat-label">Inactive Banners</span>
            <strong className="bn-stat-val">{inactiveCount}</strong>
          </div>
        </div>
      </div>

      {/* Banners Panel */}
      <div className="admin-panel banners-panel">
        <div className="admin-toolbar">
          <div>
            <strong>{banners.length} Banners Configured</strong>
            <p className="banners-helper">
              Ordered sequence will slide automatically on the Home Page hero slider
            </p>
          </div>
        </div>

        {loading ? (
          <div className="admin-loading-box">
            <FiRefreshCw className="spin-icon" style={{ fontSize: "28px", color: "#e5aa0a" }} />
            <p>Loading banners from database...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table banners-table">
              <thead>
                <tr>
                  <th style={{ width: "8%" }}>Order</th>
                  <th style={{ width: "26%" }}>Banner Image</th>
                  <th style={{ width: "24%" }}>Banner Title</th>
                  <th style={{ width: "16%" }}>Target Link</th>
                  <th style={{ width: "12%" }}>Status</th>
                  <th style={{ width: "14%", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {banners.map((b, index) => (
                  <tr key={b._id || index}>
                    <td>
                      <span className="bn-order-badge">#{b.order ?? index + 1}</span>
                    </td>

                    <td>
                      <div className="bn-thumb-wrap">
                        <img
                          src={formatImageUrl(b.image)}
                          alt={b.title || "Banner"}
                          className="bn-thumb-img"
                          onClick={() => setPreviewModalImg(formatImageUrl(b.image))}
                          title="Click to view full image"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=400&q=80";
                          }}
                        />
                        <button
                          type="button"
                          className="bn-thumb-zoom-btn"
                          onClick={() => setPreviewModalImg(formatImageUrl(b.image))}
                          title="Preview full banner"
                        >
                          <FiEye />
                        </button>
                      </div>
                    </td>

                    <td>
                      <div className="bn-title-cell">
                        <strong>{b.title || "—"}</strong>
                        <small className="bn-date">
                          Added {b.createdAt ? new Date(b.createdAt).toLocaleDateString("en-IN") : ""}
                        </small>
                      </div>
                    </td>

                    <td>
                      {b.link ? (
                        <a
                          href={b.link}
                          target="_blank"
                          rel="noreferrer"
                          className="bn-link-pill"
                        >
                          {b.link} <FiExternalLink />
                        </a>
                      ) : (
                        <span className="bn-empty-subtle">—</span>
                      )}
                    </td>

                    <td>
                      <button
                        type="button"
                        className={`bn-status-pill ${
                          b.status === "Active" ? "active" : "inactive"
                        }`}
                        onClick={() => handleToggleStatus(b)}
                        title="Click to toggle status"
                      >
                        {b.status === "Active" ? "Active" : "Inactive"}
                      </button>
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <div className="bn-actions-row">
                        <button
                          type="button"
                          className="bn-action-btn edit"
                          onClick={() => handleOpenEdit(b)}
                          title="Edit Banner"
                        >
                          <FiEdit2 /> Edit
                        </button>

                        <button
                          type="button"
                          className="bn-action-btn delete"
                          onClick={() => handleDelete(b)}
                          title="Delete Banner"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {banners.length === 0 && !loading && (
              <div className="admin-empty">
                <FiImage style={{ fontSize: "36px", color: "#e5aa0a", marginBottom: "8px" }} />
                <h3>No banners configured</h3>
                <p>Click "+ Add New Banner" to upload your first hero slider banner.</p>
                <button
                  type="button"
                  className="admin-primary-button"
                  onClick={handleOpenCreate}
                  style={{ marginTop: "14px" }}
                >
                  <FiPlus /> Add First Banner
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add / Edit Banner Modal */}
      {showModal && (
        <div className="bn-modal-backdrop" onClick={handleCloseModal}>
          <div className="bn-modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="bn-modal-header">
              <div>
                <h3>{editingBanner ? "Edit Hero Banner" : "Add New Hero Banner"}</h3>
                <p>
                  {editingBanner
                    ? "Update banner image or display settings"
                    : "Upload high-quality banner for the Home Page hero slider."}
                </p>
              </div>
              <button
                type="button"
                className="bn-modal-close"
                onClick={handleCloseModal}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="bn-modal-form">
              {/* Image Upload / URL Selector */}
              <div className="bn-image-section">
                <div className="bn-mode-toggle">
                  <button
                    type="button"
                    className={`bn-mode-btn ${uploadMode === "file" ? "active" : ""}`}
                    onClick={() => setUploadMode("file")}
                  >
                    <FiUploadCloud /> Upload Image File
                  </button>
                  <button
                    type="button"
                    className={`bn-mode-btn ${uploadMode === "url" ? "active" : ""}`}
                    onClick={() => setUploadMode("url")}
                  >
                    <FiExternalLink /> Image Web URL
                  </button>
                </div>

                {uploadMode === "file" ? (
                  <div className="bn-file-dropzone">
                    {imagePreview ? (
                      <div className="bn-preview-box">
                        <img
                          src={imagePreview}
                          alt="Banner Preview"
                          className="bn-preview-img"
                        />
                        <button
                          type="button"
                          className="bn-remove-img-btn"
                          onClick={handleRemoveImage}
                          title="Remove image"
                        >
                          <FiX /> Remove Image
                        </button>
                      </div>
                    ) : (
                      <div
                        className="bn-drop-area"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <FiUploadCloud className="bn-upload-icon" />
                        <strong>Click to select banner image</strong>
                        <span>Supports PNG, JPG, JPEG, WEBP (Up to 15 MB)</span>
                        <span className="bn-rec-hint">
                          Recommended ratio: 16:9 or 4:3 (will render completely without cuts)
                        </span>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                    />
                  </div>
                ) : (
                  <div className="admin-form-field">
                    <label>Image Direct URL</label>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                        setImagePreview(e.target.value);
                      }}
                      placeholder="https://example.com/images/banner.jpg"
                    />
                    {imagePreview && (
                      <div className="bn-preview-box" style={{ marginTop: "10px" }}>
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="bn-preview-img"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Form Grid */}
              <div className="bn-form-grid">
                <div className="admin-form-field">
                  <label htmlFor="bn-title">Banner Title / Alt Description</label>
                  <input
                    id="bn-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Solar Energy Commercial Banner"
                  />
                </div>

                <div className="admin-form-field">
                  <label htmlFor="bn-link">Click Target Link (Optional)</label>
                  <input
                    id="bn-link"
                    type="text"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="e.g. #products or /contact"
                  />
                </div>

                <div className="admin-form-field">
                  <label htmlFor="bn-order">Display Sequence Order</label>
                  <input
                    id="bn-order"
                    type="number"
                    min="1"
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    placeholder="1, 2, 3..."
                  />
                </div>

                <div className="admin-form-field">
                  <label htmlFor="bn-status">Status</label>
                  <select
                    id="bn-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="Active">Active (Display on Home)</option>
                    <option value="Inactive">Inactive (Hidden)</option>
                  </select>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="bn-modal-actions">
                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={handleCloseModal}
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-primary-button"
                  disabled={submitting}
                >
                  <FiSave />
                  {submitting
                    ? "Saving..."
                    : editingBanner
                    ? "Update Banner"
                    : "Save Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Image Preview Modal */}
      {previewModalImg && (
        <div
          className="bn-modal-backdrop"
          onClick={() => setPreviewModalImg("")}
          style={{ zIndex: 1200 }}
        >
          <div
            className="bn-lightbox-window"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="bn-lightbox-close"
              onClick={() => setPreviewModalImg("")}
            >
              <FiX />
            </button>
            <img
              src={previewModalImg}
              alt="Full Preview"
              className="bn-lightbox-img"
            />
          </div>
        </div>
      )}
    </section>
  );
}

