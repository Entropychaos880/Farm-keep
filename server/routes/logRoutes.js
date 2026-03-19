const express = require('express');
const router = express.Router();
const FarmLog = require('../models/FarmLog');

// GET all logs for a specific user
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ success: false, error: "User ID required" });

    const logs = await FarmLog.find({ userId }).sort({ date: -1 });
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;