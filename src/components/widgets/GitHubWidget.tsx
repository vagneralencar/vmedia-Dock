import React from 'react';
import { GitPullRequest } from 'lucide-react';

export const GitHubWidget: React.FC = () => {
  const contributionsCount = 1420;
  const pendingPRs = 2;

  // Grade horizontal: 9 colunas (semanas) x 4 linhas (dias)
  // Altura total: 4 * 6px + 3 * 2px = 30px (ajuste perfeito dentro dos 48px de altura da barra)
  const columns = [
    [1, 2, 0, 1],
    [0, 1, 3, 2],
    [2, 3, 1, 0],
    [1, 0, 4, 3],
    [0, 2, 1, 2],
    [3, 4, 2, 1],
    [2, 1, 3, 4],
    [1, 3, 2, 0],
    [2, 4, 3, 1],
  ];

  const getColorClass = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-emerald-800/90';
      case 2:
        return 'bg-emerald-600';
      case 3:
        return 'bg-emerald-500';
      case 4:
        return 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]';
      default:
        return 'bg-white/10';
    }
  };

  return (
    <div 
      className="flex items-center gap-3 px-3 h-12 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 transition-all duration-200 cursor-pointer shadow-sm group select-none"
      title={`${contributionsCount} contribuições no ano | ${pendingPRs} PRs aguardando revisão`}
    >
      {/* Indicador Numérico e PRs */}
      <div className="flex flex-col justify-center min-w-[70px]">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-white leading-none">
            {contributionsCount.toLocaleString('pt-BR')}
          </span>
          {pendingPRs > 0 && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-purple-500/25 text-purple-300 border border-purple-400/30 text-[9px] font-semibold leading-none">
              <GitPullRequest className="w-2.5 h-2.5" />
              {pendingPRs}
            </span>
          )}
        </div>
        <span className="text-[9px] text-white/50 leading-tight mt-0.5">
          este ano
        </span>
      </div>

      {/* Grade de Contribuições estilo GitHub (orientação horizontal correta) */}
      <div className="flex items-center gap-[3px] p-1.5 rounded-xl bg-black/30 border border-white/10">
        {columns.map((col, colIdx) => (
          <div key={colIdx} className="flex flex-col gap-[3px]">
            {col.map((level, rowIdx) => (
              <div 
                key={rowIdx} 
                className={`w-[6px] h-[6px] rounded-[1.5px] transition-colors ${getColorClass(level)}`} 
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
