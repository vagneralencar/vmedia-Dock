import React, { useState, useEffect } from 'react';
import { Timer, Play, Pause, RotateCcw } from 'lucide-react';

export const PomodoroWidget: React.FC = () => {
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => setSecondsLeft((sec) => sec - 1), 1000);
    } else if (secondsLeft === 0) {
      setIsActive(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, secondsLeft]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsActive(!isActive);
  };

  const reset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsActive(false);
    setSecondsLeft(25 * 60);
  };

  return (
    <div 
      className="flex flex-col items-center justify-center p-1 w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 transition-all duration-200 cursor-pointer shadow-sm group"
      title={`Pomodoro: ${formattedTime}`}
    >
      <div className="flex items-center gap-0.5 text-amber-400">
        <Timer className="w-2.5 h-2.5" />
        <span className="text-[10px] font-semibold">Foco</span>
      </div>

      <div className="text-[11px] font-bold text-white tracking-tight my-0.5">
        {formattedTime}
      </div>

      <div className="flex items-center gap-1 text-white/60 group-hover:text-white">
        <button onClick={toggle} className="hover:scale-110 active:scale-90 transition-transform">
          {isActive ? <Pause className="w-2.5 h-2.5 text-amber-300" /> : <Play className="w-2.5 h-2.5" />}
        </button>
        <button onClick={reset} className="hover:scale-110 active:scale-90 transition-transform">
          <RotateCcw className="w-2.5 h-2.5" />
        </button>
      </div>
    </div>
  );
};
