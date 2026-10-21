const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const OrderUser = require("../models/OrderUser");
const Order = require("../models/Order");
const ContactMessage = require("../models/ContactMessage");

const JWT_SECRET =
  process.env.JWT_SECRET || "starlink_super_secret_admin_jwt_key_2026";

// Middleware to authenticate OrderUser
const requireOrderUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token missing. Please log in to your account.",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid session token. Please log in again.",
      });
    }

    const user = await OrderUser.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account not found. Please log in again.",
      });
    }

    if (user.status === "Blocked") {
      return res.status(403).json({
        success: false,
        message: "Your customer account has been suspended. Please contact customer care.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Session expired or invalid. Please log in again.",
      error: error.message,
    });
  }
};

/**
 * POST /api/order-users/login
 * Order Customer Login with Email and Password
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter your registered email and password.",
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // Find user by email
    const user = await OrderUser.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user account found with this email address. Please check your email or place an order first.",
      });
    }

    if (user.status === "Blocked") {
      return res.status(403).json({
        success: false,
        message: "Your account is temporarily suspended. Please contact support.",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password. Please enter the password you set during order checkout.",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        role: "OrderCustomer",
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        address: user.address,
        city: user.city,
        state: user.state,
        pincode: user.pincode,
        isHouseOwner: user.isHouseOwner,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Order user login error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during login.",
      error: error.message,
    });
  }
});

/**
 * GET /api/order-users/me
 * Get current Order User profile and overview stats
 */
router.get("/me", requireOrderUser, async (req, res) => {
  try {
    const user = req.user;

    const ordersCount = await Order.countDocuments({
      $or: [
        { orderUserId: user._id },
        { orderUserEmail: user.email },
        { "customerDetails.email": user.email },
      ],
    });

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        address: user.address,
        city: user.city,
        state: user.state,
        pincode: user.pincode,
        isHouseOwner: user.isHouseOwner,
        role: user.role,
        createdAt: user.createdAt,
        ordersCount,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile details.",
      error: error.message,
    });
  }
});

/**
 * GET /api/order-users/my-orders
 * Get all orders placed by or for this user
 */
router.get("/my-orders", requireOrderUser, async (req, res) => {
  try {
    const user = req.user;

    const orders = await Order.find({
      $or: [
        { orderUserId: user._id },
        { orderUserEmail: user.email },
        { "customerDetails.email": user.email },
      ],
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Error fetching order user orders:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch your orders.",
      error: error.message,
    });
  }
});

/**
 * POST /api/order-users/support
 * Submit a customer support query or ticket
 */
router.post("/support", requireOrderUser, async (req, res) => {
  try {
    const user = req.user;
    const { subject, orderId, message, phone } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please write your query or issue message.",
      });
    }

    const formattedSubject = subject
      ? `${subject} ${orderId ? `[Order #${orderId}]` : ""}`
      : `Customer Order Support ${orderId ? `[Order #${orderId}]` : ""}`;

    const contactMsg = new ContactMessage({
      name: user.name,
      email: user.email,
      phone: phone || user.mobile || "",
      subject: formattedSubject,
      message: message.trim(),
    });

    await contactMsg.save();

    return res.status(201).json({
      success: true,
      message: "Your support request has been registered! Our solar assistance executive will contact you shortly.",
      ticketId: contactMsg._id,
    });
  } catch (error) {
    console.error("Error registering support message:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit support request.",
      error: error.message,
    });
  }
});

module.exports = router;

