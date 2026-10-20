const express = require("express");
const jwt = require("jsonwebtoken");
const VendorUser = require("../models/VendorUser");
const Vendor = require("../models/Vendor");

const router = express.Router();

/**
 * Helper to extract vendor details from Authorization header or request body
 */
const extractVendorInfo = async (req) => {
  const body = req.body || {};
  const query = req.query || {};
  let vendorId = body.vendorId || query.vendorId || null;
  let vendorName = body.vendorName || "Vendor";
  let vendorEmail = body.vendorEmail || "";
  let vendorMobile = body.vendorMobile || "";
  let vendorUniqueId = body.vendorUniqueId || query.vendorUniqueId || "";

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "starlink_super_secret_admin_jwt_key_2026"
      );
      if (decoded && decoded.id) {
        vendorId = decoded.id;
        const vendor = await Vendor.findById(decoded.id);
        if (vendor) {
          vendorName = vendor.name;
          vendorEmail = vendor.email;
          vendorMobile = vendor.mobile;
          vendorUniqueId = vendor.vendorId || "";
        }
      }
    } catch (err) {
      // Token decode failure shouldn't crash if body provided data
    }
  }

  // If vendorUniqueId wasn't found yet and vendorId/email is present, look up Vendor
  if (!vendorUniqueId && (vendorId || vendorEmail)) {
    try {
      const orList = [];
      if (vendorId && vendorId.toString().match(/^[0-9a-fA-F]{24}$/)) {
        orList.push({ _id: vendorId });
      }
      if (vendorId) {
        orList.push({ vendorId: vendorId.toString().toUpperCase() });
      }
      if (vendorEmail) {
        orList.push({ email: vendorEmail.toString().toLowerCase().trim() });
      }
      if (orList.length > 0) {
        const found = await Vendor.findOne({ $or: orList });
        if (found) {
          vendorUniqueId = found.vendorId || "";
          vendorName = found.name || vendorName;
          vendorEmail = found.email || vendorEmail;
          vendorMobile = found.mobile || vendorMobile;
          vendorId = found._id.toString();
        }
      }
    } catch (e) {}
  }

  return { vendorId, vendorName, vendorEmail, vendorMobile, vendorUniqueId };
};

/**
 * POST /api/vendor-users
 * Add a new user created by a vendor
 */
