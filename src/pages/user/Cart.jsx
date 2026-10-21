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
  FiEye,
  FiEyeOff,
  FiUser,
  FiLock,
} from "react-icons/fi";

import {
  getUserCart,
  updateUserCartQuantity,
  removeFromUserCart,
  clearUserCart,
  getUserCartTotals,
  getLoggedInUser,
} from "../../lib/cart";

import {
  formatImageUrl,
  createOrder,
  createOrderRazorpayOrder,
} from "../../lib/api";
import "./Cart.css";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// Helper to ensure Razorpay script is loaded in browser
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const initialCustomerInfo = () => ({
  fullName: "",
  mobile: "",
  email: "",
  password: "",
  confirmPassword: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  isHouseOwner: "No", // "Yes" or "No"
});

const initialDocuments = {
  houseOwnerCertificate: null,
  aadhaarCard: null,
  electricityBill: null,
  otherDocument: null,
};

export default function UserCart() {
  const navigate = useNavigate();
  const [userData] = useState(() => getLoggedInUser() || {});
  const [cartItems, setCartItems] = useState([]);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [orderNotes, setOrderNotes] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Fresh, blank customer info for every order
  const [shippingInfo, setShippingInfo] = useState(initialCustomerInfo);
  const [documents, setDocuments] = useState(initialDocuments);
  const [formError, setFormError] = useState("");

  const updateShippingInfo = (key, value) => {
    setShippingInfo((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const loadCart = () => {
    setCartItems(getUserCart(userData));
  };

  useEffect(() => {
    loadCart();

    const handleCartUpdate = () => loadCart();

    window.addEventListener("slg-cart-updated", handleCartUpdate);

    return () => {
      window.removeEventListener(
        "slg-cart-updated",
        handleCartUpdate
      );
    };
  }, [userData?.email, userData?._id]);

  const totals = getUserCartTotals(userData, cartItems);

  const handleQtyChange = (productId, newQty) => {
    if (newQty < 1) return;

    const updated = updateUserCartQuantity(
      productId,
      newQty,
      userData
    );

    setCartItems(updated);
  };

  const handleRemoveItem = (productId) => {
    setCartItems(removeFromUserCart(productId, userData));
  };

  const handleClearCart = () => {
    if (
      window.confirm(
        "Are you sure you want to remove all items from your cart?"
      )
    ) {
      clearUserCart(userData);
      setCartItems([]);
    }
  };

  const handleMobileChange = (value) => {
    updateShippingInfo(
      "mobile",
      value.replace(/\D/g, "").slice(0, 10)
    );
  };

  const handleDocumentChange = (key, event) => {
    const file = event.target.files?.[0] || null;

    if (!file) {
      setDocuments((current) => ({
        ...current,
        [key]: null,
      }));
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Please upload a PDF, JPG, JPEG or PNG file.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      alert("Each document must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    setDocuments((current) => ({
      ...current,
      [key]: file,
    }));
  };

  const validateCheckout = () => {
    if (!shippingInfo.fullName.trim()) {
      setFormError("Please enter customer's Full Name.");
      return false;
    }

    const cleanMobile = shippingInfo.mobile.replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      setFormError("Please enter a valid 10-digit customer Mobile Number.");
      return false;
    }

    if (!shippingInfo.email.trim()) {
      setFormError("Please enter customer's Email ID (required for customer login and dashboard).");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shippingInfo.email.trim())) {
      setFormError("Please enter a valid Email ID.");
      return false;
    }

    if (!shippingInfo.password || shippingInfo.password.length < 6) {
      setFormError("Password is required and must be at least 6 characters.");
      return false;
    }

    if (shippingInfo.password !== shippingInfo.confirmPassword) {
      setFormError("Password and Confirm Password do not match.");
      return false;
    }

    if (!shippingInfo.address.trim()) {
      setFormError("Please enter complete Delivery / Installation Address.");
      return false;
    }

    if (!shippingInfo.city.trim()) {
      setFormError("Please enter City or Village.");
      return false;
    }

    if (!shippingInfo.state.trim()) {
      setFormError("Please enter State.");
      return false;
    }

    // House Owner requirement
    if (shippingInfo.isHouseOwner === "Yes" && !documents.houseOwnerCertificate) {
      setFormError("You selected House Owner as 'Yes'. Please upload the House Owner Certificate / Registry proof.");
      return false;
    }

    // Required documents
    if (!documents.aadhaarCard) {
      setFormError("Please upload Aadhaar Card document.");
      return false;
    }

    if (!documents.electricityBill) {
      setFormError("Please upload Electricity Bill document.");
      return false;
    }

    setFormError("");
    return true;
  };

  const handlePlaceOrder = async (event) => {
    event.preventDefault();

    if (!cartItems.length) {
      setFormError("Your cart is empty.");
      return;
    }

    if (!validateCheckout()) return;

    try {
      setPlacingOrder(true);
      setFormError("");

      // 1. Ensure Razorpay Checkout SDK is loaded
      const scriptReady = await loadRazorpayScript();
      if (!scriptReady || !window.Razorpay) {
        setFormError(
          "Unable to load Razorpay payment gateway. Please check your internet connection and try again."
        );
        setPlacingOrder(false);
        return;
      }

      // 2. Create Razorpay order on backend for ₹1,000 booking token
      const rzpRes = await createOrderRazorpayOrder({
        fullName: shippingInfo.fullName.trim(),
        mobile: shippingInfo.mobile.trim(),
        email: shippingInfo.email.trim(),
        amount: 1000,
      });

      if (!rzpRes || !rzpRes.success || !rzpRes.orderId) {
        throw new Error(
          rzpRes?.message || "Failed to initialize payment gateway. Please try again."
        );
      }

      // 3. Open Razorpay payment gateway modal
      const options = {
        key: rzpRes.keyId,
        amount: rzpRes.amount,
        currency: rzpRes.currency || "INR",
        name: "Star Link Goods",
        description: "Solar Product Order Booking Token (₹1,000)",
        image: "/Logo.jpeg",
        order_id: rzpRes.orderId,
        prefill: {
          name: shippingInfo.fullName.trim(),
          contact: shippingInfo.mobile.trim(),
          email: shippingInfo.email.trim(),
        },
        theme: {
          color: "#ffd044",
        },
        handler: async function (paymentResponse) {
          try {
            setPlacingOrder(true);
            setFormError("");

            // 4. Send customer details + uploaded documents + Razorpay signatures for server-side verification
            const formData = new FormData();

            formData.append(
              "customerDetails",
              JSON.stringify({
                fullName: shippingInfo.fullName.trim(),
                mobile: shippingInfo.mobile.trim(),
                email: (shippingInfo.email || "").trim(),
                password: shippingInfo.password,
                address: shippingInfo.address.trim(),
                city: shippingInfo.city.trim(),
                state: shippingInfo.state.trim(),
                pincode: (shippingInfo.pincode || "").trim(),
                isHouseOwner: shippingInfo.isHouseOwner === "Yes" ? "Yes" : "No",
              })
            );

            // Razorpay Payment Verification credentials
            formData.append("razorpay_order_id", paymentResponse.razorpay_order_id);
            formData.append("razorpay_payment_id", paymentResponse.razorpay_payment_id);
            formData.append("razorpay_signature", paymentResponse.razorpay_signature);

            formData.append("paymentMethod", "Online Payment (Razorpay)");
            formData.append("paymentStatus", "Paid");
            formData.append("notes", orderNotes);
            formData.append("items", JSON.stringify(cartItems));
            formData.append("totalAmount", String(totals.grandTotal));
            formData.append("payableAmount", "1000"); // ₹1,000 token payable amount

            if (userData?._id || userData?.id) {
              formData.append("vendorId", userData._id || userData.id);
            }
            if (userData?.vendorCode || userData?.slgId) {
              formData.append("vendorCode", userData.vendorCode || userData.slgId);
            }
            if (userData?.name) {
              formData.append("vendorName", userData.name);
            }
            if (userData?.email) {
              formData.append("vendorEmail", userData.email);
            }
            if (userData?.mobile) {
              formData.append("vendorMobile", userData.mobile);
            }

            Object.entries(documents).forEach(([key, file]) => {
              if (file) {
                formData.append(key, file);
              }
            });

            const result = await createOrder(formData);

            if (!result.success) {
              throw new Error(result.message || "Failed to confirm and place order.");
            }

            // Store Customer OrderUser auth credentials for customer dashboard
            if (result.orderUserToken) {
              localStorage.setItem("orderUserToken", result.orderUserToken);
            }
            if (result.orderUser) {
              localStorage.setItem("orderUserData", JSON.stringify(result.orderUser));
            }

            const serverOrder = result.order || {};
            const placedOrder = {
              orderId:
                serverOrder.orderId ||
                result.orderId ||
                `SLG-ORD-${Date.now().toString().slice(-6)}`,
              id:
                serverOrder.orderId ||
                result.orderId ||
                `SLG-ORD-${Date.now().toString().slice(-6)}`,
              totalAmount: Number(serverOrder.totalAmount || totals.grandTotal),
              payableAmount: Number(serverOrder.payableAmount || 1000),
              amount: Number(serverOrder.payableAmount || 1000),
              paymentMethod: serverOrder.paymentMethod || "Online Payment (Razorpay)",
              paymentStatus: serverOrder.paymentStatus || "Paid",
              onlineTransactionId:
                serverOrder.onlineTransactionId ||
                paymentResponse.razorpay_payment_id ||
                "",
              customerDetails: serverOrder.customerDetails || shippingInfo,
              shippingInfo: serverOrder.customerDetails || shippingInfo,
              items: serverOrder.items || cartItems,
              createdAt: serverOrder.createdAt || new Date().toISOString(),
              date: new Date().toLocaleDateString("en-IN"),
              ...serverOrder,
            };

            // Store in localStorage for instant client fallback
            const ordersKey = `slg_orders_${
              userData?._id ||
              userData?.id ||
              userData?.email ||
              "guest"
            }`;

            let existingOrders = [];
            try {
              existingOrders = JSON.parse(
                localStorage.getItem(ordersKey) || "[]"
              );
            } catch {
              existingOrders = [];
            }

            existingOrders.unshift(placedOrder);
            localStorage.setItem(ordersKey, JSON.stringify(existingOrders));

            clearUserCart(userData);
            setCartItems([]);
            setOrderSuccess(placedOrder);
            setIsCheckoutOpen(false);
            setDocuments(initialDocuments);
            setShippingInfo(initialCustomerInfo());
            setOrderNotes("");
          } catch (verificationError) {
            console.error("Order placement error after payment:", verificationError);
            setFormError(
              verificationError.message ||
                "Payment was successful but order creation failed. Please contact support."
            );
          } finally {
            setPlacingOrder(false);
          }
        },
        modal: {
          ondismiss: function () {
            setPlacingOrder(false);
            setFormError("Payment was cancelled. Order was NOT placed.");
          },
        },
      };

      const rzpInstance = new window.Razorpay(options);

      rzpInstance.on("payment.failed", function (response) {
        console.error("Razorpay order payment failed:", response.error);
        setPlacingOrder(false);
        setFormError(
          `Payment failed: ${response.error?.description || "Transaction was declined"}. Order was NOT placed.`
        );
      });

      rzpInstance.open();
    } catch (error) {
      console.error("Error launching Razorpay payment:", error);
      setFormError(
        error.message || "Something went wrong while launching Razorpay payment."
      );
      setPlacingOrder(false);
    }
  };

  return (
    <div className="user-cart-page">
      <div className="cart-page-heading">
        <div>
          <span className="cart-eyebrow">
            SLG / DEALER PROCUREMENT
          </span>

          <h1>My Cart</h1>

          <p>
            Isolated cart for{" "}
            <strong>{userData.name || "Vendor User"}</strong>{" "}
            ({userData.email || "Authenticated Account"}).
          </p>
        </div>

        <div className="cart-heading-actions">
          <Link
            to="/user/products"
            className="cart-outline-button"
          >
            <FiArrowLeft /> Continue Shopping
          </Link>

          {cartItems.length > 0 && (
            <button
              type="button"
              className="cart-danger-button"
              onClick={handleClearCart}
            >
              <FiTrash2 /> Clear Cart
            </button>
          )}
        </div>
      </div>

      {orderSuccess && (
        <section className="cart-success-card">
          <div className="success-icon-badge">
            <FiCheckCircle />
          </div>

          <h2>Order Placed Successfully!</h2>

          <p className="success-order-id">
            Order Reference:{" "}
            <strong>
              #{orderSuccess.orderId || orderSuccess.id || "SLG-ORD"}
            </strong>{" "}
            &bull; Placed on{" "}
            {orderSuccess.createdAt
              ? new Date(orderSuccess.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : orderSuccess.date || "Today"}
          </p>

          <p className="success-desc">
            Your booking token payment of{" "}
            <strong style={{ color: "#34d399" }}>
              ₹
              {Number(
                orderSuccess.payableAmount || orderSuccess.amount || 1000
              ).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </strong>{" "}
            has been confirmed. Total catalog order value:{" "}
            <strong>
              ₹
              {Number(
                orderSuccess.totalAmount || orderSuccess.amount || 0
              ).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </strong>
          </p>

          <div className="success-summary-row">
            <div>
              <span>Payment Mode:</span>
              <strong>
                {orderSuccess.paymentMethod || "Online Payment (Razorpay)"}
              </strong>
            </div>

            <div>
              <span>Payment Status:</span>
              <strong style={{ color: "#34d399" }}>
                {orderSuccess.paymentStatus || "Paid"}
              </strong>
            </div>

            <div>
              <span>Customer:</span>
              <strong>
                {orderSuccess.customerDetails?.fullName ||
                  orderSuccess.shippingInfo?.fullName ||
                  "Customer"}
              </strong>
            </div>

            <div>
              <span>Customer Account:</span>
              <strong style={{ color: "#ffd044" }}>
                {orderSuccess.customerDetails?.email ||
                  orderSuccess.shippingInfo?.email ||
                  "Registered with Order"}
              </strong>
            </div>

            <div>
              <span>Deliver To:</span>
              <strong>
                {orderSuccess.customerDetails?.city ||
                  orderSuccess.shippingInfo?.city ||
                  orderSuccess.customerDetails?.address ||
                  orderSuccess.shippingInfo?.address ||
                  "Registered Address"}
              </strong>
            </div>
          </div>

          <div
            style={{
              margin: "18px 0",
              padding: "16px 20px",
              background: "rgba(255, 208, 68, 0.08)",
              border: "1px dashed rgba(255, 208, 68, 0.4)",
              borderRadius: "12px",
              textAlign: "left",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#ffd044", fontWeight: "700", marginBottom: "6px" }}>
              <FiUser /> Customer Account Created &amp; Connected!
            </div>
            <p style={{ margin: 0, fontSize: "13px", color: "#e2e8f0", lineHeight: "1.6" }}>
              User can directly log in using their email (<strong>{orderSuccess.customerDetails?.email || orderSuccess.shippingInfo?.email}</strong>) and password at the Customer Login portal to check order status, delivery tracking, and contact customer support.
            </p>
          </div>

          <div className="success-action-btns">
            <Link
              to="/order-user/dashboard"
              className="cart-primary-button"
              style={{ background: "#ffd044", color: "#000", fontWeight: "800" }}
            >
              <FiUser /> Go to Customer Dashboard
            </Link>

            <Link to="/user/orders" className="cart-outline-button">
              <FiPackage /> Vendor Orders
            </Link>

            <Link to="/user/products" className="cart-outline-button">
              Browse Products
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

      {!orderSuccess && cartItems.length === 0 ? (
        <section className="cart-empty-panel">
          <div className="empty-cart-icon">
            <FiShoppingCart />
          </div>

          <h2>Your Cart is Currently Empty</h2>

          <p>
            Browse our product catalog and add products to your cart
            to create an order.
          </p>

          <div className="empty-cart-actions">
            <Link to="/user/products" className="cart-primary-button">
              Explore Products Catalog <FiArrowRight />
            </Link>
          </div>
        </section>
      ) : !orderSuccess ? (
        <div className="cart-main-grid">
          <div className="cart-items-column">
            <div className="cart-items-header">
              <span>Product ({totals.totalUnits} items)</span>
              <span>Unit Price</span>
              <span>Quantity</span>
              <span style={{ textAlign: "right" }}>Subtotal</span>
            </div>

            <div className="cart-items-list">
              {cartItems.map((item) => {
                const itemLineTotal =
                  (item.price || 0) * (item.quantity || 1);

                const hasDiscount =
                  item.oldPrice && item.oldPrice > item.price;

                const discountPercent = hasDiscount
                  ? Math.round(
                      ((item.oldPrice - item.price) / item.oldPrice) *
                        100
                    )
                  : 0;

                return (
                  <article
                    key={item._id || item.id}
                    className="cart-item-card"
                  >
                    <div className="cart-item-info">
                      <div className="cart-item-thumb">
                        <img
                          src={formatImageUrl(item.image)}
                          alt={item.name}
                          onError={(event) => {
                            event.currentTarget.src =
                              "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=300&q=80";
                          }}
                        />
                      </div>

                      <div className="cart-item-details">
                        <span className="cart-item-cat">
                          {item.category || "Furniture"}
                        </span>

                        <h3 className="cart-item-title">
                          {item.name}
                        </h3>

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

                    <div className="cart-item-unit-price">
                      <strong className="unit-current">
                        ₹{(item.price || 0).toLocaleString("en-IN")}
                      </strong>

                      {hasDiscount && (
                        <div className="unit-old-wrap">
                          <span className="unit-old">
                            ₹{item.oldPrice.toLocaleString("en-IN")}
                          </span>

                          <span className="unit-off">
                            {discountPercent}% OFF
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="cart-item-qty">
                      <div className="qty-control-box">
                        <button
                          type="button"
                          className="qty-btn minus"
                          onClick={() =>
                            handleQtyChange(
                              item._id || item.id,
                              (item.quantity || 1) - 1
                            )
                          }
                          disabled={(item.quantity || 1) <= 1}
                          aria-label="Decrease quantity"
                        >
                          <FiMinus />
                        </button>

                        <span className="qty-value">
                          {item.quantity || 1}
                        </span>

                        <button
                          type="button"
                          className="qty-btn plus"
                          onClick={() =>
                            handleQtyChange(
                              item._id || item.id,
                              (item.quantity || 1) + 1
                            )
                          }
                          disabled={
                            (item.quantity || 1) >= (item.stock || 999)
                          }
                          aria-label="Increase quantity"
                        >
                          <FiPlus />
                        </button>
                      </div>

                      <button
                        type="button"
                        className="item-delete-btn"
                        onClick={() =>
                          handleRemoveItem(item._id || item.id)
                        }
                      >
                        <FiTrash2 /> Remove
                      </button>
                    </div>

                    <div className="cart-item-line-total">
                      <strong>
                        ₹
                        {itemLineTotal.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </strong>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="cart-assurance-banner">
              <div className="assurance-item">
                <FiTruck className="assurance-icon" />
                <div>
                  <strong>Insured Express Delivery</strong>
                  <p>Careful packaging and secure dispatch.</p>
                </div>
              </div>

              <div className="assurance-item">
                <FiShield className="assurance-icon" />
                <div>
                  <strong>Quality Guaranteed</strong>
                  <p>Our team verifies orders before dispatch.</p>
                </div>
              </div>
            </div>
          </div>

          <aside className="cart-summary-sidebar">
            <div className="summary-card">
              <h2 className="summary-title">Order Summary</h2>

              <div className="summary-rows">
                <div className="summary-row">
                  <span>Subtotal ({totals.totalUnits} items)</span>
                  <strong>
                    ₹
                    {totals.subtotal.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </strong>
                </div>

                {totals.discountSavings > 0 && (
                  <div className="summary-row discount">
                    <span>Dealer Savings</span>
                    <strong className="discount-value">
                      -₹
                      {totals.discountSavings.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </strong>
                  </div>
                )}

                <div className="summary-row">
                  <span>Shipping &amp; Logistics</span>
                  <strong>
                    {totals.shippingFee === 0
                      ? "FREE"
                      : `₹${totals.shippingFee.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}`}
                  </strong>
                </div>

                <div className="summary-row">
                  <span>Estimated GST &amp; Taxes</span>
                  <span className="tax-note">Included (0%)</span>
                </div>
              </div>

              <div className="summary-divider" />

              <div className="summary-total-row">
                <div>
                  <span className="total-label">Total Product Value</span>
                  <small>Full order catalog value</small>
                </div>

                <h3 className="total-amount" style={{ color: "#ffd044", fontSize: "20px" }}>
                  ₹
                  {totals.grandTotal.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </h3>
              </div>

              {/* Highlighted ₹1,000 Token / Payable Amount Box */}
              <div
                style={{
                  background: "linear-gradient(135deg, rgba(52, 211, 153, 0.12) 0%, rgba(16, 185, 129, 0.08) 100%)",
                  border: "1px solid rgba(52, 211, 153, 0.35)",
                  borderRadius: "8px",
                  padding: "12px 14px",
                  margin: "12px 0 16px 0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ color: "#34d399", fontWeight: "800", fontSize: "13.5px" }}>
                    Payable Now (Token)
                  </div>
                  <div style={{ color: "#a89d8d", fontSize: "11px", marginTop: "2px" }}>
                    Balance: ₹{Math.max(0, totals.grandTotal - 1000).toLocaleString("en-IN")} on installation
                  </div>
                </div>
                <div style={{ color: "#34d399", fontWeight: "800", fontSize: "22px" }}>
                  ₹1,000
                </div>
              </div>

              <button
                type="button"
                className="cart-checkout-button"
                onClick={() => {
                  setFormError("");
                  setIsCheckoutOpen(true);
                }}
              >
                Proceed to Checkout (Pay ₹1,000) <FiArrowRight />
              </button>

              <div className="cart-safe-guarantee">
                <FiShield /> Secure Solar Procurement
              </div>
            </div>
          </aside>
        </div>
      ) : null}

      {isCheckoutOpen && (
        <div
          className="cart-modal-backdrop"
          onClick={() => !placingOrder && setIsCheckoutOpen(false)}
        >
          <div
            className="cart-modal-container"
            style={{ maxWidth: "680px" }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="cart-modal-header">
              <div>
                <span className="modal-eyebrow">SLG SOLAR PROCUREMENT</span>
                <h2>Place Solar System Order</h2>
                <p className="checkout-subtitle">
                  Fill in customer details &amp; upload required documents to place order.
                </p>
              </div>

              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsCheckoutOpen(false)}
                disabled={placingOrder}
                aria-label="Close checkout"
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handlePlaceOrder} className="checkout-form">
              {/* Payment Token & Total Summary Banner */}
              <div
                style={{
                  background: "linear-gradient(135deg, rgba(255, 208, 68, 0.12) 0%, rgba(212, 175, 55, 0.08) 100%)",
                  border: "1px solid rgba(255, 208, 68, 0.3)",
                  borderLeft: "4px solid #ffd044",
                  borderRadius: "8px",
                  padding: "12px 14px",
                  marginBottom: "18px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                <div>
                  <span style={{ color: "#a89d8d", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Total Order Value: ₹{totals.grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                  <div style={{ color: "#ffd044", fontSize: "16px", fontWeight: "800", marginTop: "2px" }}>
                    Payable Amount: ₹1,000 (Online Booking Token)
                  </div>
                </div>
                <div style={{ fontSize: "12px", color: "#34d399", fontWeight: "700" }}>
                  ● Payment Method: Online Payment
                </div>
              </div>

              {/* 1. Customer Details (Blank, not prefilled) */}
              <div className="form-section">
                <h3 className="form-section-title">
                  1. Customer Information
                </h3>
                <p className="form-help-text" style={{ margin: "-4px 0 12px 0", color: "#a89d8d", fontSize: "12px" }}>
                  Please fill in the fresh details of the customer for whom the order is placed.
                </p>

                <div className="form-grid-2">
                  <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label>Customer Full Name *</label>
                    <input
                      required
                      type="text"
                      value={shippingInfo.fullName}
                      onChange={(event) =>
                        updateShippingInfo("fullName", event.target.value)
                      }
                      placeholder="Enter customer's complete name"
                    />
                  </div>

                  <div className="form-group">
                    <label>Mobile Number * (10 Digits)</label>
                    <input
                      required
                      type="tel"
                      maxLength={10}
                      value={shippingInfo.mobile}
                      onChange={(event) =>
                        handleMobileChange(event.target.value)
                      }
                      placeholder="e.g. 9876543210"
                    />
                  </div>

                  <div className="form-group">
                    <label>Email ID * (Account &amp; Login)</label>
                    <input
                      required
                      type="email"
                      value={shippingInfo.email}
                      onChange={(event) =>
                        updateShippingInfo("email", event.target.value)
                      }
                      placeholder="customer@example.com"
                    />
                  </div>

                  <div className="form-group">
                    <label>Customer Password * (Min 6 Chars)</label>
                    <div style={{ position: "relative" }}>
                      <input
                        required
                        type={showPassword ? "text" : "password"}
                        value={shippingInfo.password}
                        onChange={(event) =>
                          updateShippingInfo("password", event.target.value)
                        }
                        placeholder="Create login password"
                        style={{ paddingRight: "42px" }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: "absolute",
                          right: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          color: "#ffd044",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "17px",
                          padding: "4px",
                        }}
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Confirm Password *</label>
                    <div style={{ position: "relative" }}>
                      <input
                        required
                        type={showConfirmPassword ? "text" : "password"}
                        value={shippingInfo.confirmPassword}
                        onChange={(event) =>
                          updateShippingInfo("confirmPassword", event.target.value)
                        }
                        placeholder="Re-enter password"
                        style={{ paddingRight: "42px" }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{
                          position: "absolute",
                          right: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          color: "#ffd044",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "17px",
                          padding: "4px",
                        }}
                        title={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label>Complete Installation / Delivery Address *</label>
                    <input
                      required
                      type="text"
                      value={shippingInfo.address}
                      onChange={(event) =>
                        updateShippingInfo("address", event.target.value)
                      }
                      placeholder="House / Flat No., Street, Landmark, Area"
                    />
                  </div>

                  <div className="form-group">
                    <label>City / Village *</label>
                    <input
                      required
                      type="text"
                      value={shippingInfo.city}
                      onChange={(event) =>
                        updateShippingInfo("city", event.target.value)
                      }
                      placeholder="City or Village name"
                    />
                  </div>

                  <div className="form-group">
                    <label>State *</label>
                    <input
                      required
                      type="text"
                      value={shippingInfo.state}
                      onChange={(event) =>
                        updateShippingInfo("state", event.target.value)
                      }
                      placeholder="State name"
                    />
                  </div>

                  <div className="form-group">
                    <label>Pincode *</label>
                    <input
                      required
                      type="text"
                      maxLength={6}
                      value={shippingInfo.pincode}
                      onChange={(event) =>
                        updateShippingInfo(
                          "pincode",
                          event.target.value.replace(/\D/g, "").slice(0, 6)
                        )
                      }
                      placeholder="6-digit Pincode"
                    />
                  </div>
                </div>
              </div>

              {/* 2. House Owner Details & Certificate */}
              <div className="form-section">
                <h3 className="form-section-title">
                  2. House Ownership &amp; Certificate
                </h3>

                <div className="form-group">
                  <label style={{ fontSize: "13px", fontWeight: "700", color: "#ffd044" }}>
                    Are you the House Owner? *
                  </label>
                  <div style={{ display: "flex", gap: "14px", marginTop: "8px" }}>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer",
                        padding: "8px 18px",
                        borderRadius: "8px",
                        background: shippingInfo.isHouseOwner === "Yes" ? "rgba(255, 208, 68, 0.2)" : "#181818",
                        border: `1px solid ${shippingInfo.isHouseOwner === "Yes" ? "#ffd044" : "rgba(255, 208, 68, 0.2)"}`,
                        color: shippingInfo.isHouseOwner === "Yes" ? "#ffd044" : "#ffffff",
                        fontWeight: "700",
                      }}
                    >
                      <input
                        type="radio"
                        name="isHouseOwner"
                        value="Yes"
                        checked={shippingInfo.isHouseOwner === "Yes"}
                        onChange={() => updateShippingInfo("isHouseOwner", "Yes")}
                        style={{ accentColor: "#ffd044" }}
                      />
                      Yes (House Owner)
                    </label>

                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer",
                        padding: "8px 18px",
                        borderRadius: "8px",
                        background: shippingInfo.isHouseOwner === "No" ? "rgba(255, 208, 68, 0.2)" : "#181818",
                        border: `1px solid ${shippingInfo.isHouseOwner === "No" ? "#ffd044" : "rgba(255, 208, 68, 0.2)"}`,
                        color: shippingInfo.isHouseOwner === "No" ? "#ffd044" : "#ffffff",
                        fontWeight: "700",
                      }}
                    >
                      <input
                        type="radio"
                        name="isHouseOwner"
                        value="No"
                        checked={shippingInfo.isHouseOwner === "No"}
                        onChange={() => updateShippingInfo("isHouseOwner", "No")}
                        style={{ accentColor: "#ffd044" }}
                      />
                      No (Tenant / Other)
                    </label>
                  </div>
                </div>

                {/* If Yes: House Owner Certificate Upload */}
                {shippingInfo.isHouseOwner === "Yes" && (
                  <div
                    className="form-group file-upload-group"
                    style={{
                      background: "rgba(255, 208, 68, 0.08)",
                      border: "1px dashed #ffd044",
                      borderRadius: "8px",
                      padding: "14px",
                      marginTop: "12px",
                    }}
                  >
                    <label htmlFor="document-houseOwnerCertificate" style={{ color: "#ffd044", fontWeight: "700" }}>
                      Upload House Owner Certificate / Registry Proof * (PDF, JPG, PNG)
                    </label>
                    <input
                      id="document-houseOwnerCertificate"
                      type="file"
                      required
                      accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                      onChange={(event) =>
                        handleDocumentChange("houseOwnerCertificate", event)
                      }
                    />
                    {documents.houseOwnerCertificate && (
                      <span className="selected-file-name" style={{ color: "#34d399", display: "block", marginTop: "6px" }}>
                        ✓ Selected: {documents.houseOwnerCertificate.name}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* 3. Upload Required Documents */}
              <div className="form-section">
                <h3 className="form-section-title">
                  3. Upload Required Documents
                </h3>
                <p className="form-help-text">
                  Accepted formats: PDF, JPG, JPEG or PNG. Maximum 10 MB per file.
                </p>

                <div className="form-grid-2">
                  <div className="form-group file-upload-group">
                    <label htmlFor="document-aadhaarCard">
                      Aadhaar Card (Front/Back) *
                    </label>
                    <input
                      id="document-aadhaarCard"
                      type="file"
                      required
                      accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                      onChange={(event) =>
                        handleDocumentChange("aadhaarCard", event)
                      }
                    />
                    {documents.aadhaarCard && (
                      <span className="selected-file-name">
                        ✓ {documents.aadhaarCard.name}
                      </span>
                    )}
                  </div>

                  <div className="form-group file-upload-group">
                    <label htmlFor="document-electricityBill">
                      Electricity Bill *
                    </label>
                    <input
                      id="document-electricityBill"
                      type="file"
                      required
                      accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                      onChange={(event) =>
                        handleDocumentChange("electricityBill", event)
                      }
                    />
                    {documents.electricityBill && (
                      <span className="selected-file-name">
                        ✓ {documents.electricityBill.name}
                      </span>
                    )}
                  </div>

                  <div className="form-group file-upload-group" style={{ gridColumn: "1 / -1" }}>
                    <label htmlFor="document-otherDocument">
                      Additional Document / ID Proof (Optional)
                    </label>
                    <input
                      id="document-otherDocument"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                      onChange={(event) =>
                        handleDocumentChange("otherDocument", event)
                      }
                    />
                    {documents.otherDocument && (
                      <span className="selected-file-name">
                        ✓ {documents.otherDocument.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 4. Payment Method: Strictly Online Payment */}
              <div className="form-section">
                <h3 className="form-section-title">
                  4. Payment Method (Online Payment)
                </h3>

                <div className="payment-options-grid">
                  <label className="payment-option-card selected">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      checked={true}
                      readOnly
                    />
                    <div className="option-content">
                      <div className="option-title-row">
                        <strong>Online Payment (₹1,000 Now)</strong>
                      </div>
                      <p>Pay ₹1,000 online token booking amount via UPI, NetBanking, Cards or Payment Gateway.</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* 5. Special Instructions */}
              <div className="form-section">
                <div className="form-group">
                  <label>Order Notes / Special Instructions (Optional)</label>
                  <textarea
                    rows={2}
                    value={orderNotes}
                    onChange={(event) => setOrderNotes(event.target.value)}
                    placeholder="Enter any specific solar setup requirements or landmark..."
                  />
                </div>
              </div>

              {formError && (
                <div className="checkout-error" role="alert">
                  {formError}
                </div>
              )}

              <div className="cart-modal-footer">
                <div className="modal-total-display">
                  <span>Payable Amount (Token)</span>
                  <strong style={{ color: "#34d399", fontSize: "20px" }}>
                    ₹1,000.00
                  </strong>
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
                    {placingOrder
                      ? "Placing Order..."
                      : "Confirm & Place Order (Pay ₹1,000)"}
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