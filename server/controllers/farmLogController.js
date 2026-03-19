const FarmLog = require('../models/FarmLog');

exports.addLog = async (req, res) => {
  try {
    const log = await FarmLog.create(req.body);
    res.status(201).json({ success: true, data: log });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getLogs = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(200).json({ success: true, data: [] });

    // Fetch the logs and sort them from newest to oldest
    const logs = await FarmLog.find({ userId }).sort({ date: -1 });
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};