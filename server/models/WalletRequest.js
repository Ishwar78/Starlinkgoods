const mongoose = require("mongoose");

const walletRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "userModel",
    },
    userModel: {
      type: String,
      required: true,
      enum: ["Vendor", "VendorUser"],
      default: "Vendor",
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    userEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    userMobile: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Requested amount is required"],
      min: [1, "Amount must be at least ₹1"],
    },
    paymentMode: {
      type: String,
      required: [true, "Payment mode is required"],
      enum: ["UPI", "Bank Account"],
      default: "UPI",
    },
    upiDetails: {
      upiId: {
        type: String,
        trim: true,
        default: "",
      },
      accountHolderName: {
        type: String,
        trim: true,
        default: "",
      },
    },
    bankDetails: {
      accountHolderName: {
        type: String,
        trim: true,
        default: "",
      },
      accountNumber: {
        type: String,
        trim: true,
        default: "",
      },
      ifscCode: {
        type: String,
        trim: true,
        uppercase: true,
        default: "",
      },
      bankName: {
        type: String,
        trim: true,
        default: "",
      },
    },
    userRemarks: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    adminRemarks: {
      type: String,
      trim: true,
      default: "",
    },
    adminTransactionId: {
      type: String,
      trim: true,
      default: "",
    },
    processedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Helpful index for fast queries by user and status
walletRequestSchema.index({ userId: 1, createdAt: -1 });
walletRequestSchema.index({ status: 1, createdAt: -1 });

const WalletRequest = mongoose.model("WalletRequest", walletRequestSchema);

module.exports = WalletRequest;
