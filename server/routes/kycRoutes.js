const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const KYC = require("../models/KYC");
const Vendor = require("../models/Vendor");

const JWT_SECRET =
  process.env.JWT_SECRET || "starlink_super_secret_admin_jwt_key_2026";

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../uploads/kyc");
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
    cb(null, `kyc-${base}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
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

// Helper to extract user info from Authorization header if present
const getUserFromToken = (req) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded;
    }
  } catch (err) {
    // Ignore invalid/expired token
  }
  return null;
};

/**
 * POST /api/kyc/submit
 * User / Vendor submits their KYC document & personal details
 */
router.post("/submit", (req, res) => {
  upload.single("documentFile")(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: `File upload error: ${err.message}`,
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    try {
      const {
        fullName,
        dob,
        email,
        mobile,
        businessName,
        documentType,
        documentNumber,
        address,
        userId: formUserId,
      } = req.body;

      const userTokenData = getUserFromToken(req);
      const effectiveUserId = userTokenData?.id || formUserId || null;

      // Validate required fields
      if (!fullName || !fullName.trim()) {
        return res.status(400).json({ success: false, message: "Full Name is required" });
      }
      if (!email || !email.trim()) {
        return res.status(400).json({ success: false, message: "Email is required" });
      }
      if (!mobile || !mobile.trim()) {
        return res.status(400).json({ success: false, message: "Mobile number is required" });
      }
      if (!documentNumber || !documentNumber.trim()) {
        return res.status(400).json({ success: false, message: "Document number is required" });
      }
      if (!address || !address.trim()) {
        return res.status(400).json({ success: false, message: "Address is required" });
      }
      if (!req.file) {
        return res.status(400).json({ success: false, message: "Please upload your identity document file." });
      }

      const documentPath = `/uploads/kyc/${req.file.filename}`;
      const userEmail = email.trim().toLowerCase();

      // Check if this user already submitted KYC
      let existingKYC = null;
      if (effectiveUserId) {
        existingKYC = await KYC.findOne({
          $or: [{ userId: effectiveUserId }, { email: userEmail }],
        });
      } else {
        existingKYC = await KYC.findOne({ email: userEmail });
      }

      if (existingKYC) {
        // If already verified, prevent duplicate overwrite unless explicitly allowed
        if (existingKYC.status === "Verified") {
          return res.status(400).json({
            success: false,
            message: "Your KYC is already verified and approved.",
            kyc: existingKYC,
          });
        }

        // Delete old uploaded file if local
        if (existingKYC.documentFile && existingKYC.documentFile.startsWith("/uploads/kyc/")) {
          const oldFilePath = path.join(__dirname, "..", existingKYC.documentFile);
          if (fs.existsSync(oldFilePath)) {
            try {
              fs.unlinkSync(oldFilePath);
            } catch (unlinkErr) {
              console.warn("Could not remove old KYC file:", unlinkErr.message);
            }
          }
        }

        // Update existing record (e.g. resubmission after rejection or pending update)
        existingKYC.fullName = fullName.trim();
        existingKYC.dob = dob ? dob.trim() : "";
        existingKYC.email = userEmail;
        existingKYC.mobile = mobile.trim();
        existingKYC.businessName = businessName ? businessName.trim() : "";
        existingKYC.documentType = documentType || "Aadhaar Card";
        existingKYC.documentNumber = documentNumber.trim();
        existingKYC.documentFile = documentPath;
        existingKYC.documentOriginalName = req.file.originalname;
        existingKYC.documentMimeType = req.file.mimetype;
        existingKYC.address = address.trim();
        existingKYC.status = "Pending";
        existingKYC.remarks = ""; // Clear rejection remark on resubmission
        if (effectiveUserId) existingKYC.userId = effectiveUserId;

        await existingKYC.save();

        return res.json({
          success: true,
          message: "KYC documents updated and submitted for review successfully!",
          kyc: existingKYC,
        });
      }

      // Create new KYC submission
      const newKYC = new KYC({
        userId: effectiveUserId,
        fullName: fullName.trim(),
        dob: dob ? dob.trim() : "",
        email: userEmail,
        mobile: mobile.trim(),
        businessName: businessName ? businessName.trim() : "",
        documentType: documentType || "Aadhaar Card",
        documentNumber: documentNumber.trim(),
        documentFile: documentPath,
        documentOriginalName: req.file.originalname,
        documentMimeType: req.file.mimetype,
        address: address.trim(),
        status: "Pending",
      });

      await newKYC.save();

      res.status(201).json({
        success: true,
        message: "KYC verification submitted successfully! It is now under review.",
        kyc: newKYC,
      });
    } catch (error) {
      console.error("KYC Submit Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to submit KYC verification.",
        error: error.message,
      });
    }
  });
});

/**
 * GET /api/kyc/my-status
 * Get current user's KYC verification status & submitted info
 */
router.get("/my-status", async (req, res) => {
  try {
    const userTokenData = getUserFromToken(req);
    const { email, userId } = req.query;

    const queryFilters = [];
    if (userTokenData?.id) queryFilters.push({ userId: userTokenData.id });
    if (userTokenData?.email) queryFilters.push({ email: userTokenData.email.toLowerCase() });
    if (userId) queryFilters.push({ userId });
    if (email) queryFilters.push({ email: email.toLowerCase().trim() });

    if (queryFilters.length === 0) {
      return res.status(400).json({
        success: false,
        message: "User identifier or email required to check KYC status.",
      });
    }

    const kyc = await KYC.findOne({ $or: queryFilters }).sort({ createdAt: -1 });

    if (!kyc) {
      return res.json({
        success: true,
        submitted: false,
        status: "Not Submitted",
        kyc: null,
      });
    }

    res.json({
      success: true,
      submitted: true,
      status: kyc.status,
      kyc,
    });
  } catch (error) {
    console.error("GET /my-status error:", error);
    res.status(500).json({
      success: false,
      message: "Error checking KYC status",
      error: error.message,
    });
  }
});

/**
 * GET /api/kyc/all
 * Admin retrieves all KYC submissions with search & status filters
 */
router.get("/all", async (req, res) => {
  try {
    const { search, status } = req.query;
    const filter = {};

    if (status && status !== "All") {
      filter.status = status;
    }

    if (search) {
      const q = search.trim();
      filter.$or = [
        { fullName: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { mobile: { $regex: q, $options: "i" } },
        { documentNumber: { $regex: q, $options: "i" } },
        { businessName: { $regex: q, $options: "i" } },
      ];
    }

    const submissions = await KYC.find(filter).sort({ createdAt: -1 });

    // Calculate status counts
    const totalCount = await KYC.countDocuments();
    const pendingCount = await KYC.countDocuments({ status: "Pending" });
    const verifiedCount = await KYC.countDocuments({ status: "Verified" });
    const rejectedCount = await KYC.countDocuments({ status: "Rejected" });

    res.json({
      success: true,
      count: submissions.length,
      stats: {
        total: totalCount,
        pending: pendingCount,
        verified: verifiedCount,
        rejected: rejectedCount,
      },
      submissions,
    });
  } catch (error) {
    console.error("GET /api/kyc/all error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve KYC submissions",
      error: error.message,
    });
  }
});

/**
 * PATCH /api/kyc/:id/status
 * Admin updates KYC status: "Verified" or "Rejected" with remarks
 */
router.patch("/:id/status", async (req, res) => {
  try {
    const { status, remarks } = req.body;

    if (!["Verified", "Rejected", "Pending"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'Verified', 'Rejected', or 'Pending'.",
      });
    }

    const kyc = await KYC.findById(req.params.id);
    if (!kyc) {
      return res.status(404).json({
        success: false,
        message: "KYC submission record not found.",
      });
    }

    kyc.status = status;
    if (remarks !== undefined) {
      kyc.remarks = remarks.trim();
    }

    if (status === "Verified") {
      kyc.verifiedAt = new Date();
    } else {
      kyc.verifiedAt = null;
    }

    await kyc.save();

    res.json({
      success: true,
      message: `KYC status updated to "${status}".`,
      kyc,
    });
  } catch (error) {
    console.error("PATCH /api/kyc/:id/status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update KYC status.",
      error: error.message,
    });
  }
});

/**
 * DELETE /api/kyc/:id
 * Admin deletes a KYC record
 */
router.delete("/:id", async (req, res) => {
  try {
    const kyc = await KYC.findById(req.params.id);
    if (!kyc) {
      return res.status(404).json({
        success: false,
        message: "KYC record not found.",
      });
    }

    // Delete uploaded document file if present
    if (kyc.documentFile && kyc.documentFile.startsWith("/uploads/kyc/")) {
      const filePath = path.join(__dirname, "..", kyc.documentFile);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (unlinkErr) {
          console.warn("Could not unlink KYC file:", unlinkErr.message);
        }
      }
    }

    await KYC.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "KYC record deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE /api/kyc/:id error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete KYC record.",
      error: error.message,
    });
  }
});

module.exports = router;
