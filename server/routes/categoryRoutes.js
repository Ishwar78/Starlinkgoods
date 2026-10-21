const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Category = require("../models/Category");
const Product = require("../models/Product");

// Configure upload directory
const uploadDir = path.join(__dirname, "../uploads/categories");
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
    cb(null, `cat-${base}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Please upload a valid image file (JPG, PNG, WEBP, etc.)"), false);
    }
  },
});

/**
 * GET /api/categories
 * Returns list of categories with product counts
 */
router.get("/", async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};

    if (status && status !== "All") {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const categories = await Category.find(filter).sort({ createdAt: -1 });

    // Optionally calculate product count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await Product.countDocuments({
          category: { $regex: new RegExp(`^${cat.name}$`, "i") },
        });
        const catObj = cat.toObject();
        catObj.productCount = count;
        return catObj;
      })
    );

    res.json({
      success: true,
      count: categoriesWithCount.length,
      categories: categoriesWithCount,
    });
  } catch (error) {
    console.error("GET /api/categories error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching categories",
      error: error.message,
    });
  }
});

/**
 * GET /api/categories/:id
 * Get single category by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const count = await Product.countDocuments({
      category: { $regex: new RegExp(`^${category.name}$`, "i") },
    });

    res.json({
      success: true,
      category: {
        ...category.toObject(),
        productCount: count,
      },
    });
  } catch (error) {
    console.error("GET /api/categories/:id error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching category details",
      error: error.message,
    });
  }
});

/**
 * POST /api/categories
 * Create new category with image upload
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
      const { name, slug, description, status } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Category name is required",
        });
      }

      // Check for duplicate category name
      const existing = await Category.findOne({
        name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Category with name "${name.trim()}" already exists.`,
        });
      }

      // Determine image URL
      let imagePath = "";
      if (req.file) {
        imagePath = `/uploads/categories/${req.file.filename}`;
      } else if (req.body.image) {
        imagePath = req.body.image.trim();
      } else {
        imagePath = "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80";
      }

      const generatedSlug =
        (slug && slug.trim()) ||
        name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");

      const newCategory = new Category({
        name: name.trim(),
        slug: generatedSlug,
        description: description ? description.trim() : "",
        image: imagePath,
        status: status === "Inactive" ? "Inactive" : "Active",
      });

      await newCategory.save();

      res.status(201).json({
        success: true,
        message: "Category created successfully",
        category: newCategory,
      });
    } catch (error) {
      console.error("POST /api/categories error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create category",
        error: error.message,
      });
    }
  });
});

/**
 * PUT /api/categories/:id
 * Edit/Update category with optional image replacement
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
      const category = await Category.findById(req.params.id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      const { name, slug, description, status } = req.body;
      const oldName = category.name;

      if (name && name.trim()) {
        // If name changed, check uniqueness
        if (name.trim().toLowerCase() !== category.name.toLowerCase()) {
          const duplicate = await Category.findOne({
            name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
            _id: { $ne: category._id },
          });
          if (duplicate) {
            return res.status(400).json({
              success: false,
              message: `Category with name "${name.trim()}" already exists.`,
            });
          }
        }
        category.name = name.trim();
      }

      if (slug !== undefined) {
        category.slug = slug.trim()
          ? slug
              .toLowerCase()
              .trim()
              .replace(/[^a-z0-9]+/g, "-")
          : category.name
              .toLowerCase()
              .trim()
              .replace(/[^a-z0-9]+/g, "-");
      }

      if (description !== undefined) {
        category.description = description.trim();
      }

      if (status) {
        category.status = status === "Inactive" ? "Inactive" : "Active";
      }

      // If new image file uploaded, delete old local file if present and update image path
      if (req.file) {
        if (category.image && category.image.startsWith("/uploads/categories/")) {
          const oldFilePath = path.join(__dirname, "..", category.image);
          if (fs.existsSync(oldFilePath)) {
            try {
              fs.unlinkSync(oldFilePath);
            } catch (unlinkErr) {
              console.warn("Could not remove old category image:", unlinkErr.message);
            }
          }
        }
        category.image = `/uploads/categories/${req.file.filename}`;
      } else if (req.body.image && req.body.image.trim()) {
        category.image = req.body.image.trim();
      }

      await category.save();

      // If category name changed, cascade update all products referencing the old category name
      if (oldName && category.name && oldName.trim().toLowerCase() !== category.name.trim().toLowerCase()) {
        try {
          await Product.updateMany(
            { category: { $regex: new RegExp(`^${oldName.trim()}$`, "i") } },
            { $set: { category: category.name.trim() } }
          );
        } catch (cascadeErr) {
          console.warn("Could not cascade category name change to products:", cascadeErr.message);
        }
      }

      res.json({
        success: true,
        message: "Category updated successfully",
        category,
      });
    } catch (error) {
      console.error("PUT /api/categories/:id error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update category",
        error: error.message,
      });
    }
  });
});

/**
 * PATCH /api/categories/:id/status
 * Toggle category active/inactive status
 */
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    category.status = status || (category.status === "Active" ? "Inactive" : "Active");
    await category.save();

    res.json({
      success: true,
      message: `Category status updated to ${category.status}`,
      category,
    });
  } catch (error) {
    console.error("PATCH /api/categories/:id/status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle category status",
      error: error.message,
    });
  }
});

/**
 * DELETE /api/categories/:id
 * Delete category and remove uploaded image
 */
router.delete("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Delete image file from uploads if local
    if (category.image && category.image.startsWith("/uploads/categories/")) {
      const filePath = path.join(__dirname, "..", category.image);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (unlinkErr) {
          console.warn("Could not delete image file:", unlinkErr.message);
        }
      }
    }

    await Category.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/categories/:id error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete category",
      error: error.message,
    });
  }
});

module.exports = router;
