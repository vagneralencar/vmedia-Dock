import React, { useEffect, useState } from 'react';
import { CalendarPopover } from './CalendarPopover';

export const ClockWidget: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const weekday = time.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toUpperCase();
  const day = time.getDate();

  return (
    <div className="relative">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex flex-col items-center justify-center w-12 h-12 rounded-2xl backdrop-blur-md border transition-all duration-200 cursor-pointer group shadow-sm ${
          isOpen ? 'bg-blue-500/20 border-blue-400/50' : 'bg-white/10 hover:bg-white/15 border-white/20'
        }`}
        title="Clique para abrir o calendário"
      >
        <div className="text-[10px] font-bold text-red-400 leading-tight tracking-wider">{weekday}</div>
        <div className="text-sm font-semibold text-white/95 leading-none">{hours}</div>
        <div className="text-[9px] font-medium text-white/60 leading-tight">Dia {day}</div>
      </div>

      {isOpen && <CalendarPopover onClose={() => setIsOpen(false)} />}
    </div>
  );
};
