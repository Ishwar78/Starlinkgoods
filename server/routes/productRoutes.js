const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Product = require("../models/Product");

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../uploads/products");
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
    cb(null, `prod-${base}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit per file
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Please upload a valid image file (JPG, PNG, WEBP)."), false);
    }
  },
});

/**
 * GET /api/products
 * Get all products with search & category filtering
 */
router.get("/", async (req, res) => {
  try {
    const { search, category, vendorId, status } = req.query;
    const filter = {};

    if (category && category !== "All") {
      filter.category = new RegExp(`^${category.trim()}$`, "i");
    }

    if (status && status !== "All") {
      filter.status = status;
    }

    if (vendorId) {
      filter.vendorId = vendorId;
    }

    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    const rawProducts = await Product.find(filter).sort({ createdAt: -1 });

    // Ensure every product has an images array with at least 1 image
    const products = rawProducts.map((p) => {
      const doc = p.toObject();
      if (!Array.isArray(doc.images) || doc.images.length === 0) {
        doc.images = doc.image ? [doc.image] : [];
      }
      return doc;
    });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch products.",
      error: error.message,
    });
  }
});

/**
 * GET /api/products/:id
 * Get single product
 */
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const doc = product.toObject();
    if (!Array.isArray(doc.images) || doc.images.length === 0) {
      doc.images = doc.image ? [doc.image] : [];
    }

    return res.status(200).json({
      success: true,
      product: doc,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching product.",
      error: error.message,
    });
  }
});

/**
 * POST /api/products
 * Create a new product (supports up to 5 uploaded image files or URLs)
 */
router.post("/", (req, res) => {
  upload.any()(req, res, async function (err) {
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
        name,
        category,
        price,
        oldPrice,
        stock,
        image: singleImageUrl,
        imageUrls,
        description,
        badge,
        vendorId,
        vendorName,
        rating,
        reviews,
        status: customStatus,
      } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Product name is required.",
        });
      }

      if (!category || !category.trim()) {
        return res.status(400).json({
          success: false,
          message: "Product category is required.",
        });
      }

      if (!price || isNaN(Number(price))) {
        return res.status(400).json({
          success: false,
          message: "Valid product price is required.",
        });
      }

      // Collect uploaded file paths
      const uploadedFilePaths = (req.files || []).map(
        (f) => `/uploads/products/${f.filename}`
      );

      // Collect URL images if any
      let parsedUrls = [];
      if (imageUrls) {
        try {
          parsedUrls = Array.isArray(imageUrls)
            ? imageUrls
            : JSON.parse(imageUrls);
        } catch {
          parsedUrls = [imageUrls];
        }
      } else if (singleImageUrl && singleImageUrl.trim()) {
        parsedUrls = [singleImageUrl.trim()];
      }

      // Reconstruct allImages based on imageOrder manifest if supplied
      let allImages = [];
      if (req.body.imageOrder) {
        try {
          const manifest = JSON.parse(req.body.imageOrder);
          if (Array.isArray(manifest) && manifest.length > 0) {
            let fileCounter = 0;
            manifest.forEach((entry) => {
              if (entry.type === "file") {
                if (fileCounter < uploadedFilePaths.length) {
                  allImages.push(uploadedFilePaths[fileCounter++]);
                }
              } else if (entry.url) {
                allImages.push(entry.url);
              }
            });
          }
        } catch (manifestErr) {
          console.warn("Could not parse imageOrder in POST:", manifestErr.message);
        }
      }

      // Fallback if imageOrder was not provided
      if (allImages.length === 0) {
        allImages = [...uploadedFilePaths, ...parsedUrls].filter(Boolean);
      }

      if (allImages.length === 0) {
        allImages = [
          "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=700&q=85",
        ];
      }
      allImages = allImages.slice(0, 5);

      const stockNum =
        stock !== undefined && stock !== "" ? Number(stock) : 15;
      let calculatedStatus =
        customStatus ||
        (stockNum === 0
          ? "Out of Stock"
          : stockNum < 5
          ? "Low Stock"
          : "In Stock");

      const product = new Product({
        name: name.trim(),
        category: category.trim(),
        price: Number(price),
        oldPrice: oldPrice ? Number(oldPrice) : 0,
        stock: stockNum,
        image: allImages[0],
        images: allImages,
        description: description
          ? description.trim()
          : "Premium handcrafted furniture with durable construction.",
        badge: badge ? badge.trim() : "",
        rating: rating || "4.8",
        reviews: reviews ? Number(reviews) : 45,
        status: calculatedStatus,
        vendorId: vendorId || null,
        vendorName: vendorName || "SLG Official",
      });

      await product.save();

      return res.status(201).json({
        success: true,
        message: "Product created successfully with up to 5 images!",
        product,
      });
    } catch (error) {
      console.error("Error creating product:", error);
      return res.status(500).json({
        success: false,
        message: "Server error while creating product.",
        error: error.message,
      });
    }
  });
});

/**
 * PUT /api/products/:id
 * Edit / Update an existing product (supports up to 5 images)
 */
router.put("/:id", (req, res) => {
  upload.any()(req, res, async function (err) {
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
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found.",
        });
      }

      const {
        name,
        category,
        price,
        oldPrice,
        stock,
        image: singleImageUrl,
        imageUrls,
        existingImages,
        description,
        badge,
        status: customStatus,
      } = req.body;

      if (name && name.trim()) product.name = name.trim();
      if (category && category.trim()) product.category = category.trim();
      if (price !== undefined && !isNaN(Number(price)))
        product.price = Number(price);
      if (oldPrice !== undefined) product.oldPrice = Number(oldPrice) || 0;
      if (description !== undefined) product.description = description.trim();
      if (badge !== undefined) product.badge = badge.trim();

      if (stock !== undefined && stock !== "") {
        const stockNum = Number(stock);
        product.stock = stockNum;
        product.status =
          customStatus ||
          (stockNum === 0
            ? "Out of Stock"
            : stockNum < 5
            ? "Low Stock"
            : "In Stock");
      } else if (customStatus) {
        product.status = customStatus;
      }

      // Collect uploaded new files
      const newUploadedPaths = (req.files || []).map(
        (f) => `/uploads/products/${f.filename}`
      );

      // Collect preserved existing images
      let retainedImages = [];
      if (existingImages) {
        try {
          retainedImages = Array.isArray(existingImages)
            ? existingImages
            : JSON.parse(existingImages);
        } catch {
          retainedImages = [existingImages];
        }
      }

      // Collect URL images if any
      let parsedUrls = [];
      if (imageUrls) {
        try {
          parsedUrls = Array.isArray(imageUrls)
            ? imageUrls
            : JSON.parse(imageUrls);
        } catch {
          parsedUrls = [imageUrls];
        }
      } else if (singleImageUrl && singleImageUrl.trim()) {
        parsedUrls = [singleImageUrl.trim()];
      }

      // Reconstruct finalImages in user-specified order
      let finalImages = [];
      if (req.body.imageOrder) {
        try {
          const manifest = JSON.parse(req.body.imageOrder);
          if (Array.isArray(manifest) && manifest.length > 0) {
            let fileCounter = 0;
            manifest.forEach((entry) => {
              if (entry.type === "file") {
                if (fileCounter < newUploadedPaths.length) {
                  finalImages.push(newUploadedPaths[fileCounter++]);
                }
              } else if (entry.url) {
                finalImages.push(entry.url);
              }
            });
          }
        } catch (manifestErr) {
          console.warn("Could not parse imageOrder manifest:", manifestErr.message);
        }
      }

      // Fallback if imageOrder was not used or produced empty array
      if (finalImages.length === 0) {
        finalImages = [
          ...retainedImages,
          ...newUploadedPaths,
          ...parsedUrls,
        ].filter(Boolean);
      }

      // If user provided image information (manifest, files, or retained), update images
      if (
        req.body.imageOrder !== undefined ||
        newUploadedPaths.length > 0 ||
        retainedImages.length > 0 ||
        parsedUrls.length > 0
      ) {
        if (finalImages.length === 0) {
          finalImages = [
            product.image ||
              "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=700&q=85",
          ];
        }

        finalImages = finalImages.slice(0, 5);

        // Safe extraction of current images (handles string, array, or undefined)
        const currentImages = Array.isArray(product.images)
          ? product.images
          : typeof product.images === "string" && product.images.trim()
          ? [product.images.trim()]
          : product.image
          ? [product.image]
          : [];

        // Clean up removed local files
        currentImages.forEach((img) => {
          if (
            img &&
            typeof img === "string" &&
            img.startsWith("/uploads/products/") &&
            !finalImages.includes(img)
          ) {
            const oldFilePath = path.join(__dirname, "..", img);
            if (fs.existsSync(oldFilePath)) {
              try {
                fs.unlinkSync(oldFilePath);
              } catch (unlinkErr) {
                console.warn(
                  "Could not remove old product image:",
                  unlinkErr.message
                );
              }
            }
          }
        });

        product.image = finalImages[0];
        product.images = finalImages;
      }

      await product.save();

      return res.status(200).json({
        success: true,
        message: "Product updated successfully!",
        product,
      });
    } catch (error) {
      console.error("Error updating product:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update product.",
        error: error.message,
      });
    }
  });
});

/**
 * DELETE /api/products/:id
 * Delete a product and all its uploaded local images
 */
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Delete all uploaded images if stored locally
    const allImagesToDelete = [
      product.image,
      ...(Array.isArray(product.images) ? product.images : []),
    ];

    const uniquePaths = Array.from(new Set(allImagesToDelete.filter(Boolean)));

    uniquePaths.forEach((imgPath) => {
      if (imgPath && imgPath.startsWith("/uploads/products/")) {
        const filePath = path.join(__dirname, "..", imgPath);
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (unlinkErr) {
            console.warn("Could not unlink product file:", unlinkErr.message);
          }
        }
      }
    });

    await Product.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete product.",
      error: error.message,
    });
  }
});

module.exports = router;
