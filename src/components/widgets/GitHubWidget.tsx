import React from 'react';
import { GitPullRequest } from 'lucide-react';

export const GitHubWidget: React.FC = () => {
  // Simulação de contribuições recentes no ano (níveis de 0 a 4)
  const contributionsCount = 1420;
  const pendingPRs = 2;

  // Gerador determinístico de mini-matriz para o gráfico
  const miniGrid = [
    [1, 2, 0, 3, 2, 4, 1],
    [0, 1, 3, 2, 0, 1, 3],
    [2, 4, 1, 0, 3, 2, 4],
  ];

  const getColorClass = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-emerald-800';
      case 2:
        return 'bg-emerald-600';
      case 3:
        return 'bg-emerald-500';
      case 4:
        return 'bg-emerald-400';
      default:
        return 'bg-white/10';
    }
  };

  return (
    <div 
      className="flex items-center gap-2.5 px-3 h-12 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 transition-all duration-200 cursor-pointer shadow-sm group select-none"
      title={`${contributionsCount} contribuições no ano | ${pendingPRs} PRs aguardando revisão`}
    >
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-white leading-none">
            {contributionsCount.toLocaleString('pt-BR')}
          </span>
          {pendingPRs > 0 && (
            <span className="flex items-center gap-0.5 px-1 py-0.2 rounded-full bg-purple-500/30 text-purple-300 border border-purple-400/30 text-[9px] font-semibold">
              <GitPullRequest className="w-2.5 h-2.5" />
              {pendingPRs}
            </span>
          )}
        </div>
        <span className="text-[9px] text-white/50 leading-tight">ano ativo</span>
      </div>

      {/* Mini-grade de contribuições (estilo GitHub commits) */}
      <div className="flex gap-1 p-1 rounded-lg bg-black/20 border border-white/5">
        {miniGrid.map((col, colIdx) => (
          <div key={colIdx} className="flex flex-col gap-1">
            {col.map((level, rowIdx) => (
              <div 
                key={rowIdx} 
                className={`w-1.5 h-1.5 rounded-sm transition-colors ${getColorClass(level)}`} 
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
