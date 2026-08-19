import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { getLiveDelhiGridStatus } from '../../services/api';
import { Zap, Menu, X, Activity } from 'lucide-react';

export const Navbar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [gridStatus, setGridStatus] = useState(getLiveDelhiGridStatus());
  const location = useLocation();

  // Periodically update live ticker data
  useEffect(() => {
    const interval = setInterval(() => {
      setGridStatus(getLiveDelhiGridStatus());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'AI Forecast', path: '/forecast' },
    { label: 'Power Intelligence', path: '/power-intelligence' },
    { label: 'Solar & Grid', path: '/solar-grid' },
    { label: 'AI Simulator', path: '/simulator' },
    { label: 'Model Intelligence', path: '/model-intelligence' },
  ];

  return (
    <header className="w-full px-4 md:px-8 lg:px-12 pt-5 relative z-50">
      <nav className="liquid-glass rounded-xl px-5 py-3 flex items-center justify-between border border-white/10">
        
        {/* Brand Logo & Tag */}
        <NavLink to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center text-black font-bold shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5 fill-black" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                URJADRISHTI
              </span>
              <span className="text-xs font-semibold text-cyan-400/90 tracking-widest uppercase">
                ऊर्जादृष्टि
              </span>
            </div>
            <span className="text-[10px] text-gray-400 tracking-wider">
              AI ENERGY INTELLIGENCE FOR DELHI
            </span>
          </div>
        </NavLink>

        {/* Live Grid Status Ticker (Desktop) */}
        <div className="hidden xl:flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-gray-300 font-medium flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            Delhi Load: <strong className="text-white">{gridStatus.currentLoadMW.toLocaleString()} MW</strong>
          </span>
          <span className="text-gray-600">|</span>
          <span className="text-gray-300">
            Freq: <strong className="text-emerald-400">{gridStatus.frequencyHz} Hz</strong>
          </span>
        </div>

        {/* Center: Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-6">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }: { isActive: boolean }) =>
                `text-xs font-medium transition-all duration-200 py-1 px-2 rounded-md ${
                  isActive
                    ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Right CTA Button */}
        <div className="hidden sm:flex items-center gap-3">
          <NavLink
            to="/forecast"
            className="bg-gradient-to-r from-cyan-400 to-emerald-400 text-black px-4 py-2 rounded-lg text-xs font-semibold hover:brightness-110 transition-all cursor-pointer shadow-md shadow-cyan-500/10 flex items-center gap-1.5"
          >
            Launch Forecast
          </NavLink>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="lg:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden mt-3 liquid-glass rounded-xl p-4 border border-white/10 flex flex-col gap-2 animate-fadeIn">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }: { isActive: boolean }) =>
                `text-sm font-medium py-2.5 px-3 rounded-lg transition-colors ${
                  isActive
                    ? 'text-cyan-400 bg-cyan-950/50 border border-cyan-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <NavLink
            to="/forecast"
            className="mt-2 bg-gradient-to-r from-cyan-400 to-emerald-400 text-black py-2.5 rounded-lg text-center font-semibold text-sm"
          >
            Launch Forecast Dashboard
          </NavLink>
        </div>
      )}
    </header>
  );
};
