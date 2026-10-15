import React, { useState, useEffect, useMemo } from "react";
import {
  FiSearch,
  FiPackage,
  FiCheckCircle,
  FiAlertTriangle,
  FiLayers,
  FiEye,
  FiX,
  FiStar,
  FiTag,
  FiShoppingBag,
  FiShoppingCart,
  FiRefreshCw,
  FiGrid,
  FiList,
  FiShield,
  FiTruck,
  FiCheck,
} from "react-icons/fi";
import { getProducts, getCategories, formatImageUrl } from "../../lib/api";
import "./Products.css";

export default function UserProducts() {
  const [products, setProducts] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Modal State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalActiveImage, setModalActiveImage] = useState("");

  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'table'
  const [sortBy, setSortBy] = useState("default");

  // Cart State & Toast
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("userCart") || "[]");
    } catch {
      return [];
    }
  });
  const [cartToast, setCartToast] = useState("");

  const fetchCatalogData = async () => {
    try {
      setLoading(true);
      setError("");
      const [prodRes, catRes] = await Promise.all([
        getProducts(),
        getCategories({ status: "Active" }).catch(() => ({ categories: [] })),
      ]);

      if (prodRes.success && Array.isArray(prodRes.products)) {
        setProducts(prodRes.products);
      } else {
        setProducts([]);
      }

      if (catRes.success && Array.isArray(catRes.categories)) {
        setDbCategories(catRes.categories);
      } else {
        setDbCategories([]);
      }
    } catch (err) {
      console.error("Error fetching catalog:", err);
      setError(err.message || "Failed to load products. Please check connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogData();
  }, []);

  // Compute category list from database & products
  const categoryList = useMemo(() => {
    const list = ["All"];
    const seen = new Set(["all"]);

    // First add active categories from Database
    dbCategories.forEach((cat) => {
      if (cat.name && !seen.has(cat.name.toLowerCase())) {
        seen.add(cat.name.toLowerCase());
        list.push(cat.name);
      }
    });

    // Then ensure any category present in products is also included
    products.forEach((p) => {
      if (p.category && !seen.has(p.category.toLowerCase())) {
        seen.add(p.category.toLowerCase());
        list.push(p.category);
      }
    });

    return list;
  }, [dbCategories, products]);

  // Filtered & sorted products
  const filteredProducts = useMemo(() => {
    let result = products.filter((item) => {
      const matchesSearch =
        (item.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (item.category || "").toLowerCase().includes(search.toLowerCase()) ||
        (item.description || "").toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" ||
        (item.category || "").toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });

    if (sortBy === "price-low") {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === "price-high") {
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === "rating") {
      result.sort((a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0));
    }

    return result;
  }, [products, search, selectedCategory, sortBy]);

  // Summary stats
  const totalCount = products.length;
  const inStockCount = products.filter(
    (p) => (p.status || "In Stock") === "In Stock" && (p.stock || 0) > 0
  ).length;
  const lowStockCount = products.filter(
    (p) => p.status === "Low Stock" || (p.stock > 0 && p.stock <= 5)
  ).length;

  // Add to cart handler
  const handleAddToCart = (item) => {
    setCart((prev) => {
      const id = item._id || item.id;
      const existing = prev.find((x) => (x._id || x.id) === id);
      let updated;
      if (existing) {
        updated = prev.map((x) =>
          (x._id || x.id) === id ? { ...x, quantity: (x.quantity || 1) + 1 } : x
        );
      } else {
        updated = [...prev, { ...item, quantity: 1 }];
      }
      localStorage.setItem("userCart", JSON.stringify(updated));
      return updated;
    });

    setCartToast(`"${item.name}" added to cart!`);
    setTimeout(() => setCartToast(""), 3500);
  };

  // Open modal with default main image
  const handleOpenDetailModal = (product) => {
    setSelectedProduct(product);
    setModalActiveImage(product.image || "");
  };

  const totalCartUnits = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <div className="user-products-container">
      {/* Floating Add to Cart Toast Notification */}
      {cartToast && (
        <div className="cart-toast-banner">
          <FiShoppingCart />
          <span>{cartToast}</span>
          <span style={{ color: "#ffd044", marginLeft: "6px" }}>
            ({totalCartUnits} in cart)
          </span>
        </div>
      )}

      {/* Header Banner */}
      <div className="products-hero">
        <div className="hero-text-col">
          <span className="hero-subtitle">Catalog &amp; Inventory</span>
          <h1 className="hero-title">My Products</h1>
          <p className="hero-desc">
            Browse premium furniture offerings, view high-res multi-angle photos, monitor stock levels, and place dealer orders.
          </p>
        </div>
        <div className="hero-action-col">
          <div className="cart-counter-chip" title={`${totalCartUnits} items in cart`}>
            <FiShoppingCart />
            <span>Cart: {totalCartUnits}</span>
          </div>
          <button
            type="button"
            className="hero-refresh-btn"
            onClick={fetchCatalogData}
            disabled={loading}
            title="Refresh product list"
          >
            <FiRefreshCw className={loading ? "spin-icon" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="products-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrapper kpi-brown">
            <FiPackage />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Total Products</span>
            <span className="kpi-value">{totalCount}</span>
            <span className="kpi-sub">In Catalog</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper kpi-green">
            <FiCheckCircle />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">In Stock</span>
            <span className="kpi-value">{inStockCount}</span>
            <span className="kpi-sub">Ready to Dispatch</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper kpi-orange">
            <FiAlertTriangle />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Low Stock</span>
            <span className="kpi-value">{lowStockCount}</span>
            <span className="kpi-sub">Replenish Soon</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper kpi-gold">
            <FiLayers />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Categories</span>
            <span className="kpi-value">
              {categoryList.length > 1 ? categoryList.length - 1 : 0}
            </span>
            <span className="kpi-sub">Furniture Lines</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="products-filter-panel">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by product name, category or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <FiX />
            </button>
          )}
        </div>

        <div className="filter-controls">
          <div className="sort-select-wrapper">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="default">Sort by: Default</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          <div className="view-mode-toggle">
            <button
              type="button"
              className={`toggle-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
              title="Grid View"
            >
              <FiGrid />
            </button>
            <button
              type="button"
              className={`toggle-btn ${viewMode === "table" ? "active" : ""}`}
              onClick={() => setViewMode("table")}
              title="Table View"
            >
              <FiList />
            </button>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="category-pills-bar">
        {categoryList.map((catName) => {
          const dbCat = dbCategories.find(
            (c) => c.name.toLowerCase() === catName.toLowerCase()
          );
          const iconUrl = dbCat?.image ? formatImageUrl(dbCat.image) : null;
          const isSelected = selectedCategory.toLowerCase() === catName.toLowerCase();

          return (
            <button
              key={catName}
              type="button"
              className={`category-pill ${isSelected ? "active" : ""}`}
              onClick={() => setSelectedCategory(catName)}
            >
              {iconUrl && (
                <img
                  src={iconUrl}
                  alt={catName}
                  className="category-pill-icon"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              )}
              <span>{catName}</span>
              <span className="cat-count">
                {catName === "All"
                  ? products.length
                  : products.filter(
                      (p) =>
                        (p.category || "").toLowerCase() === catName.toLowerCase()
                    ).length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Product Content Body */}
      {loading ? (
        <div className="products-loading-state">
          <div className="loading-spinner" />
          <p>Loading catalog products from warehouse...</p>
        </div>
      ) : error ? (
        <div className="products-error-state">
          <FiAlertTriangle className="error-icon" />
          <h3>Unable to Load Products</h3>
          <p>{error}</p>
          <button
            type="button"
            className="retry-btn"
            onClick={fetchCatalogData}
          >
            Retry Loading
          </button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="products-empty-state">
          <div className="empty-icon-box">
            <FiPackage />
          </div>
          <h3>No Products Found</h3>
          <p>
            {search || selectedCategory !== "All"
              ? "No items match your active filters. Try searching for something else or reset your filter."
              : "No products currently available in this catalog."}
          </p>
          {(search || selectedCategory !== "All") && (
            <button
              type="button"
              className="clear-filters-btn"
              onClick={() => {
                setSearch("");
                setSelectedCategory("All");
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        /* Grid Mode */
        <div className="products-grid">
          {filteredProducts.map((item) => {
            const isDiscounted = item.oldPrice && item.oldPrice > item.price;
            const discountPercent = isDiscounted
              ? Math.round(((item.oldPrice - item.price) / item.oldPrice) * 100)
              : 0;

            const isLowStock =
              (item.stock || 0) > 0 &&
              ((item.stock || 0) <= 5 || item.status === "Low Stock");
            const isOutOfStock = (item.stock || 0) <= 0;

            const itemImgs =
              Array.isArray(item.images) && item.images.length > 0
                ? item.images
                : [item.image];

            return (
              <div key={item._id || item.id} className="product-card">
                <div
                  className="card-image-wrap"
                  onClick={() => handleOpenDetailModal(item)}
                  style={{ cursor: "pointer" }}
                >
                  <img
                    src={formatImageUrl(item.image)}
                    alt={item.name}
                    loading="lazy"
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=700&q=85";
                    }}
                  />
                  {item.badge && (
                    <span className="card-badge">{item.badge}</span>
                  )}
                  {discountPercent > 0 && (
                    <span className="card-discount-tag">
                      {discountPercent}% OFF
                    </span>
                  )}
                  {itemImgs.length > 1 && (
                    <span className="card-multi-badge">
                      {itemImgs.length} photos
                    </span>
                  )}
                  <span
                    className={`card-stock-pill ${
                      isOutOfStock
                        ? "stock-out"
                        : isLowStock
                        ? "stock-low"
                        : "stock-in"
                    }`}
                  >
                    {isOutOfStock
                      ? "Out of Stock"
                      : isLowStock
                      ? `Only ${item.stock} left`
                      : `In Stock (${item.stock})`}
                  </span>
                </div>

                <div className="card-body">
                  <div className="card-cat-rating">
                    <span className="card-cat">{item.category}</span>
                    <span className="card-rating">
                      <FiStar className="star-icon" />
                      {item.rating || "4.8"} ({item.reviews || 40})
                    </span>
                  </div>

                  <h3
                    className="card-title"
                    title={item.name}
                    onClick={() => handleOpenDetailModal(item)}
                    style={{ cursor: "pointer" }}
                  >
                    {item.name}
                  </h3>

                  <p className="card-desc">
                    {item.description ||
                      "Premium handcrafted furniture crafted with seasoned timber and ergonomic comfort."}
                  </p>

                  <div className="card-footer">
                    <div className="card-pricing">
                      <span className="current-price">
                        ₹{(item.price || 0).toLocaleString("en-IN")}
                      </span>
                      {isDiscounted && (
                        <span className="old-price">
                          ₹{item.oldPrice.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>

                    <div className="card-action-btns">
                      <button
                        type="button"
                        className="card-cart-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(item);
                        }}
                        disabled={isOutOfStock}
                        title={isOutOfStock ? "Out of Stock" : "Add to Cart"}
                      >
                        <FiShoppingCart /> Add to Cart
                      </button>

                      <button
                        type="button"
                        className="view-detail-btn"
                        onClick={() => handleOpenDetailModal(item)}
                        title="View Details"
                      >
                        <FiEye /> View
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table Mode */
        <div className="products-table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Rating</th>
                <th>Vendor</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((item) => {
                const isOutOfStock = (item.stock || 0) <= 0;
                const isLowStock =
                  (item.stock || 0) > 0 &&
                  ((item.stock || 0) <= 5 || item.status === "Low Stock");

                return (
                  <tr key={item._id || item.id}>
                    <td>
                      <div className="table-product-cell">
                        <img
                          src={formatImageUrl(item.image)}
                          alt={item.name}
                          className="table-thumbnail"
                          onError={(e) => {
                            e.target.src =
                              "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=150&q=80";
                          }}
                        />
                        <div>
                          <span className="table-product-title">{item.name}</span>
                          {item.badge && (
                            <span className="table-badge">{item.badge}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="table-cat-badge">{item.category}</span>
                    </td>
                    <td>
                      <div className="table-pricing">
                        <span className="table-current-price">
                          ₹{(item.price || 0).toLocaleString("en-IN")}
                        </span>
                        {item.oldPrice > item.price && (
                          <span className="table-old-price">
                            ₹{item.oldPrice.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`table-stock-status ${
                          isOutOfStock
                            ? "status-out"
                            : isLowStock
                            ? "status-low"
                            : "status-in"
                        }`}
                      >
                        {item.stock || 0} units
                      </span>
                    </td>
                    <td>
                      <span className="table-rating">
                        <FiStar className="star-icon" /> {item.rating || "4.8"}
                      </span>
                    </td>
                    <td>
                      <span className="table-vendor">
                        {item.vendorName || "SLG Official"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        <button
                          type="button"
                          className="table-action-btn"
                          onClick={() => handleAddToCart(item)}
                          disabled={isOutOfStock}
                          title="Add to Cart"
                        >
                          <FiShoppingCart /> Add to Cart
                        </button>
                        <button
                          type="button"
                          className="table-action-btn"
                          onClick={() => handleOpenDetailModal(item)}
                        >
                          <FiEye /> View
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

      {/* Product Details Modal (With Multi-Image Gallery & Add to Cart) */}
      {selectedProduct && (
        <div
          className="product-modal-backdrop"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="product-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setSelectedProduct(null)}
              aria-label="Close modal"
            >
              <FiX />
            </button>

            <div className="modal-inner">
              {/* Image Column with Big Image + Thumbnails Below */}
              <div className="modal-image-col">
                <div className="modal-main-img-wrap">
                  <img
                    src={formatImageUrl(modalActiveImage || selectedProduct.image)}
                    alt={selectedProduct.name}
                    className="modal-main-img"
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=85";
                    }}
                  />
                  {selectedProduct.badge && (
                    <span className="modal-img-badge">
                      {selectedProduct.badge}
                    </span>
                  )}
                </div>

                {/* Gallery Thumbnails List (up to 5 images) */}
                {(() => {
                  const allImgs =
                    Array.isArray(selectedProduct.images) &&
                    selectedProduct.images.length > 0
                      ? selectedProduct.images
                      : selectedProduct.image
                      ? [selectedProduct.image]
                      : [];

                  return (
                    allImgs.length > 1 && (
                      <div className="modal-thumbnails-strip">
                        {allImgs.map((imgSrc, idx) => {
                          const formatted = formatImageUrl(imgSrc);
                          const isSelected =
                            (modalActiveImage || selectedProduct.image) === imgSrc;
                          return (
                            <button
                              key={idx}
                              type="button"
                              className={`modal-thumb-btn ${
                                isSelected ? "active" : ""
                              }`}
                              onClick={() => setModalActiveImage(imgSrc)}
                              title={`View photo ${idx + 1}`}
                            >
                              <img
                                src={formatted}
                                alt={`${selectedProduct.name} ${idx + 1}`}
                                onError={(e) => {
                                  e.currentTarget.src =
                                    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=150&q=80";
                                }}
                              />
                            </button>
                          );
                        })}
                      </div>
                    )
                  );
                })()}
              </div>

              {/* Info Column */}
              <div className="modal-info-col">
                <div className="modal-header-meta">
                  <span className="modal-cat">{selectedProduct.category}</span>
                  <span className="modal-rating">
                    <FiStar className="star-icon" />
                    <strong>{selectedProduct.rating || "4.8"}</strong> (
                    {selectedProduct.reviews || 45} customer reviews)
                  </span>
                </div>

                <h2 className="modal-title">{selectedProduct.name}</h2>

                <div className="modal-pricing-box">
                  <div className="price-tag-group">
                    <span className="modal-current-price">
                      ₹{(selectedProduct.price || 0).toLocaleString("en-IN")}
                    </span>
                    {selectedProduct.oldPrice > selectedProduct.price && (
                      <span className="modal-old-price">
                        ₹{selectedProduct.oldPrice.toLocaleString("en-IN")}
                      </span>
                    )}
                    {selectedProduct.oldPrice > selectedProduct.price && (
                      <span className="modal-discount-pill">
                        {Math.round(
                          ((selectedProduct.oldPrice - selectedProduct.price) /
                            selectedProduct.oldPrice) *
                            100
                        )}
                        % OFF
                      </span>
                    )}
                  </div>
                  <span className="tax-notice">Inclusive of all taxes &amp; warranty</span>
                </div>

                <div className="modal-desc-box">
                  <h4>Product Description</h4>
                  <p>
                    {selectedProduct.description ||
                      "Premium quality furniture crafted to highest structural standards. Features kiln-dried solid hardwood frame, high-resilience foam cushioning, and scratch-resistant finishes."}
                  </p>
                </div>

                <div className="modal-spec-grid">
                  <div className="spec-item">
                    <FiPackage className="spec-icon" />
                    <div>
                      <span className="spec-label">Available Stock</span>
                      <span className="spec-val">
                        {selectedProduct.stock || 0} units
                      </span>
                    </div>
                  </div>

                  <div className="spec-item">
                    <FiShield className="spec-icon" />
                    <div>
                      <span className="spec-label">Warranty</span>
                      <span className="spec-val">5 Years Manufacturer</span>
                    </div>
                  </div>

                  <div className="spec-item">
                    <FiTruck className="spec-icon" />
                    <div>
                      <span className="spec-label">Shipping</span>
                      <span className="spec-val">Express Delivery (3-5 Days)</span>
                    </div>
                  </div>

                  <div className="spec-item">
                    <FiTag className="spec-icon" />
                    <div>
                      <span className="spec-label">Vendor Source</span>
                      <span className="spec-val">
                        {selectedProduct.vendorName || "SLG Official"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Modal Action Buttons with Add to Cart */}
                <div className="modal-actions-row">
                  <button
                    type="button"
                    className="modal-action-btn cart-btn"
                    onClick={() => handleAddToCart(selectedProduct)}
                  >
                    <FiShoppingCart /> Add to Cart
                  </button>
                  <button
                    type="button"
                    className="modal-action-btn primary"
                    onClick={() => {
                      alert(
                        `Order Request initiated for "${selectedProduct.name}". Product ID: ${selectedProduct._id}`
                      );
                    }}
                  >
                    <FiShoppingBag /> Place Order Request
                  </button>
                  <button
                    type="button"
                    className="modal-action-btn secondary"
                    onClick={() => setSelectedProduct(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
