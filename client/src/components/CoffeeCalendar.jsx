import React from 'react';
import { CalendarDays, Sun, CloudRain, Cloud, CheckCircle2, ShieldAlert, Sprout, Bug } from 'lucide-react';

export default function CoffeeCalendar() {
  const currentMonthIndex = new Date().getMonth();

  // Advanced Kenyan Coffee Farming Calendar Data
  const schedule = [
    { 
      month: 'Jan', full: 'January', weather: 'Dry / Hot', icon: Sun, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200',
      activities: ['Main pruning and desuckering', 'Irrigation (if available)', 'Digging planting holes'],
      spraying: [],
      fertilizer: ''
    },
    { 
      month: 'Feb', full: 'February', weather: 'Dry / Warm', icon: Sun, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200',
      activities: ['Mulching', 'Weeding before rains', 'Preparation for planting'],
      spraying: ['Pre-rain Copper spray for CBD & Leaf Rust (e.g., Kocide 2000, Copper Oxychloride)'],
      fertilizer: 'Apply 1st Top Dressing (CAN or NPK 17:17:17) just before rains start'
    },
    { 
      month: 'Mar', full: 'March', weather: 'Long Rains Begin', icon: CloudRain, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200',
      activities: ['Planting new seedlings', 'Slashing weeds (do not uproot)'],
      spraying: ['CBD & Rust Spray 1: Systemic + Copper (e.g., Alto 100, Green Cop, or Ridomil)'],
      fertilizer: ''
    },
    { 
      month: 'Apr', full: 'April', weather: 'Long Rains Peak', icon: CloudRain, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200',
      activities: ['Canopy management (handling/desuckering)', 'Soil conservation (check terraces)'],
      spraying: ['CBD & Rust Spray 2: Rotate active ingredient to prevent resistance (e.g., Opera or Silvacur)'],
      fertilizer: ''
    },
    { 
      month: 'May', full: 'May', weather: 'Long Rains End', icon: Cloud, color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200',
      activities: ['Early crop harvesting begins', 'Light weeding'],
      spraying: ['CBD Spray 3: Focus on protecting expanding berries (Copper formulations)'],
      fertilizer: 'Apply 2nd Top Dressing (CAN) if soils are still moist'
    },
    { 
      month: 'Jun', full: 'June', weather: 'Cool & Dry', icon: Cloud, color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200',
      activities: ['Early crop peak harvest', 'Processing and drying early crop'],
      spraying: ['Monitor for Thrips and Antestia Bugs; Spray insecticides ONLY if threshold is met (e.g., Thunder, Duduthrin)'],
      fertilizer: ''
    },
    { 
      month: 'Jul', full: 'July', weather: 'Cool / Cloudy', icon: Cloud, color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200',
      activities: ['Main crop bean expansion phase', 'Pruning dead wood'],
      spraying: ['Monitor for Coffee Berry Borer (CBB). Use traps or spray (e.g., Marshal) if infestation is high.'],
      fertilizer: ''
    },
    { 
      month: 'Aug', full: 'August', weather: 'Dry / Warming', icon: Sun, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200',
      activities: ['Prepare factory equipment for main harvest', 'Clear weeds ahead of short rains'],
      spraying: ['Late Rust control if signs persist (Copper spray)'],
      fertilizer: ''
    },
    { 
      month: 'Sep', full: 'September', weather: 'Short Rains Begin', icon: CloudRain, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200',
      activities: ['Main harvesting starts', 'Factory pulping and fermentation'],
      spraying: ['Pre-rain CBD control (Copper) if short rains are heavy'],
      fertilizer: 'Apply 3rd Top Dressing or Foliar Feed to support berry maturation'
    },
    { 
      month: 'Oct', full: 'October', weather: 'Short Rains', icon: CloudRain, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200',
      activities: ['Peak main harvest', 'Intensive processing and careful drying'],
      spraying: ['Monitor for Leaf Miner outbreaks; spray if necessary'],
      fertilizer: ''
    },
    { 
      month: 'Nov', full: 'November', weather: 'Short Rains End', icon: CloudRain, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200',
      activities: ['Late harvesting (stripping)', 'Final drying of beans', 'Delivery to mill/society'],
      spraying: [],
      fertilizer: ''
    },
    { 
      month: 'Dec', full: 'December', weather: 'Dry / Hot', icon: Sun, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200',
      activities: ['Main pruning (change of cycle if required)', 'Stump over-aged trees', 'Farm planning and budgeting'],
      spraying: [],
      fertilizer: 'Soil sampling and testing for next year\'s planning'
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-700 shadow-sm">
          <CalendarDays size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Agronomy Calendar</h1>
          <p className="text-gray-500 mt-1 font-medium">Seasonal guide for spraying, fertilizer, and farm management.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {schedule.map((monthData, index) => {
          const Icon = monthData.icon;
          const isCurrentMonth = index === currentMonthIndex;

          return (
            <div 
              key={monthData.month} 
              className={`flex flex-col rounded-2xl shadow-sm border transition-all overflow-hidden ${
                isCurrentMonth 
                  ? 'bg-white border-green-500 ring-2 ring-green-100 scale-[1.01]' 
                  : 'bg-white border-gray-100 hover:border-gray-300 hover:shadow-md'
              }`}
            >
              {/* Card Header */}
              <div className={`p-4 border-b ${isCurrentMonth ? 'bg-green-50/80 border-green-100' : 'bg-gray-50/50 border-gray-100'} flex justify-between items-center`}>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-gray-800">
                    {monthData.full}
                  </h3>
                  {isCurrentMonth && <span className="text-[10px] bg-green-600 text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider font-bold shadow-sm">Current</span>}
                </div>
                <div className={`text-xs font-bold inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white ${monthData.color} border ${monthData.border} shadow-sm`}>
                  <Icon size={14} /> {monthData.weather}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 space-y-5">
                
                {/* General Activities */}
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Activities
                  </p>
                  <ul className="space-y-2">
                    {monthData.activities.map((task, i) => (
                      <li key={i} className={`text-sm flex items-start gap-2 leading-tight ${isCurrentMonth ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${isCurrentMonth ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Spraying Section (Only renders if there are spray tasks) */}
                {monthData.spraying.length > 0 && (
                  <div className="bg-red-50/50 p-3 rounded-xl border border-red-100">
                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                      <ShieldAlert size={12} /> Spray Program
                    </p>
                    <ul className="space-y-2">
                      {monthData.spraying.map((spray, i) => (
                        <li key={i} className="text-sm text-red-900 font-medium flex items-start gap-2 leading-tight">
                          <Bug size={14} className="mt-0.5 flex-shrink-0 text-red-400" />
                          {spray}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Fertilizer Section (Only renders if there is fertilizer data) */}
                {monthData.fertilizer && (
                  <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                      <Sprout size={12} /> Fertilizer & Soil
                    </p>
                    <p className="text-sm text-blue-900 font-medium leading-tight pl-4 border-l-2 border-blue-200 ml-1">
                      {monthData.fertilizer}
                    </p>
                  </div>
                )}

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}