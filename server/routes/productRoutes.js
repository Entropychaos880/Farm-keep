const express = require('express');
const router = express.Router();
const { addProduct, getRecommendations } = require('../controllers/productController');

router.post('/', addProduct);
router.get('/recommend', getRecommendations);

module.exports = router;