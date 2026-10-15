const express = require("express");
const jwt = require("jsonwebtoken");
const Vendor = require("../models/Vendor");

const router = express.Router();

/**
 * POST /api/vendors/login
 * Vendor / User Login using email or mobile + password
 */
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

    // Find vendor by email or mobile
    const vendor = await Vendor.findOne({
      $or: [{ email: cleanInput }, { mobile: loginInput }],
    });

    if (!vendor) {
      return res.status(401).json({
        success: false,
        message: "Invalid email/mobile number or password.",
      });
    }

    if (vendor.status !== "Active") {
      return res.status(403).json({
        success: false,
        message: "Your account is currently inactive. Please contact the administrator.",
      });
    }

    const isMatch = await vendor.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email/mobile number or password.",
      });
    }

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

    const vendor = await Vendor.findById(decoded.id);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user: vendor.toJSON(),
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
 * POST /api/vendors
 * Create a new vendor (validates both email and mobile uniqueness)
 */
router.post("/", async (req, res) => {
  try {
    const { name, email, mobile, city, state, address, password, role, status } =
      req.body;

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

    const vendor = new Vendor({
      name: name.trim(),
      email: cleanEmail,
      mobile: cleanMobile,
      city: city.trim(),
      state: state.trim(),
      address: address.trim(),
      password,
      role: role || "Vendor",
      status: status || "Active",
    });

    await vendor.save();

    return res.status(201).json({
      success: true,
      message: "Vendor created successfully!",
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
 * Get all vendors
 */
router.get("/", async (req, res) => {
  try {
    const vendors = await Vendor.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: vendors.length,
      vendors,
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

module.exports = router;
