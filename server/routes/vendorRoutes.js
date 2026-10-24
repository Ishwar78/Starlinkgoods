const express = require("express");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const Vendor = require("../models/Vendor");
const VendorUser = require("../models/VendorUser");
const OrderUser = require("../models/OrderUser");

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

// Profile images upload directory
const profileUploadDir = path.join(__dirname, "../uploads/profiles");
if (!fs.existsSync(profileUploadDir)) {
  fs.mkdirSync(profileUploadDir, { recursive: true });
}

const profileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, profileUploadDir);
  },
  filename: function (req, file, cb) {
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.]/g, "-");
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e6);
    const ext = path.extname(cleanName);
    const base = path.basename(cleanName, ext).substring(0, 20);
    cb(null, `avatar-${base}-${uniqueSuffix}${ext}`);
  },
});

const profileUpload = multer({
  storage: profileStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Please upload a valid image file (JPG, PNG, WEBP, etc.)"), false);
    }
  },
});

/**
 * POST /api/vendors/login
 * Vendor / User Login using email or mobile + password
 */

// Vendor documents upload directory (Aadhar, PAN, Passbook, etc.)
const docUploadDir = path.join(__dirname, "../uploads/documents");
if (!fs.existsSync(docUploadDir)) {
  fs.mkdirSync(docUploadDir, { recursive: true });
}

const docStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, docUploadDir);
  },
  filename: function (req, file, cb) {
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.]/g, "-");
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e6);
    const ext = path.extname(cleanName);
    const base = path.basename(cleanName, ext).substring(0, 20);
    cb(null, `doc-${base}-${uniqueSuffix}${ext}`);
  },
});

const docUpload = multer({
  storage: docStorage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
});

/**
 * POST /api/vendors/upload-document
 * Upload a document (Aadhar, PAN, Passbook, etc.)
 */
router.post("/upload-document", docUpload.single("document"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No document file provided. Please choose a file to upload.",
      });
    }

    const filePath = `/uploads/documents/${req.file.filename}`;
    return res.status(200).json({
      success: true,
      message: "Document uploaded successfully!",
      filePath,
      originalName: req.file.originalname,
      fileName: req.file.filename,
    });
  } catch (error) {
    console.error("Document upload error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to upload document file.",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { identifier, email, mobile, password } = req.body;
    const loginInput = (identifier || email || mobile || "").trim();

    if (!loginInput || !password) {
      return res.status(400).json({
        success: false,
        message: "Email or mobile number and password are required.",
      });
    }

    const cleanInput = loginInput.toLowerCase();
    const upperInput = loginInput.toUpperCase();

    // Find vendor by email, mobile, or unique vendorId (e.g. SLG1001)
    const vendor = await Vendor.findOne({
      $or: [
        { email: cleanInput },
        { mobile: loginInput },
        { vendorId: upperInput },
      ],
    });

    if (vendor && vendor.status === "Active") {
      const isVendorMatch = await vendor.comparePassword(password);
      if (isVendorMatch) {
        const token = jwt.sign(
          {
            id: vendor._id,
            email: vendor.email,
            mobile: vendor.mobile,
            role: vendor.role || "Vendor",
          },
          process.env.JWT_SECRET || "starlink_super_secret_admin_jwt_key_2026",
          {
            expiresIn: "7d",
          }
        );

        return res.status(200).json({
          success: true,
          message: "Login successful!",
          token,
          user: vendor.toJSON(),
        });
      }
    }

    // Fallback: Check OrderUser (Customer Account)
    const orderUser = await OrderUser.findOne({
      $or: [
        { email: cleanInput },
        { mobile: loginInput },
      ],
    });

    if (orderUser) {
      if (orderUser.status === "Blocked") {
        return res.status(403).json({
          success: false,
          message: "Your customer account has been suspended. Please contact support.",
        });
      }

      const isMatch = await orderUser.comparePassword(password);
      if (isMatch) {
        const token = jwt.sign(
          {
            id: orderUser._id,
            email: orderUser.email,
            mobile: orderUser.mobile,
            role: "OrderCustomer",
          },
          process.env.JWT_SECRET || "starlink_super_secret_admin_jwt_key_2026",
          { expiresIn: "30d" }
        );

        return res.status(200).json({
          success: true,
          message: `Welcome back, ${orderUser.name}!`,
          token,
          role: "OrderCustomer",
          user: {
            id: orderUser._id,
            _id: orderUser._id,
            name: orderUser.name,
            email: orderUser.email,
            mobile: orderUser.mobile,
            address: orderUser.address,
            city: orderUser.city,
            state: orderUser.state,
            pincode: orderUser.pincode,
            role: "OrderCustomer",
          },
        });
      }
    }

    return res.status(401).json({
      success: false,
      message: "Invalid email/mobile number or password.",
    });
  } catch (error) {
    console.error("Vendor login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during login.",
      error: error.message,
    });
  }
});