router.post("/", async (req, res) => {
  try {
    const { name, email, mobile, city, state, role, status } = req.body;

    if (!name || !email || !mobile || !city || !state) {
      return res.status(400).json({
        success: false,
        message: "All fields (name, email, mobile, city, state) are required.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanMobile = mobile.trim();

    // Check uniqueness for email and mobile
    const existing = await VendorUser.findOne({
      $or: [{ email: cleanEmail }, { mobile: cleanMobile }],
    });

    if (existing) {
      if (existing.email === cleanEmail && existing.mobile === cleanMobile) {
        return res.status(400).json({
          success: false,
          message: "A user with this email and mobile number is already registered.",
        });
      }
      if (existing.email === cleanEmail) {
        return res.status(400).json({
          success: false,
          message: "A user with this email is already registered. Email must be unique.",
        });
      }
      return res.status(400).json({
        success: false,
        message: "A user with this mobile number is already registered. Mobile number must be unique.",
      });
    }

    const vendorInfo = await extractVendorInfo(req);

    const vendorUser = new VendorUser({
      name: name.trim(),
      email: cleanEmail,
      mobile: cleanMobile,
      city: city.trim(),
      state: state.trim(),
      vendorId: vendorInfo.vendorId || req.body.vendorId || null,
      vendorName: vendorInfo.vendorName || req.body.vendorName || "Direct Vendor",
      vendorEmail: (vendorInfo.vendorEmail || req.body.vendorEmail || "").toLowerCase().trim(),
      vendorMobile: vendorInfo.vendorMobile || req.body.vendorMobile || "",
      role: role || "Customer",
      status: status || "Active",
    });

    await vendorUser.save();

    return res.status(201).json({
      success: true,
      message: "User added successfully!",
      user: vendorUser,
    });
  } catch (error) {
    if (error.code === 11000) {
      const isMobile = error.keyPattern && error.keyPattern.mobile;
      return res.status(400).json({
        success: false,
        message: isMobile
          ? "This mobile number is already registered. Mobile number must be unique."
          : "This email is already registered. Email must be unique.",
      });
    }
    console.error("Error creating vendor user:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while adding user.",
      error: error.message,
    });
  }
});

/**
 * GET /api/vendor-users/my-users
 * Fetch all users/members affiliated with the logged-in vendor:
 * 1. Members joined via Navbar Member Register using this vendor's ID
 * 2. Members added directly by this vendor through Add User
 * 3. Legacy users from VendorUser collection
 */
router.get("/my-users", async (req, res) => {
  try {
    const vendorInfo = await extractVendorInfo(req);
    const effectiveVendorId = vendorInfo.vendorId || req.query.vendorId || null;
    const effectiveVendorUniqueId = vendorInfo.vendorUniqueId || req.query.vendorUniqueId || null;
    const effectiveVendorEmail = (
      vendorInfo.vendorEmail ||
      req.query.vendorEmail ||
      ""
    )
      .toLowerCase()
      .trim();

    if (!effectiveVendorId && !effectiveVendorEmail && !effectiveVendorUniqueId) {
      return res.status(200).json({
        success: true,
        count: 0,
        users: [],
      });
    }

    // 1. Fetch affiliated members from Vendor collection (role: Member)
    const memberOrConditions = [];
    if (effectiveVendorUniqueId) {
      memberOrConditions.push({ parentVendorId: effectiveVendorUniqueId });
      memberOrConditions.push({ vendorId: { $regex: new RegExp(`^${effectiveVendorUniqueId}-`, "i") } });
    }
    if (effectiveVendorId) {
      memberOrConditions.push({ parentVendorId: effectiveVendorId.toString() });
    }

    let affiliatedMembers = [];
    if (memberOrConditions.length > 0) {
      affiliatedMembers = await Vendor.find({
        role: { $in: ["Member", "member"] },
        $or: memberOrConditions,
      }).sort({ createdAt: -1 });
    }

    console.log("MY-USERS DEBUG:", {
      effectiveVendorId,
      effectiveVendorUniqueId,
      effectiveVendorEmail,
      memberConditionsCount: memberOrConditions.length,
      affiliatedFound: affiliatedMembers.length,
    });

    // 2. Fetch users from VendorUser collection
    const vuConditions = [];
    if (effectiveVendorId && effectiveVendorId.toString().match(/^[0-9a-fA-F]{24}$/)) {
      vuConditions.push({ vendorId: effectiveVendorId });
    }
    if (effectiveVendorEmail) {
      vuConditions.push({ vendorEmail: effectiveVendorEmail });
    }

    let vendorUsers = [];
    if (vuConditions.length > 0) {
      vendorUsers = await VendorUser.find({ $or: vuConditions }).sort({
        createdAt: -1,
      });
    }

    // 3. Merge & Deduplicate
    const combinedUsers = [];
    const seenEmails = new Set();
    const seenMobiles = new Set();
    const seenIds = new Set();

    for (const m of affiliatedMembers) {
      const email = (m.email || "").toLowerCase().trim();
      const mobile = (m.mobile || "").trim();
      const idStr = m._id.toString();

      if ((email && seenEmails.has(email)) || (mobile && seenMobiles.has(mobile)) || seenIds.has(idStr)) {
        continue;
      }
      if (email) seenEmails.add(email);
      if (mobile) seenMobiles.add(mobile);
      seenIds.add(idStr);

      const mObj = m.toObject ? m.toObject() : { ...m };
      combinedUsers.push({
        ...mObj,
        _id: m._id,
        vendorId: m.vendorId, // e.g. SLG1002-01
        name: m.name,
        firstName: m.firstName || (m.name ? m.name.split(" ")[0] : ""),
        lastName: m.lastName || (m.name ? m.name.split(" ").slice(1).join(" ") : ""),
        email: m.email,
        mobile: m.mobile,
        city: m.city,
        state: m.state,
        address: m.address,
        role: m.role || "Member",
        status: m.status || "Active",
        membershipFee: m.membershipFee || 500,
        paymentStatus: m.paymentStatus || "Paid",
        createdAt: m.createdAt,
      });
    }

    for (const u of vendorUsers) {
      const email = (u.email || "").toLowerCase().trim();
      const mobile = (u.mobile || "").trim();
      const idStr = u._id.toString();

      if ((email && seenEmails.has(email)) || (mobile && seenMobiles.has(mobile)) || seenIds.has(idStr)) {
        continue;
      }
      if (email) seenEmails.add(email);
      if (mobile) seenMobiles.add(mobile);
      seenIds.add(idStr);

      combinedUsers.push(u.toObject ? u.toObject() : u);
    }

    return res.status(200).json({
      success: true,
      count: combinedUsers.length,
      users: combinedUsers,
    });
  } catch (error) {
    console.error("Error fetching my vendor users:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users.",
      error: error.message,
    });
  }
});

/**
 * GET /api/vendor-users/all
 * Admin route: Get all vendor users across all vendors
 */
router.get("/all", async (req, res) => {
  try {
    const users = await VendorUser.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Error fetching all vendor users:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch all vendor users.",
      error: error.message,
    });
  }
});

