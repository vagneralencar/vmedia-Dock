import React, { useEffect, useState } from 'react';

export const ClockWidget: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const weekday = time.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toUpperCase();
  const day = time.getDate();

  return (
    <div 
      className="flex flex-col items-center justify-center w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 transition-all duration-200 cursor-pointer group shadow-sm"
      title="Calendário e Horário"
    >
      <div className="text-[10px] font-bold text-red-400 leading-tight tracking-wider">{weekday}</div>
      <div className="text-sm font-semibold text-white/95 leading-none">{hours}</div>
      <div className="text-[9px] font-medium text-white/60 leading-tight">Dia {day}</div>
    </div>
  );
};