/**
 * GET /api/vendors/me
 * Get current logged in vendor profile
 */
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No authentication token provided.",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "starlink_super_secret_admin_jwt_key_2026"
    );

    let user = await Vendor.findById(decoded.id);
    if (!user) {
      user = await VendorUser.findById(decoded.id);
    }
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user: user.toJSON(),
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
      error: error.message,
    });
  }
});

/**
 * POST /api/vendors/profile-image
 * Upload profile photo for logged-in vendor or user
 */
router.post("/profile-image", profileUpload.single("profileImage"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided. Please select a photo to upload.",
      });
    }

    let user = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || "starlink_super_secret_admin_jwt_key_2026"
        );
        if (decoded && decoded.id) {
          user = await Vendor.findById(decoded.id);
          if (!user) user = await VendorUser.findById(decoded.id);
        }
      } catch (e) {}
    }

    // Fallback: check userId or email from req.body or req.query
    if (!user) {
      const qId = req.body.userId || req.query.userId;
      const qEmail = (req.body.email || req.query.email || "").toLowerCase().trim();
      if (qId) {
        user = await Vendor.findById(qId);
        if (!user) user = await VendorUser.findById(qId);
      }
      if (!user && qEmail) {
        user = await Vendor.findOne({ email: qEmail });
        if (!user) user = await VendorUser.findOne({ email: qEmail });
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authenticated account not found.",
      });
    }

    const relativePath = `/uploads/profiles/${req.file.filename}`;
    user.profileImage = relativePath;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile photo uploaded successfully!",
      profileImage: relativePath,
      user: user.toJSON ? user.toJSON() : user,
    });
  } catch (error) {
    console.error("Profile image upload error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload profile photo.",
      error: error.message,
    });
  }
});

/**
 * POST /api/vendors/create-order
 * Validate vendor details, check email/mobile uniqueness, and create ₹5,000 Razorpay order
 */
router.post("/create-order", async (req, res) => {
  try {
    const { name, email, mobile, city, state, address, password, fee } = req.body;

    const vendorName = (name || "").trim();
    const cleanEmail = (email || "").toLowerCase().trim();
    const cleanMobile = (mobile || "").replace(/\D/g, "").trim();

    if (
      !vendorName ||
      !cleanEmail ||
      !cleanMobile ||
      !city?.trim() ||
      !state?.trim() ||
      !address?.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields (name, email, mobile, city, state, address, password) are required.",
      });
    }

    if (cleanMobile.length !== 10) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit mobile number.",
      });
    }

    if (password.length < 6) {
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
      let msg = "A user with this email and mobile number is already registered.";
      if (existing.email === cleanEmail && existing.mobile !== cleanMobile) {
        msg = "A vendor with this email is already registered. Email must be unique.";
      } else if (existing.mobile === cleanMobile && existing.email !== cleanEmail) {
        msg = "A vendor with this mobile number is already registered. Mobile number must be unique.";
      }
      return res.status(400).json({
        success: false,
        registered: true,
        message: msg,
      });
    }

    const razorpay = getRazorpayInstance();
    const vendorFee = Number(fee) || 5000; // ₹5,000 for Vendor registration
    const currency = process.env.RAZORPAY_CURRENCY || "INR";
    const amountInPaise = Math.round(vendorFee * 100);

    const orderOptions = {
      amount: amountInPaise,
      currency,
      receipt: `vnd_${Date.now()}_${cleanMobile.slice(-4)}`,
      notes: {
        vendor_name: vendorName,
        vendor_email: cleanEmail,
        vendor_mobile: cleanMobile,
        purpose: "Star Link Goods Vendor Account Registration (₹5,000)",
      },
    };

    const order = await razorpay.orders.create(orderOptions);

    return res.status(200).json({
      success: true,
      message: "Razorpay order created successfully.",
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      fee: vendorFee,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Error creating vendor Razorpay order:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create vendor payment order.",
    });
  }
});

/**
 * POST /api/vendors/verify-and-create
 * Verify Razorpay payment signature and create Vendor in database
 */
