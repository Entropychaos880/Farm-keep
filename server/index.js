require('dotenv').config(); // Load variables from .env BEFORE everything else
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const chatRoutes = require('./routes/chatRoutes');
const logRoutes = require('./routes/logRoutes');


const app = express();

// Connect to Database
connectDB();


const allowedOrigins = [
  'https://farm-keep.vercel.app',
  'http://localhost:5173' 
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// IMPORTANT: Handle the preflight OPTIONS request explicitly
app.options('(.*)', cors());
app.use(express.json()); // Allows the server to read JSON data
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/farmlogs', require('./routes/farmLogRoutes'));
app.use('/api/chat', chatRoutes);
app.use('/api/logs', logRoutes);
// A simple "Health Check" route
app.get('/', (req, res) => {
  res.send('Coffee Tracker API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
   
});