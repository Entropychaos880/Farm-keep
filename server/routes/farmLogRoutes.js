const express = require('express');
const router = express.Router();
const { addLog, getLogs } = require('../controllers/farmLogController');

router.post('/add', addLog);
router.get('/', getLogs);

module.exports = router;