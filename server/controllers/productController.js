const Product = require('../models/Product');

// ADD A NEW PRODUCT
exports.addProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// SEARCH PRODUCTS BY ISSUE (Used by the AI)
exports.getRecommendations = async (req, res) => {
  try {
    const { issue } = req.query; // e.g. /api/products/recommend?issue=Coffee+Rust
    
    // Find products where the issue is listed in their targetIssues array
    const products = await Product.find({ 
      targetIssues: { $regex: issue, $options: 'i' },
      inStock: true 
    });

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};