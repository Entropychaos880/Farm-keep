require('dotenv').config(); // Load variables from .env BEFORE everything else
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Route Imports
const chatRoutes = require('./routes/chatRoutes');
const logRoutes = require('./routes/logRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const aiRoutes = require('./routes/aiRoutes');
const userRoutes = require('./routes/userRoutes');
const farmLogRoutes = require('./routes/farmLogRoutes');

const app = express();

// --- Zero-Trust CORS Architecture ---
const allowedOrigins = [
  'https://farm-keep.vercel.app',
  'http://localhost:5173' 
];

const corsOptions = {
  origin: (origin, callback) => {
    // !origin allows server-to-server requests (e.g., Postman, mobile apps). 
    // If you want strictly browser-only access, remove the !origin check.
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by Strict CORS Policy: Origin rejected.'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200 // Ensures compatibility with older browsers/devices
};

// Apply CORS middleware securely before any route processing
app.use(cors(corsOptions));

// Global Middleware
app.use(express.json()); // Allows the server to read JSON payloads safely

// --- Route Definitions ---
app.use('/api/expenses', expenseRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/users', userRoutes);
app.use('/api/farmlogs', farmLogRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/logs', logRoutes);

// Health Check Route
app.get('/', (req, res) => {
  res.status(200).send('Coffee Tracker API is running...');
});

// Centralized Error Handling Middleware (Graceful fallback)
app.use((err, req, res, next) => {
  console.error(`[Security/Error Log] ${err.message}`);
  
  if (err.message === 'Blocked by Strict CORS Policy: Origin rejected.') {
    return res.status(403).json({ error: err.message });
  }

  res.status(500).json({ error: 'An unexpected internal server error occurred.' });
});

// --- Strict Startup Sequence & Diagnostics ---
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  console.log('--- PRODUCTION DIAGNOSTIC CHECK ---');
  console.log('1. MONGO_URI Type:', typeof process.env.MONGO_URI);
  
  if (process.env.MONGO_URI) {
    // Safely log the protocol and cluster address, masking the credentials
    const sanitizedUri = process.env.MONGO_URI.replace(/\/\/.*@/, '//***:***@');
    console.log('2. Sanitized URI:', sanitizedUri);
  } else {
    console.log('2. MONGO_URI is UNDEFINED');
  }
  console.log('-----------------------------------');

  try {
    // Await the database connection BEFORE opening the HTTP port
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running securely on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Critical Failure: Unable to initialize application due to database connection failure.', error);
    process.exit(1);
  }
};

startServer();
