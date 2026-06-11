const mongoose = require('mongoose');
const dns = require('dns');

// --- CRITICAL CLOUD INFRASTRUCTURE FIX ---
// Intercept the core Node.js DNS resolver to globally prefer IPv4.
// This guarantees the preliminary `mongodb+srv://` lookup will not hang on Render's IPv6 network.
dns.setDefaultResultOrder('ipv4first');

const connectDB = async () => {
  try {
    // Enterprise connection pooling configurations
    const options = {
      maxPoolSize: 10, // Maintain up to 10 socket connections for algorithmic efficiency
      serverSelectionTimeoutMS: 5000, // Fail fast if the database cluster is unreachable
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4 // Enforce IPv4 on the physical TCP socket layer as a secondary fallback
    };

    if (!process.env.MONGO_URI) {
      throw new Error('FATAL: MONGO_URI environment variable is missing from the host environment.');
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, options);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ Database Connection Error: ${error.message}`);
    process.exit(1); // Halt the Node process; an API without its DB is fundamentally broken
  }
};

module.exports = connectDB;
