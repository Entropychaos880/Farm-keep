const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Stripped back to core pooling and IPv4 routing.
    // We removed the aggressive 5s timeout so Render's cold boot has time to negotiate the TLS handshake.
    const options = {
      maxPoolSize: 10,
      family: 4 
    };

    if (!process.env.MONGO_URI) {
      throw new Error('FATAL: MONGO_URI environment variable is missing.');
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, options);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ Database Connection Error: ${error.message}`);
    process.exit(1); 
  }
};

module.exports = connectDB;
