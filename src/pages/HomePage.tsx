import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { AnimatedHeading } from '../components/AnimatedHeading';
import { FadeIn } from '../components/FadeIn';
import { getLiveDelhiGridStatus } from '../services/api';
import { Zap, ShieldCheck, Cpu, ArrowRight, Sun, TrendingUp, Compass, BarChart3 } from 'lucide-react';

export const HomePage = () => {
  const [gridData, setGridData] = useState(getLiveDelhiGridStatus());

  useEffect(() => {
    const timer = setInterval(() => {
      setGridData(getLiveDelhiGridStatus());
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const horizons = [
    {
      title: '15 Min – 6 Hours',
      badge: 'Operational Awareness',
      tag: 'Real-time Demand + Peak + Ramp',
      desc: 'High-frequency intra-day predictions capturing sudden heatwave demand surges and ramp rate shifts for instant grid balancing.',
      icon: Zap,
      accent: 'border-cyan-500/40 text-cyan-400 bg-cyan-950/20',
      buttonText: 'View Short-Term',
    },
    {
      title: '1 – 7 Days ⭐',
      badge: 'OpenSTEF Core',
      tag: 'Primary Procurement Horizon',
      desc: 'Day-ahead electricity demand forecasting powered by OpenSTEF machine learning pipelines, weather integration, and calendar features.',
      icon: Cpu,
      accent: 'border-emerald-500/50 text-emerald-400 bg-emerald-950/30 ring-1 ring-emerald-500/20',
      buttonText: 'View Day-Ahead',
    },
    {
      title: '1 – 5 Years',
      badge: 'Infrastructure Planning',
      tag: 'Macro-Spatial Zonal Growth',
      desc: 'Long-term demand forecasting modeling EV adoption rates, rooftop solar penetration, and urban development across Delhi DISCOM zones.',
      icon: Compass,
      accent: 'border-amber-500/40 text-amber-400 bg-amber-950/20',
      buttonText: 'View Zonal Growth',
    },
  ];

  return (
    <div className="relative w-full min-h-screen flex flex-col justify-between overflow-hidden bg-black text-white">
      {/* Video Background (Raw video with no dark/gradient overlay) */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4"
      />

      {/* Hero Content (Bottom of Viewport) */}
      <div className="relative z-10 w-full px-6 md:px-12 lg:px-16 flex-1 flex flex-col justify-end pt-32 pb-12 lg:pb-16">
        <div className="w-full lg:grid lg:grid-cols-12 lg:items-end gap-8">
          
          {/* Left Main Content */}
          <div className="lg:col-span-8 flex flex-col items-start">
            {/* Tag pill */}
            <FadeIn delay={100} duration={800}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-4">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                Delhi SLDC Grid Intelligence
              </div>
            </FadeIn>

            {/* Character-by-Character Heading */}
            <AnimatedHeading
              text={"Predict. Prepare.\nPower Delhi."}
              initialDelay={200}
              charDelay={30}
              duration={500}
              className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-normal mb-4 text-white"
            />

            {/* Subheading with FadeIn */}
            <FadeIn delay={800} duration={1000}>
              <p className="text-base md:text-xl text-gray-300 mb-6 max-w-2xl font-light leading-relaxed">
                AI-powered multi-horizon demand forecasting and spatial power grid intelligence for Delhi.
                Equipping power dispatchers to manage extreme heatwaves and renewable energy transitions.
              </p>
            </FadeIn>

            {/* Buttons Row */}
            <FadeIn delay={1200} duration={1000}>
              <div className="flex flex-wrap gap-4 items-center mb-6">
                <NavLink
                  to="/forecast"
                  className="bg-white text-black px-8 py-3.5 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 shadow-xl shadow-white/10 flex items-center gap-2"
                >
                  Explore AI Forecasts <ArrowRight className="w-4 h-4" />
                </NavLink>
                <NavLink
                  to="/simulator"
                  className="liquid-glass border border-white/20 text-white px-8 py-3.5 rounded-lg font-medium hover:bg-white hover:text-black transition-colors duration-300 flex items-center gap-2"
                >
                  Launch Scenario Simulator
                </NavLink>
              </div>
            </FadeIn>
          </div>

          {/* Right Column - Delhi Live Grid Status Card */}
          <div className="lg:col-span-4 flex items-end justify-start lg:justify-end mt-8 lg:mt-0">
            <FadeIn delay={1400} duration={1000} className="w-full">
              <div className="liquid-glass border border-white/20 p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Delhi Grid Live Status
                  </div>
                  <span className="text-[11px] text-gray-400">{gridData.lastUpdated}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <div className="text-[11px] text-gray-400 font-medium">Current Demand</div>
                    <div className="text-xl font-bold text-cyan-400 mt-0.5">
                      {gridData.currentLoadMW.toLocaleString()} <span className="text-xs text-gray-300 font-normal">MW</span>
                    </div>
                  </div>

                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <div className="text-[11px] text-gray-400 font-medium">Peak Demand Today</div>
                    <div className="text-xl font-bold text-emerald-400 mt-0.5">
                      {gridData.peakLoadTodayMW.toLocaleString()} <span className="text-xs text-gray-300 font-normal">MW</span>
                    </div>
                  </div>

                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <div className="text-[11px] text-gray-400 font-medium">Frequency</div>
                    <div className="text-xl font-bold text-amber-400 mt-0.5">
                      {gridData.frequencyHz} <span className="text-xs text-gray-300 font-normal">Hz</span>
                    </div>
                  </div>

                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <div className="text-[11px] text-gray-400 font-medium">Rooftop Solar</div>
                    <div className="text-xl font-bold text-yellow-300 mt-0.5">
                      {gridData.solarGenerationMW} <span className="text-xs text-gray-300 font-normal">MW</span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-gray-400 flex items-center justify-between pt-1">
                  <span>DISCOM Operational Health:</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                    {gridData.gridHealth}
                  </span>
                </div>
              </div>
            </FadeIn>
          </div>

        </div>

        {/* 3 Forecasting Horizons Cards Overview */}
        <div className="mt-16 pt-8 border-t border-white/10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Multi-Horizon Forecasting Architecture</h2>
              <p className="text-sm text-gray-400 mt-1">Specialized AI engines tailored for real-time operations, power scheduling, and zonal growth</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {horizons.map((h) => {
              const IconComp = h.icon;
              return (
                <div
                  key={h.title}
                  className={`liquid-glass p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:border-white/30 flex flex-col justify-between ${h.accent}`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2.5 rounded-xl bg-white/10 text-white">
                        <IconComp className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/10 text-white uppercase tracking-wider">
                        {h.badge}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-1">{h.title}</h3>
                    <div className="text-xs font-semibold text-cyan-300 mb-3">{h.tag}</div>
                    <p className="text-sm text-gray-300 leading-relaxed font-light mb-6">
                      {h.desc}
                    </p>
                  </div>

                  <NavLink
                    to="/forecast"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-white hover:text-cyan-300 transition-colors pt-4 border-t border-white/10"
                  >
                    {h.buttonText} <ArrowRight className="w-3.5 h-3.5" />
                  </NavLink>
                </div>
              );
            })}
          </div>
        </div>

        {/* Features & Pillars */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-cyan-400 shrink-0" />
            <div>
              <div className="text-sm font-semibold text-white">OpenSTEF Engine</div>
              <div className="text-xs text-gray-400">Battle-tested Day-Ahead ML pipeline</div>
            </div>
          </div>

          <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center gap-3">
            <Sun className="w-8 h-8 text-yellow-400 shrink-0" />
            <div>
              <div className="text-sm font-semibold text-white">Duck Curve Ramping</div>
              <div className="text-xs text-gray-400">Solar net-demand ramp prediction</div>
            </div>
          </div>

          <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-emerald-400 shrink-0" />
            <div>
              <div className="text-sm font-semibold text-white">DISCOM Zonal Heatmaps</div>
              <div className="text-xs text-gray-400">BRPL, BYPL, TPDDL load tracking</div>
            </div>
          </div>

          <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center gap-3">
            <Cpu className="w-8 h-8 text-amber-400 shrink-0" />
            <div>
              <div className="text-sm font-semibold text-white">AI Scenario Simulator</div>
              <div className="text-xs text-gray-400">Real-time heatwave & EV stress tests</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
