import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  FiPlus,
  FiSearch,
  FiX,
  FiSave,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiUploadCloud,
  FiImage,
  FiCheckCircle,
  FiAlertCircle,
  FiLayers,
  FiRefreshCw,
  FiPackage,
  FiDollarSign,
  FiTag,
  FiCheck,
  FiAlertTriangle,
  FiShoppingBag,
} from "react-icons/fi";
import {
  getProducts,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  formatImageUrl,
} from "../../lib/api";
import "./Products.css";

const BADGE_OPTIONS = [
  "None",
  "Best Seller",
  "New Arrival",
  "Trending",
  "Hot Deal",
  "Eco Friendly",
  "Limited Edition",
  "Popular",
];

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price) || 0);

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Notifications
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [viewingActiveImage, setViewingActiveImage] = useState("");
  const [deletingProduct, setDeletingProduct] = useState(null);

  // Form inputs
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [stock, setStock] = useState("15");
  const [status, setStatus] = useState("In Stock");
  const [badge, setBadge] = useState("None");
  const [description, setDescription] = useState("");

  // Up to 5 images management: each item is { id, type: 'file' | 'existing' | 'url', file?, url, preview }
  const [imageList, setImageList] = useState([]);
  const [imageMode, setImageMode] = useState("file"); // 'file' or 'url'
  const [customUrlInput, setCustomUrlInput] = useState("");

  const fileInputRef = useRef(null);

  // Auto-clear notification after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Fetch products and active categories
  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);

      if (prodRes && prodRes.success && Array.isArray(prodRes.products)) {
        setProducts(prodRes.products);
      } else {
        setProducts([]);
      }

      if (catRes && catRes.success && Array.isArray(catRes.categories)) {
        setCategories(catRes.categories);
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.error("Error fetching admin products data:", err);
      setMessage(err.message || "Failed to load products.");
      setMessageType("error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Synchronize stock changes with status automatically
  const handleStockChange = (val) => {
    setStock(val);
    const num = Number(val);
    if (!isNaN(num)) {
      if (num === 0) setStatus("Out of Stock");
      else if (num < 5) setStatus("Low Stock");
      else setStatus("In Stock");
    }
  };

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setName("");
    const defaultCat = categories.length > 0 ? categories[0].name : "";
    setCategory(defaultCat);
    setPrice("");
    setOldPrice("");
    setStock("15");
    setStatus("In Stock");
    setBadge("None");
    setDescription("");
    setImageList([]);
    setCustomUrlInput("");
    setImageMode("file");
    setShowModal(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setName(prod.name || "");
    setCategory(prod.category || "");
    setPrice(prod.price !== undefined ? String(prod.price) : "");
    setOldPrice(prod.oldPrice ? String(prod.oldPrice) : "");
    setStock(prod.stock !== undefined ? String(prod.stock) : "0");
    setStatus(prod.status || "In Stock");
    setBadge(prod.badge || "None");
    setDescription(prod.description || "");

    // Populate existing images (up to 5)
    const rawImages =
      Array.isArray(prod.images) && prod.images.length > 0
        ? prod.images
        : prod.image
        ? [prod.image]
        : [];

    const existingItems = rawImages.slice(0, 5).map((img, idx) => ({
      id: `existing-${idx}-${Date.now()}`,
      type: "existing",
      url: img,
      preview: formatImageUrl(img),
    }));

    setImageList(existingItems);
    setCustomUrlInput("");
    setImageMode("file");
    setShowModal(true);
  };

  // Handle local files selection (allows up to 5 total images)
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const availableSlots = 5 - imageList.length;
    if (availableSlots <= 0) {
      setMessage("You can only upload a maximum of 5 images per product.");
      setMessageType("error");
      return;
    }

    const filesToProcess = files.slice(0, availableSlots);
    const invalidFiles = filesToProcess.filter((f) => !f.type.startsWith("image/"));
    if (invalidFiles.length > 0) {
      setMessage("Please upload only valid image files (JPG, PNG, WEBP).");
      setMessageType("error");
      return;
    }

    const newItems = filesToProcess.map((file, idx) => ({
      id: `file-${Date.now()}-${idx}-${Math.random()}`,
      type: "file",
      file,
      preview: URL.createObjectURL(file),
    }));

    setImageList((prev) => [...prev, ...newItems].slice(0, 5));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Add custom URL image
  const handleAddUrlImage = () => {
    const trimmed = customUrlInput.trim();
    if (!trimmed) return;

    if (imageList.length >= 5) {
      setMessage("You can only upload a maximum of 5 images per product.");
      setMessageType("error");
      return;
    }

    const newItem = {
      id: `url-${Date.now()}-${Math.random()}`,
      type: "url",
      url: trimmed,
      preview: trimmed,
    };

    setImageList((prev) => [...prev, newItem].slice(0, 5));
    setCustomUrlInput("");
  };

  // Remove single image from list
  const handleRemoveImageIndex = (indexToRemove) => {
    setImageList((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Save product (Create or Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setMessage("Please enter a product name.");
      setMessageType("error");
      return;
    }

    if (!category.trim()) {
      setMessage("Please select a product category.");
      setMessageType("error");
      return;
    }

    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      setMessage("Please enter a valid selling price greater than 0.");
      setMessageType("error");
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");

      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("category", category.trim());
      formData.append("price", String(Number(price)));
      if (oldPrice && !isNaN(Number(oldPrice))) {
        formData.append("oldPrice", String(Number(oldPrice)));
      } else {
        formData.append("oldPrice", "0");
      }
      formData.append("stock", String(Number(stock) || 0));
      formData.append("status", status);
      formData.append("badge", badge === "None" ? "" : badge);
      formData.append("description", description.trim());

      // Append files
      imageList.forEach((item) => {
        if (item.type === "file" && item.file) {
          formData.append("images", item.file);
        }
      });

      // Retained existing images
      const existingImages = imageList
        .filter((item) => item.type === "existing" && item.url)
        .map((item) => item.url);
      formData.append("existingImages", JSON.stringify(existingImages));

      // External URLs
      const urlImages = imageList
        .filter((item) => item.type === "url" && item.url)
        .map((item) => item.url);
      formData.append("imageUrls", JSON.stringify(urlImages));

      if (editingProduct) {
        const res = await updateProduct(editingProduct._id || editingProduct.id, formData);
        if (res.success) {
          setMessage(`Product "${name}" updated successfully!`);
          setMessageType("success");
          setShowModal(false);
          fetchData();
        } else {
          setMessage(res.message || "Failed to update product.");
          setMessageType("error");
        }
      } else {
        const res = await createProduct(formData);
        if (res.success) {
          setMessage(`Product "${name}" created successfully and synced to catalog!`);
          setMessageType("success");
          setShowModal(false);
          fetchData();
        } else {
          setMessage(res.message || "Failed to create product.");
          setMessageType("error");
        }
      }
    } catch (err) {
      console.error("Error saving product:", err);
      setMessage(err.message || "An unexpected error occurred while saving.");
      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle product deletion
  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    try {
      setSubmitting(true);
      const res = await deleteProduct(deletingProduct._id || deletingProduct.id);
      if (res.success) {
        setMessage(`Product "${deletingProduct.name}" deleted successfully.`);
        setMessageType("success");
        setDeletingProduct(null);
        fetchData();
      } else {
        setMessage(res.message || "Failed to delete product.");
        setMessageType("error");
      }
    } catch (err) {
      console.error("Error deleting product:", err);
      setMessage(err.message || "Failed to delete product.");
      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  };

  // Distinct category names list from DB
  const categoryNames = useMemo(() => {
    const list = [];
    const seen = new Set();
    categories.forEach((cat) => {
      if (cat.name && !seen.has(cat.name.toLowerCase())) {
        seen.add(cat.name.toLowerCase());
        list.push(cat.name);
      }
    });
    products.forEach((p) => {
      if (p.category && !seen.has(p.category.toLowerCase())) {
        seen.add(p.category.toLowerCase());
        list.push(p.category);
      }
    });
    return list;
  }, [categories, products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase().trim();
    return products.filter((p) => {
      const matchesSearch =
        !q ||
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q));

      const matchesCategory =
        selectedCategory === "All" ||
        (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || p.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, search, selectedCategory, statusFilter]);

  // Summary Metrics
  const stats = useMemo(() => {
    const total = products.length;
    const inStock = products.filter((p) => p.status === "In Stock" && p.stock > 0).length;
    const lowStock = products.filter((p) => p.status === "Low Stock" || (p.stock > 0 && p.stock < 5)).length;
    const outOfStock = products.filter((p) => p.status === "Out of Stock" || p.stock === 0).length;
    return { total, inStock, lowStock, outOfStock, categoriesCount: categoryNames.length };
  }, [products, categoryNames]);

  return (
    <div className="admin-prod-container">
      {/* Top Banner / Heading */}
      <div className="admin-prod-header">
        <div className="admin-prod-header-text">
          <span className="admin-prod-eyebrow">CATALOG &amp; INVENTORY</span>
          <h1 className="admin-prod-title">Product Management</h1>
          <p className="admin-prod-subtitle">
            Add, update, and manage products with up to 5 high-res photos. Uploaded images instantly appear in the User Catalog under their exact category with full multi-image gallery preview.
          </p>
        </div>
        <div className="admin-prod-header-actions">
          <button
            className="admin-prod-refresh-btn"
            onClick={handleRefresh}
            disabled={refreshing || loading}
            title="Refresh Catalog"
          >
            <FiRefreshCw className={refreshing ? "spin-icon" : ""} />
            <span>Refresh</span>
          </button>
          <button
            className="admin-prod-primary-btn"
            onClick={handleOpenCreate}
          >
            <FiPlus />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Global Notification Banner */}
      {message && (
        <div className={`admin-prod-alert ${messageType === "error" ? "alert-error" : "alert-success"}`}>
          {messageType === "error" ? <FiAlertCircle /> : <FiCheckCircle />}
          <span>{message}</span>
          <button onClick={() => setMessage("")} aria-label="Close notification">
            <FiX />
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="admin-prod-stats-grid">
        <div className="admin-prod-stat-card">
          <div className="stat-icon-wrap gold">
            <FiPackage />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Products</span>
            <span className="stat-value">{stats.total}</span>
          </div>
        </div>

        <div className="admin-prod-stat-card">
          <div className="stat-icon-wrap green">
            <FiCheckCircle />
          </div>
          <div className="stat-content">
            <span className="stat-label">In Stock</span>
            <span className="stat-value">{stats.inStock}</span>
          </div>
        </div>

        <div className="admin-prod-stat-card">
          <div className="stat-icon-wrap amber">
            <FiAlertTriangle />
          </div>
          <div className="stat-content">
            <span className="stat-label">Low / Out of Stock</span>
            <span className="stat-value">{stats.lowStock + stats.outOfStock}</span>
          </div>
        </div>

        <div className="admin-prod-stat-card">
          <div className="stat-icon-wrap blue">
            <FiLayers />
          </div>
          <div className="stat-content">
            <span className="stat-label">Active Categories</span>
            <span className="stat-value">{stats.categoriesCount}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="admin-prod-toolbar">
        <div className="admin-prod-search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search products by title, category, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="clear-search-btn" onClick={() => setSearch("")}>
              <FiX />
            </button>
          )}
        </div>

        <div className="admin-prod-filters">
          <div className="filter-item">
            <label>Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">All Categories ({products.length})</option>
              {categoryNames.map((catName) => {
                const count = products.filter(
                  (p) => (p.category || "").toLowerCase() === catName.toLowerCase()
                ).length;
                return (
                  <option key={catName} value={catName}>
                    {catName} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          <div className="filter-item">
            <label>Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table / Catalog View */}
      <div className="admin-prod-table-card">
        {loading ? (
          <div className="admin-prod-loading">
            <div className="admin-spinner" />
            <p>Loading products from database...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="admin-prod-empty">
            <FiPackage className="empty-icon" />
            <h3>No Products Found</h3>
            <p>
              {search || selectedCategory !== "All" || statusFilter !== "All"
                ? "No products matched your current filters. Try resetting search or category."
                : "No products in catalog yet. Click '+ Add New Product' to add your first item."}
            </p>
            {(search || selectedCategory !== "All" || statusFilter !== "All") && (
              <button
                className="admin-prod-secondary-btn"
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("All");
                  setStatusFilter("All");
                }}
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="admin-prod-table-wrapper">
            <table className="admin-prod-table">
              <thead>
                <tr>
                  <th style={{ width: "32%" }}>Product</th>
                  <th style={{ width: "16%" }}>Category</th>
                  <th style={{ width: "18%" }}>Price</th>
                  <th style={{ width: "14%" }}>Stock &amp; Status</th>
                  <th style={{ width: "10%" }}>Badge</th>
                  <th style={{ width: "10%", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((prod) => {
                  const hasDiscount = prod.oldPrice && prod.oldPrice > prod.price;
                  const discountPct = hasDiscount
                    ? Math.round(((prod.oldPrice - prod.price) / prod.oldPrice) * 100)
                    : 0;

                  const prodImgs =
                    Array.isArray(prod.images) && prod.images.length > 0
                      ? prod.images
                      : [prod.image];

                  return (
                    <tr key={prod._id || prod.id} className="admin-prod-row">
                      {/* Product details */}
                      <td>
                        <div className="prod-cell-main">
                          <div className="prod-thumbnail-wrap">
                            <img
                              src={formatImageUrl(prod.image)}
                              alt={prod.name}
                              onError={(e) => {
                                e.currentTarget.src =
                                  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=300&q=80";
                              }}
                            />
                            {prodImgs.length > 1 && (
                              <span className="prod-multi-img-pill" title={`${prodImgs.length} photos available`}>
                                {prodImgs.length} photos
                              </span>
                            )}
                          </div>
                          <div className="prod-meta">
                            <span className="prod-title" title={prod.name}>
                              {prod.name}
                            </span>
                            <span className="prod-desc-snippet" title={prod.description}>
                              {prod.description || "Premium handcrafted furniture"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category tag */}
                      <td>
                        <span className="prod-category-tag">
                          {prod.category}
                        </span>
                      </td>

                      {/* Pricing */}
                      <td>
                        <div className="prod-price-stack">
                          <span className="prod-current-price">
                            {formatPrice(prod.price)}
                          </span>
                          {hasDiscount && (
                            <div className="prod-old-price-wrap">
                              <span className="prod-old-price">
                                {formatPrice(prod.oldPrice)}
                              </span>
                              <span className="prod-discount-badge">
                                -{discountPct}%
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Stock & Status */}
                      <td>
                        <div className="prod-stock-wrap">
                          <span
                            className={`prod-status-pill ${
                              prod.status === "In Stock"
                                ? "status-in"
                                : prod.status === "Low Stock"
                                ? "status-low"
                                : "status-out"
                            }`}
                          >
                            <span className="status-dot" />
                            {prod.status || "In Stock"}
                          </span>
                          <span className="prod-units-text">
                            {prod.stock || 0} units left
                          </span>
                        </div>
                      </td>

                      {/* Badge */}
                      <td>
                        {prod.badge ? (
                          <span className="prod-badge-tag">{prod.badge}</span>
                        ) : (
                          <span className="prod-badge-empty">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="prod-actions-row">
                          <button
                            className="prod-action-btn view-btn"
                            title="View Details"
                            onClick={() => {
                              setViewingProduct(prod);
                              setViewingActiveImage(prod.image);
                            }}
                          >
                            <FiEye />
                          </button>
                          <button
                            className="prod-action-btn edit-btn"
                            title="Edit Product"
                            onClick={() => handleOpenEdit(prod)}
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            className="prod-action-btn delete-btn"
                            title="Delete Product"
                            onClick={() => setDeletingProduct(prod)}
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================
          ADD / EDIT PRODUCT MODAL (UP TO 5 IMAGES)
         ======================================================== */}
      {showModal && (
        <div className="admin-prod-modal-overlay" onClick={() => !submitting && setShowModal(false)}>
          <div
            className="admin-prod-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-prod-modal-header">
              <div className="modal-title-stack">
                <span className="modal-eyebrow">
                  {editingProduct ? "UPDATE ITEM" : "NEW CATALOG ENTRY"}
                </span>
                <h2>{editingProduct ? "Edit Product" : "Add New Product"}</h2>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => !submitting && setShowModal(false)}
                disabled={submitting}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="admin-prod-form">
              <div className="form-two-cols">
                {/* Product Name */}
                <div className="form-group span-2">
                  <label>
                    Product Name <span className="req-star">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Chesterfield Velvet Sofa"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                {/* Category Dropdown */}
                <div className="form-group">
                  <label>
                    Category <span className="req-star">*</span>
                  </label>
                  <div className="cat-select-wrap">
                    <select
                      required
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="" disabled>
                        Select Category...
                      </option>
                      {categoryNames.map((catName) => (
                        <option key={catName} value={catName}>
                          {catName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <span className="field-hint">
                    Products will appear under this category in user side.
                  </span>
                </div>

                {/* Badge */}
                <div className="form-group">
                  <label>Badge / Tag</label>
                  <select
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                  >
                    {BADGE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selling Price */}
                <div className="form-group">
                  <label>
                    Selling Price (₹) <span className="req-star">*</span>
                  </label>
                  <div className="input-with-prefix">
                    <span className="input-prefix">₹</span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      required
                      placeholder="e.g. 24999"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                </div>

                {/* Old Price / MRP */}
                <div className="form-group">
                  <label>Original MRP (₹)</label>
                  <div className="input-with-prefix">
                    <span className="input-prefix">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="e.g. 32999 (optional)"
                      value={oldPrice}
                      onChange={(e) => setOldPrice(e.target.value)}
                    />
                  </div>
                </div>

                {/* Stock Quantity */}
                <div className="form-group">
                  <label>
                    Stock Quantity <span className="req-star">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    placeholder="e.g. 15"
                    value={stock}
                    onChange={(e) => handleStockChange(e.target.value)}
                  />
                </div>

                {/* Stock Status */}
                <div className="form-group">
                  <label>Stock Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>

                {/* Description */}
                <div className="form-group span-2">
                  <label>Description</label>
                  <textarea
                    rows="3"
                    placeholder="Provide details about material, durability, dimensions, and craftsmanship..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {/* Multi-Image Section (Up to 5 images) */}
                <div className="form-group span-2">
                  <div className="image-field-header">
                    <label>
                      Product Photos ({imageList.length}/5) &bull;{" "}
                      <small style={{ color: "#ffd044" }}>
                        First image is the main cover
                      </small>
                    </label>
                    <div className="image-mode-toggle">
                      <button
                        type="button"
                        className={`toggle-tab ${imageMode === "file" ? "active" : ""}`}
                        onClick={() => setImageMode("file")}
                      >
                        Upload Photos
                      </button>
                      <button
                        type="button"
                        className={`toggle-tab ${imageMode === "url" ? "active" : ""}`}
                        onClick={() => setImageMode("url")}
                      >
                        Add Photo URL
                      </button>
                    </div>
                  </div>

                  {/* Thumbnails Gallery Strip */}
                  {imageList.length > 0 && (
                    <div className="admin-prod-imgs-grid">
                      {imageList.map((item, idx) => (
                        <div key={item.id} className="admin-prod-thumb-box">
                          <img
                            src={item.preview}
                            alt={`Photo ${idx + 1}`}
                            onError={(e) => {
                              e.currentTarget.src =
                                "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=200&q=80";
                            }}
                          />
                          <span className={`thumb-index-badge ${idx === 0 ? "is-cover" : ""}`}>
                            {idx === 0 ? "★ Cover" : `#${idx + 1}`}
                          </span>
                          <button
                            type="button"
                            className="thumb-remove-btn"
                            onClick={() => handleRemoveImageIndex(idx)}
                            title="Remove this photo"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      ))}

                      {imageList.length < 5 && imageMode === "file" && (
                        <div
                          className="admin-prod-add-more-box"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <FiPlus />
                          <span>Add More</span>
                          <small>({5 - imageList.length} left)</small>
                        </div>
                      )}
                    </div>
                  )}

                  {imageMode === "file" ? (
                    imageList.length < 5 ? (
                      <div className="file-upload-zone">
                        <div
                          className="dropzone-area"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: "none" }}
                            accept="image/*"
                            multiple
                            onChange={handleFileChange}
                          />
                          <div className="dropzone-icon">
                            <FiUploadCloud />
                          </div>
                          <h4>Click or drag up to 5 photos</h4>
                          <p>PNG, JPG, WEBP up to 10MB each (Saved directly to server storage)</p>
                        </div>
                      </div>
                    ) : (
                      <p className="photo-limit-notice">
                        <FiCheckCircle /> Maximum 5 photos added for this product.
                      </p>
                    )
                  ) : (
                    <div className="url-input-wrap">
                      <div style={{ display: "flex", gap: "8px" }}>
                        <input
                          type="url"
                          placeholder="Paste image URL (https://...)"
                          value={customUrlInput}
                          onChange={(e) => setCustomUrlInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddUrlImage();
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="admin-prod-primary-btn"
                          onClick={handleAddUrlImage}
                          disabled={!customUrlInput.trim() || imageList.length >= 5}
                          style={{ padding: "0 18px", fontSize: "13px" }}
                        >
                          Add URL
                        </button>
                      </div>
                      <span className="field-hint">
                        Paste external link and click "Add URL" to append to photos.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Footer Buttons */}
              <div className="admin-prod-modal-footer">
                <button
                  type="button"
                  className="admin-prod-secondary-btn"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-prod-primary-btn"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="btn-spinner" />
                      <span>Saving Product...</span>
                    </>
                  ) : (
                    <>
                      <FiSave />
                      <span>{editingProduct ? "Update Product" : "Save Product"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          DELETE CONFIRMATION MODAL
         ======================================================== */}
      {deletingProduct && (
        <div className="admin-prod-modal-overlay" onClick={() => !submitting && setDeletingProduct(null)}>
          <div
            className="admin-prod-delete-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="delete-icon-wrap">
              <FiTrash2 />
            </div>
            <h3>Delete Product?</h3>
            <p>
              Are you sure you want to delete <strong>"{deletingProduct.name}"</strong>? This will remove the product and its uploaded images from server storage and the user catalog.
            </p>
            <div className="delete-dialog-actions">
              <button
                className="admin-prod-secondary-btn"
                onClick={() => setDeletingProduct(null)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                className="admin-prod-danger-btn"
                onClick={handleConfirmDelete}
                disabled={submitting}
              >
                {submitting ? "Deleting..." : "Yes, Delete Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          VIEW PRODUCT DETAILS MODAL (WITH MULTI-IMAGE SELECTOR)
         ======================================================== */}
      {viewingProduct && (
        <div className="admin-prod-modal-overlay" onClick={() => setViewingProduct(null)}>
          <div
            className="admin-prod-view-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-prod-modal-header">
              <div className="modal-title-stack">
                <span className="modal-eyebrow">PRODUCT PREVIEW</span>
                <h2>{viewingProduct.name}</h2>
              </div>
              <button className="modal-close-btn" onClick={() => setViewingProduct(null)}>
                <FiX />
              </button>
            </div>

            <div className="prod-preview-content">
              {/* Main Image Container */}
              <div className="preview-img-container">
                <img
                  src={formatImageUrl(viewingActiveImage || viewingProduct.image)}
                  alt={viewingProduct.name}
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80";
                  }}
                />
                {viewingProduct.badge && (
                  <span className="preview-badge-overlay">{viewingProduct.badge}</span>
                )}
              </div>

              {/* Thumbnails Strip */}
              {Array.isArray(viewingProduct.images) && viewingProduct.images.length > 1 && (
                <div className="modal-thumbnails-strip">
                  {viewingProduct.images.map((imgSrc, idx) => {
                    const isSelected = (viewingActiveImage || viewingProduct.image) === imgSrc;
                    return (
                      <button
                        key={idx}
                        type="button"
                        className={`modal-thumb-btn ${isSelected ? "active" : ""}`}
                        onClick={() => setViewingActiveImage(imgSrc)}
                      >
                        <img
                          src={formatImageUrl(imgSrc)}
                          alt={`${viewingProduct.name} ${idx + 1}`}
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=150&q=80";
                          }}
                        />
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="preview-details-grid">
                <div className="preview-detail-row">
                  <span className="detail-label">Category</span>
                  <span className="detail-val category-pill">{viewingProduct.category}</span>
                </div>
                <div className="preview-detail-row">
                  <span className="detail-label">Price</span>
                  <span className="detail-val price-highlight">
                    {formatPrice(viewingProduct.price)}
                    {viewingProduct.oldPrice > viewingProduct.price && (
                      <span className="striked-price">
                        {formatPrice(viewingProduct.oldPrice)}
                      </span>
                    )}
                  </span>
                </div>
                <div className="preview-detail-row">
                  <span className="detail-label">Stock Status</span>
                  <span className="detail-val">
                    <span
                      className={`prod-status-pill ${
                        viewingProduct.status === "In Stock"
                          ? "status-in"
                          : viewingProduct.status === "Low Stock"
                          ? "status-low"
                          : "status-out"
                      }`}
                    >
                      <span className="status-dot" />
                      {viewingProduct.status || "In Stock"} ({viewingProduct.stock || 0} units)
                    </span>
                  </span>
                </div>
                <div className="preview-detail-row">
                  <span className="detail-label">Description</span>
                  <p className="detail-desc-text">
                    {viewingProduct.description || "No description provided."}
                  </p>
                </div>
              </div>
            </div>

            <div className="admin-prod-modal-footer">
              <button
                className="admin-prod-secondary-btn"
                onClick={() => setViewingProduct(null)}
              >
                Close
              </button>
              <button
                className="admin-prod-primary-btn"
                onClick={() => {
                  const p = viewingProduct;
                  setViewingProduct(null);
                  handleOpenEdit(p);
                }}
              >
                <FiEdit2 />
                <span>Edit This Product</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
