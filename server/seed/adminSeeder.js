require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});

const connectDB = require("../config/db");
const Admin = require("../models/Admin");

const seedAdmin = async () => {
  const adminEmail = (process.env.ADMIN_EMAIL || "Starlinkadmin@gmail.com").toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || "STARLINK@123#$";

  try {
    let existingAdmin = await Admin.findOne({ email: adminEmail });

    if (existingAdmin) {
      existingAdmin.password = adminPassword;
      existingAdmin.role = "admin";
      existingAdmin.isActive = true;
      await existingAdmin.save();
      console.log(`✅ Admin credentials verified/updated: ${adminEmail}`);
      return existingAdmin;
    }

    const newAdmin = new Admin({
      name: "Starlink Administrator",
      email: adminEmail,
      password: adminPassword,
      role: "admin",
      isActive: true,
    });

    await newAdmin.save();
    console.log(`🎉 Admin seeded successfully into database!`);
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
    return newAdmin;
  } catch (error) {
    console.error("❌ Error seeding admin:", error.message);
    throw error;
  }
};

// Standalone execution support
if (require.main === module) {
  (async () => {
    try {
      await connectDB();
      await seedAdmin();
      console.log("Seed process completed successfully.");
      process.exit(0);
    } catch (err) {
      console.error("Seed process failed:", err.message);
      process.exit(1);
    }
  })();
}

module.exports = seedAdmin;
