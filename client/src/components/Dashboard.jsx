import React, { useState, useEffect } from 'react';
import { User, Bell, LogOut, Settings, ChevronDown, RefreshCw, BarChart3, Eye } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import FinancialCards from './FinancialCards';
import AiDoctor from './AiDoctor';
import WeatherWidget from './WeatherWidget';

export default function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ fullName: 'Guest Farmer', region: 'Kenya' });
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // States for our dropdown menus
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // States for the AI Insights Notification Bell
  const [notifications, setNotifications] = useState([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  const fetchInsights = async (forceRefresh = false) => {
    setIsLoadingNotifications(true);
    try {
      const savedProfile = localStorage.getItem('farmerProfile');
      if (!savedProfile) return;
      const parsedProfile = JSON.parse(savedProfile);

      const lastCheckTime = localStorage.getItem('lastInsightTime');
      const cachedInsights = localStorage.getItem('cachedInsights');
      const now = new Date().getTime();

      if (!forceRefresh && lastCheckTime && cachedInsights && (now - parseInt(lastCheckTime) < 3600000)) {
        setNotifications(JSON.parse(cachedInsights));
        setIsLoadingNotifications(false);
        return;
      }

      const res = await axios.get(`http://localhost:5000/api/ai/insights?userId=${parsedProfile._id}`);
      if (res.data.success && Array.isArray(res.data.data)) {
        setNotifications(res.data.data);
        localStorage.setItem('cachedInsights', JSON.stringify(res.data.data));
        localStorage.setItem('lastInsightTime', now.toString());
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  useEffect(() => {
    const savedProfile = localStorage.getItem('farmerProfile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
      fetchInsights(false); 
    }
  }, [refreshTrigger]);

  const handleManualRefresh = () => {
    fetchInsights(true); 
  };

  const handleActionSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleLogout = () => {
    localStorage.removeItem('farmerProfile');
    navigate('/login');
  };

  return (
    <>
      {/* TOP HEADER AREA: Profile (Mobile) & Notifications (All Devices) */}
      <div className="flex justify-between items-start mb-6 relative z-30">
        
        {/* LEFT SIDE: Mobile Profile Menu */}
        <div className="md:hidden relative">
          <div 
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-3 bg-white p-2 pr-4 rounded-full shadow-sm border border-gray-100 cursor-pointer hover:bg-gray-50 transition"
          >
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700">
              <User size={20} />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-800 flex items-center gap-1">
                {profile.fullName?.split(' ')[0]} <ChevronDown size={14} className="text-gray-400" />
              </h1>
            </div>
          </div>

          {/* Mobile Profile Dropdown */}
          {isProfileMenuOpen && (
            <div className="absolute top-14 left-0 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-slide-up z-50">
             <Link to="/profile" className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition border-b border-gray-50">
                <Settings size={16} /> Edit Profile
             </Link>
              <button 
                onClick={handleLogout} 
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition"
              >
                <LogOut size={16} /> Log Out
              </button>
            </div>
          )}
        </div>

        {/* LEFT SIDE: Desktop Page Title */}
        <div className="hidden md:block">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Farm Overview</h1>
          <p className="text-gray-500 mt-1 font-medium">Track your harvest and farm expenses.</p>
        </div>

        {/* RIGHT SIDE: Notification Bell */}
        <div className="relative ml-auto">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-600 shadow-sm border border-gray-100 hover:text-green-600 hover:bg-green-50 transition relative"
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute top-14 right-0 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-slide-up origin-top-right z-50">
              <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-gray-800">AI Insights</h3>
                <div className="flex items-center gap-3">
                  {isLoadingNotifications ? (
                    <span className="text-xs text-green-600 animate-pulse font-medium">Scanning...</span>
                  ) : (
                    <button 
                      onClick={handleManualRefresh} 
                      className="text-gray-400 hover:text-green-600 transition flex items-center gap-1 bg-white border border-gray-200 px-2 py-1 rounded-md shadow-sm"
                      title="Force AI to scan latest logs"
                    >
                      <RefreshCw size={12} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Refresh</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="p-2 max-h-72 overflow-y-auto">
                {notifications.length === 0 && !isLoadingNotifications ? (
                   <div className="p-4 text-center text-sm text-gray-500 font-medium">
                     No unresolved issues. Your farm is looking great!
                   </div>
                ) : (
                  notifications.map((note, index) => (
                    <div key={index} className="p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition mb-1 border border-transparent hover:border-red-100 bg-red-50/30">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        <p className="text-sm text-gray-800 font-bold tracking-tight">{note.title}</p>
                      </div>
                      <p className="text-xs text-gray-600 ml-4 leading-relaxed">{note.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Page Title */}
      <div className="md:hidden mb-6">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Farm Overview</h1>
        <p className="text-gray-500 mt-1 font-medium">Track your harvest and farm expenses.</p>
      </div>

      {/* WEATHER WIDGET PLACEMENT */}
      <div className="w-full mb-8">
        <WeatherWidget />
      </div>

      <FinancialCards key={`cards-${refreshTrigger}`} />

      {/* NEW ANALYTICS SECTION HEADER */}
      <div className="mt-8 mb-6 flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
             <BarChart3 size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800 tracking-tight">Farm Analytics</h2>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Visualize your cash flow and margins</p>
          </div>
        </div>
        
        {/* The Link to the new Page */}
        <Link 
          to="/analytics" 
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-bold shadow-sm hover:bg-blue-700 transition"
        >
          <Eye size={16} className="hidden sm:block" /> View Dashboard
        </Link>
      </div>

      <div className="hidden md:block mt-8 max-w-3xl"> 
        <h2 className="text-xl font-bold text-gray-800 mb-4 tracking-tight">Consult the Doctor</h2>
        <AiDoctor onActionSuccess={handleActionSuccess} />
      </div>
    </>
  );
}