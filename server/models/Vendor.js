const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const vendorSchema = new mongoose.Schema(
  {
    vendorId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true,
    },
    parentVendorId: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
    },
    parentVendorName: {
      type: String,
      default: "",
      trim: true,
    },
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
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    dateOfBirth: {
      type: String,
      default: "",
      trim: true,
    },
    gender: {
      type: String,
      default: "",
      trim: true,
    },
    membershipFee: {
      type: Number,
      default: 0,
    },
    razorpayOrderId: {
      type: String,
      default: "",
      trim: true,
    },
    razorpayPaymentId: {
      type: String,
      default: "",
      trim: true,
    },
    razorpaySignature: {
      type: String,
      default: "",
      trim: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Paid", "Pending", "Failed"],
      default: "Paid",
    },
    role: {
      type: String,
      default: "Vendor",
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Pending"],
      default: "Active",
    },
    profileImage: {
      type: String,
      default: "",
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

// Unique Vendor ID Generator (e.g. SLG1001, SLG1002, etc.)
vendorSchema.statics.generateUniqueVendorId = async function () {
  const VendorModel = this;
  const vendors = await VendorModel.find(
    { vendorId: { $regex: /^SLG\d+$/i } },
    { vendorId: 1 }
  );

  let maxNum = 1000;
  for (const v of vendors) {
    if (v.vendorId) {
      const num = parseInt(v.vendorId.replace(/\D/g, ""), 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  }

  let nextNum = maxNum + 1;
  let candidateId = `SLG${nextNum}`;

  while (await VendorModel.findOne({ vendorId: candidateId })) {
    nextNum++;
    candidateId = `SLG${nextNum}`;
  }

  return candidateId;
};

// Unique Member ID Generator under a specific Vendor (e.g. SLG1002-01, SLG1002-02, etc.)
vendorSchema.statics.generateMemberIdForVendor = async function (parentVendorId) {
  const VendorModel = this;
  const cleanParentId = (parentVendorId || "").trim().toUpperCase();

  if (!cleanParentId) {
    return await VendorModel.generateUniqueVendorId();
  }

  const escapedParentId = cleanParentId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`^${escapedParentId}-(\\d+)$`, "i");

  const existingMembers = await VendorModel.find(
    {
      $or: [
        { vendorId: { $regex: regex } },
        { parentVendorId: cleanParentId },
      ],
    },
    { vendorId: 1 }
  );

  let maxSeq = 0;
  for (const m of existingMembers) {
    if (m.vendorId) {
      const match = m.vendorId.match(regex);
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxSeq) {
          maxSeq = num;
        }
      }
    }
  }

  let nextSeq = maxSeq + 1;
  let candidateId = `${cleanParentId}-${String(nextSeq).padStart(2, "0")}`;

  while (await VendorModel.findOne({ vendorId: candidateId })) {
    nextSeq++;
    candidateId = `${cleanParentId}-${String(nextSeq).padStart(2, "0")}`;
  }

  return candidateId;
};

// Migration helper to auto-assign SLG IDs to any legacy vendors lacking vendorId
vendorSchema.statics.migrateExistingVendors = async function () {
  try {
    const VendorModel = this;
    const vendorsWithoutId = await VendorModel.find({
      $or: [
        { vendorId: { $exists: false } },
        { vendorId: "" },
        { vendorId: null },
      ],
    }).sort({ createdAt: 1 });

    if (vendorsWithoutId.length > 0) {
      console.log(`ℹ️ Assigning SLG IDs to ${vendorsWithoutId.length} existing vendors...`);
      for (const vendor of vendorsWithoutId) {
        const newId = await VendorModel.generateUniqueVendorId();
        vendor.vendorId = newId;
        await vendor.save();
        console.log(`✅ Assigned ${newId} to vendor: ${vendor.name} (${vendor.email})`);
      }
    }
  } catch (err) {
    console.warn("Migration of vendor IDs warning:", err.message);
  }
};

// Auto-assign vendorId and hash password before saving
vendorSchema.pre("save", async function () {
  if (!this.vendorId) {
    const VendorModel = this.constructor;
    this.vendorId = await VendorModel.generateUniqueVendorId();
  }

  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
vendorSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Don't leak hashed password in JSON responses
vendorSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const Vendor = mongoose.model("Vendor", vendorSchema);

module.exports = Vendor;
