import React, { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area, LabelList
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, PieChart as PieIcon, Activity, ArrowLeft, Table2, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function FarmAnalytics() {
  const [isLoading, setIsLoading] = useState(true);
  const [kpis, setKpis] = useState({ revenue: 0, expenses: 0, profit: 0, margin: 0 });
  const [pieData, setPieData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [barData, setBarData] = useState([]);
  const [recentLedger, setRecentLedger] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]); // <-- NEW STATE FOR EXPORT
  const [hasData, setHasData] = useState(false);

  const COLORS = ['#2563eb', '#4f46e5', '#7c3aed', '#db2777', '#ea580c', '#059669'];

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const savedProfile = localStorage.getItem('farmerProfile');
      if (!savedProfile) {
        setIsLoading(false);
        return;
      }
      const profile = JSON.parse(savedProfile);

      const response = await axios.get(`https://farm-keep-pm47.onrender.com/api/expenses?userId=${profile._id}`);
      const transactions = response.data.data;

      if (!transactions || transactions.length === 0) {
        setHasData(false);
        setIsLoading(false);
        return;
      }

      setHasData(true);
      setAllTransactions(transactions); // Save all for the CSV export
      setRecentLedger(transactions.slice(0, 5)); // Save top 5 for the UI

      let totalInc = 0;
      let totalExp = 0;
      const categoryTotals = {};
      const monthlyData = {};

      transactions.forEach(t => {
        const amount = Number(t.amount) || 0;
        const date = new Date(t.date);
        const monthYear = date.toLocaleString('default', { month: 'short', year: '2-digit' });

        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = { name: monthYear, Income: 0, Expenses: 0 };
        }

        if (t.type === 'Income' || t.type === 'Harvest' || t.type === 'Sale') {
          totalInc += amount;
          monthlyData[monthYear].Income += amount;
        } else if (t.type === 'Expense') {
          totalExp += amount;
          monthlyData[monthYear].Expenses += amount;
          
          const cat = t.category || 'General';
          categoryTotals[cat] = (categoryTotals[cat] || 0) + amount;
        }
      });

      const netProfit = totalInc - totalExp;
      const profitMargin = totalInc > 0 ? ((netProfit / totalInc) * 100).toFixed(2) : 0.00; 
      setKpis({ revenue: totalInc, expenses: totalExp, profit: netProfit, margin: profitMargin });

      setPieData(Object.keys(categoryTotals)
        .map(key => ({ name: key, value: categoryTotals[key] }))
        .sort((a, b) => b.value - a.value)
      );

      const trendArray = Object.values(monthlyData).reverse();
      if (trendArray.length === 1) {
        trendArray.unshift({ name: 'Prev', Income: 0, Expenses: 0 });
      }
      setTrendData(trendArray);

      setBarData([
        { name: 'Total Revenue', amount: totalInc, fill: '#059669' }, 
        { name: 'Total Expenses', amount: totalExp, fill: '#dc2626' }  
      ]);

    } catch (error) {
      console.error("Failed to fetch analytics data", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- NEW CSV EXPORT FUNCTION ---
  const handleExportCSV = () => {
    if (allTransactions.length === 0) return;

    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount (KES)'];

    const csvRows = allTransactions.map(row => {
      const date = new Date(row.date).toLocaleDateString();
      // Safely escape quotes and commas in descriptions
      const desc = row.description ? `"${row.description.replace(/"/g, '""')}"` : 'N/A';
      const cat = row.category || 'N/A';
      return `${date},${row.type},${cat},${desc},${row.amount}`;
    });

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    
    // Create an invisible download link and click it programmatically
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `FarmKeep_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    if (percent < 0.05) return null; 
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center text-gray-600 font-mono text-sm uppercase tracking-widest animate-pulse">Loading Financial Data...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 w-full pb-24 md:pb-8">
      
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link to="/" className="text-gray-500 hover:text-gray-900 flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-2 transition">
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            Financial Analytics
          </h1>
          <p className="text-gray-500 font-medium mt-1 text-sm">Precision data and cash flow tracking.</p>
        </div>
      </div>

      {!hasData ? (
        <div className="max-w-7xl mx-auto bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center">
          <Activity className="mx-auto text-gray-300 mb-4" size={48} />
          <h2 className="text-xl font-bold text-gray-700">No ledger entries found</h2>
          <p className="text-gray-500 mt-2">Log your financial data to generate reports.</p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Gross Revenue</p>
              <p className="text-2xl font-mono text-gray-900">KES {kpis.revenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
            </div>
            
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Operating Expenses</p>
              <p className="text-2xl font-mono text-red-600">KES {kpis.expenses.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
            </div>

            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-blue-600">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Net Income</p>
              <p className={`text-2xl font-mono ${kpis.profit >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                KES {kpis.profit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </p>
            </div>

            <div className="bg-gray-900 p-5 rounded-lg shadow-sm text-white">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Net Profit Margin</p>
              <p className="text-2xl font-mono">{kpis.margin}%</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-96">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-6 border-b border-gray-100 pb-2">
              Cash Flow Over Time
            </h2>
            <ResponsiveContainer width="100%" height="85%">
              <AreaChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{fill: '#64748b', fontSize: 12, fontFamily: 'monospace'}} />
                <YAxis tick={{fill: '#64748b', fontSize: 12, fontFamily: 'monospace'}} tickFormatter={(val) => `K${val/1000}k`} width={60} />
                <RechartsTooltip formatter={(value) => `KES ${value.toLocaleString()}`} contentStyle={{borderRadius: '4px', border: '1px solid #e2e8f0', fontFamily: 'monospace', fontSize: '12px'}} />
                <Legend verticalAlign="top" height={36} wrapperStyle={{fontFamily: 'monospace', fontSize: '12px'}}/>
                <Area type="monotone" dataKey="Income" stroke="#059669" strokeWidth={2} fillOpacity={0.1} fill="#059669" activeDot={{r: 6}} />
                <Area type="monotone" dataKey="Expenses" stroke="#dc2626" strokeWidth={2} fillOpacity={0.1} fill="#dc2626" activeDot={{r: 6}} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-96">
               <h2 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-6 border-b border-gray-100 pb-2">
                Expense Distribution
              </h2>
              <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" labelLine={false} label={renderCustomizedLabel} outerRadius={110} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value) => `KES ${value.toLocaleString()}`} contentStyle={{fontFamily: 'monospace', fontSize: '12px'}} />
                  <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{fontFamily: 'monospace', fontSize: '12px'}}/>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-96">
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-6 border-b border-gray-100 pb-2">
                Income vs Expense Ledger
              </h2>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={barData} margin={{ top: 30, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{fill: '#1e293b', fontSize: 12, fontWeight: 'bold'}} />
                  <YAxis hide={true} /> 
                  <RechartsTooltip cursor={{fill: '#f8fafc'}} formatter={(value) => `KES ${value.toLocaleString()}`} />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]} barSize={80}>
                    <LabelList dataKey="amount" position="top" formatter={(val) => `KES ${val.toLocaleString()}`} style={{ fill: '#1e293b', fontSize: 12, fontFamily: 'monospace', fontWeight: 'bold' }} />
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Raw Data Ledger WITH EXPORT BUTTON */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-2">
                <Table2 size={18} className="text-gray-500" />
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-widest">Recent Ledger Entries</h2>
              </div>
              
              {/* THE EXPORT BUTTON */}
              <button 
                onClick={handleExportCSV}
                className="flex items-center gap-2 bg-gray-900 text-white px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition shadow-sm"
              >
                <Download size={14} /> Export CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-bold">
                    <th className="p-4">Date</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Description</th>
                    <th className="p-4 text-right">Amount (KES)</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-mono text-gray-700">
                  {recentLedger.map((row, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4">{new Date(row.date).toLocaleDateString()}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${row.type === 'Expense' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {row.type}
                        </span>
                      </td>
                      <td className="p-4">{row.category || 'N/A'}</td>
                      <td className="p-4 truncate max-w-xs">{row.description || '-'}</td>
                      <td className={`p-4 text-right font-bold ${row.type === 'Expense' ? 'text-red-600' : 'text-green-600'}`}>
                        {row.type === 'Expense' ? '-' : '+'}{row.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}