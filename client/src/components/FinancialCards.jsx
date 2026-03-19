import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import axios from 'axios';

export default function FinancialCards() {
  // 1. Set up state for our real numbers
  const [stats, setStats] = useState({ income: 0, expenses: 0, profit: 0 });

  // 2. Fetch the live totals from the database when the dashboard loads
  useEffect(() => {
    const fetchLiveStats = async () => {
      try {
        const savedProfile = localStorage.getItem('farmerProfile');
        if (!savedProfile) return;
        const profile = JSON.parse(savedProfile);

        // Fetch the summary using the real userId
        const response = await axios.get(`https://farm-keep-pm47.onrender.com/api/expenses/summary?userId=${profile._id}`);
        
        // Use the simplified data structure from your updated controller
        const { income, expenses } = response.data.data;

        // Update the state with the real math
        setStats({
          income: income,
          expenses: expenses,
          profit: income - expenses
        });
      } catch (error) {
        console.error("Failed to fetch live stats for Dashboard:", error);
      }
    };

    fetchLiveStats();
  }, []); // Runs once when the page opens

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Income Card */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500 font-medium">Cherry Sales (Harvest)</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">
              KES {stats.income.toLocaleString()}
            </h3>
          </div>
          <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600">
            <TrendingUp size={20} />
          </div>
        </div>
        <p className="text-xs text-green-600 mt-3 font-medium">Live Database Data</p>
      </div>

      {/* Expense Card */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500 font-medium">Farm Expenses</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">
              KES {stats.expenses.toLocaleString()}
            </h3>
          </div>
          <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-500">
            <TrendingDown size={20} />
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3 font-medium text-red-400">Fertilizer, Labor, Transport</p>
      </div>

      {/* Net Profit Card */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500 font-medium">Net Profit</p>
            <h3 className={`text-2xl font-bold mt-1 ${stats.profit >= 0 ? 'text-green-700' : 'text-red-600'}`}>
              KES {stats.profit.toLocaleString()}
            </h3>
          </div>
          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
            <Wallet size={20} />
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3 font-medium">Available Balance</p>
      </div>
    </div>
  );
}