const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
    },
    oldPrice: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      default: 15,
    },
    badge: {
      type: String,
      default: "",
      trim: true,
    },
    rating: {
      type: String,
      default: "4.8",
      trim: true,
    },
    reviews: {
      type: Number,
      default: 45,
    },
    image: {
      type: String,
      default: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=700&q=85",
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      default: "Premium handcrafted furniture crafted with seasoned timber, ergonomic comfort and timeless contemporary aesthetics.",
      trim: true,
    },
    status: {
      type: String,
      enum: ["In Stock", "Low Stock", "Out of Stock"],
      default: "In Stock",
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: false,
    },
    vendorName: {
      type: String,
      default: "SLG Official",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
