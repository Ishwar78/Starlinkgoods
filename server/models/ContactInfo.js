const mongoose = require("mongoose");

const contactInfoSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      default: "+91 12345 67890",
      trim: true,
    },
    email: {
      type: String,
      default: "support@SLG.com",
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      default: "SLG Furniture, Rohtak, Haryana, India",
      trim: true,
    },
    timing: {
      type: String,
      default: "10:00 AM – 7:00 PM",
      trim: true,
    },
    days: {
      type: String,
      default: "Monday – Saturday",
      trim: true,
    },
    supportNote: {
      type: String,
      default: "Need help choosing furniture? Tell us what you need and our team will assist you.",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const ContactInfo = mongoose.model("ContactInfo", contactInfoSchema);

module.exports = ContactInfo;
