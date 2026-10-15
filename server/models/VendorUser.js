const mongoose = require("mongoose");

const vendorUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      unique: true,
      trim: true,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: false,
    },
    vendorName: {
      type: String,
      default: "Direct Vendor",
      trim: true,
    },
    vendorEmail: {
      type: String,
      default: "",
      lowercase: true,
      trim: true,
    },
    vendorMobile: {
      type: String,
      default: "",
      trim: true,
    },
    role: {
      type: String,
      default: "Customer",
      trim: true,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    walletBalance: {
      type: Number,
      default: 0,
      min: [0, "Wallet balance cannot be negative"],
    },
    walletTransactions: [
      {
        transactionId: { type: String, required: true },
        amount: { type: Number, required: true },
        type: { type: String, enum: ["Credit", "Debit"], default: "Credit" },
        title: { type: String, default: "Wallet Credit" },
        description: { type: String, default: "" },
        addedBy: { type: String, default: "Admin" },
        status: { type: String, default: "Completed" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const VendorUser = mongoose.model("VendorUser", vendorUserSchema);

module.exports = VendorUser;
