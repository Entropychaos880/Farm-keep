import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Receipt, 
  BookOpen, 
  User as UserIcon, 
  CalendarDays, 
  BarChart3, 
  LogOut 
} from 'lucide-react';

// Accept setAuth as a prop from App.jsx
export default function Sidebar({ setAuth }) {
  const location = useLocation();
  const navigate = useNavigate();
  
  const savedProfile = localStorage.getItem('farmerProfile');
  const profile = savedProfile ? JSON.parse(savedProfile) : { fullName: 'Guest Farmer' };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }, // Updated path to match App.jsx
    { name: 'Transactions', path: '/expenses', icon: Receipt },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Farm Diary', path: '/diary', icon: BookOpen },
    { name: 'Calendar', path: '/calendar', icon: CalendarDays }, 
  ];

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      // 1. Clear the local storage session
      localStorage.removeItem('farmerProfile'); 
      
      // 2. Update the global Auth state in App.jsx
      // This forces the router to re-evaluate the protected routes
      if (setAuth) setAuth(false); 
      
      // 3. Clear any remaining local state and redirect
      navigate('/login', { replace: true }); 
    }
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 h-screen sticky top-0 shadow-sm z-40">
      
      {/* Logo Area */}
      <div className="p-6 border-b border-gray-100 flex items-center gap-3">
        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm">
          F
        </div>
        <span className="text-xl font-bold text-green-800 tracking-tight">Farm Keep</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link 
              key={item.name}
              to={item.path} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-green-50 text-green-700 shadow-sm' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-green-600'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-green-600' : 'text-gray-400'} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Logout Area */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50 space-y-3">
        {/* Profile Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700">
            <UserIcon size={20} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-800 truncate w-32">{profile.fullName}</p>
            <Link to="/profile" className="text-xs text-gray-500 hover:text-green-600 cursor-pointer font-medium transition">
              Edit Profile
            </Link>
          </div>
        </div>

        {/* LOGOUT BUTTON */}
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 transition-all duration-200"
        >
          <LogOut size={20} />
          <span>Log Out</span>
        </button>
      </div>
      
    </aside>
  );
}