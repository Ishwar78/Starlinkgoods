const express = require("express");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const Razorpay = require("razorpay");
const Vendor = require("../models/Vendor");
const VendorUser = require("../models/VendorUser");

const router = express.Router();

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

/**
 * GET /api/membership/config
 * Expose Razorpay public key and membership fee configuration
 */
router.get("/config", (req, res) => {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID || "";
    const fee = Number(process.env.MEMBERSHIP_FEE) || 5000;
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
      message: "Failed to fetch membership configuration.",
      error: error.message,
    });
  }
});

/**
 * POST /api/membership/check-user
 * Check if email or mobile number already exists in database
 */
router.post("/check-user", async (req, res) => {
  try {
    const { email, mobile } = req.body;

    const cleanEmail = (email || "").toLowerCase().trim();
    const cleanMobile = (mobile || "").trim();

    if (!cleanEmail && !cleanMobile) {
      return res.status(400).json({
        success: false,
        message: "Email or mobile number is required to verify account availability.",
      });
    }

    const conditions = [];
    if (cleanEmail) conditions.push({ email: cleanEmail });
    if (cleanMobile) conditions.push({ mobile: cleanMobile });

    const existingUser = await Vendor.findOne({ $or: conditions });

    if (existingUser) {
      let field = "account";
      let msg = "Already registered. Please sign in.";

      if (existingUser.email === cleanEmail && existingUser.mobile === cleanMobile) {
        msg = "This email and mobile number are already registered. Please sign in.";
      } else if (existingUser.email === cleanEmail) {
        field = "email";
        msg = "This email is already registered. Please sign in.";
      } else if (existingUser.mobile === cleanMobile) {
        field = "mobile";
        msg = "This mobile number is already registered. Please sign in.";
      }

      return res.status(200).json({
        success: false,
        registered: true,
        field,
        message: msg,
      });
    }

    return res.status(200).json({
      success: true,
      registered: false,
      message: "User is eligible to register.",
    });
  } catch (error) {
    console.error("Error checking user:", error);
    return res.status(500).json({
      success: false,
      message: "Server error checking user credentials.",
      error: error.message,
    });
  }
});

/**
 * POST /api/membership/verify-vendor
 * Verify if Vendor ID exists in database
 */
