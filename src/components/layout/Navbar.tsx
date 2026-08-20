import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { getLiveDelhiGridStatus } from '../../services/api';
import { DataModeBadge } from '../dashboard/DataModeBadge';
import { useDate } from '../../context/DateContext';
import { UrjadrishtiLogoIcon } from '../common/UrjadrishtiLogoIcon';
import { Menu, X, Activity, Calendar } from 'lucide-react';

export const Navbar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [gridStatus, setGridStatus] = useState(getLiveDelhiGridStatus());
  const { selectedDate, setSelectedDate } = useDate();
  const location = useLocation();

  useEffect(() => {
    const interval = setInterval(() => {
      setGridStatus(getLiveDelhiGridStatus());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'AI Forecast', path: '/forecast' },
    { label: 'Power Intelligence', path: '/power-intelligence' },
    { label: 'Solar & Grid', path: '/solar-grid' },
    { label: 'AI Simulator', path: '/simulator' },
    { label: 'Model Intelligence', path: '/model' },
  ];

  // Helper to parse Year, Month, Day from selectedDate (YYYY-MM-DD)
  const dateParts = selectedDate.split('-');
  const currYear = dateParts[0] || '2026';
  const currMonth = dateParts[1] || '08';
  const currDay = dateParts[2] || '20';

  const months = [
    { value: '01', name: 'Jan (January)' },
    { value: '02', name: 'Feb (February)' },
    { value: '03', name: 'Mar (March)' },
    { value: '04', name: 'Apr (April)' },
    { value: '05', name: 'May (May)' },
    { value: '06', name: 'Jun (Summer Peak June)' },
    { value: '07', name: 'Jul (Monsoon July)' },
    { value: '08', name: 'Aug (Peak August)' },
    { value: '09', name: 'Sep (September)' },
    { value: '10', name: 'Oct (October)' },
    { value: '11', name: 'Nov (November)' },
    { value: '12', name: 'Dec (December)' },
  ];

  const handleMonthChange = (newMonth: string) => {
    setSelectedDate(`${currYear}-${newMonth}-${currDay}`);
  };

  const handleDayChange = (newDay: string) => {
    const formattedDay = newDay.padStart(2, '0');
    setSelectedDate(`${currYear}-${currMonth}-${formattedDay}`);
  };

  return (
    <header className="w-full px-4 md:px-8 lg:px-12 pt-4 relative z-50">
      <nav className="liquid-glass rounded-2xl px-5 py-3 flex items-center justify-between border border-white/10 shadow-2xl">
        
        {/* Official URJADRISHTI Brand Logo & Tag */}
        <NavLink to="/" className="flex items-center gap-3 group shrink-0">
          <div className="h-11 px-2.5 py-1 rounded-xl bg-black/80 flex items-center justify-center border border-cyan-500/50 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <UrjadrishtiLogoIcon className="h-8 w-auto object-contain" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-extrabold tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                URJADRISHTI
              </span>
              <span className="text-xs font-semibold text-cyan-400/90 tracking-widest uppercase">
                ऊर्जादृष्टि
              </span>
            </div>
            <span className="text-[9px] text-gray-400 tracking-wider uppercase">
              Predict. Prepare. Power Delhi.
            </span>
          </div>
        </NavLink>

        {/* ULTRA-EASY 2026 CALENDAR & DATE SELECTOR CONTROL */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-xs shadow-xl backdrop-blur-md relative">
          <Calendar className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
          
          <div className="flex items-center gap-1.5">
            <span className="text-gray-300 font-extrabold text-[11px] hidden sm:inline">2026 Date:</span>
            
            {/* MONTH SELECTOR DROPDOWN */}
            <select
              value={currMonth}
              onChange={(e) => handleMonthChange(e.target.value)}
              className="bg-black text-amber-300 font-bold text-xs px-2.5 py-1.5 rounded-lg border border-cyan-500/50 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              {months.map((m) => (
                <option key={m.value} value={m.value} className="bg-gray-900 text-white">
                  {m.name}
                </option>
              ))}
            </select>

            {/* DAY SELECTOR DROPDOWN */}
            <select
              value={currDay}
              onChange={(e) => handleDayChange(e.target.value)}
              className="bg-black text-cyan-300 font-bold text-xs px-2 py-1.5 rounded-lg border border-cyan-500/50 focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              {Array.from({ length: 31 }, (_, i) => {
                const dayVal = (i + 1).toString().padStart(2, '0');
                return (
                  <option key={dayVal} value={dayVal} className="bg-gray-900 text-white">
                    Day {i + 1}
                  </option>
                );
              })}
            </select>

            {/* NATIVE CALENDAR PICKER OVERRIDE WITH DARK SCHEME */}
            <input
              type="date"
              min="2026-01-01"
              max="2026-12-31"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="[color-scheme:dark] bg-black text-yellow-300 font-mono font-bold text-xs px-2 py-1.5 rounded-lg border border-amber-500/40 focus:outline-none cursor-pointer w-32 hidden md:block"
            />
          </div>

          {/* QUICK PRESET SEASONAL BUTTONS */}
          <div className="hidden xl:flex items-center gap-1.5 ml-2 border-l border-white/15 pl-2">
            <button
              type="button"
              onClick={() => setSelectedDate('2026-06-15')}
              className={`px-2 py-1 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                selectedDate === '2026-06-15'
                  ? 'bg-amber-500 text-black border-amber-400 font-extrabold'
                  : 'bg-white/5 text-amber-300 border-white/10 hover:bg-white/10'
              }`}
            >
              🔥 Jun 15
            </button>
            <button
              type="button"
              onClick={() => setSelectedDate('2026-07-20')}
              className={`px-2 py-1 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                selectedDate === '2026-07-20'
                  ? 'bg-cyan-500 text-black border-cyan-400 font-extrabold'
                  : 'bg-white/5 text-cyan-300 border-white/10 hover:bg-white/10'
              }`}
            >
              🌧️ Jul 20
            </button>
            <button
              type="button"
              onClick={() => setSelectedDate('2026-08-20')}
              className={`px-2 py-1 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                selectedDate === '2026-08-20'
                  ? 'bg-rose-500 text-white border-rose-400 font-extrabold shadow-md'
                  : 'bg-white/5 text-rose-300 border-white/10 hover:bg-white/10'
              }`}
            >
              ⚡ Aug 20
            </button>
          </div>
        </div>

        {/* Live Grid Status Ticker & Demo Mode Badge */}
        <div className="hidden xl:flex items-center gap-3">
          <DataModeBadge isDemoMode={true} />
          
          <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-gray-300 font-medium flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              Demand: <strong className="text-white">{gridStatus.currentLoadMW.toLocaleString()} MW</strong>
            </span>
          </div>
        </div>

        {/* Center: Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }: { isActive: boolean }) =>
                `text-xs font-semibold transition-all duration-200 py-1.5 px-3 rounded-lg ${
                  isActive
                    ? 'text-cyan-300 bg-cyan-950/80 border border-cyan-400/50 shadow-md shadow-cyan-500/20'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="lg:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer"
        >
          {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

      </nav>

      {/* Mobile Drawer Menu */}
      {isMobileOpen && (
        <div className="lg:hidden absolute top-full left-4 right-4 mt-2 liquid-glass rounded-2xl p-5 border border-white/10 shadow-2xl z-50 flex flex-col gap-3">
          
          <div className="p-3.5 rounded-xl bg-cyan-950/90 border border-cyan-500/50 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-gray-300">
              <span className="font-bold flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-400" /> 2026 Date Selector
              </span>
              <span className="text-yellow-300 font-mono font-extrabold">{selectedDate}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <select
                value={currMonth}
                onChange={(e) => handleMonthChange(e.target.value)}
                className="bg-black text-amber-300 font-bold text-xs p-2 rounded-lg border border-cyan-500/50"
              >
                {months.map((m) => (
                  <option key={m.value} value={m.value} className="bg-gray-900 text-white">
                    {m.name}
                  </option>
                ))}
              </select>

              <select
                value={currDay}
                onChange={(e) => handleDayChange(e.target.value)}
                className="bg-black text-cyan-300 font-bold text-xs p-2 rounded-lg border border-cyan-500/50"
              >
                {Array.from({ length: 31 }, (_, i) => {
                  const dayVal = (i + 1).toString().padStart(2, '0');
                  return (
                    <option key={dayVal} value={dayVal} className="bg-gray-900 text-white">
                      Day {i + 1}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `text-sm font-semibold py-2.5 px-4 rounded-xl transition-all ${
                  isActive ? 'bg-cyan-500 text-black font-bold' : 'text-gray-300 hover:bg-white/10'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
};
