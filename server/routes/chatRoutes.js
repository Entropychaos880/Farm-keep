const express = require('express');
const router = express.Router();
const { getChat, updateChat, clearChat } = require('../controllers/chatController');

// GET request to fetch history (e.g., /api/chat?userId=123)
router.get('/', getChat);

// POST request to save/update history
router.post('/', updateChat);

// DELETE request to clear the history
router.delete('/', clearChat);

module.exports = router;