/**
 * PATCH /api/vendor-users/:id/status
 * Toggle status of a vendor user
 */
router.patch("/:id/status", async (req, res) => {
  try {
    const user = await VendorUser.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const newStatus =
      req.body.status || (user.status === "Active" ? "Inactive" : "Active");
    user.status = newStatus;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User status updated to ${newStatus}`,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update user status.",
      error: error.message,
    });
  }
});

/**
 * DELETE /api/vendor-users/:id
 * Delete a vendor user
 */
router.delete("/:id", async (req, res) => {
  try {
    const user = await VendorUser.findByIdAndDelete(req.params.id);
    const member = await Vendor.findOneAndDelete({
      _id: req.params.id,
      role: { $in: ["Member", "member"] },
    });

    if (!user && !member) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete user.",
      error: error.message,
    });
  }
});

/**
 * POST /api/vendor-users/:id/wallet
 * Add or deduct wallet funds for a vendor user (Admin Action)
 */
router.post("/:id/wallet", async (req, res) => {
  try {
    const { amount, type = "Credit", description = "Admin Wallet Adjustment" } = req.body;
    const numAmount = Number(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid amount greater than 0.",
      });
    }

    const user = await VendorUser.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (!Array.isArray(user.walletTransactions)) {
      user.walletTransactions = [];
    }
    if (typeof user.walletBalance !== "number") {
      user.walletBalance = 0;
    }

    if (type === "Debit" && user.walletBalance < numAmount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance! Current wallet balance is ₹${user.walletBalance.toLocaleString("en-IN")}.`,
      });
    }

    if (type === "Debit") {
      user.walletBalance -= numAmount;
    } else {
      user.walletBalance += numAmount;
    }

    const txnId = `TXN${Date.now()}${Math.floor(100 + Math.random() * 900)}`;
    const newTxn = {
      transactionId: txnId,
      amount: numAmount,
      type: type === "Debit" ? "Debit" : "Credit",
      title: type === "Debit" ? "Admin Wallet Debit" : "Admin Wallet Topup",
      description: description.trim() || (type === "Debit" ? "Deducted by Admin" : "Added by Admin"),
      addedBy: "Admin",
      status: "Completed",
      createdAt: new Date(),
    };

    user.walletTransactions.unshift(newTxn);
    await user.save();

    return res.status(200).json({
      success: true,
      message: `₹${numAmount.toLocaleString("en-IN")} ${
        type === "Debit" ? "deducted from" : "credited to"
      } ${user.name}'s wallet successfully!`,
      walletBalance: user.walletBalance,
      transaction: newTxn,
      user,
    });
  } catch (error) {
    console.error("Vendor user wallet update error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update user wallet.",
      error: error.message,
    });
  }
});

module.exports = router;
