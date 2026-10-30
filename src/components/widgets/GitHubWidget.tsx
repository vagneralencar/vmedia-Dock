import React, { useEffect, useState } from 'react';
import { Github } from 'lucide-react';
import { useDockStore } from '../../stores/dockStore';
import { tauriService } from '../../services/tauri';
import { GitHubContributionsData } from '../../types/dock';

export const GitHubWidget: React.FC = () => {
  const { githubUsername } = useDockStore();
  const [data, setData] = useState<GitHubContributionsData>({
    total_contributions: 0,
    weeks: [
      [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0],
      [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]
    ],
    username: githubUsername || 'vagneralencar',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchContributions = async () => {
      setLoading(true);
      try {
        const res = await tauriService.getGitHubContributions(githubUsername);
        if (isMounted && res) {
          setData(res);
        }
      } catch (err) {
        console.error('Erro ao carregar contribuições do GitHub:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchContributions();
    // Atualiza a cada 30 minutos
    const interval = setInterval(fetchContributions, 30 * 60 * 1000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [githubUsername]);

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
    <a
      href={`https://github.com/${data.username}`}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-3 px-3 h-12 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 transition-all duration-200 cursor-pointer shadow-sm group select-none"
      title={`GitHub: @${data.username} | ${data.total_contributions} contribuições no último ano`}
    >
      {/* Indicador Numérico e PRs */}
      <div className="flex flex-col justify-center min-w-[70px]">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-white leading-none">
            {loading && data.total_contributions === 0 ? '...' : data.total_contributions.toLocaleString('pt-BR')}
          </span>
          <span className="flex items-center gap-0.5 px-1 py-0.5 rounded-full bg-neutral-800/80 text-white/60 border border-white/10 text-[9px] font-semibold leading-none">
            <Github className="w-2.5 h-2.5" />
          </span>
        </div>
        <span className="text-[9px] text-white/50 leading-tight mt-0.5 truncate max-w-[80px]">
          @{data.username}
        </span>
      </div>

      {/* Grade de Contribuições estilo GitHub (orientação horizontal com dados ao vivo) */}
      <div className="flex items-center gap-[3px] p-1.5 rounded-xl bg-black/30 border border-white/10">
        {data.weeks.slice(0, 9).map((col, colIdx) => (
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
    </a>
  );
};
