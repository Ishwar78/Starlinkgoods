const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  oldPrice: {
    type: Number,
    default: 0,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
  image: {
    type: String,
    default: "",
  },
  category: {
    type: String,
    default: "Solar System",
  },
  total: {
    type: Number,
    required: true,
  },
});

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    // Vendor who placed the order
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: false,
    },
    vendorCode: {
      type: String,
      default: "",
    },
    vendorName: {
      type: String,
      default: "",
    },
    vendorEmail: {
      type: String,
      default: "",
    },
    vendorMobile: {
      type: String,
      default: "",
    },

    // Customer details filled during checkout (fresh, not prefilled)
    customerDetails: {
      fullName: {
        type: String,
        required: true,
        trim: true,
      },
      mobile: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        trim: true,
        default: "",
      },
      address: {
        type: String,
        required: true,
        trim: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
      },
      state: {
        type: String,
        required: true,
        trim: true,
      },
      pincode: {
        type: String,
        trim: true,
        default: "",
      },
      isHouseOwner: {
        type: String,
        enum: ["Yes", "No"],
        default: "No",
      },
    },

    // Uploaded Documents
    documents: {
      houseOwnerCertificate: {
        type: String,
        default: "",
      },
      aadhaarCard: {
        type: String,
        default: "",
      },
      electricityBill: {
        type: String,
        default: "",
      },
      otherDocument: {
        type: String,
        default: "",
      },
    },

    items: [orderItemSchema],

    // Pricing & Payment
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    payableAmount: {
      type: Number,
      required: true,
      default: 1000, // ₹1,000 payable amount
    },
    remainingAmount: {
      type: Number,
      default: 0,
    },
    paymentMethod: {
      type: String,
      default: "Online Payment",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Refunded"],
      default: "Paid",
    },
    onlineTransactionId: {
      type: String,
      default: "",
    },
    razorpayOrderId: {
      type: String,
      default: "",
    },
    razorpayPaymentId: {
      type: String,
      default: "",
    },
    razorpaySignature: {
      type: String,
      default: "",
    },

    // Fulfillment Status
    orderStatus: {
      type: String,
      enum: ["Pending", "Processing", "Confirmed", "Shipped", "Delivered", "Cancelled"],
      default: "Processing",
    },
    adminNotes: {
      type: String,
      default: "",
    },
    orderNotes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ vendorId: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