router.post("/verify-vendor", async (req, res) => {
  try {
    const { vendorId } = req.body;
    const cleanId = (vendorId || "").trim();

    if (!cleanId) {
      return res.status(400).json({
        success: false,
        message: "Vendor ID is required.",
      });
    }

    const conditions = [
      { vendorId: cleanId.toUpperCase() },
      { vendorId: cleanId },
    ];
    if (cleanId.match(/^[0-9a-fA-F]{24}$/)) {
      conditions.push({ _id: cleanId });
    }

    const vendor = await Vendor.findOne({ $or: conditions });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: `Vendor ID "${cleanId}" not found in database. Please enter a valid registered Vendor ID.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vendor verified successfully.",
      vendor: {
        vendorId: vendor.vendorId || cleanId,
        name: vendor.name,
        email: vendor.email,
        mobile: vendor.mobile,
      },
    });
  } catch (error) {
    console.error("Error verifying vendor:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while verifying vendor ID.",
      error: error.message,
    });
  }
});

/**
 * POST /api/membership/create-order
 * Validate registration details, verify uniqueness, and create Razorpay Order
 */
router.post("/create-order", async (req, res) => {
  try {
    const {
      name,
      fullName,
      firstName,
      lastName,
      email,
      mobile,
      city,
      state,
      address,
      password,
      vendorId,
      vendorName,
      fee,
    } = req.body;

    const userName = (name || fullName || `${firstName || ""} ${lastName || ""}`).trim();
    const cleanEmail = (email || "").toLowerCase().trim();
    const cleanMobile = (mobile || "").replace(/\D/g, "").trim();

    // Verify Vendor ID if provided (or mandatory for Member Register)
    const cleanVendorId = (vendorId || "").trim();
    if (cleanVendorId) {
      const conditions = [
        { vendorId: cleanVendorId.toUpperCase() },
        { vendorId: cleanVendorId },
      ];
      if (cleanVendorId.match(/^[0-9a-fA-F]{24}$/)) {
        conditions.push({ _id: cleanVendorId });
      }
      const existingVendor = await Vendor.findOne({ $or: conditions });
      if (!existingVendor) {
        return res.status(400).json({
          success: false,
          message: `Vendor ID "${cleanVendorId}" is invalid or does not exist in database.`,
        });
      }
    }

    // Required fields check
    if (!userName) {
      return res.status(400).json({
        success: false,
        message: "Please enter your name.",
      });
    }

    if (!cleanEmail) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    if (!cleanMobile || cleanMobile.length !== 10) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit mobile number.",
      });
    }

    if (!city || !city.trim()) {
      return res.status(400).json({
        success: false,
        message: "City is required.",
      });
    }

    if (!state || !state.trim()) {
      return res.status(400).json({
        success: false,
        message: "State is required.",
      });
    }

    if (!address || !address.trim()) {
      return res.status(400).json({
        success: false,
        message: "Address is required.",
      });
    }

    if (password && password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    // Check if email or mobile already registered
    const existing = await Vendor.findOne({
      $or: [{ email: cleanEmail }, { mobile: cleanMobile }],
    });

    if (existing) {
      let msg = "Already registered. Please sign in.";
      if (existing.email === cleanEmail && existing.mobile === cleanMobile) {
        msg = "This email and mobile number are already registered. Please sign in.";
      } else if (existing.email === cleanEmail) {
        field = "email";
        msg = "This email is already registered. Please sign in.";
      } else if (existing.mobile === cleanMobile) {
        field = "mobile";
        msg = "This mobile number is already registered. Please sign in.";
      }

      return res.status(400).json({
        success: false,
        registered: true,
        message: msg,
      });
    }

    // Initialize Razorpay
    const razorpay = getRazorpayInstance();
    const membershipFee = Number(fee) || 500; // Fixed ₹500 for member registration
    const currency = process.env.RAZORPAY_CURRENCY || "INR";
    const amountInPaise = Math.round(membershipFee * 100);

    const orderOptions = {
      amount: amountInPaise,
      currency,
      receipt: `mem_${Date.now()}_${cleanMobile.slice(-4)}`,
      notes: {
        customer_name: userName,
        customer_email: cleanEmail,
        customer_mobile: cleanMobile,
        vendorId: cleanVendorId,
        vendorName: vendorName || "",
        purpose: "Star Link Goods Member Registration (₹500)",
      },
    };

    const order = await razorpay.orders.create(orderOptions);

    return res.status(200).json({
      success: true,
      message: "Razorpay order created successfully.",
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      fee: membershipFee,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create payment order. Please try again.",
    });
  }
});

/**
 * POST /api/membership/verify-and-register
 * Verify Razorpay payment signature, create User/Vendor account, and return login token
 */
router.post("/verify-and-register", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      name,
      fullName,
      firstName,
      lastName,
      email,
      mobile,
      city,
      state,
      address,
      password,
      dateOfBirth,
      gender,
      vendorId,
      vendorName,
      fee,
      role = "Member",
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification details (order ID, payment ID, signature) are required.",
      });
    }

    // 1. Verify Razorpay Signature
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(500).json({
        success: false,
        message: "Razorpay secret key is not configured.",
      });
    }

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.error("Signature mismatch:", { expectedSignature, razorpay_signature });
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature. Transaction verification failed.",
      });
    }

    // 2. Validate User Data
    const userName = (name || fullName || `${firstName || ""} ${lastName || ""}`).trim();
    const cleanEmail = (email || "").toLowerCase().trim();
    const cleanMobile = (mobile || "").replace(/\D/g, "").trim();

    if (!userName || !cleanEmail || !cleanMobile) {
      return res.status(400).json({
        success: false,
        message: "Incomplete user registration data (Name, Email, Mobile).",
      });
    }

    // 3. Verify Parent Vendor if vendorId provided
    let parentVendor = null;
    const cleanVendorId = (vendorId || "").trim();
    if (cleanVendorId) {
      const conditions = [
        { vendorId: cleanVendorId.toUpperCase() },
        { vendorId: cleanVendorId },
      ];
      if (cleanVendorId.match(/^[0-9a-fA-F]{24}$/)) {
        conditions.push({ _id: cleanVendorId });
      }
      parentVendor = await Vendor.findOne({ $or: conditions });
      if (!parentVendor) {
        return res.status(400).json({
          success: false,
          message: `Vendor ID "${cleanVendorId}" is invalid or does not exist in database.`,
        });
      }
    }

    // 4. Double-check uniqueness
    const existing = await Vendor.findOne({
      $or: [{ email: cleanEmail }, { mobile: cleanMobile }],
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        registered: true,
        message: "Already registered. Please sign in with your email/mobile and password.",
      });
    }

    const membershipFee = Number(fee) || 500;
    const isMemberRegistration = role === "Member" || !!cleanVendorId;
    let newMemberId;
    if (isMemberRegistration && cleanVendorId) {
      newMemberId = await Vendor.generateMemberIdForVendor(parentVendor ? parentVendor.vendorId : cleanVendorId);
    } else {
      newMemberId = await Vendor.generateUniqueVendorId();
    }

    // 5. Create and Save the Member
    const finalPassword = password && password.length >= 6 ? password : `SLG@${cleanMobile.slice(-4)}`;

    const newVendor = new Vendor({
      vendorId: newMemberId,
      name: userName,
      email: cleanEmail,
      mobile: cleanMobile,
      password: finalPassword, // Mongoose pre-save hook handles bcrypt hashing
      city: (city || "").trim(),
      state: (state || "").trim(),
      address: (address || "").trim(),
      dateOfBirth: (dateOfBirth || "").trim(),
      gender: (gender || "").trim(),
      membershipFee,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      paymentStatus: "Paid",
      role: role || "Member",
      parentVendorId: parentVendor ? parentVendor.vendorId : (cleanVendorId.toUpperCase() || ""),
      parentVendorName: parentVendor ? parentVendor.name : (vendorName || ""),
      status: "Active",
    });

    await newVendor.save();

    // Sync to VendorUser for vendor directory
    try {
      await VendorUser.findOneAndUpdate(
        {
          $or: [
            { email: newVendor.email },
            { mobile: newVendor.mobile },
          ],
        },
        {
          name: newVendor.name,
          email: newVendor.email,
          mobile: newVendor.mobile,
          city: newVendor.city,
          state: newVendor.state,
          address: newVendor.address,
          vendorId: parentVendor ? parentVendor._id : (newVendor.parentVendorId || null),
          vendorName: parentVendor ? parentVendor.name : (newVendor.parentVendorName || "Vendor"),
          vendorEmail: parentVendor ? parentVendor.email : "",
          vendorMobile: parentVendor ? parentVendor.mobile : "",
          role: "Member",
          status: "Active",
        },
        { upsert: true, new: true }
      );
    } catch (vuErr) {
      console.warn("Sync to VendorUser non-critical warning:", vuErr.message);
    }

    // 6. Generate Auth JWT Token for immediate login
    const token = jwt.sign(
      {
        id: newVendor._id,
        vendorId: newVendor.vendorId,
        email: newVendor.email,
        mobile: newVendor.mobile,
        role: newVendor.role,
      },
      process.env.JWT_SECRET || "starlink_super_secret_admin_jwt_key_2026",
      {
        expiresIn: "7d",
      }
    );

    return res.status(201).json({
      success: true,
      message: "Payment verified and member registration completed successfully!",
      token,
      user: newVendor.toJSON(),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        registered: true,
        message: "Already registered. Please sign in.",
      });
    }
    console.error("Error verifying payment and registering user:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during registration and payment verification.",
      error: error.message,
    });
  }
});

module.exports = router;
