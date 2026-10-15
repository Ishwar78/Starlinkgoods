const express = require("express");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const { verifyAdminToken } = require("../middleware/authMiddleware");

const router = express.Router();

// POST /api/admin/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const admin = await Admin.findOne({ email: cleanEmail });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: "This admin account has been deactivated.",
      });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      {
        id: admin._id,
        email: admin.email,
        role: admin.role,
      },
      process.env.JWT_SECRET || "starlink_super_secret_admin_jwt_key_2026",
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during admin login.",
      error: error.message,
    });
  }
});

// GET /api/admin/me (Verify token)
router.get("/me", verifyAdminToken, async (req, res) => {
  return res.status(200).json({
    success: true,
    admin: req.admin,
  });
});

// POST /api/admin/logout
router.post("/logout", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

module.exports = router;
