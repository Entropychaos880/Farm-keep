import React, { useState, useEffect } from 'react';
import { Plus, Receipt, Calendar, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import axios from 'axios';

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [txType, setTxType] = useState('Expense'); 
  const [harvestData, setHarvestData] = useState({ kg: '', pricePerKg: '120' }); 

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    date: getTodayDate(), 
    category: 'Fertilizer',
    amount: '',
    description: ''
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  // FIX 1: Fetch only the logged-in user's transactions
  const fetchExpenses = async () => {
    try {
      const savedProfile = localStorage.getItem('farmerProfile');
      if (!savedProfile) return;
      const profile = JSON.parse(savedProfile);

      const response = await axios.get(`https://farm-keep-pm47.onrender.com/api/expenses?userId=${profile._id}`);
      setExpenses(response.data.data); 
    } catch (error) {
      console.error("Failed to load expenses:", error);
    }
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleHarvestChange = (e) => {
    setHarvestData({ ...harvestData, [e.target.name]: e.target.value });
  };

  // FIX 2: Correctly POST the data to the database
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const savedProfile = localStorage.getItem('farmerProfile');
    if (!savedProfile) return;
    const profile = JSON.parse(savedProfile);

    let finalAmount = 0;
    let finalCategory = '';

    if (txType === 'Harvest') {
      if (!harvestData.kg || !harvestData.pricePerKg) return;
      finalAmount = parseFloat(harvestData.kg) * parseFloat(harvestData.pricePerKg);
      finalCategory = 'Cherry Delivery'; 
    } else {
      if (!formData.amount) return;
      finalAmount = parseFloat(formData.amount);
      finalCategory = formData.category;
    }

    const payload = {
      userId: profile._id, // Attach the real ID
      type: txType,        // 'Expense' or 'Harvest'
      category: finalCategory,
      amount: finalAmount,
      description: formData.description,
      date: formData.date
    };

    try {
      // Actually send the POST request to save to MongoDB
      await axios.post('https://farm-keep-pm47.onrender.com/api/expenses/add', payload);
      
      // Refresh the list immediately
      fetchExpenses();
      
      // Reset form
      setFormData({ date: getTodayDate(), category: 'Fertilizer', amount: '', description: '' });
      setHarvestData({ kg: '', pricePerKg: '120' });
    } catch (error) {
      console.error("Failed to save transaction:", error);
      alert("Could not save the transaction.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Transactions</h1>
        <p className="text-gray-500 mt-1 font-medium">Log your harvest income and farm expenses.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ADD TRANSACTION FORM */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-1 h-fit">
          <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
            <button 
              type="button"
              onClick={() => setTxType('Expense')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition ${txType === 'Expense' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <ArrowDownCircle size={16} /> Expense
            </button>
            <button 
              type="button"
              onClick={() => setTxType('Harvest')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition ${txType === 'Harvest' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <ArrowUpCircle size={16} /> Harvest
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input 
                type="date" 
                name="date"
                value={formData.date}
                onChange={handleFormChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 cursor-pointer"
                required
              />
            </div>

            {txType === 'Expense' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select 
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 cursor-pointer"
                  >
                    <option value="Fertilizer">Fertilizer & Manure</option>
                    <option value="Pesticides">Pesticides & Fungicides</option>
                    <option value="Labor">Labor (Picking, Weeding)</option>
                    <option value="Transport">Transport</option>
                    <option value="Equipment">Equipment & Tools</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (KES)</label>
                  <input 
                    type="number" 
                    name="amount"
                    value={formData.amount}
                    onChange={handleFormChange}
                    placeholder="e.g. 1500"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    required
                  />
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                <div>
                  <label className="block text-xs font-bold text-green-800 mb-1">Kilograms</label>
                  <input 
                    type="number" 
                    name="kg"
                    value={harvestData.kg}
                    onChange={handleHarvestChange}
                    placeholder="e.g. 50"
                    className="w-full bg-white border border-green-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-green-800 mb-1">Price/Kg (KES)</label>
                  <input 
                    type="number" 
                    name="pricePerKg"
                    value={harvestData.pricePerKg}
                    onChange={handleHarvestChange}
                    className="w-full bg-white border border-green-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                    required
                  />
                </div>
                <div className="col-span-2 mt-2 flex justify-between items-center border-t border-green-200 pt-2">
                  <span className="text-sm text-green-700 font-medium">Value:</span>
                  <span className="text-lg font-bold text-green-800">
                    KES {(parseFloat(harvestData.kg || 0) * parseFloat(harvestData.pricePerKg || 0)).toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
              <input 
                type="text" 
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                placeholder="Mill name, block picked, etc."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>

            <button 
              type="submit" 
              className={`w-full text-white font-bold py-3 rounded-xl transition mt-2 shadow-sm ${txType === 'Expense' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
            >
              Save {txType}
            </button>
          </form>
        </div>

        {/* RECENT TRANSACTIONS LIST */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <Receipt size={22} />
            </div>
            <h2 className="text-lg font-bold text-gray-800 tracking-tight">Transaction History</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wider">
                  <th className="pb-4 font-bold">Date</th>
                  <th className="pb-4 font-bold">Type</th>
                  <th className="pb-4 font-bold">Details</th>
                  <th className="pb-4 font-bold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-12 text-gray-400 font-medium italic">No transactions recorded yet.</td>
                  </tr>
                ) : (
                  expenses.map((expense) => (
                    <tr key={expense._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                      <td className="py-4 text-gray-600 flex items-center gap-2 whitespace-nowrap">
                         <Calendar size={14} className="text-gray-400" />
                         {new Date(expense.date).toLocaleDateString()}
                      </td>
                      <td className="py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${expense.type === 'Harvest' || expense.type === 'Income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {expense.type === 'Harvest' || expense.type === 'Income' ? 'Income' : 'Expense'}
                        </span>
                      </td>
                      <td className="py-4 text-gray-800">
                        <div className="font-bold text-gray-800">{expense.category}</div>
                        <div className="text-xs text-gray-500 font-medium">{expense.description}</div>
                      </td>
                      <td className={`py-4 text-right font-black whitespace-nowrap ${expense.type === 'Harvest' || expense.type === 'Income' ? 'text-green-600' : 'text-red-600'}`}>
                        {expense.type === 'Harvest' || expense.type === 'Income' ? '+' : '-'} KES {expense.amount?.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}