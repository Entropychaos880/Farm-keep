const express = require("express");
const router = express.Router();
const multer = require("multer");
const { diagnoseCrop, generateInsights } = require('../controllers/aiController');

// 1. Use Memory Storage (saves the file to RAM temporarily)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// 2. The field name MUST be 'image'
router.post("/diagnose", upload.single("image"), diagnoseCrop);
router.get('/insights', generateInsights);

module.exports = router;