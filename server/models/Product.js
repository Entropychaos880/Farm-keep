const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  }, // e.g., "Green Cop 500WP"
  activeIngredient: { 
    type: String, 
    required: true,
    trim: true 
  }, // e.g., "Copper Oxychloride"
  category: { 
    type: String, 
    enum: ['Fungicide', 'Insecticide', 'Herbicide', 'Fertilizer', 'Equipment'], 
    required: true 
  },
  targetIssues: [{ 
    type: String, 
    trim: true 
  }], // Array of strings e.g., ["Coffee Leaf Rust", "Coffee Berry Disease"]
  estimatedPrice: {
    min: { type: Number },
    max: { type: Number } // Prices fluctuate, so ranges are safer to show farmers
  },
  distributor: { 
    type: String,
    trim: true 
  }, // e.g., "Amiran Kenya", "Osho Chemicals"
  productUrl: { 
    type: String 
  }, // Direct link for the farmer to buy or read more
  inStock: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true });

// Build a compound index. This makes the database lightning fast 
// when the backend searches for a specific category to treat a specific issue.
ProductSchema.index({ category: 1, targetIssues: 1 });

module.exports = mongoose.model('Product', ProductSchema);