router.post("/verify-and-create", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      name,
      email,
      mobile,
      city,
      state,
      address,
      password,
      role = "Vendor",
      status = "Active",
      fee = 5000,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification details (order ID, payment ID, signature) are required.",
      });
    }

    // Verify Razorpay signature
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
      console.error("Vendor signature mismatch:", { expectedSignature, razorpay_signature });
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature. Payment verification failed. Vendor was not created.",
      });
    }

    const cleanEmail = (email || "").toLowerCase().trim();
    const cleanMobile = (mobile || "").replace(/\D/g, "").trim();
    const vendorName = (name || "").trim();

    if (
      !vendorName ||
      !cleanEmail ||
      !cleanMobile ||
      !city?.trim() ||
      !state?.trim() ||
      !address?.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required to register vendor.",
      });
    }

    // Double check uniqueness
    const existing = await Vendor.findOne({
      $or: [{ email: cleanEmail }, { mobile: cleanMobile }],
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "A vendor with this email or mobile number already exists in database.",
      });
    }

    // Generate unique Vendor ID (e.g. SLG1001, SLG1002, etc.)
    const newVendorId = await Vendor.generateUniqueVendorId();

    const vendor = new Vendor({
      vendorId: newVendorId,
      name: vendorName,
      email: cleanEmail,
      mobile: cleanMobile,
      city: city.trim(),
      state: state.trim(),
      address: address.trim(),
      password,
      role: role || "Vendor",
      status: status || "Active",
      membershipFee: Number(fee) || 10000,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      paymentStatus: "Paid",
    });

    await vendor.save();

    return res.status(201).json({
      success: true,
      message: `Vendor "${vendor.name}" (${vendor.vendorId}) created successfully!`,
      vendor,
    });
  } catch (error) {
    if (error.code === 11000) {
      const isMobile = error.keyPattern && error.keyPattern.mobile;
      return res.status(400).json({
        success: false,
        message: isMobile
          ? "This mobile number is already registered. Mobile number must be unique."
          : "This email is already registered. Email must be unique.",
      });
    }
    console.error("Error creating vendor with payment:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create vendor account.",
    });
  }
});

/**
 * POST /api/vendors
 * Create a new vendor (validates both email and mobile uniqueness)
 */
router.post("/", async (req, res) => {
  try {
    const {
      name,
      email,
      mobile,
      city,
      state,
      address,
      password,
      role,
      status,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      fee = 10000,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !email ||
      !mobile ||
      !city ||
      !state ||
      !address ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All fields (name, email, mobile, city, state, address, password) are required.",
      });
    }

    // If Razorpay details provided, verify signature
    if (razorpay_order_id && razorpay_payment_id && razorpay_signature) {
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
        return res.status(400).json({
          success: false,
          message: "Invalid payment signature. Verification failed.",
        });
      }
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanMobile = mobile.trim();

    // Check if email or mobile already registered
    const existing = await Vendor.findOne({
      $or: [{ email: cleanEmail }, { mobile: cleanMobile }],
    });

    if (existing) {
      if (existing.email === cleanEmail && existing.mobile === cleanMobile) {
        return res.status(400).json({
          success: false,
          message: "A user with this email and mobile number is already registered.",
        });
      }
      if (existing.email === cleanEmail) {
        return res.status(400).json({
          success: false,
          message: "A user with this email is already registered. Email must be unique.",
        });
      }
      return res.status(400).json({
        success: false,
        message: "A user with this mobile number is already registered. Mobile number must be unique.",
      });
    }

    const newVendorId = await Vendor.generateUniqueVendorId();

    const vendor = new Vendor({
      vendorId: newVendorId,
      name: name.trim(),
      email: cleanEmail,
      mobile: cleanMobile,
      city: city.trim(),
      state: state.trim(),
      address: address.trim(),
      password,
      role: role || "Vendor",
      status: status || "Active",
      membershipFee: Number(fee) || 10000,
      razorpayOrderId: razorpay_order_id || "",
      razorpayPaymentId: razorpay_payment_id || "",
      razorpaySignature: razorpay_signature || "",
      paymentStatus: razorpay_payment_id ? "Paid" : "Pending",
    });

    await vendor.save();

    return res.status(201).json({
      success: true,
      message: `Vendor "${vendor.name}" (${vendor.vendorId}) created successfully!`,
      vendor,
    });
  } catch (error) {
    if (error.code === 11000) {
      const isMobile = error.keyPattern && error.keyPattern.mobile;
      return res.status(400).json({
        success: false,
        message: isMobile
          ? "This mobile number is already registered. Mobile number must be unique."
          : "This email is already registered. Email must be unique.",
      });
    }
    console.error("Error creating vendor:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating vendor.",
      error: error.message,
    });
  }
});

/**
 * GET /api/vendors
 * Get all vendors (with affiliated members count)
 */
