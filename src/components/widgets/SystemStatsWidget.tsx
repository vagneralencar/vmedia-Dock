import React, { useEffect } from 'react';
import { useDockStore } from '../../stores/dockStore';
import { Cpu, MemoryStick } from 'lucide-react';

export const SystemStatsWidget: React.FC = () => {
  const { metrics, updateMetrics } = useDockStore();

  useEffect(() => {
    updateMetrics();
    // Atualização eficiente a cada 3 segundos para economizar energia
    const interval = setInterval(updateMetrics, 3000);
    return () => clearInterval(interval);
  }, [updateMetrics]);

  const cpu = metrics?.cpu_usage ? Math.round(metrics.cpu_usage) : 12;
  const ram = metrics?.memory_percentage ? Math.round(metrics.memory_percentage) : 48;

  // Cor baseada na carga (verde -> amarelo -> vermelho)
  const getLoadColor = (value: number) => {
    if (value > 80) return 'text-rose-400 stroke-rose-400';
    if (value > 60) return 'text-amber-400 stroke-amber-400';
    return 'text-emerald-400 stroke-emerald-400';
  };

  return (
    <div 
      className="flex flex-col items-center justify-between p-1.5 w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 transition-all duration-200 cursor-pointer shadow-sm group"
      title={`CPU: ${cpu}% | RAM: ${ram}%`}
    >
      <div className="flex items-center gap-1 w-full justify-center">
        <Cpu className="w-2.5 h-2.5 text-white/60" />
        <span className={`text-[10px] font-bold ${getLoadColor(cpu)}`}>{cpu}%</span>
      </div>

      {/* Mini barras de progresso duplas */}
      <div className="w-full space-y-1 px-1">
        <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-400 transition-all duration-500 rounded-full"
            style={{ width: `${Math.min(cpu, 100)}%` }}
          />
        </div>
        <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
          <div 
            className="h-full bg-sky-400 transition-all duration-500 rounded-full"
            style={{ width: `${Math.min(ram, 100)}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-1 w-full justify-center">
        <MemoryStick className="w-2.5 h-2.5 text-white/60" />
        <span className="text-[10px] font-bold text-sky-300">{ram}%</span>
      </div>
    </div>
  );
};
