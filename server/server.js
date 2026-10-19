require("dotenv").config({
  path: __dirname + "/.env",
});

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const seedAdmin = require("./seed/adminSeeder");
const seedProducts = require("./seed/productSeeder");
const seedCategories = require("./seed/categorySeeder");
const adminRoutes = require("./routes/adminRoutes");
const vendorRoutes = require("./routes/vendorRoutes");
const vendorUserRoutes = require("./routes/vendorUserRoutes");
const contactRoutes = require("./routes/contactRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const kycRoutes = require("./routes/kycRoutes");
const membershipRoutes = require("./routes/membershipRoutes");
const walletRequestRoutes = require("./routes/walletRequestRoutes");
const orderRoutes = require("./routes/orderRoutes");
const Vendor = require("./models/Vendor");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health Check API
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "SolarSystemEcommerce API is running",
    database:
      mongoose.connection.readyState === 1
        ? "Connected"
        : "Disconnected",
    dbName: mongoose.connection.name || null,
  });
});

// Admin Routes
app.use("/api/admin", adminRoutes);

// Vendor & User Auth Routes
app.use("/api/vendors", vendorRoutes);
app.use("/api/auth", vendorRoutes);

// Vendor Users Routes (Users added by Vendors)
app.use("/api/vendor-users", vendorUserRoutes);

// Contact Routes (Inquiries & Store Info)
app.use("/api/contact", contactRoutes);

// Products Catalog Routes
app.use("/api/products", productRoutes);

// Categories Routes
app.use("/api/categories", categoryRoutes);

// KYC Verification Routes
app.use("/api/kyc", kycRoutes);

// Membership Registration & Razorpay Routes
app.use("/api/membership", membershipRoutes);

// Wallet Withdrawal / Payout Request Routes
app.use("/api/wallet-requests", walletRequestRoutes);

// Orders Routes
app.use("/api/orders", orderRoutes);

const startServer = async () => {
  try {
    await connectDB();
    await seedAdmin();
    await seedCategories();
    await seedProducts();
    await Vendor.migrateExistingVendors();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Health Check URL: http://localhost:${PORT}`);
      console.log(`🔐 Admin API Base: http://localhost:${PORT}/api/admin`);
      console.log(`🏪 Vendor API Base: http://localhost:${PORT}/api/vendors`);
    });
  } catch (error) {
    console.error("❌ Server start nahi hua:", error.message);
    process.exit(1);
  }
};

startServer();
