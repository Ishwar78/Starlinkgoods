const express = require("express");
const jwt = require("jsonwebtoken");
const WalletRequest = require("../models/WalletRequest");
const Vendor = require("../models/Vendor");
const VendorUser = require("../models/VendorUser");

const router = express.Router();

/**
 * Helper to authenticate logged-in vendor or vendor-user from JWT or query/body
 */
const resolveAuthUser = async (req) => {
  let user = null;
  let userModel = "Vendor";

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "starlink_super_secret_admin_jwt_key_2026"
      );
      if (decoded && decoded.id) {
        user = await Vendor.findById(decoded.id);
        if (user) {
          userModel = "Vendor";
        } else {
          user = await VendorUser.findById(decoded.id);
          if (user) userModel = "VendorUser";
        }
      }
    } catch (e) {
      // invalid or expired token
    }
  }

  // Fallback lookup via userId or email
  if (!user) {
    const qId = req.body.userId || req.query.userId;
    const qEmail = (req.body.email || req.query.email || req.body.userEmail || "").toLowerCase().trim();

    if (qId) {
      user = await Vendor.findById(qId);
      if (user) userModel = "Vendor";
      if (!user) {
        user = await VendorUser.findById(qId);
        if (user) userModel = "VendorUser";
      }
    }

    if (!user && qEmail) {
      user = await Vendor.findOne({ email: qEmail });
      if (user) userModel = "Vendor";
      if (!user) {
        user = await VendorUser.findOne({ email: qEmail });
        if (user) userModel = "VendorUser";
      }
    }
  }

  return { user, userModel };
};

/**
 * POST /api/wallet-requests
 * User submits a withdrawal / payout request
 */
