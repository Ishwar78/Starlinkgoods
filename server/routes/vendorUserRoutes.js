const express = require("express");
const jwt = require("jsonwebtoken");
const VendorUser = require("../models/VendorUser");
const Vendor = require("../models/Vendor");

const router = express.Router();

/**
 * Helper to extract vendor details from Authorization header or request body
 */
const extractVendorInfo = async (req) => {
  const body = req.body || {};
  const query = req.query || {};
  let vendorId = body.vendorId || query.vendorId || null;
  let vendorName = body.vendorName || "Vendor";
  let vendorEmail = body.vendorEmail || "";
  let vendorMobile = body.vendorMobile || "";

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "starlink_super_secret_admin_jwt_key_2026"
      );
      if (decoded && decoded.id) {
        vendorId = decoded.id;
        const vendor = await Vendor.findById(decoded.id);
        if (vendor) {
          vendorName = vendor.name;
          vendorEmail = vendor.email;
          vendorMobile = vendor.mobile;
        }
      }
    } catch (err) {
      // Token decode failure shouldn't crash if body provided data
    }
  }

  return { vendorId, vendorName, vendorEmail, vendorMobile };
};

/**
 * POST /api/vendor-users
 * Add a new user created by a vendor
 */
router.post("/", async (req, res) => {
  try {
    const { name, email, mobile, city, state, role, status } = req.body;

    if (!name || !email || !mobile || !city || !state) {
      return res.status(400).json({
        success: false,
        message: "All fields (name, email, mobile, city, state) are required.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanMobile = mobile.trim();

    // Check uniqueness for email and mobile
    const existing = await VendorUser.findOne({
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

    const vendorInfo = await extractVendorInfo(req);

    const vendorUser = new VendorUser({
      name: name.trim(),
      email: cleanEmail,
      mobile: cleanMobile,
      city: city.trim(),
      state: state.trim(),
      vendorId: vendorInfo.vendorId || req.body.vendorId || null,
      vendorName: vendorInfo.vendorName || req.body.vendorName || "Direct Vendor",
      vendorEmail: (vendorInfo.vendorEmail || req.body.vendorEmail || "").toLowerCase().trim(),
      vendorMobile: vendorInfo.vendorMobile || req.body.vendorMobile || "",
      role: role || "Customer",
      status: status || "Active",
    });

    await vendorUser.save();

    return res.status(201).json({
      success: true,
      message: "User added successfully!",
      user: vendorUser,
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
    console.error("Error creating vendor user:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while adding user.",
      error: error.message,
    });
  }
});

/**
 * GET /api/vendor-users/my-users
 * Fetch all users added strictly by the logged-in vendor
 */
router.get("/my-users", async (req, res) => {
  try {
    const vendorInfo = await extractVendorInfo(req);
    const effectiveVendorId = vendorInfo.vendorId || req.query.vendorId || null;
    const effectiveVendorEmail = (
      vendorInfo.vendorEmail ||
      req.query.vendorEmail ||
      ""
    )
      .toLowerCase()
      .trim();

    // If no vendor identity can be determined, strictly return empty list
    if (!effectiveVendorId && !effectiveVendorEmail) {
      return res.status(200).json({
        success: true,
        count: 0,
        users: [],
      });
    }

    const queryConditions = [];
    if (effectiveVendorId) {
      queryConditions.push({ vendorId: effectiveVendorId });
    }
    if (effectiveVendorEmail) {
      queryConditions.push({ vendorEmail: effectiveVendorEmail });
    }

    const users = await VendorUser.find({ $or: queryConditions }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Error fetching my vendor users:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users.",
      error: error.message,
    });
  }
});

/**
 * GET /api/vendor-users/all
 * Admin route: Get all vendor users across all vendors
 */
router.get("/all", async (req, res) => {
  try {
    const users = await VendorUser.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Error fetching all vendor users:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch all vendor users.",
      error: error.message,
    });
  }
});

/**
 * PATCH /api/vendor-users/:id/status
 * Toggle status of a vendor user
 */
router.patch("/:id/status", async (req, res) => {
  try {
    const user = await VendorUser.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const newStatus =
      req.body.status || (user.status === "Active" ? "Inactive" : "Active");
    user.status = newStatus;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User status updated to ${newStatus}`,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update user status.",
      error: error.message,
    });
  }
});

/**
 * DELETE /api/vendor-users/:id
 * Delete a vendor user
 */
router.delete("/:id", async (req, res) => {
  try {
    const user = await VendorUser.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete user.",
      error: error.message,
    });
  }
});

module.exports = router;
