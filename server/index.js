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

// Connect to Database
connectDB();

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

// Server Initialization
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running securely on port ${PORT}`);
});