router.post("/", async (req, res) => {
  try {
    const { user, userModel } = await resolveAuthUser(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. User account not found.",
      });
    }

    const {
      amount,
      paymentMode,
      upiId,
      upiName,
      accountHolderName,
      accountNumber,
      ifscCode,
      bankName,
      userRemarks,
    } = req.body;

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid amount greater than ₹0.",
      });
    }

    const currentBalance = typeof user.walletBalance === "number" ? user.walletBalance : 0;

    // Rule: User can only request up to wallet balance minus 10% (10% reserved for 5% TDS & 5% Software Charge)
    const maxAllowed = Math.floor(currentBalance * 0.9);
    if (numAmount > maxAllowed) {
      return res.status(400).json({
        success: false,
        message: `Maximum requestable amount is ₹${maxAllowed.toLocaleString(
          "en-IN"
        )} (Wallet balance ₹${currentBalance.toLocaleString(
          "en-IN"
        )} minus 10% deduction for 5% TDS & 5% Software Charge).`,
      });
    }

    // 5% TDS & 5% Software charge calculations on requested amount
    const tdsAmount = Math.round(numAmount * 0.05 * 100) / 100;
    const softwareCharge = Math.round(numAmount * 0.05 * 100) / 100;
    const totalDebited = Math.round((numAmount + tdsAmount + softwareCharge) * 100) / 100;

    if (currentBalance < totalDebited) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance! Total deduction with 5% TDS and 5% Software Charge is ₹${totalDebited.toLocaleString(
          "en-IN"
        )}, which exceeds your balance of ₹${currentBalance.toLocaleString("en-IN")}.`,
      });
    }

    if (!["UPI", "Bank Account"].includes(paymentMode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment mode. Choose either 'UPI' or 'Bank Account'.",
      });
    }

    let upiDetails = {};
    let bankDetails = {};

    if (paymentMode === "UPI") {
      if (!upiId || !upiId.trim()) {
        return res.status(400).json({
          success: false,
          message: "Please enter your UPI ID (e.g. mobile@upi, username@okhdfcbank).",
        });
      }
      upiDetails = {
        upiId: upiId.trim(),
        accountHolderName: (upiName || user.name || "").trim(),
      };
    } else {
      // Bank Account
      if (!accountHolderName || !accountHolderName.trim()) {
        return res.status(400).json({
          success: false,
          message: "Account Holder Name is required for Bank Transfer.",
        });
      }
      if (!accountNumber || !accountNumber.trim()) {
        return res.status(400).json({
          success: false,
          message: "Bank Account Number is required for Bank Transfer.",
        });
      }
      if (!ifscCode || !ifscCode.trim()) {
        return res.status(400).json({
          success: false,
          message: "Bank IFSC Code is required for Bank Transfer.",
        });
      }

      bankDetails = {
        accountHolderName: accountHolderName.trim(),
        accountNumber: accountNumber.trim(),
        ifscCode: ifscCode.trim().toUpperCase(),
        bankName: (bankName || "").trim(),
      };
    }

    // Deduct full amount (Requested Amount + 5% TDS + 5% Software Charge) from user's wallet
    user.walletBalance = Math.round((currentBalance - totalDebited) * 100) / 100;

    const txnId = `REQ${Date.now()}${Math.floor(100 + Math.random() * 900)}`;
    const pendingTxn = {
      transactionId: txnId,
      amount: totalDebited,
      payoutAmount: numAmount,
      tdsAmount,
      softwareCharge,
      type: "Debit",
      title: `Payout Request (${paymentMode})`,
      description: `Payout Amount: ₹${numAmount.toLocaleString(
        "en-IN"
      )} | 5% TDS: ₹${tdsAmount.toLocaleString(
        "en-IN"
      )} | 5% Software Charge: ₹${softwareCharge.toLocaleString(
        "en-IN"
      )} | Total Debited: ₹${totalDebited.toLocaleString("en-IN")}. Status: Under Review`,
      addedBy: "User",
      status: "Pending",
      createdAt: new Date(),
    };

    if (!Array.isArray(user.walletTransactions)) {
      user.walletTransactions = [];
    }
    user.walletTransactions.unshift(pendingTxn);
    await user.save();

    // Create the payout request record with full breakdown
    const walletRequest = new WalletRequest({
      userId: user._id,
      userModel,
      userName: user.name,
      userEmail: user.email,
      userMobile: user.mobile,
      amount: numAmount,
      netAmount: numAmount,
      tdsPercent: 5,
      tdsAmount,
      softwareChargePercent: 5,
      softwareCharge,
      totalDebited,
      paymentMode,
      upiDetails,
      bankDetails,
      userRemarks: (userRemarks || "").trim(),
      status: "Pending",
    });

    await walletRequest.save();

    return res.status(201).json({
      success: true,
      message: "Withdrawal request submitted successfully! It is now pending admin review.",
      request: walletRequest,
      walletBalance: user.walletBalance,
      transaction: pendingTxn,
    });
  } catch (error) {
    console.error("Error creating wallet request:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit withdrawal request.",
      error: error.message,
    });
  }
});

/**
 * GET /api/wallet-requests/my-requests
 * Fetch all payout requests for currently logged-in user
 */
router.get("/my-requests", async (req, res) => {
  try {
    const { user } = await resolveAuthUser(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required to view wallet requests.",
      });
    }

    const requests = await WalletRequest.find({
      $or: [{ userId: user._id }, { userEmail: user.email }],
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Error fetching user wallet requests:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch withdrawal requests.",
      error: error.message,
    });
  }
});

/**
 * GET /api/wallet-requests/all
 * Admin route: Get all requests with optional status and search filtering
 */
router.get("/all", async (req, res) => {
  try {
    const { status, search } = req.query;

    const filter = {};
    if (status && status !== "All") {
      filter.status = status;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [
        { userName: regex },
        { userEmail: regex },
        { userMobile: regex },
        { "upiDetails.upiId": regex },
        { "upiDetails.accountHolderName": regex },
        { "bankDetails.accountNumber": regex },
        { "bankDetails.accountHolderName": regex },
        { "bankDetails.ifscCode": regex },
        { "bankDetails.bankName": regex },
        { adminTransactionId: regex },
      ];
    }

    const requests = await WalletRequest.find(filter).sort({ createdAt: -1 });

    // Aggregate stats
    const all = await WalletRequest.find({}, "status amount netAmount totalDebited tdsAmount softwareCharge");
    const stats = {
      total: all.length,
      pending: all.filter((r) => r.status === "Pending").length,
      approved: all.filter((r) => r.status === "Approved").length,
      rejected: all.filter((r) => r.status === "Rejected").length,
      totalAmount: all.reduce((sum, r) => sum + (Number(r.amount) || 0), 0),
      approvedAmount: all
        .filter((r) => r.status === "Approved")
        .reduce((sum, r) => sum + (Number(r.amount) || 0), 0),
      totalTds: all
        .filter((r) => r.status === "Approved")
        .reduce((sum, r) => sum + (Number(r.tdsAmount) || 0), 0),
      totalSoftwareCharge: all
        .filter((r) => r.status === "Approved")
        .reduce((sum, r) => sum + (Number(r.softwareCharge) || 0), 0),
      totalDebited: all
        .filter((r) => r.status === "Approved")
        .reduce((sum, r) => sum + (Number(r.totalDebited || r.amount) || 0), 0),
    };

    return res.status(200).json({
      success: true,
      count: requests.length,
      stats,
      requests,
    });
  } catch (error) {
    console.error("Error fetching all wallet requests:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch wallet requests.",
      error: error.message,
    });
  }
});

/**
 * PATCH /api/wallet-requests/:id/status
 * Admin route: Approve or reject withdrawal request
 */
router.patch("/:id/status", async (req, res) => {
  try {
    const { status, adminRemarks = "", adminTransactionId = "" } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'Approved' or 'Rejected'.",
      });
    }

    const request = await WalletRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Withdrawal request not found.",
      });
    }

    if (request.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: `This request has already been ${request.status.toLowerCase()} and cannot be modified again.`,
      });
    }

    // Find the user to update their transactions or balance
    let user = await Vendor.findById(request.userId);
    if (!user) {
      user = await VendorUser.findById(request.userId);
    }
    if (!user && request.userEmail) {
      user = await Vendor.findOne({ email: request.userEmail });
      if (!user) user = await VendorUser.findOne({ email: request.userEmail });
    }

    const totalDebitVal = request.totalDebited || request.amount;

    if (status === "Approved") {
      request.status = "Approved";
      request.adminRemarks = adminRemarks.trim();
      request.adminTransactionId = adminTransactionId.trim();
      request.processedAt = new Date();
      await request.save();

      // If user found, mark the pending debit transaction as completed
      if (user && Array.isArray(user.walletTransactions)) {
        const pendingTxn = user.walletTransactions.find(
          (t) =>
            t.status === "Pending" &&
            (t.amount === totalDebitVal || t.payoutAmount === request.amount) &&
            t.type === "Debit"
        );
        if (pendingTxn) {
          pendingTxn.status = "Completed";
          pendingTxn.description = `Payout completed. Payout: ₹${request.amount.toLocaleString(
            "en-IN"
          )} | 5% TDS: ₹${(request.tdsAmount || 0).toLocaleString(
            "en-IN"
          )} | 5% Software: ₹${(request.softwareCharge || 0).toLocaleString(
            "en-IN"
          )} | Total: ₹${totalDebitVal.toLocaleString("en-IN")}. Ref/UTR: ${adminTransactionId || "N/A"}. ${adminRemarks}`;
        }
        await user.save();
      }

      return res.status(200).json({
        success: true,
        message: `Payout request of ₹${request.amount.toLocaleString(
          "en-IN"
        )} approved successfully! (Wallet debited: ₹${totalDebitVal.toLocaleString("en-IN")})`,
        request,
      });
    } else {
      // Status is "Rejected": Refund full debited amount (including 10% charges) back to user's wallet
      request.status = "Rejected";
      request.adminRemarks = adminRemarks.trim() || "Declined by Admin";
      request.processedAt = new Date();
      await request.save();

      const refundAmount = totalDebitVal;

      if (user) {
        if (typeof user.walletBalance !== "number") user.walletBalance = 0;
        user.walletBalance = Math.round((user.walletBalance + refundAmount) * 100) / 100;

        const refundTxnId = `REF${Date.now()}${Math.floor(100 + Math.random() * 900)}`;
        const refundTxn = {
          transactionId: refundTxnId,
          amount: refundAmount,
          type: "Credit",
          title: "Payout Request Refund",
          description: `Refund for rejected withdrawal: Full ₹${refundAmount.toLocaleString(
            "en-IN"
          )} (Payout ₹${request.amount} + 10% TDS & Software charges). Reason: ${request.adminRemarks}`,
          addedBy: "Admin",
          status: "Completed",
          createdAt: new Date(),
        };

        if (!Array.isArray(user.walletTransactions)) {
          user.walletTransactions = [];
        }

        // Mark the previous pending debit as cancelled
        const pendingTxn = user.walletTransactions.find(
          (t) =>
            t.status === "Pending" &&
            (t.amount === totalDebitVal || t.payoutAmount === request.amount) &&
            t.type === "Debit"
        );
        if (pendingTxn) {
          pendingTxn.status = "Cancelled";
        }

        user.walletTransactions.unshift(refundTxn);
        await user.save();
      }

      return res.status(200).json({
        success: true,
        message: `Payout request rejected. Full ₹${refundAmount.toLocaleString(
          "en-IN"
        )} (including 10% charges) has been refunded back to user's wallet.`,
        request,
      });
    }
  } catch (error) {
    console.error("Error updating wallet request status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update request status.",
      error: error.message,
    });
  }
});

/**
 * DELETE /api/wallet-requests/:id
 * Admin route: Delete a request
 */
router.delete("/:id", async (req, res) => {
  try {
    const request = await WalletRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found.",
      });
    }

    // If deleting a pending request, refund user balance
    if (request.status === "Pending") {
      let user = await Vendor.findById(request.userId);
      if (!user) user = await VendorUser.findById(request.userId);
      if (user) {
        user.walletBalance = (user.walletBalance || 0) + request.amount;
        await user.save();
      }
    }

    await WalletRequest.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Wallet request deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting wallet request:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete request.",
      error: error.message,
    });
  }
});

module.exports = router;
