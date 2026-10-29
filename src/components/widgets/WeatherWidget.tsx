import React, { useState } from 'react';
import { Sun, CloudRain, CloudSun, Wind } from 'lucide-react';

interface WeatherData {
  city: string;
  temperature: number;
  condition: 'sunny' | 'rainy' | 'partly-cloudy';
  humidity: number;
}

export const WeatherWidget: React.FC = () => {
  const [data] = useState<WeatherData>({
    city: 'São Paulo',
    temperature: 24,
    condition: 'sunny',
    humidity: 65,
  });

  const renderIcon = () => {
    switch (data.condition) {
      case 'sunny':
        return <Sun className="w-4 h-4 text-amber-300 animate-spin-slow" />;
      case 'rainy':
        return <CloudRain className="w-4 h-4 text-blue-300" />;
      case 'partly-cloudy':
        return <CloudSun className="w-4 h-4 text-amber-200" />;
      default:
        return <Sun className="w-4 h-4 text-amber-300" />;
    }
  };

  return (
    <div 
      className="flex items-center gap-2 px-3 h-12 min-w-[130px] rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 transition-all duration-200 cursor-pointer shadow-sm group select-none"
      title={`Clima em ${data.city}: ${data.temperature}°C, Umidade: ${data.humidity}%`}
    >
      <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500/20 to-orange-400/20 border border-amber-300/20 shadow-inner flex-shrink-0">
        {renderIcon()}
      </div>

      <div className="flex flex-col flex-grow min-w-0">
        <div className="flex items-baseline gap-1">
          <span className="text-sm font-bold text-white leading-none">
            {data.temperature}°
          </span>
          <span className="text-[10px] text-white/70 font-medium truncate">
            {data.city}
          </span>
        </div>
        
        <div className="flex items-center gap-1 mt-0.5 text-white/50 text-[9px]">
          <Wind className="w-2.5 h-2.5" />
          <span>{data.humidity}% umid.</span>
        </div>
      </div>
    </div>
  );
};
