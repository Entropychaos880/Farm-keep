const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Enterprise connection pooling and DNS routing configurations
    const options = {
      maxPoolSize: 10, // Maintain up to 10 socket connections for algorithmic efficiency
      serverSelectionTimeoutMS: 5000, // Fail fast if the database cluster is unreachable
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4 // CRITICAL FIX: Force IPv4 DNS resolution to bypass Node 22 IPv6 hanging
    };

    if (!process.env.MONGO_URI) {
      throw new Error('FATAL: MONGO_URI environment variable is missing.');
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
