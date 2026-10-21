const express = require("express");
const router = express.Router();
const VendorData = require("../models/VendorData");

/**
 * GET /api/vendor-data
 * Fetch all vendor records with optional search query & status filter
 */
router.get("/", async (req, res) => {
  try {
    const { search, city, state, status } = req.query;
    const filter = {};

    if (status && status !== "All") {
      filter.status = status;
    }

    if (city && city !== "All") {
      filter.city = { $regex: new RegExp(`^${city}$`, "i") };
    }

    if (state && state !== "All") {
      filter.state = { $regex: new RegExp(`^${state}$`, "i") };
    }

    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { vendorName: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { mobile: { $regex: q, $options: "i" } },
        { city: { $regex: q, $options: "i" } },
        { state: { $regex: q, $options: "i" } },
        { address: { $regex: q, $options: "i" } },
      ];
    }

    const list = await VendorData.find(filter).sort({ createdAt: -1 });

    // Distinct cities and states for filter dropdowns
    const allRecords = await VendorData.find({}, "city state");
    const cities = [
      ...new Set(allRecords.map((r) => r.city).filter((c) => !!c && c.trim())),
    ].sort();
    const states = [
      ...new Set(allRecords.map((r) => r.state).filter((s) => !!s && s.trim())),
    ].sort();

    res.json({
      success: true,
      count: list.length,
      vendors: list,
      filterOptions: {
        cities,
        states,
      },
    });
  } catch (error) {
    console.error("GET /api/vendor-data error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching vendor data",
      error: error.message,
    });
  }
});

/**
 * GET /api/vendor-data/:id
 * Fetch single vendor record
 */
router.get("/:id", async (req, res) => {
  try {
    const vendor = await VendorData.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor data not found",
      });
    }

    res.json({
      success: true,
      vendor,
    });
  } catch (error) {
    console.error("GET /api/vendor-data/:id error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching vendor record",
      error: error.message,
    });
  }
});

/**
 * POST /api/vendor-data
 * Create and save a new vendor record
 */
router.post("/", async (req, res) => {
  try {
    const { vendorName, email, mobile, city, state, address, status, notes } =
      req.body;

    if (!vendorName || !vendorName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Vendor name is required",
      });
    }

    const newRecord = new VendorData({
      vendorName: vendorName.trim(),
      email: email ? email.trim().toLowerCase() : "",
      mobile: mobile ? mobile.trim() : "",
      city: city ? city.trim() : "",
      state: state ? state.trim() : "",
      address: address ? address.trim() : "",
      status: status === "Inactive" ? "Inactive" : "Active",
      notes: notes ? notes.trim() : "",
    });

    await newRecord.save();

    res.status(201).json({
      success: true,
      message: `Vendor "${newRecord.vendorName}" saved successfully!`,
      vendor: newRecord,
    });
  } catch (error) {
    console.error("POST /api/vendor-data error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save vendor data",
      error: error.message,
    });
  }
});

/**
 * PUT /api/vendor-data/:id
 * Update an existing vendor record
 */
router.put("/:id", async (req, res) => {
  try {
    const { vendorName, email, mobile, city, state, address, status, notes } =
      req.body;

    const vendor = await VendorData.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor record not found",
      });
    }

    if (vendorName !== undefined) {
      if (!vendorName.trim()) {
        return res.status(400).json({
          success: false,
          message: "Vendor name cannot be empty",
        });
      }
      vendor.vendorName = vendorName.trim();
    }

    if (email !== undefined) vendor.email = email.trim().toLowerCase();
    if (mobile !== undefined) vendor.mobile = mobile.trim();
    if (city !== undefined) vendor.city = city.trim();
    if (state !== undefined) vendor.state = state.trim();
    if (address !== undefined) vendor.address = address.trim();
    if (status !== undefined) vendor.status = status;
    if (notes !== undefined) vendor.notes = notes.trim();

    await vendor.save();

    res.json({
      success: true,
      message: `Vendor "${vendor.vendorName}" updated successfully!`,
      vendor,
    });
  } catch (error) {
    console.error("PUT /api/vendor-data/:id error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update vendor data",
      error: error.message,
    });
  }
});

/**
 * DELETE /api/vendor-data/:id
 * Delete vendor record
 */
router.delete("/:id", async (req, res) => {
  try {
    const vendor = await VendorData.findByIdAndDelete(req.params.id);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor record not found",
      });
    }

    res.json({
      success: true,
      message: `Vendor "${vendor.vendorName}" deleted successfully!`,
    });
  } catch (error) {
    console.error("DELETE /api/vendor-data/:id error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete vendor data",
      error: error.message,
    });
  }
});

module.exports = router;

