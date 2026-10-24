const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Banner = require("../models/Banner");

// Uploads directory
const uploadDir = path.join(__dirname, "../uploads/banners");
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
    cb(null, `banner-${base}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Please upload a valid image file (JPG, PNG, WEBP, etc.)"), false);
    }
  },
});

// Helper: Seed default banners if empty
async function ensureInitialBanners() {
  try {
    const count = await Banner.countDocuments();
    if (count === 0) {
      await Banner.insertMany([
        {
          title: "Solar Energy Commercial Banner",
          image: "/Solar-Energy.png",
          link: "#products",
          order: 1,
          status: "Active",
        },
        {
          title: "Solar Solutions & Clean Energy",
          image: "/Solar Energy Commercial Banner.png",
          link: "#products",
          order: 2,
          status: "Active",
        },
      ]);
      console.log("✅ Seeded initial default solar banners into database.");
    }
  } catch (err) {
    console.warn("Could not check/seed banners:", err.message);
  }
}

/**
 * GET /api/banners
 * Fetch all or active banners
 */
router.get("/", async (req, res) => {
  try {
    await ensureInitialBanners();

    const { status } = req.query;
    const filter = {};

    if (status && status !== "All") {
      filter.status = status;
    }

    const banners = await Banner.find(filter).sort({ order: 1, createdAt: -1 });

    res.json({
      success: true,
      count: banners.length,
      banners,
    });
  } catch (error) {
    console.error("GET /api/banners error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching banners",
      error: error.message,
    });
  }
});

/**
 * GET /api/banners/:id
 * Get single banner details
 */
router.get("/:id", async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    res.json({
      success: true,
      banner,
    });
  } catch (error) {
    console.error("GET /api/banners/:id error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching banner",
      error: error.message,
    });
  }
});

/**
 * POST /api/banners
 * Create new banner with optional image upload
 */
router.post("/", (req, res) => {
  upload.single("image")(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`,
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    try {
      const { title, link, order, status } = req.body;

      let imagePath = "";
      if (req.file) {
        imagePath = `/uploads/banners/${req.file.filename}`;
      } else if (req.body.image && req.body.image.trim()) {
        imagePath = req.body.image.trim();
      } else {
        return res.status(400).json({
          success: false,
          message: "Please upload an image or provide an image URL.",
        });
      }

      const newBanner = new Banner({
        title: title ? title.trim() : "",
        image: imagePath,
        link: link ? link.trim() : "",
        order: Number(order) || 0,
        status: status === "Inactive" ? "Inactive" : "Active",
      });

      await newBanner.save();

      res.status(201).json({
        success: true,
        message: "Banner created successfully!",
        banner: newBanner,
      });
    } catch (error) {
      console.error("POST /api/banners error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create banner",
        error: error.message,
      });
    }
  });
});

/**
 * PUT /api/banners/:id
 * Edit / Update banner
 */
router.put("/:id", (req, res) => {
  upload.single("image")(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`,
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    try {
      const banner = await Banner.findById(req.params.id);
      if (!banner) {
        return res.status(404).json({
          success: false,
          message: "Banner not found",
        });
      }

      const { title, link, order, status } = req.body;

      if (title !== undefined) banner.title = title.trim();
      if (link !== undefined) banner.link = link.trim();
      if (order !== undefined) banner.order = Number(order) || 0;
      if (status !== undefined) banner.status = status === "Inactive" ? "Inactive" : "Active";

      // If new image file uploaded, delete old local file if present and update image path
      if (req.file) {
        if (banner.image && banner.image.startsWith("/uploads/banners/")) {
          const oldFilePath = path.join(__dirname, "..", banner.image);
          if (fs.existsSync(oldFilePath)) {
            try {
              fs.unlinkSync(oldFilePath);
            } catch (unlinkErr) {
              console.warn("Could not remove old banner file:", unlinkErr.message);
            }
          }
        }
        banner.image = `/uploads/banners/${req.file.filename}`;
      } else if (req.body.image && req.body.image.trim()) {
        banner.image = req.body.image.trim();
      }

      await banner.save();

      res.json({
        success: true,
        message: "Banner updated successfully!",
        banner,
      });
    } catch (error) {
      console.error("PUT /api/banners/:id error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update banner",
        error: error.message,
      });
    }
  });
});

/**
 * DELETE /api/banners/:id
 * Delete banner and remove uploaded file
 */
router.delete("/:id", async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    if (banner.image && banner.image.startsWith("/uploads/banners/")) {
      const filePath = path.join(__dirname, "..", banner.image);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (unlinkErr) {
          console.warn("Could not delete banner file:", unlinkErr.message);
        }
      }
    }

    await Banner.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Banner deleted successfully!",
    });
  } catch (error) {
    console.error("DELETE /api/banners/:id error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete banner",
      error: error.message,
    });
  }
});

module.exports = router;

