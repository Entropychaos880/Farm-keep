const express = require('express');
const router = express.Router();
const { addExpense, getExpenses, getSummary } = require('../controllers/expenseController');

// This matches the frontend and fixes the 404!
router.post('/add', addExpense); 

// These get the data for your dashboard
router.get('/', getExpenses);
router.get('/summary', getSummary);

module.exports = router;