const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true // Massively speeds up fetching a specific farmer's financial data
  }, 
  type: { 
    type: String, 
    enum: ['Expense', 'Harvest', 'Income', 'Sale'], // Added 'Sale' to match your AI prompt logic
    required: true 
  },
  category: { 
    type: String, 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  description: { type: String, trim: true },
  receiptImage: { type: String }, // URL from the AI scanning module
  date: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

module.exports = mongoose.model('Expense', ExpenseSchema);