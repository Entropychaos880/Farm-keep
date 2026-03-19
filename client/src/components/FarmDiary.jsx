import React, { useState, useEffect } from 'react';
import { Sprout, Calendar, Plus, FileText } from 'lucide-react';
import axios from 'axios';

export default function FarmDiary() {
  const [logs, setLogs] = useState([]);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    activityType: 'Observation',
    description: ''
  });

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const savedProfile = localStorage.getItem('farmerProfile');
      if (!savedProfile) return;
      const profile = JSON.parse(savedProfile);

      const response = await axios.get(`https://farm-keep-pm47.onrender.com/api/farmlogs?userId=${profile._id}`);
      setLogs(response.data.data);
    } catch (error) {
      console.error("Failed to load farm logs:", error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description.trim()) return;

    try {
      const savedProfile = localStorage.getItem('farmerProfile');
      if (!savedProfile) return;
      const profile = JSON.parse(savedProfile);

      const payload = {
        userId: profile._id,
        activityType: formData.activityType,
        description: formData.description,
        date: formData.date
      };

      await axios.post('https://farm-keep-pm47.onrender.com/api/farmlogs/add', payload);
      
      fetchLogs(); // Refresh the list
      setFormData({ ...formData, description: '' }); // Clear the text input
    } catch (error) {
      console.error("Failed to save log:", error);
    }
  };

  // Helper function to pick colors for different activities
  const getActivityColor = (type) => {
    const colors = {
      Pruning: 'bg-orange-100 text-orange-600',
      Spraying: 'bg-blue-100 text-blue-600',
      Planting: 'bg-green-100 text-green-600',
      Weeding: 'bg-yellow-100 text-yellow-600',
      Fertilizing: 'bg-purple-100 text-purple-600',
      Observation: 'bg-gray-100 text-gray-600',
      Other: 'bg-gray-100 text-gray-600'
    };
    return colors[type] || colors['Other'];
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Farm Diary</h1>
        <p className="text-gray-500 mt-1 font-medium">Document your daily farm activities and observations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* ADD LOG FORM */}
        <div className="md:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
              <Plus size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-800">New Entry</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input 
                type="date" 
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type</label>
              <select 
                name="activityType"
                value={formData.activityType}
                onChange={handleInputChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-green-500"
              >
                <option value="Observation">Observation</option>
                <option value="Pruning">Pruning</option>
                <option value="Spraying">Spraying Pesticide/Fungicide</option>
                <option value="Planting">Planting</option>
                <option value="Weeding">Weeding</option>
                <option value="Fertilizing">Fertilizing</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="What did you do today?"
                rows="4"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-green-500 resize-none"
                required
              ></textarea>
            </div>

            <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition shadow-sm">
              Save Entry
            </button>
          </form>
        </div>

        {/* TIMELINE */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
           <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <FileText size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Activity History</h2>
          </div>

          <div className="relative border-l-2 border-gray-100 ml-4 pl-6 space-y-8 mt-4">
            {logs.length === 0 ? (
              <p className="text-gray-400 text-sm py-4">No entries yet. Start logging your farm activities.</p>
            ) : (
              logs.map((log) => (
                <div key={log._id} className="relative">
                  {/* Timeline Dot */}
                  <div className={`absolute -left-[35px] w-4 h-4 rounded-full border-4 border-white ${getActivityColor(log.activityType).split(' ')[1].replace('text-', 'bg-')}`}></div>
                  
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getActivityColor(log.activityType)}`}>
                        {log.activityType}
                      </span>
                      <div className="flex items-center gap-1 text-xs font-bold text-gray-400">
                        <Calendar size={12} />
                        {new Date(log.date).toLocaleDateString()}
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm mt-2">{log.description}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}