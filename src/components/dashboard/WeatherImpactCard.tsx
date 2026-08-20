import { Thermometer, Droplets, Wind, CloudRain } from 'lucide-react';

interface WeatherImpactCardProps {
  temperatureC: number;
  humidityPercent: number;
  rainfallMm?: number;
  windSpeedKmh?: number;
  className?: string;
}

export const WeatherImpactCard = ({
  temperatureC,
  humidityPercent,
  rainfallMm = 0.0,
  windSpeedKmh = 14.2,
  className = '',
}: WeatherImpactCardProps) => {
  return (
    <div className={`liquid-glass p-4 rounded-xl border border-white/10 ${className}`}>
      <div className="flex items-center justify-between text-xs text-gray-400 font-medium mb-2 border-b border-white/10 pb-2">
        <span>Delhi Weather Drivers</span>
        <Thermometer className="w-3.5 h-3.5 text-amber-400" />
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <div className="text-gray-400 text-[10px]">Temperature</div>
          <div className="text-base font-bold text-amber-400 flex items-center gap-1">
            <Thermometer className="w-3 h-3" /> {temperatureC} °C
          </div>
        </div>

        <div>
          <div className="text-gray-400 text-[10px]">Humidity</div>
          <div className="text-base font-bold text-cyan-400 flex items-center gap-1">
            <Droplets className="w-3 h-3" /> {humidityPercent} %
          </div>
        </div>

        <div>
          <div className="text-gray-400 text-[10px]">Wind Speed</div>
          <div className="text-base font-bold text-gray-200 flex items-center gap-1">
            <Wind className="w-3 h-3" /> {windSpeedKmh} km/h
          </div>
        </div>

        <div>
          <div className="text-gray-400 text-[10px]">Rainfall</div>
          <div className="text-base font-bold text-emerald-400 flex items-center gap-1">
            <CloudRain className="w-3 h-3" /> {rainfallMm} mm
          </div>
        </div>
      </div>
    </div>
  );
};
