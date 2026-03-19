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

app.use((req, res, next) => {
  const allowedOrigins = ['https://farm-keep.vercel.app', 'http://localhost:5173'];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  // These three lines are the most important for Vercel + Render
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle the Preflight (OPTIONS) request immediately
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});


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