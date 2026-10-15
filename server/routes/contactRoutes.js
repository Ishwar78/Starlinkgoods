const express = require("express");
const ContactMessage = require("../models/ContactMessage");
const ContactInfo = require("../models/ContactInfo");

const router = express.Router();

/* =========================================================
   CONTACT MESSAGES (INQUIRIES) ENDPOINTS
========================================================= */

/**
 * POST /api/contact/messages
 * Submit a contact inquiry from the storefront
 */
router.post("/messages", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and message are required fields.",
      });
    }

    const contactMessage = new ContactMessage({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: (phone || "").trim(),
      subject: (subject || "General Enquiry").trim(),
      message: message.trim(),
      status: "Unread",
    });

    await contactMessage.save();

    return res.status(201).json({
      success: true,
      message: "Thank you! Your message has been sent successfully. We will get back to you soon.",
      data: contactMessage,
    });
  } catch (error) {
    console.error("Error saving contact message:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while submitting message.",
      error: error.message,
    });
  }
});

/**
 * GET /api/contact/messages
 * Admin: Get all inquiries
 */
router.get("/messages", async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    console.error("Error fetching contact messages:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch contact messages.",
      error: error.message,
    });
  }
});

/**
 * PATCH /api/contact/messages/:id/read
 * Admin: Mark an inquiry as Read
 */
router.patch("/messages/:id/read", async (req, res) => {
  try {
    const msg = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { status: "Read" },
      { new: true }
    );

    if (!msg) {
      return res.status(404).json({
        success: false,
        message: "Message not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Message marked as read.",
      data: msg,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update message status.",
      error: error.message,
    });
  }
});

/**
 * DELETE /api/contact/messages/:id
 * Admin: Delete an inquiry
 */
router.delete("/messages/:id", async (req, res) => {
  try {
    const msg = await ContactMessage.findByIdAndDelete(req.params.id);

    if (!msg) {
      return res.status(404).json({
        success: false,
        message: "Message not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete message.",
      error: error.message,
    });
  }
});

/* =========================================================
   STORE CONTACT INFO (SETTINGS) ENDPOINTS
========================================================= */

/**
 * GET /api/contact/info
 * Public: Get current store contact details
 */
router.get("/info", async (req, res) => {
  try {
    let info = await ContactInfo.findOne();

    if (!info) {
      // Create initial default info if none exists
      info = await ContactInfo.create({
        phone: "+91 93062 82979",
        email: "support@starlinkgoods.com",
        address: "Star Link Goods, Main Market, Rohtak, Haryana, India",
        timing: "10:00 AM – 7:00 PM",
        days: "Monday – Saturday",
        supportNote: "Need help choosing furniture? Tell us what you need and our team will assist you.",
      });
    }

    return res.status(200).json({
      success: true,
      info,
    });
  } catch (error) {
    console.error("Error fetching contact info:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch contact details.",
      error: error.message,
    });
  }
});

/**
 * PUT /api/contact/info
 * Admin: Update store contact details
 */
router.put("/info", async (req, res) => {
  try {
    const { phone, email, address, timing, days, supportNote } = req.body;

    let info = await ContactInfo.findOne();

    if (!info) {
      info = new ContactInfo({
        phone,
        email,
        address,
        timing,
        days,
        supportNote,
      });
    } else {
      if (phone !== undefined) info.phone = phone.trim();
      if (email !== undefined) info.email = email.trim().toLowerCase();
      if (address !== undefined) info.address = address.trim();
      if (timing !== undefined) info.timing = timing.trim();
      if (days !== undefined) info.days = days.trim();
      if (supportNote !== undefined) info.supportNote = supportNote.trim();
    }

    await info.save();

    return res.status(200).json({
      success: true,
      message: "Contact details updated successfully!",
      info,
    });
  } catch (error) {
    console.error("Error updating contact info:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update contact details.",
      error: error.message,
    });
  }
});

module.exports = router;
