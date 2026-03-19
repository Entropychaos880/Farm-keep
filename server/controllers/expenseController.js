const Expense = require('../models/Expense');
// We don't even need mongoose here anymore since we removed the strict ObjectId casting!

exports.addExpense = async (req, res) => {
  try {
    const expense = await Expense.create(req.body);
    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getExpenses = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(200).json({ success: true, data: [] });

    // Ensure we filter by the specific farmer's ID
    const expenses = await Expense.find({ userId }).sort({ date: -1 }); 
    res.status(200).json({ success: true, count: expenses.length, data: expenses });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.getSummary = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(200).json({ success: true, data: { income: 0, expenses: 0 } });

    // 1. Fetch all records simply, letting Mongoose handle the ID format
    const allRecords = await Expense.find({ userId });

    // 2. Initialize clean totals
    const totals = {
      income: 0,
      expenses: 0
    };

    // 3. Do the math directly in Node.js instead of relying on MongoDB aggregation
    allRecords.forEach(record => {
      if (record.type === 'Harvest' || record.type === 'Income') {
        totals.income += record.amount;
      } else if (record.type === 'Expense') {
        totals.expenses += record.amount;
      }
    });

    res.status(200).json({ success: true, data: totals });
  } catch (error) {
    console.error("Summary Error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};