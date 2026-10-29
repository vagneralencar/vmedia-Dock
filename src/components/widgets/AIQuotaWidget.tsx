import React, { useState, useEffect } from 'react';
import { Cpu, RefreshCw, AlertTriangle } from 'lucide-react';
import { AIProviderQuota } from '../../types/dock';

interface AIQuotaWidgetProps {
  onOpenFlyout?: () => void;
}

export const AIQuotaWidget: React.FC<AIQuotaWidgetProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeProviderIndex, setActiveProviderIndex] = useState(0);

  // Providers suportados estilo CodexBar
  const [providers] = useState<AIProviderQuota[]>([
    {
      id: 'claude',
      name: 'Claude Code',
      used_requests: 38,
      total_requests: 50,
      used_percentage: 76,
      resets_in: '2h 45m',
      status: 'warning',
      cost_estimate_usd: 4.20,
    },
    {
      id: 'openai',
      name: 'OpenAI Codex',
      used_requests: 120,
      total_requests: 500,
      used_percentage: 24,
      resets_in: '1d 12h',
      status: 'ok',
      cost_estimate_usd: 1.85,
    },
    {
      id: 'cursor',
      name: 'Cursor Pro',
      used_requests: 485,
      total_requests: 500,
      used_percentage: 97,
      resets_in: '42m',
      status: 'exceeded',
      cost_estimate_usd: 19.90,
    },
    {
      id: 'gemini',
      name: 'Gemini 1.5 Pro',
      used_requests: 14,
      total_requests: 100,
      used_percentage: 14,
      resets_in: '5h 10m',
      status: 'ok',
      cost_estimate_usd: 0.45,
    },
  ]);

  // Alterna o provedor exibido no resumo do dock a cada 5 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveProviderIndex((prev) => (prev + 1) % providers.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [providers.length]);

  const active = providers[activeProviderIndex] ?? providers[0]!;

  const getStatusColor = (status: AIProviderQuota['status']) => {
    switch (status) {
      case 'exceeded':
        return 'text-rose-400 bg-rose-500/20 border-rose-400/40';
      case 'warning':
        return 'text-amber-400 bg-amber-500/20 border-amber-400/40';
      case 'ok':
      default:
        return 'text-emerald-400 bg-emerald-500/20 border-emerald-400/40';
    }
  };

  const getBarColor = (percentage: number) => {
    if (percentage > 90) return 'bg-rose-400';
    if (percentage > 70) return 'bg-amber-400';
    return 'bg-emerald-400';
  };

  return (
    <div className="relative">
      {/* Botão Resumo no Dock */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2.5 px-3 h-12 min-w-[145px] rounded-2xl backdrop-blur-md border transition-all duration-200 cursor-pointer shadow-sm select-none group ${
          isOpen ? 'bg-purple-500/25 border-purple-400/50' : 'bg-white/10 hover:bg-white/15 border-white/20'
        }`}
        title={`Cotas de IA: ${active.name} (${active.used_percentage}% usado). Clique para ver todos os provedores.`}
      >
        {/* Ícone de IA */}
        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500/30 to-indigo-500/30 border border-purple-300/30 text-purple-300 flex-shrink-0">
          <Cpu className="w-4 h-4 animate-pulse" />
        </div>

        {/* Resumo Dinâmico */}
        <div className="flex flex-col flex-grow min-w-0">
          <div className="flex items-center justify-between gap-1 leading-none">
            <span className="text-[11px] font-bold text-white truncate max-w-[70px]">
              {active.name}
            </span>
            <span className={`text-[9px] font-extrabold px-1 py-0.2 rounded border ${getStatusColor(active.status)}`}>
              {active.used_percentage}%
            </span>
          </div>

          {/* Barra de Progresso da Cota */}
          <div className="w-full bg-white/10 h-1 rounded-full mt-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getBarColor(active.used_percentage)}`}
              style={{ width: `${Math.min(100, active.used_percentage)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[8px] text-white/50 mt-1">
            <span>Reseta em {active.resets_in}</span>
          </div>
        </div>
      </div>

      {/* Popover / Flyout Completo Estilo CodexBar */}
      {isOpen && (
        <div
          className="absolute bottom-16 left-1/2 -translate-x-1/2 w-80 p-4 rounded-2xl bg-neutral-900/95 border border-white/20 shadow-2xl backdrop-blur-2xl text-white select-none z-50 animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Cabeçalho */}
          <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              <div>
                <h4 className="text-xs font-bold leading-tight">Cotas de IA & Modelos</h4>
                <p className="text-[10px] text-white/50 leading-tight">Monitor inspirado no CodexBar</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-white/40">
              <RefreshCw className="w-3 h-3 text-emerald-400 animate-spin-slow" />
              <span>Ao vivo</span>
            </div>
          </div>

          {/* Lista de Provedores com Barra e Reset */}
          <div className="my-3 space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {providers.map((p) => (
              <div
                key={p.id}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors"
              >
                <div className="flex items-center justify-between mb-1 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-white">{p.name}</span>
                    {p.status === 'exceeded' && (
                      <AlertTriangle className="w-3 h-3 text-rose-400" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white/50">
                      {p.used_requests}/{p.total_requests} reqs
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getStatusColor(p.status)}`}>
                      {p.used_percentage}%
                    </span>
                  </div>
                </div>

                {/* Barra */}
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${getBarColor(p.used_percentage)}`}
                    style={{ width: `${Math.min(100, p.used_percentage)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between mt-1 text-[9px] text-white/50">
                  <span>Reseta em: <strong className="text-white/80 font-medium">{p.resets_in}</strong></span>
                  {p.cost_estimate_usd !== undefined && (
                    <span>Gasto: ${p.cost_estimate_usd.toFixed(2)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Rodapé informativo */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-white/50">
            <span>Sincronizado localmente (zero envio de chaves)</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
            >
              <span>Fechar</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
