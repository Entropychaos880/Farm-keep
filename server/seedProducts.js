const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const coffeeProducts = [
  {
    name: "Green Cop 500WP",
    activeIngredient: "Copper Oxychloride",
    category: "Fungicide",
    targetIssues: ["Coffee Leaf Rust", "Coffee Berry Disease", "CBD"],
    estimatedPrice: { min: 1200, max: 1500 },
    distributor: "Greenlife Crop Protection",
    productUrl: "https://greenlife.co.ke/green-cop-500wp/"
  },
  {
    name: "Victory 72WP",
    activeIngredient: "Metalaxyl + Mancozeb",
    category: "Fungicide",
    targetIssues: ["Coffee Berry Disease", "Damping off", "Downy Mildew"],
    estimatedPrice: { min: 1800, max: 2200 },
    distributor: "Osho Chemical Industries",
    productUrl: "https://oshochemical.com/product/victory-72wp/"
  }
];

const seedDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Product.deleteMany({}); // Clear existing to avoid duplicates
  await Product.insertMany(coffeeProducts);
  console.log("✅ Coffee products seeded!");
  process.exit();
};

seedDB();