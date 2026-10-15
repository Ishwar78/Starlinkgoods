const mongoose = require("mongoose");
const dns = require("dns");

// Windows / ISP DNS fallback for MongoDB Atlas SRV records
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (err) {
  // Ignore if not supported in environment
}

const connectDB = async () => {
  try {
    const uri =
      process.env.MONGODB_URI ||
      process.env.MONGIDB_URI ||
      process.env.MONGO_URI;

    if (!uri) {
      throw new Error("MONGODB_URI is missing in server/.env");
    }

    const conn = await mongoose.connect(uri);

    console.log(`✅ MongoDB Connected Successfully!`);
    console.log(`📦 Database: ${conn.connection.name}`);
    console.log(`🌐 Host: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    throw error;
  }
};

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB connection disconnected.");
});

mongoose.connection.on("reconnected", () => {
  console.log("🔄 MongoDB reconnected.");
});

module.exports = connectDB;