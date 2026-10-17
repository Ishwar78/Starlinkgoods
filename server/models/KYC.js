const mongoose = require("mongoose");

const kycSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: false,
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    dob: {
      type: String,
      default: "",
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      trim: true,
    },
    businessName: {
      type: String,
      default: "",
      trim: true,
    },
    documentType: {
      type: String,
      required: [true, "Document type is required"],
      enum: [
        "Aadhaar Card",
        "PAN Card",
        "Passport",
        "Driving Licence",
        "Voter ID",
        "GST Certificate",
        "Other",
      ],
      default: "Aadhaar Card",
    },
    documentNumber: {
      type: String,
      required: [true, "Document number is required"],
      trim: true,
    },
    documentFile: {
      type: String,
      required: [true, "Document file upload is required"],
      trim: true,
    },
    documentOriginalName: {
      type: String,
      default: "",
    },
    documentMimeType: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    // Bank Account Details for Payouts & Verification
    accountHolderName: {
      type: String,
      default: "",
      trim: true,
    },
    accountNumber: {
      type: String,
      default: "",
      trim: true,
    },
    ifscCode: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
    },
    bankName: {
      type: String,
      default: "",
      trim: true,
    },
    passbookFile: {
      type: String,
      default: "",
      trim: true,
    },
    passbookOriginalName: {
      type: String,
      default: "",
    },
    passbookMimeType: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending", "Verified", "Rejected"],
      default: "Pending",
    },
    remarks: {
      type: String,
      default: "",
      trim: true,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const KYC = mongoose.model("KYC", kycSchema);

module.exports = KYC;
