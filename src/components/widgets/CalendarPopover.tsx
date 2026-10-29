import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';

interface CalendarPopoverProps {
  onClose?: () => void;
}

export const CalendarPopover: React.FC<CalendarPopoverProps> = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const today = new Date();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const daysOfWeek = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  // Primeiro dia do mês e total de dias
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const prevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const isToday = (dayNumber: number) => {
    return (
      dayNumber === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  // Preenche a grade
  const daysCells = [];
  for (let i = 0; i < firstDayIndex; i++) {
    daysCells.push(<div key={`empty-${i}`} className="w-7 h-7" />);
  }

  for (let day = 1; day <= totalDays; day++) {
    const isCurrent = isToday(day);
    daysCells.push(
      <button
        key={`day-${day}`}
        onClick={(e) => e.stopPropagation()}
        className={`w-7 h-7 flex items-center justify-center rounded-xl text-xs font-semibold transition-all ${
          isCurrent
            ? 'bg-blue-500 text-white shadow-md shadow-blue-500/40 ring-1 ring-blue-300'
            : 'text-white/80 hover:bg-white/10 hover:text-white'
        }`}
      >
        {day}
      </button>
    );
  }

  return (
    <div 
      className="absolute bottom-16 left-1/2 -translate-x-1/2 w-64 p-3.5 rounded-2xl bg-neutral-900/95 border border-white/20 shadow-2xl backdrop-blur-2xl text-white select-none z-50 animate-fade-in"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Cabeçalho do Calendário */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
        <div className="flex items-center gap-1.5 text-xs font-bold text-white">
          <CalendarIcon className="w-3.5 h-3.5 text-blue-400" />
          <span>{monthNames[month]} {year}</span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={prevMonth}
            className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={nextMonth}
            className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Dias da Semana */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {daysOfWeek.map((d, idx) => (
          <span key={idx} className="text-[10px] font-bold text-white/40">
            {d}
          </span>
        ))}
      </div>

      {/* Grade de Dias */}
      <div className="grid grid-cols-7 gap-1 justify-items-center">
        {daysCells}
      </div>

      {/* Rodapé com Hora ao Vivo */}
      <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-white/60">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-emerald-400" />
          <span>Horário de Brasília</span>
        </div>
        <span className="font-semibold text-white/90">
          {today.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};
