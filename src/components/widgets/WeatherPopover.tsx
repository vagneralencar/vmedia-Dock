import React from 'react';
import { Sun, CloudRain, CloudSun, Wind, Droplets, MapPin } from 'lucide-react';

interface WeatherForecast {
  day: string;
  tempMax: number;
  tempMin: number;
  condition: 'sunny' | 'rainy' | 'partly-cloudy';
}

interface WeatherPopoverProps {
  onClose?: () => void;
  city: string;
  temperature: number;
}

export const WeatherPopover: React.FC<WeatherPopoverProps> = ({ city, temperature }) => {
  const forecast: WeatherForecast[] = [
    { day: 'Hoje', tempMax: 26, tempMin: 18, condition: 'sunny' },
    { day: 'Amanhã', tempMax: 24, tempMin: 17, condition: 'partly-cloudy' },
    { day: 'Sex', tempMax: 22, tempMin: 16, condition: 'rainy' },
    { day: 'Sáb', tempMax: 25, tempMin: 18, condition: 'sunny' },
    { day: 'Dom', tempMax: 27, tempMin: 19, condition: 'sunny' },
  ];

  const getConditionIcon = (condition: WeatherForecast['condition']) => {
    switch (condition) {
      case 'sunny':
        return <Sun className="w-4 h-4 text-amber-400" />;
      case 'rainy':
        return <CloudRain className="w-4 h-4 text-blue-400" />;
      case 'partly-cloudy':
        return <CloudSun className="w-4 h-4 text-amber-300" />;
    }
  };

  return (
    <div 
      className="absolute bottom-16 left-1/2 -translate-x-1/2 w-64 p-3.5 rounded-2xl bg-neutral-900/95 border border-white/20 shadow-2xl backdrop-blur-2xl text-white select-none z-50 animate-fade-in"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Cabeçalho */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-rose-400" />
          <span className="text-xs font-bold text-white">{city}</span>
        </div>
        <span className="text-xs text-white/50">Brasil</span>
      </div>

      {/* Condição Atual Detalhada */}
      <div className="flex items-center justify-between my-3 px-1">
        <div>
          <div className="text-3xl font-extrabold text-white leading-none">
            {temperature}°C
          </div>
          <div className="text-[11px] text-amber-300 font-medium mt-1">Céu limpo e ensolarado</div>
        </div>
        <div className="flex flex-col gap-1 text-[10px] text-white/60">
          <div className="flex items-center gap-1">
            <Droplets className="w-3 h-3 text-cyan-400" />
            <span>65% umidade</span>
          </div>
          <div className="flex items-center gap-1">
            <Wind className="w-3 h-3 text-emerald-400" />
            <span>12 km/h vento</span>
          </div>
        </div>
      </div>

      {/* Previsão para os Próximos Dias */}
      <div className="pt-2 border-t border-white/10 space-y-1.5">
        <div className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1">
          Previsão 5 Dias
        </div>
        {forecast.map((f, i) => (
          <div key={i} className="flex items-center justify-between py-0.5 text-xs">
            <span className="w-14 text-white/70 font-medium text-[11px]">{f.day}</span>
            <div className="flex items-center justify-center w-6">
              {getConditionIcon(f.condition)}
            </div>
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="font-semibold text-white">{f.tempMax}°</span>
              <span className="text-white/40">{f.tempMin}°</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
