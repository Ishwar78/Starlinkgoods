import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiShoppingCart,
  FiTrash2,
  FiPlus,
  FiMinus,
  FiArrowRight,
  FiArrowLeft,
  FiCheckCircle,
  FiShield,
  FiTruck,
  FiPackage,
  FiX,
} from "react-icons/fi";
import {
  getUserCart,
  updateUserCartQuantity,
  removeFromUserCart,
  clearUserCart,
  getUserCartTotals,
  getLoggedInUser,
} from "../../lib/cart";
import { formatImageUrl } from "../../lib/api";
import "./Cart.css";

export default function UserCart() {
  const navigate = useNavigate();

  const [userData, setUserData] = useState(() => getLoggedInUser() || {});
  const [cartItems, setCartItems] = useState([]);

  // Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod"); // 'cod' | 'online'
  const [orderNotes, setOrderNotes] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Shipping details state
  const [shippingInfo, setShippingInfo] = useState({
    name: userData?.name || "",
    email: userData?.email || "",
    mobile: userData?.mobile || "",
    address: userData?.address || "",
    city: userData?.city || "",
    state: userData?.state || "",
  });

  const loadCart = () => {
    const current = getUserCart(userData);
    setCartItems(current);
  };

  useEffect(() => {
    loadCart();

    const handleCartUpdate = () => {
      loadCart();
    };

    window.addEventListener("slg-cart-updated", handleCartUpdate);
    return () => {
      window.removeEventListener("slg-cart-updated", handleCartUpdate);
    };
  }, [userData?.email, userData?._id]);

  // Totals
  const totals = getUserCartTotals(userData, cartItems);

  // Handle quantity changes
  const handleQtyChange = (productId, newQty) => {
    const updated = updateUserCartQuantity(productId, newQty, userData);
    setCartItems(updated);
  };

  // Handle remove item
  const handleRemoveItem = (productId) => {
    const updated = removeFromUserCart(productId, userData);
    setCartItems(updated);
  };

  // Handle clear cart
  const handleClearCart = () => {
    if (window.confirm("Are you sure you want to remove all items from your cart?")) {
      clearUserCart(userData);
      setCartItems([]);
    }
  };

  // Handle Order Placement
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    try {
      setPlacingOrder(true);

      const orderId = `SLG-${Date.now().toString().slice(-6)}`;
      const orderDate = new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      // Record in user's isolated orders storage
      const userOrdersKey = `slg_orders_${userData?._id || userData?.id || userData?.email || "guest"}`;
      let existingOrders = [];
      try {
        existingOrders = JSON.parse(localStorage.getItem(userOrdersKey) || "[]");
      } catch {
        existingOrders = [];
      }

      const newOrder = {
        id: orderId,
        date: orderDate,
        amount: totals.grandTotal,
        status: "Processing",
        paymentMethod:
          paymentMethod === "cod"
            ? "Cash on Delivery"
            : "Online Payment (Razorpay)",
        paymentStatus: "Pending",
        items: cartItems,
        shippingInfo,
        notes: orderNotes,
        createdAt: new Date().toISOString(),
      };

      existingOrders.unshift(newOrder);
      localStorage.setItem(userOrdersKey, JSON.stringify(existingOrders));

      // Clear the user's cart
      clearUserCart(userData);
      setCartItems([]);

      setOrderSuccess(newOrder);
      setIsCheckoutOpen(false);
    } catch (err) {
      alert("Failed to place order: " + err.message);
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="user-cart-page">
      {/* Page Heading */}
      <div className="cart-page-heading">
        <div>
          <span className="cart-eyebrow">SLG / DEALER PROCUREMENT</span>
          <h1>My Cart</h1>
          <p>
            Isolated cart for <strong>{userData.name || "Vendor User"}</strong> ({userData.email || "Authenticated Account"}).
          </p>
        </div>
        <div className="cart-heading-actions">
          <Link to="/user/products" className="cart-outline-button">
            <FiArrowLeft /> Continue Shopping
          </Link>
          {cartItems.length > 0 && (
            <button
              type="button"
              className="cart-danger-button"
              onClick={handleClearCart}
              title="Remove all items from your cart"
            >
              <FiTrash2 /> Clear Cart
            </button>
          )}
        </div>
      </div>

      {/* Success Order View */}
      {orderSuccess && (
        <section className="cart-success-card">
          <div className="success-icon-badge">
            <FiCheckCircle />
          </div>
          <h2>Order Placed Successfully!</h2>
          <p className="success-order-id">
            Order Reference: <strong>#{orderSuccess.id}</strong> &bull; Placed on {orderSuccess.date}
          </p>
          <p className="success-desc">
            Your dealer procurement request of <strong>₹{orderSuccess.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong> has been submitted. Our logistics and dispatch team has begun order verification.
          </p>
          <div className="success-summary-row">
            <div>
              <span>Payment Mode:</span>
              <strong>{orderSuccess.paymentMethod}</strong>
            </div>
            <div>
              <span>Payment Status:</span>
              <strong style={{ color: orderSuccess.paymentStatus === "Paid" ? "#2ecc71" : "#f39c12" }}>
                ● {orderSuccess.paymentStatus}
              </strong>
            </div>
            <div>
              <span>Deliver To:</span>
              <strong>{orderSuccess.shippingInfo.city || "Registered Address"}</strong>
            </div>
          </div>
          <div className="success-action-btns">
            <Link to="/user/orders" className="cart-primary-button">
              <FiPackage /> View My Orders
            </Link>
            <Link to="/user/products" className="cart-outline-button">
              Browse More Products
            </Link>
            <button
              type="button"
              className="cart-ghost-button"
              onClick={() => setOrderSuccess(null)}
            >
              Back to Cart
            </button>
          </div>
        </section>
      )}

      {/* Empty State */}
      {!orderSuccess && cartItems.length === 0 ? (
        <section className="cart-empty-panel">
          <div className="empty-cart-icon">
            <FiShoppingCart />
          </div>
          <h2>Your Cart is Currently Empty</h2>
          <p>
            You have no products in your procurement cart. Browse through our premium catalog, select multi-angle furniture models, and add them here to create your order.
          </p>
          <div className="empty-cart-actions">
            <Link to="/user/products" className="cart-primary-button">
              Explore Products Catalog <FiArrowRight />
            </Link>
          </div>
        </section>
      ) : !orderSuccess ? (
        /* Cart Grid with Items + Summary */
        <div className="cart-main-grid">
          {/* Left Column: Items */}
          <div className="cart-items-column">
            <div className="cart-items-header">
              <span>Product ({totals.totalUnits} items)</span>
              <span>Unit Price</span>
              <span>Quantity</span>
              <span style={{ textAlign: "right" }}>Subtotal</span>
            </div>

            <div className="cart-items-list">
              {cartItems.map((item) => {
                const itemLineTotal = (item.price || 0) * (item.quantity || 1);
                const hasDiscount = item.oldPrice && item.oldPrice > item.price;
                const discountPercent = hasDiscount
                  ? Math.round(((item.oldPrice - item.price) / item.oldPrice) * 100)
                  : 0;

                return (
                  <article key={item._id || item.id} className="cart-item-card">
                    {/* Product Image & Info */}
                    <div className="cart-item-info">
                      <div className="cart-item-thumb">
                        <img
                          src={formatImageUrl(item.image)}
                          alt={item.name}
                          onError={(e) => {
                            e.target.src =
                              "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=300&q=80";
                          }}
                        />
                      </div>
                      <div className="cart-item-details">
                        <span className="cart-item-cat">{item.category || "Furniture"}</span>
                        <h3 className="cart-item-title">{item.name}</h3>
                        <div className="cart-item-meta">
                          <span className="cart-item-vendor">
                            By {item.vendorName || "SLG Official"}
                          </span>
                          <span className="cart-item-stock-tag">
                            ● In Stock ({item.stock || 99})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Unit Price */}
                    <div className="cart-item-unit-price">
                      <strong className="unit-current">
                        ₹{(item.price || 0).toLocaleString("en-IN")}
                      </strong>
                      {hasDiscount && (
                        <div className="unit-old-wrap">
                          <span className="unit-old">
                            ₹{item.oldPrice.toLocaleString("en-IN")}
                          </span>
                          <span className="unit-off">{discountPercent}% OFF</span>
                        </div>
                      )}
                    </div>

                    {/* Quantity Selector */}
                    <div className="cart-item-qty">
                      <div className="qty-control-box">
                        <button
                          type="button"
                          className="qty-btn minus"
                          onClick={() => handleQtyChange(item._id || item.id, (item.quantity || 1) - 1)}
                          title="Decrease quantity"
                        >
                          <FiMinus />
                        </button>
                        <span className="qty-value">{item.quantity || 1}</span>
                        <button
                          type="button"
                          className="qty-btn plus"
                          onClick={() => handleQtyChange(item._id || item.id, (item.quantity || 1) + 1)}
                          disabled={(item.quantity || 1) >= (item.stock || 999)}
                          title="Increase quantity"
                        >
                          <FiPlus />
                        </button>
                      </div>

                      <button
                        type="button"
                        className="item-delete-btn"
                        onClick={() => handleRemoveItem(item._id || item.id)}
                        title="Remove product"
                      >
                        <FiTrash2 /> Remove
                      </button>
                    </div>

                    {/* Line Total */}
                    <div className="cart-item-line-total">
                      <strong>
                        ₹{itemLineTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </strong>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Procurement Policy Banner */}
            <div className="cart-assurance-banner">
              <div className="assurance-item">
                <FiTruck className="assurance-icon" />
                <div>
                  <strong>Insured Express Delivery</strong>
                  <p>Safely dispatched with verified wooden protective packaging.</p>
                </div>
              </div>
              <div className="assurance-item">
                <FiShield className="assurance-icon" />
                <div>
                  <strong>100% Quality Guaranteed</strong>
                  <p>Crafted from authentic seasoned timber with full warranty.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary (Sticky) */}
          <aside className="cart-summary-sidebar">
            <div className="summary-card">
              <h2 className="summary-title">Order Summary</h2>

              <div className="summary-rows">
                <div className="summary-row">
                  <span>Subtotal ({totals.totalUnits} items)</span>
                  <strong>₹{totals.subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong>
                </div>

                {totals.discountSavings > 0 && (
                  <div className="summary-row discount">
                    <span>Wholesale Dealer Savings</span>
                    <strong style={{ color: "#2ecc71" }}>
                      -₹{totals.discountSavings.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </strong>
                  </div>
                )}

                <div className="summary-row">
                  <span>Shipping &amp; Logistics</span>
                  <strong>
                    {totals.shippingFee === 0 ? (
                      <span className="free-shipping-tag">FREE</span>
                    ) : (
                      `₹${totals.shippingFee.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                    )}
                  </strong>
                </div>

                <div className="summary-row">
                  <span>Estimated GST &amp; Taxes</span>
                  <span style={{ color: "#a89d8d", fontSize: "13px" }}>Included (0%)</span>
                </div>
              </div>

              <div className="summary-divider" />

              <div className="summary-total-row">
                <div>
                  <span className="total-label">Grand Total</span>
                  <small>Applicable taxes and handling included</small>
                </div>
                <h3 className="total-amount">
                  ₹{totals.grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </h3>
              </div>

              {/* Checkout Action Button */}
              <button
                type="button"
                className="cart-checkout-button"
                onClick={() => setIsCheckoutOpen(true)}
              >
                Proceed to Checkout <FiArrowRight />
              </button>

              <div className="cart-safe-guarantee">
                <FiShield /> 256-Bit Encrypted Secure Dealer Procurement
              </div>
            </div>
          </aside>
        </div>
      ) : null}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="cart-modal-backdrop" onClick={() => setIsCheckoutOpen(false)}>
          <div className="cart-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="cart-modal-header">
              <div>
                <span className="modal-eyebrow">FINAL STEP</span>
                <h2>Confirm &amp; Place Dealer Order</h2>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsCheckoutOpen(false)}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handlePlaceOrder} className="checkout-form">
              {/* Shipping Address Inputs */}
              <div className="form-section">
                <h3 className="form-section-title">1. Shipping &amp; Contact Details</h3>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Recipient Name *</label>
                    <input
                      type="text"
                      required
                      value={shippingInfo.name}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })}
                      placeholder="Enter full name"
                    />
                  </div>

                  <div className="form-group">
                    <label>Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      value={shippingInfo.mobile}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, mobile: e.target.value })}
                      placeholder="10-digit mobile number"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Delivery Address *</label>
                  <input
                    type="text"
                    required
                    value={shippingInfo.address}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                    placeholder="Shop / House / Street Address"
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>City *</label>
                    <input
                      type="text"
                      required
                      value={shippingInfo.city}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                      placeholder="City"
                    />
                  </div>

                  <div className="form-group">
                    <label>State *</label>
                    <input
                      type="text"
                      required
                      value={shippingInfo.state}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                      placeholder="State"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="form-section">
                <h3 className="form-section-title">2. Select Payment Method</h3>
                <div className="payment-options-grid">
                  {/* Option 1: Cash on Delivery / Pay on Dispatch */}
                  <label
                    className={`payment-option-card ${paymentMethod === "cod" ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                    />
                    <div className="option-content">
                      <div className="option-title-row">
                        <strong>Cash on Delivery (COD) / Dealer Invoice</strong>
                      </div>
                      <p>Pay cash or bank transfer upon physical arrival of goods at your location.</p>
                    </div>
                  </label>

                  {/* Option 2: Online Payment */}
                  <label
                    className={`payment-option-card ${paymentMethod === "online" ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      checked={paymentMethod === "online"}
                      onChange={() => setPaymentMethod("online")}
                    />
                    <div className="option-content">
                      <div className="option-title-row">
                        <strong>Online Payment (UPI / Cards / Netbanking)</strong>
                      </div>
                      <p>Pay instantly and securely via Razorpay payment gateway upon dispatch confirmation.</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Order Notes */}
              <div className="form-section">
                <div className="form-group">
                  <label>Special Instructions / Dealer Remarks (Optional)</label>
                  <textarea
                    rows="2"
                    placeholder="e.g. Please deliver after 2 PM, or specific unloading instructions."
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                  />
                </div>
              </div>

              {/* Modal Footer with Submit */}
              <div className="cart-modal-footer">
                <div className="modal-total-display">
                  <span>Payable Amount:</span>
                  <strong>₹{totals.grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong>
                </div>

                <div className="modal-action-buttons">
                  <button
                    type="button"
                    className="cart-ghost-button"
                    onClick={() => setIsCheckoutOpen(false)}
                    disabled={placingOrder}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="cart-primary-button"
                    disabled={placingOrder}
                  >
                    {placingOrder ? "Placing Order..." : "Confirm & Place Order"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
