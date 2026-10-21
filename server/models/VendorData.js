const mongoose = require("mongoose");

const vendorDataSchema = new mongoose.Schema(
  {
    vendorName: {
      type: String,
      required: [true, "Vendor name is required"],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    mobile: {
      type: String,
      trim: true,
      default: "",
    },
    city: {
      type: String,
      trim: true,
      default: "",
    },
    state: {
      type: String,
      trim: true,
      default: "",
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Index for quick search
vendorDataSchema.index({
  vendorName: "text",
  email: "text",
  mobile: "text",
  city: "text",
  state: "text",
});

module.exports = mongoose.model("VendorData", vendorDataSchema);

