import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Receipt, BookOpen, CalendarDays, BarChart3 } from 'lucide-react';

export default function MobileNav() {
  const location = useLocation();

  // Define the mobile navigation links
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Logs', path: '/expenses', icon: Receipt }, // Shortened name slightly to fit 5 items better
    { name: 'Analytics', path: '/analytics', icon: BarChart3 }, // <-- NEW LINK
    { name: 'Diary', path: '/diary', icon: BookOpen },
    { name: 'Calendar', path: '/calendar', icon: CalendarDays }, 
  ];

  return (
    <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-100 z-40 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)] pb-safe">
      <div className="flex justify-around items-center p-2 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          // Updated to also highlight if the user manually navigates to /dashboard
          const isActive = location.pathname === item.path || (item.path === '/' && location.pathname === '/dashboard');
          
          return (
            <Link 
              key={item.name}
              to={item.path} 
              className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200"
            >
              <div className={`${isActive ? 'bg-green-50 p-1.5 rounded-xl' : 'p-1.5'}`}>
                <Icon size={22} className={isActive ? 'text-green-600' : 'text-gray-400'} />
              </div>
              <span className={`text-[10px] font-bold tracking-wide ${isActive ? 'text-green-700' : 'text-gray-400'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}