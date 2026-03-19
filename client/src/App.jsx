import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { MessageCircle, X } from 'lucide-react'; 
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import Dashboard from './components/Dashboard';
import Expenses from './components/Expenses';
import AiDoctor from './components/AiDoctor';
import Signup from './components/Signup';
import Login from './components/Login';
import EditProfile from './components/EditProfile';
import FarmDiary from './components/FarmDiary';
import CoffeeCalendar from './components/CoffeeCalendar';

// 1. IMPORT THE NEW ANALYTICS COMPONENT
import FarmAnalytics from './components/FarmAnalytics';

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <div className={`min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans relative ${isAuthPage ? '' : 'pb-16 md:pb-0'}`}>
      
      {/* 1. THE ONLY SIDEBAR - Placed here so it shows on the LEFT */}
      {!isAuthPage && <Sidebar />}

      {/* 2. MAIN CONTENT AREA */}
      <main className={`flex-1 flex flex-col ${isAuthPage ? 'p-0' : 'p-4 md:p-8 bg-gray-50'}`}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} /> {/* Added as a safe fallback */}
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<EditProfile />} />
          <Route path="/diary" element={<FarmDiary />} />
          <Route path="/calendar" element={<CoffeeCalendar />} />
          
          {/* 2. ADD THE NEW ROUTE HERE */}
          <Route path="/analytics" element={<FarmAnalytics />} />
        </Routes>
      </main>

      {/* 3. MOBILE NAV & AI CHAT */}
      {!isAuthPage && <MobileNav />}

      {!isAuthPage && (
        <button 
          onClick={() => setIsChatOpen(true)} 
          className="md:hidden fixed bottom-20 right-4 bg-green-600 text-white p-4 rounded-full shadow-lg z-40 hover:bg-green-700 transition"
        >
          <MessageCircle size={28} />
        </button>
      )}

      {/* Slide-up Chat Overlay */}
      {isChatOpen && !isAuthPage && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/40 flex flex-col justify-end">
          <div className="flex-1" onClick={() => setIsChatOpen(false)}></div>
          <div className="bg-white w-full h-[85vh] rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
            <div className="p-4 bg-white border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800">Chat with AI</h3>
              <button onClick={() => setIsChatOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <AiDoctor />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;