import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
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
import FarmAnalytics from './components/FarmAnalytics';

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); 
  const location = useLocation();

  useEffect(() => {
    // Check if the farmer is already logged in on mount
    const savedProfile = localStorage.getItem('farmerProfile');
    if (savedProfile) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  // Prevent flickering/redirect loops while checking storage
  if (loading) return null; 

  return (
    <div className={`min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans relative ${isAuthPage ? '' : 'pb-16 md:pb-0'}`}>
      
      {/* UPDATED: Pass setAuth to Sidebar */}
      {!isAuthPage && <Sidebar setAuth={setIsAuthenticated} />}

      <main className={`flex-1 flex flex-col ${isAuthPage ? 'p-0' : 'p-4 md:p-8 bg-gray-50'}`}>
        <Routes>
          {/* Landing Logic */}
          <Route 
            path="/" 
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} 
          />

          {/* Auth Routes */}
          <Route path="/signup" element={<Signup />} />
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login setAuth={setIsAuthenticated} />} 
          />

          {/* Protected Routes - Only allow if authenticated */}
          <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/expenses" element={isAuthenticated ? <Expenses /> : <Navigate to="/login" />} />
          <Route path="/profile" element={isAuthenticated ? <EditProfile /> : <Navigate to="/login" />} />
          <Route path="/diary" element={isAuthenticated ? <FarmDiary /> : <Navigate to="/login" />} />
          <Route path="/calendar" element={isAuthenticated ? <CoffeeCalendar /> : <Navigate to="/login" />} />
          <Route path="/analytics" element={isAuthenticated ? <FarmAnalytics /> : <Navigate to="/login" />} />

          {/* 404 Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      {/* UPDATED: Pass setAuth to MobileNav */}
      {!isAuthPage && <MobileNav setAuth={setIsAuthenticated} />}

      {/* AI Chat Button & Overlay */}
      {!isAuthPage && (
        <button onClick={() => setIsChatOpen(true)} className="md:hidden fixed bottom-20 right-4 bg-green-600 text-white p-4 rounded-full shadow-lg z-40">
          <MessageCircle size={28} />
        </button>
      )}

      {isChatOpen && !isAuthPage && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/40 flex flex-col justify-end">
          <div className="flex-1" onClick={() => setIsChatOpen(false)}></div>
          <div className="bg-white w-full h-[85vh] rounded-t-3xl shadow-2xl flex flex-col overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold">Chat with AI</h3>
              <button onClick={() => setIsChatOpen(false)} className="p-2 bg-gray-100 rounded-full"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-hidden"><AiDoctor /></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;