router.get("/", async (req, res) => {
  try {
    const filter = { role: { $ne: "Member" } };
    const vendors = await Vendor.find(filter).sort({ createdAt: -1 });

    const vendorsWithMembers = await Promise.all(
      vendors.map(async (v) => {
        const vObj = v.toJSON ? v.toJSON() : { ...v };
        if (v.vendorId) {
          const mList = await Vendor.find(
            {
              role: { $in: ["Member", "member"] },
              $or: [
                { parentVendorId: v.vendorId },
                { vendorId: { $regex: new RegExp(`^${v.vendorId}-`, "i") } },
              ],
            },
            { email: 1, mobile: 1 }
          );
          const vuList = await VendorUser.find(
            {
              $or: [
                { vendorId: v._id },
                { vendorEmail: v.email },
              ],
            },
            { email: 1, mobile: 1 }
          );
          const uniqueSet = new Set();
          mList.forEach((it) => {
            if (it.email) uniqueSet.add(it.email.toLowerCase().trim());
            else if (it.mobile) uniqueSet.add(it.mobile.trim());
          });
          vuList.forEach((it) => {
            if (it.email) uniqueSet.add(it.email.toLowerCase().trim());
            else if (it.mobile) uniqueSet.add(it.mobile.trim());
          });
          vObj.membersCount = Math.max(uniqueSet.size, mList.length);
        } else {
          vObj.membersCount = 0;
        }
        return vObj;
      })
    );

    return res.status(200).json({
      success: true,
      count: vendorsWithMembers.length,
      vendors: vendorsWithMembers,
    });
  } catch (error) {
    console.error("Error fetching vendors:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch vendors.",
      error: error.message,
    });
  }
});

/**
 * GET /api/vendors/:id/members
 * Get all members joined under a specific vendor
 */
router.get("/:id/members", async (req, res) => {
  try {
    const { id } = req.params;
    let vendor = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      vendor = await Vendor.findById(id);
    }
    if (!vendor) {
      vendor = await Vendor.findOne({
        $or: [
          { vendorId: id.toUpperCase() },
          { vendorId: id },
        ],
      });
    }

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found.",
      });
    }

    // 1. Find all members in Vendor model who joined under this vendor
    const members = await Vendor.find({
      role: { $in: ["Member", "member"] },
      $or: [
        { parentVendorId: vendor.vendorId },
        { parentVendorId: vendor._id.toString() },
        { vendorId: { $regex: new RegExp(`^${vendor.vendorId}-`, "i") } },
      ],
    }).sort({ createdAt: -1 });

    // 2. Also find any users in VendorUser collection
    const vendorUsers = await VendorUser.find({
      $or: [
        { vendorId: vendor._id },
        { vendorEmail: vendor.email },
      ],
    }).sort({ createdAt: -1 });

    const combinedMembers = [...members.map((m) => (m.toObject ? m.toObject() : m))];
    const seenEmails = new Set(
      members.map((m) => (m.email || "").toLowerCase().trim()).filter(Boolean)
    );
    const seenMobiles = new Set(
      members.map((m) => (m.mobile || "").trim()).filter(Boolean)
    );
    const seenIds = new Set(members.map((m) => m._id.toString()));

    for (const vu of vendorUsers) {
      const email = (vu.email || "").toLowerCase().trim();
      const mobile = (vu.mobile || "").trim();
      const idStr = vu._id.toString();

      if (
        (email && seenEmails.has(email)) ||
        (mobile && seenMobiles.has(mobile)) ||
        seenIds.has(idStr)
      ) {
        continue;
      }
      if (email) seenEmails.add(email);
      if (mobile) seenMobiles.add(mobile);
      seenIds.add(idStr);

      combinedMembers.push({
        _id: vu._id,
        vendorId:
          typeof vu.vendorId === "string" && vu.vendorId.startsWith("SLG")
            ? vu.vendorId
            : `${vendor.vendorId}-User`,
        name: vu.name,
        email: vu.email,
        mobile: vu.mobile,
        city: vu.city,
        state: vu.state,
        address: vu.address || "",
        membershipFee: 1000,
        paymentStatus: "Paid",
        role: "Member",
        status: vu.status || "Active",
        createdAt: vu.createdAt,
      });
    }

    return res.status(200).json({
      success: true,
      vendor: {
        _id: vendor._id,
        vendorId: vendor.vendorId,
        name: vendor.name,
        email: vendor.email,
        mobile: vendor.mobile,
      },
      count: combinedMembers.length,
      members: combinedMembers,
    });
  } catch (error) {
    console.error("Error fetching vendor members:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch affiliated members.",
      error: error.message,
    });
  }
});

