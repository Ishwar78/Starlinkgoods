const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Razorpay = require("razorpay");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const Order = require("../models/Order");
const Vendor = require("../models/Vendor");
const VendorUser = require("../models/VendorUser");
const OrderUser = require("../models/OrderUser");

const JWT_SECRET =
  process.env.JWT_SECRET || "starlink_super_secret_admin_jwt_key_2026";

// Helper to get Razorpay instance
const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error("Razorpay API credentials not configured in server environment.");
  }

  return new Razorpay({
    key_id,
    key_secret,
  });
};

// Ensure uploads/orders directory exists
const uploadDir = path.join(__dirname, "../uploads/orders");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.]/g, "-");
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e6);
    const ext = path.extname(cleanName);
    const base = path.basename(cleanName, ext).substring(0, 20);
    cb(null, `order-${file.fieldname}-${base}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit per file
  fileFilter: (req, file, cb) => {
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
      "application/pdf",
    ];
    if (allowed.includes(file.mimetype) || file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Please upload a valid image (JPG, PNG, WEBP) or PDF file."), false);
    }
  },
});

// Multi-file upload fields for order documentation
const orderUploadFields = upload.fields([
  { name: "houseOwnerCertificate", maxCount: 1 },
  { name: "aadhaarCard", maxCount: 1 },
  { name: "electricityBill", maxCount: 1 },
  { name: "otherDocument", maxCount: 1 },
]);

// Helper to authenticate logged-in vendor/user
const resolveVendorUser = async (req) => {
  let user = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded && decoded.id) {
        user = await Vendor.findById(decoded.id);
        if (!user) user = await VendorUser.findById(decoded.id);
      }
    } catch (e) {}
  }

  if (!user) {
    const qId = req.body.vendorId || req.query.vendorId;
    const qEmail = (
      req.body.vendorEmail ||
      req.query.vendorEmail ||
      req.body.email ||
      ""
    )
      .toLowerCase()
      .trim();

    if (qId) {
      user = await Vendor.findById(qId);
      if (!user) user = await VendorUser.findById(qId);
    }
    if (!user && qEmail) {
      user = await Vendor.findOne({ email: qEmail });
      if (!user) user = await VendorUser.findOne({ email: qEmail });
    }
  }

  return user;
};

/**
 * Helper to safely unlink uploaded files upon failure
 */
const cleanUploadedFiles = (files) => {
  if (!files) return;
  try {
    Object.values(files).forEach((fileArr) => {
      if (Array.isArray(fileArr)) {
        fileArr.forEach((f) => {
          if (f && f.path && fs.existsSync(f.path)) {
            try {
              fs.unlinkSync(f.path);
            } catch (err) {
              console.error("Error unlinking file:", err);
            }
          }
        });
      }
    });
  } catch (e) {
    console.error("cleanUploadedFiles error:", e);
  }
};

/**
 * GET /api/orders/razorpay-config
 * Expose Razorpay public key and token booking fee (₹1,000)
 */
router.get("/razorpay-config", (req, res) => {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID || "";
    const fee = 1000; // Fixed booking token of ₹1,000
    const currency = process.env.RAZORPAY_CURRENCY || "INR";

    return res.status(200).json({
      success: true,
      keyId,
      fee,
      currency,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch Razorpay configuration.",
      error: error.message,
    });
  }
});

/**
 * POST /api/orders/create-razorpay-order
 * Create Razorpay Order for ₹1,000 token booking
 */
router.post("/create-razorpay-order", async (req, res) => {
  try {
    const razorpay = getRazorpayInstance();
    const payableAmount = 1000; // ₹1,000 payable amount
    const currency = process.env.RAZORPAY_CURRENCY || "INR";
    const amountInPaise = Math.round(payableAmount * 100); // 100000 paise

    const { fullName, mobile, email } = req.body;

    const cleanMobile = (mobile || "").replace(/\D/g, "").slice(-10);
    const receipt = `ord_${Date.now()}_${cleanMobile || Math.floor(1000 + Math.random() * 9000)}`;

    const orderOptions = {
      amount: amountInPaise,
      currency,
      receipt,
      notes: {
        customer_name: (fullName || "").trim() || "Solar Customer",
        customer_mobile: cleanMobile || "",
        customer_email: (email || "").trim(),
        purpose: "Solar Product Order Booking Token (₹1,000)",
      },
    };

    const rzpOrder = await razorpay.orders.create(orderOptions);

    return res.status(200).json({
      success: true,
      message: "Razorpay order created successfully.",
      orderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      fee: payableAmount,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Error creating Razorpay order for order placement:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to initialize payment gateway. Please try again.",
    });
  }
});

/**
 * POST /api/orders
 * Vendor / Customer places a new order WITH MANDATORY Razorpay Payment Verification
 */
router.post("/", orderUploadFields, async (req, res) => {
  try {
    // 1. Mandatory Razorpay Payment Verification
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      cleanUploadedFiles(req.files);
      return res.status(400).json({
        success: false,
        message:
          "Payment verification required: Razorpay transaction details are missing. Order cannot be placed without successful payment.",
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      cleanUploadedFiles(req.files);
      return res.status(500).json({
        success: false,
        message: "Razorpay secret key is not configured on the server.",
      });
    }

    // Verify HMAC-SHA256 signature
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      cleanUploadedFiles(req.files);
      console.error("Order payment signature mismatch:", {
        expectedSignature,
        razorpay_signature,
      });
      return res.status(400).json({
        success: false,
        message:
          "Invalid payment signature. Transaction verification failed. Order was not placed.",
      });
    }

    const user = await resolveVendorUser(req);

    // Parse customerDetails and items if sent as JSON strings
    let customerDetails = {};
    if (typeof req.body.customerDetails === "string") {
      try {
        customerDetails = JSON.parse(req.body.customerDetails);
      } catch {
        customerDetails = {};
      }
    } else if (req.body.customerDetails) {
      customerDetails = req.body.customerDetails;
    } else {
      // Fallback: extract direct fields
      customerDetails = {
        fullName: req.body.fullName || req.body.customerName || "",
        mobile: req.body.mobile || req.body.customerMobile || "",
        email: req.body.email || req.body.customerEmail || "",
        address: req.body.address || "",
        city: req.body.city || "",
        state: req.body.state || "",
        pincode: req.body.pincode || "",
        isHouseOwner: req.body.isHouseOwner || "No",
      };
    }

    if (!customerDetails.fullName || !customerDetails.fullName.trim()) {
      cleanUploadedFiles(req.files);
      return res.status(400).json({
        success: false,
        message: "Customer Full Name is required.",
      });
    }

    if (!customerDetails.mobile || !customerDetails.mobile.trim()) {
      cleanUploadedFiles(req.files);
      return res.status(400).json({
        success: false,
        message: "Customer Mobile Number is required.",
      });
    }

    if (!customerDetails.address || !customerDetails.address.trim()) {
      cleanUploadedFiles(req.files);
      return res.status(400).json({
        success: false,
        message: "Complete Delivery/Installation Address is required.",
      });
    }

    // Parse Cart Items
    let items = [];
    if (typeof req.body.items === "string") {
      try {
        items = JSON.parse(req.body.items);
      } catch {
        items = [];
      }
    } else if (Array.isArray(req.body.items)) {
      items = req.body.items;
    }

    if (!items || items.length === 0) {
      cleanUploadedFiles(req.files);
      return res.status(400).json({
        success: false,
        message: "Cannot place order: Cart is empty.",
      });
    }

    // Format items with safety
    const formattedItems = items.map((it) => {
      const price = Number(it.price) || 0;
      const qty = Math.max(1, Number(it.quantity) || 1);
      return {
        productId: String(it._id || it.id || `PROD-${Date.now()}`),
        name: it.name || "Solar Product",
        price,
        oldPrice: Number(it.oldPrice) || 0,
        quantity: qty,
        image: it.image || (Array.isArray(it.images) ? it.images[0] : "") || "",
        category: it.category || "Solar System",
        total: price * qty,
      };
    });

    const totalAmount = formattedItems.reduce((sum, it) => sum + it.total, 0);

    // Document file paths
    const documents = {
      houseOwnerCertificate: "",
      aadhaarCard: "",
      electricityBill: "",
      otherDocument: "",
    };

    if (req.files) {
      if (req.files.houseOwnerCertificate && req.files.houseOwnerCertificate[0]) {
        documents.houseOwnerCertificate = `/uploads/orders/${req.files.houseOwnerCertificate[0].filename}`;
      }
      if (req.files.aadhaarCard && req.files.aadhaarCard[0]) {
        documents.aadhaarCard = `/uploads/orders/${req.files.aadhaarCard[0].filename}`;
      }
      if (req.files.electricityBill && req.files.electricityBill[0]) {
        documents.electricityBill = `/uploads/orders/${req.files.electricityBill[0].filename}`;
      }
      if (req.files.otherDocument && req.files.otherDocument[0]) {
        documents.otherDocument = `/uploads/orders/${req.files.otherDocument[0].filename}`;
      }
    }

    // Generate unique Order ID
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `SLG-ORD-${Date.now().toString().slice(-6)}-${randomSuffix}`;

    // 5. Create or Update Customer OrderUser Account in Database
    const cleanCustomerEmail = (customerDetails.email || req.body.email || "").toLowerCase().trim();
    const rawCustomerPassword = (customerDetails.password || req.body.password || "").trim();
    const finalPassword = rawCustomerPassword.length >= 6
      ? rawCustomerPassword
      : `Solar@${(customerDetails.mobile || "1234").replace(/\D/g, "").slice(-4) || "1234"}`;

    let orderUser = null;
    let orderUserToken = null;

    if (cleanCustomerEmail) {
      try {
        orderUser = await OrderUser.findOne({ email: cleanCustomerEmail });

        if (!orderUser) {
          orderUser = new OrderUser({
            name: customerDetails.fullName.trim(),
            email: cleanCustomerEmail,
            mobile: customerDetails.mobile.trim(),
            password: finalPassword,
            address: customerDetails.address.trim(),
            city: (customerDetails.city || "").trim(),
            state: (customerDetails.state || "").trim(),
            pincode: (customerDetails.pincode || "").trim(),
            isHouseOwner: customerDetails.isHouseOwner === "Yes" ? "Yes" : "No",
            vendorId: user ? user._id : null,
            vendorName: user ? user.name : "",
          });
          await orderUser.save();
        } else {
          if (rawCustomerPassword.length >= 6) {
            orderUser.password = rawCustomerPassword;
          }
          if (customerDetails.fullName) orderUser.name = customerDetails.fullName.trim();
          if (customerDetails.mobile) orderUser.mobile = customerDetails.mobile.trim();
          if (customerDetails.address) orderUser.address = customerDetails.address.trim();
          if (customerDetails.city) orderUser.city = customerDetails.city.trim();
          if (customerDetails.state) orderUser.state = customerDetails.state.trim();
          if (customerDetails.pincode) orderUser.pincode = customerDetails.pincode.trim();
          if (customerDetails.isHouseOwner) {
            orderUser.isHouseOwner = customerDetails.isHouseOwner === "Yes" ? "Yes" : "No";
          }
          await orderUser.save();
        }

        // Generate customer login token
        orderUserToken = jwt.sign(
          {
            id: orderUser._id,
            role: "OrderCustomer",
            email: orderUser.email,
          },
          JWT_SECRET,
          { expiresIn: "30d" }
        );

        // Also sync into VendorUser for Admin Panel (/admin/vendor-users) visibility
        try {
          let vUser = await VendorUser.findOne({ email: cleanCustomerEmail });
          if (!vUser) {
            vUser = new VendorUser({
              name: customerDetails.fullName.trim(),
              email: cleanCustomerEmail,
              mobile: customerDetails.mobile.trim(),
              city: (customerDetails.city || "N/A").trim(),
              state: (customerDetails.state || "N/A").trim(),
              vendorId: user ? user._id : null,
              vendorName: user ? user.name : "Direct Order",
              vendorEmail: user ? user.email : "",
              vendorMobile: user ? user.mobile : "",
              role: "Customer",
              status: "Active",
            });
            await vUser.save();
          }
        } catch (vErr) {
          console.warn("VendorUser sync notice:", vErr.message);
        }
      } catch (userCreateErr) {
        console.error("Warning: Could not create/update OrderUser:", userCreateErr);
      }
    }

    const payableAmount = 1000; // Fixed token payable amount as requested
    const remainingAmount = Math.max(0, totalAmount - payableAmount);

    const newOrder = new Order({
      orderId,
      vendorId: user ? user._id : null,
      vendorCode: user ? user.vendorCode || user.slgId || "" : "",
      vendorName: user ? user.name : (req.body.vendorName || "Direct / Vendor"),
      vendorEmail: user ? user.email : (req.body.vendorEmail || ""),
      vendorMobile: user ? user.mobile : (req.body.vendorMobile || ""),
      orderUserId: orderUser ? orderUser._id : null,
      orderUserEmail: cleanCustomerEmail,
      customerDetails: {
        fullName: customerDetails.fullName.trim(),
        mobile: customerDetails.mobile.trim(),
        email: cleanCustomerEmail,
        address: customerDetails.address.trim(),
        city: (customerDetails.city || "").trim(),
        state: (customerDetails.state || "").trim(),
        pincode: (customerDetails.pincode || "").trim(),
        isHouseOwner: customerDetails.isHouseOwner === "Yes" ? "Yes" : "No",
      },
      documents,
      items: formattedItems,
      totalAmount,
      payableAmount,
      remainingAmount,
      paymentMethod: "Online Payment (Razorpay)",
      paymentStatus: "Paid",
      onlineTransactionId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      orderStatus: "Processing",
      orderNotes: (req.body.orderNotes || req.body.notes || "").trim(),
    });

    await newOrder.save();

    return res.status(201).json({
      success: true,
      message: "Order placed successfully! ₹1,000 online payment verified via Razorpay.",
      order: newOrder,
      orderId: newOrder.orderId,
      orderUser: orderUser
        ? {
            id: orderUser._id,
            name: orderUser.name,
            email: orderUser.email,
            mobile: orderUser.mobile,
            address: orderUser.address,
            city: orderUser.city,
            state: orderUser.state,
          }
        : null,
      orderUserToken,
    });
  } catch (error) {
    cleanUploadedFiles(req.files);
    console.error("Error creating order:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to place order. " + error.message,
      error: error.message,
    });
  }
});

/**
 * GET /api/orders/my-orders
 * Get orders placed by the current vendor
 */
router.get("/my-orders", async (req, res) => {
  try {
    const user = await resolveVendorUser(req);
    const filter = {};

    if (user) {
      filter.$or = [
        { vendorId: user._id },
        { vendorEmail: user.email },
      ];
    } else if (req.query.vendorEmail) {
      filter.vendorEmail = req.query.vendorEmail.toLowerCase().trim();
    } else if (req.query.vendorId) {
      filter.vendorId = req.query.vendorId;
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Error fetching vendor orders:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders.",
      error: error.message,
    });
  }
});

/**
 * GET /api/orders/all
 * Admin route: Get all orders with filter and stats
 */
router.get("/all", async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};

    if (status && status !== "All") {
      filter.orderStatus = status;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [
        { orderId: regex },
        { "customerDetails.fullName": regex },
        { "customerDetails.mobile": regex },
        { "customerDetails.email": regex },
        { "customerDetails.city": regex },
        { vendorName: regex },
        { vendorCode: regex },
        { "items.name": regex },
      ];
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });

    // Aggregate stats
    const all = await Order.find({}, "orderStatus totalAmount payableAmount");
    const stats = {
      total: all.length,
      pending: all.filter((o) => ["Pending", "Processing"].includes(o.orderStatus)).length,
      confirmed: all.filter((o) => o.orderStatus === "Confirmed").length,
      delivered: all.filter((o) => o.orderStatus === "Delivered").length,
      cancelled: all.filter((o) => o.orderStatus === "Cancelled").length,
      totalOrderValue: all.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0),
      totalPaidBooking: all.reduce((sum, o) => sum + (Number(o.payableAmount) || 1000), 0),
    };

    return res.status(200).json({
      success: true,
      count: orders.length,
      stats,
      orders,
    });
  } catch (error) {
    console.error("Error fetching all orders for admin:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders.",
      error: error.message,
    });
  }
});

/**
 * PATCH /api/orders/:id/status
 * Admin route: Update order fulfillment status
 */
router.patch("/:id/status", async (req, res) => {
  try {
    const { orderStatus, adminNotes } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    if (orderStatus) {
      order.orderStatus = orderStatus;
    }
    if (adminNotes !== undefined) {
      order.adminNotes = adminNotes;
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${order.orderStatus}.`,
      order,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update order status.",
      error: error.message,
    });
  }
});

/**
 * GET /api/orders/:id
 * Get single order details
 */
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }
    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch order details.",
      error: error.message,
    });
  }
});

module.exports = router;
