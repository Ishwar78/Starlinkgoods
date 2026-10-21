import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  FiPlus,
  FiSearch,
  FiX,
  FiSave,
  FiEdit2,
  FiTrash2,
  FiUploadCloud,
  FiImage,
  FiCheckCircle,
  FiAlertCircle,
  FiLayers,
  FiRefreshCw,
  FiCheck,
} from "react-icons/fi";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
  formatImageUrl,
} from "../../lib/api.js";
import "./Categories.css";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null); // null if adding new
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  // Form Fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Active");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const fileInputRef = useRef(null);

  // Fetch categories from DB
  const fetchCategoryList = async () => {
    try {
      setLoading(true);
      const res = await getCategories();
      if (res.success && Array.isArray(res.categories)) {
        setCategories(res.categories);
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.error("Error loading categories:", err);
      setMessage(err.message || "Failed to load categories.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryList();
  }, []);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    const q = search.toLowerCase().trim();
    return categories.filter((cat) => {
      const matchesSearch =
        !q ||
        (cat.name && cat.name.toLowerCase().includes(q)) ||
        (cat.slug && cat.slug.toLowerCase().includes(q)) ||
        (cat.description && cat.description.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === "All" || cat.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [categories, search, statusFilter]);

  // Close modal and reset form
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setName("");
    setSlug("");
    setDescription("");
    setStatus("Active");
    setImageFile(null);
    setImagePreview("");
  };

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setDescription("");
    setStatus("Active");
    setImageFile(null);
    setImagePreview("");
    setMessage("");
    setShowModal(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setName(cat.name || "");
    setSlug(cat.slug || "");
    setDescription(cat.description || "");
    setStatus(cat.status || "Active");
    setImageFile(null);
    setImagePreview(cat.image ? formatImageUrl(cat.image) : "");
    setMessage("");
    setShowModal(true);
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
    }
  };

  // Remove chosen image
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Submit Form (Add or Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!name.trim()) {
      setMessage("Category name is required.");
      setMessageType("error");
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("slug", slug.trim());
      formData.append("description", description.trim());
      formData.append("status", status);

      if (imageFile) {
        formData.append("image", imageFile);
      }

      let res;
      const targetId = editingCategory?._id || editingCategory?.id;
      if (editingCategory && targetId) {
        res = await updateCategory(targetId, formData);
        setMessage(`Category "${name.trim()}" updated successfully!`);
      } else {
        res = await createCategory(formData);
        setMessage(`Category "${name.trim()}" created successfully!`);
      }

      setMessageType("success");
      handleCloseModal();
      await fetchCategoryList();
    } catch (err) {
      console.error("Save error:", err);
      setMessage(err.message || "Failed to save category.");
      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Category Status
  const handleToggleStatus = async (cat) => {
    try {
      const newStatus = cat.status === "Active" ? "Inactive" : "Active";
      await toggleCategoryStatus(cat._id, newStatus);
      setCategories((prev) =>
        prev.map((item) =>
          item._id === cat._id ? { ...item, status: newStatus } : item
        )
      );
      setMessage(`Category "${cat.name}" status changed to ${newStatus}.`);
      setMessageType("success");
    } catch (err) {
      console.error("Status toggle error:", err);
      setMessage(err.message || "Could not toggle category status.");
      setMessageType("error");
    }
  };

  // Delete Category
  const handleDelete = async (cat) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the category "${cat.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await deleteCategory(cat._id);
      setCategories((prev) => prev.filter((item) => item._id !== cat._id));
      setMessage(`Category "${cat.name}" deleted successfully.`);
      setMessageType("success");
    } catch (err) {
      console.error("Delete error:", err);
      setMessage(err.message || "Failed to delete category.");
      setMessageType("error");
    }
  };

  return (
    <section className="categories-page">
      {/* Top Header */}
      <div className="admin-page-heading">
        <div>
          <h2>Category Management</h2>
          <p>Create, edit, upload images, and organize store collections.</p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button
            type="button"
            className="admin-secondary-button"
            onClick={fetchCategoryList}
            disabled={loading}
            title="Refresh categories"
          >
            <FiRefreshCw className={loading ? "spin-icon" : ""} /> Refresh
          </button>

          <button
            type="button"
            className="admin-primary-button"
            onClick={handleOpenCreate}
          >
            <FiPlus /> Add Category
          </button>
        </div>
      </div>

      {/* Global Message Banner */}
      {message && (
        <div className={`categories-alert ${messageType}`}>
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
      <div className="categories-stats-row">
        <div className="cat-stat-card">
          <div className="cat-stat-icon">
            <FiLayers />
          </div>
          <div>
            <span className="cat-stat-label">Total Categories</span>
            <strong className="cat-stat-val">{categories.length}</strong>
          </div>
        </div>

        <div className="cat-stat-card">
          <div className="cat-stat-icon active-green">
            <FiCheckCircle />
          </div>
          <div>
            <span className="cat-stat-label">Active Categories</span>
            <strong className="cat-stat-val">
              {categories.filter((c) => c.status === "Active").length}
            </strong>
          </div>
        </div>

        <div className="cat-stat-card">
          <div className="cat-stat-icon inactive-gray">
            <FiAlertCircle />
          </div>
          <div>
            <span className="cat-stat-label">Inactive Categories</span>
            <strong className="cat-stat-val">
              {categories.filter((c) => c.status === "Inactive").length}
            </strong>
          </div>
        </div>
      </div>

      {/* Categories Table Panel */}
      <div className="admin-panel categories-table-panel">
        <div className="admin-toolbar">
          <div>
            <strong>{filteredCategories.length} Categories Found</strong>
            <p className="categories-helper">
              Live inventory collections linked with products catalog
            </p>
          </div>

          <div className="categories-toolbar-actions">
            <div className="cat-status-filter-wrap">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="cat-status-select"
              >
                <option value="All">All Status</option>
                <option value="Active">Active Only</option>
                <option value="Inactive">Inactive Only</option>
              </select>
            </div>

            <label className="categories-search">
              <FiSearch />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search categories..."
              />
              {search && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={() => setSearch("")}
                >
                  <FiX />
                </button>
              )}
            </label>
          </div>
        </div>

        {loading ? (
          <div className="admin-loading-box">
            <div className="spinner"></div>
            <p>Loading categories from database...</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: "90px" }}>Image</th>
                  <th>Category Name</th>
                  <th>Slug</th>
                  <th>Description</th>
                  <th>Products</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredCategories.map((cat) => (
                  <tr key={cat._id}>
                    <td>
                      <div className="cat-table-thumb-wrap">
                        <img
                          src={formatImageUrl(cat.image)}
                          alt={cat.name}
                          className="cat-table-thumb"
                          onError={(e) => {
                            e.target.src =
                              "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=150&q=80";
                          }}
                        />
                      </div>
                    </td>

                    <td>
                      <div className="cat-name-cell">
                        <strong>{cat.name}</strong>
                      </div>
                    </td>

                    <td>
                      <span className="cat-slug-pill">/{cat.slug || "n-a"}</span>
                    </td>

                    <td>
                      <span className="cat-desc-cell" title={cat.description}>
                        {cat.description || "—"}
                      </span>
                    </td>

                    <td>
                      <span className="cat-count-badge">
                        {cat.productCount || 0} items
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className={`cat-status-pill ${
                          cat.status === "Active" ? "active" : "inactive"
                        }`}
                        onClick={() => handleToggleStatus(cat)}
                        title="Click to toggle status"
                      >
                        {cat.status === "Active" ? "Active" : "Inactive"}
                      </button>
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <div className="cat-actions-row">
                        <button
                          type="button"
                          className="cat-action-btn edit"
                          onClick={() => handleOpenEdit(cat)}
                          title="Edit Category"
                        >
                          <FiEdit2 /> Edit
                        </button>

                        <button
                          type="button"
                          className="cat-action-btn delete"
                          onClick={() => handleDelete(cat)}
                          title="Delete Category"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredCategories.length === 0 && !loading && (
              <div className="admin-empty">
                <FiLayers style={{ fontSize: "32px", color: "#ffd044", marginBottom: "8px" }} />
                <p>No matching categories found.</p>
                {search && (
                  <button
                    type="button"
                    className="admin-secondary-button"
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("All");
                    }}
                    style={{ marginTop: "10px" }}
                  >
                    Clear Search Filters
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add / Edit Category Modal */}
      {showModal && (
        <div className="cat-modal-backdrop" onClick={handleCloseModal}>
          <div
            className="cat-modal-window"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cat-modal-header">
              <div>
                <h3>
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </h3>
                <p>
                  {editingCategory
                    ? `Update details and photo for "${editingCategory.name}"`
                    : "Create a new product collection with uploaded image."}
                </p>
              </div>
              <button
                type="button"
                className="modal-close-icon"
                onClick={handleCloseModal}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="cat-modal-form">
              {/* Image Upload Box */}
              <div className="cat-image-upload-section">
                <label className="cat-field-label">Category Image (Upload)</label>

                {imagePreview ? (
                  <div className="cat-preview-box">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="cat-preview-img"
                    />
                    <div className="cat-preview-overlay">
                      <button
                        type="button"
                        className="cat-change-img-btn"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <FiUploadCloud /> Change Image
                      </button>
                      <button
                        type="button"
                        className="cat-remove-img-btn"
                        onClick={handleRemoveImage}
                      >
                        <FiX /> Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="cat-dropzone"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FiUploadCloud className="cat-dropzone-icon" />
                    <h4>Click to browse & upload category image</h4>
                    <p>Supports PNG, JPG, JPEG, WEBP (Max 10MB) — Saved to /uploads directory</p>
                  </div>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>

              {/* Form Grid */}
              <div className="cat-modal-grid">
                <div className="admin-form-field">
                  <label htmlFor="modal-cat-name">Category Name *</label>
                  <input
                    id="modal-cat-name"
                    type="text"
                    value={name}
                    placeholder="e.g. Sofa Sets, Hydraulic Beds, Dining"
                    onChange={(e) => {
                      const val = e.target.value;
                      setName(val);
                      if (!editingCategory) {
                        setSlug(
                          val
                            .toLowerCase()
                            .trim()
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/^-|-$/g, "")
                        );
                      }
                    }}
                    required
                  />
                </div>

                <div className="admin-form-field">
                  <label htmlFor="modal-cat-slug">URL Slug</label>
                  <input
                    id="modal-cat-slug"
                    type="text"
                    value={slug}
                    placeholder="e.g. sofa-sets"
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                  />
                </div>

                <div className="admin-form-field">
                  <label htmlFor="modal-cat-status">Status</label>
                  <select
                    id="modal-cat-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="admin-form-field full">
                  <label htmlFor="modal-cat-desc">Description</label>
                  <textarea
                    id="modal-cat-desc"
                    rows="3"
                    value={description}
                    placeholder="Brief description about the furniture collection..."
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="cat-modal-actions">
                <button
                  type="submit"
                  className="admin-primary-button"
                  disabled={submitting}
                >
                  <FiSave /> {submitting ? "Saving..." : editingCategory ? "Update Category" : "Save Category"}
                </button>

                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={handleCloseModal}
                  disabled={submitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}