import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { getLiveDelhiGridStatus } from '../../services/api';
import { DataModeBadge } from '../dashboard/DataModeBadge';
import { useDate } from '../../context/DateContext';
import { Zap, Menu, X, Activity, Calendar } from 'lucide-react';

export const Navbar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [gridStatus, setGridStatus] = useState(getLiveDelhiGridStatus());
  const { selectedDate, setSelectedDate, presetDates } = useDate();
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

  return (
    <header className="w-full px-4 md:px-8 lg:px-12 pt-4 relative z-50">
      <nav className="liquid-glass rounded-2xl px-5 py-3 flex items-center justify-between border border-white/10 shadow-2xl">
        
        {/* Brand Logo & Tag */}
        <NavLink to="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center text-black font-bold shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5 fill-black" />
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

        {/* Global 2026 Calendar & Date Selector */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-950/70 border border-cyan-500/40 text-xs shadow-lg backdrop-blur-md">
          <Calendar className="w-4 h-4 text-cyan-400 shrink-0 animate-pulse" />
          <span className="text-gray-300 font-bold text-[11px] hidden sm:inline">2026 Calendar:</span>
          
          {/* Interactive Date Picker */}
          <input
            type="date"
            min="2026-01-01"
            max="2026-12-31"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-black/90 text-yellow-300 font-mono font-bold text-xs px-2.5 py-1 rounded-lg border border-cyan-500/50 focus:outline-none focus:border-yellow-400 cursor-pointer shadow-inner"
          />

          {/* Quick Preset Selector Dropdown */}
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="hidden md:block bg-black/80 text-cyan-300 font-semibold text-[11px] px-2 py-1 rounded-lg border border-cyan-500/30 focus:outline-none cursor-pointer"
          >
            {presetDates.map((p) => (
              <option key={p.date} value={p.date} className="bg-gray-900 text-white">
                {p.label}
              </option>
            ))}
          </select>
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
          
          <div className="p-3 rounded-xl bg-cyan-950/70 border border-cyan-500/40 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-gray-300">
              <span className="font-bold flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-cyan-400" /> 2026 Calendar Simulator
              </span>
              <span className="text-yellow-300 font-mono font-bold">{selectedDate}</span>
            </div>
            <input
              type="date"
              min="2026-01-01"
              max="2026-12-31"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-black text-yellow-300 font-mono font-bold text-xs p-2 rounded-lg border border-cyan-500/50"
            />
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
