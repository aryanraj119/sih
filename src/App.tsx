import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { HomePage } from './pages/HomePage';
import { ForecastPage } from './pages/ForecastPage';
import { PowerIntelligencePage } from './pages/PowerIntelligencePage';
import { SolarGridPage } from './pages/SolarGridPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { ModelIntelligencePage } from './pages/ModelIntelligencePage';

export function App() {
  return (
    <BrowserRouter>
      <div className="w-full min-h-screen bg-black text-white font-sans antialiased flex flex-col justify-between selection:bg-cyan-500 selection:text-black">
        {/* Top Header Navbar */}
        <Navbar />

        {/* Main Content View Container */}
        <main className="flex-1 w-full">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/forecast" element={<ForecastPage />} />
            <Route path="/power-intelligence" element={<PowerIntelligencePage />} />
            <Route path="/solar-grid" element={<SolarGridPage />} />
            <Route path="/simulator" element={<SimulatorPage />} />
            <Route path="/model" element={<ModelIntelligencePage />} />
            <Route path="/model-intelligence" element={<Navigate to="/model" replace />} />
          </Routes>
        </main>

        {/* Global Footer */}
        <footer className="w-full border-t border-white/10 py-6 px-6 md:px-12 text-xs text-gray-500 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">URJADRISHTI (ऊर्जादृष्टि)</span>
            <span>— AI-Powered Energy Intelligence for Delhi</span>
          </div>
          <div className="flex items-center gap-6 text-gray-400">
            <span>Tagline: "Predict. Prepare. Power Delhi."</span>
            <span>OpenSTEF Adapter Engine</span>
            <span>© 2026 UrjaDrishti</span>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