/**
 * GET /api/vendors/my-wallet
 * Get currently authenticated vendor/user's wallet balance and transactions
 */
router.get("/my-wallet", async (req, res) => {
  try {
    let account = null;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || "starlink_super_secret_admin_jwt_key_2026"
        );
        if (decoded && decoded.id) {
          account = await Vendor.findById(decoded.id);
          if (!account) {
            account = await VendorUser.findById(decoded.id);
          }
        }
      } catch (err) {
        // Token verification fallback
      }
    }

    // Also support query param userId or email fallback if token is expired/user context
    if (!account) {
      const qId = req.query.userId || req.query.id;
      const qEmail = req.query.email ? req.query.email.toLowerCase().trim() : null;

      if (qId) {
        account = await Vendor.findById(qId);
        if (!account) {
          account = await VendorUser.findById(qId);
        }
      }
      if (!account && qEmail) {
        account = await Vendor.findOne({ email: qEmail });
        if (!account) {
          account = await VendorUser.findOne({ email: qEmail });
        }
      }
    }

    if (!account) {
      return res.status(401).json({
        success: false,
        message: "Account not found or not authenticated.",
      });
    }

    return res.status(200).json({
      success: true,
      walletBalance: typeof account.walletBalance === "number" ? account.walletBalance : 0,
      transactions: Array.isArray(account.walletTransactions) ? account.walletTransactions : [],
      name: account.name,
      email: account.email,
    });
  } catch (error) {
    console.error("Get vendor wallet error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch wallet details.",
      error: error.message,
    });
  }
});

/**
 * GET /api/vendors/:id
 * Get single vendor
 */
router.get("/:id", async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found.",
      });
    }

    return res.status(200).json({
      success: true,
      vendor,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching vendor.",
      error: error.message,
    });
  }
});

/**
 * PATCH /api/vendors/:id/status
 * Toggle or update vendor status
 */
router.patch("/:id/status", async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found.",
      });
    }

    const newStatus =
      req.body.status || (vendor.status === "Active" ? "Inactive" : "Active");

    vendor.status = newStatus;
    await vendor.save();

    return res.status(200).json({
      success: true,
      message: `Vendor status updated to ${newStatus}`,
      vendor,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update vendor status.",
      error: error.message,
    });
  }
});

/**
 * DELETE /api/vendors/:id
 * Delete vendor
 */
router.delete("/:id", async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndDelete(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vendor deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete vendor.",
      error: error.message,
    });
  }
});

/**
 * POST /api/vendors/:id/wallet
 * Add or deduct wallet funds for a vendor (Admin Action)
 */
router.post("/:id/wallet", async (req, res) => {
  try {
    const { amount, type = "Credit", description = "Admin Wallet Adjustment" } = req.body;
    const numAmount = Number(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid amount greater than 0.",
      });
    }

    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found.",
      });
    }

    if (!Array.isArray(vendor.walletTransactions)) {
      vendor.walletTransactions = [];
    }
    if (typeof vendor.walletBalance !== "number") {
      vendor.walletBalance = 0;
    }

    if (type === "Debit" && vendor.walletBalance < numAmount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance! Current wallet balance is ₹${vendor.walletBalance.toLocaleString("en-IN")}.`,
      });
    }

    if (type === "Debit") {
      vendor.walletBalance -= numAmount;
    } else {
      vendor.walletBalance += numAmount;
    }

    const txnId = `TXN${Date.now()}${Math.floor(100 + Math.random() * 900)}`;
    const newTxn = {
      transactionId: txnId,
      amount: numAmount,
      type: type === "Debit" ? "Debit" : "Credit",
      title: type === "Debit" ? "Admin Wallet Debit" : "Admin Wallet Topup",
      description: description.trim() || (type === "Debit" ? "Deducted by Admin" : "Added by Admin"),
      addedBy: "Admin",
      status: "Completed",
      createdAt: new Date(),
    };

    vendor.walletTransactions.unshift(newTxn);
    await vendor.save();

    return res.status(200).json({
      success: true,
      message: `₹${numAmount.toLocaleString("en-IN")} ${
        type === "Debit" ? "deducted from" : "credited to"
      } ${vendor.name}'s wallet successfully!`,
      walletBalance: vendor.walletBalance,
      transaction: newTxn,
      vendor: vendor.toJSON(),
    });
  } catch (error) {
    console.error("Vendor wallet update error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update vendor wallet.",
      error: error.message,
    });
  }
});

module.exports = router;
