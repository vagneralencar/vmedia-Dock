import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import { WindowInfo } from '../../types/dock';

interface WindowPeekCardProps {
  appName: string;
  windowInfo?: WindowInfo;
  onFocus: () => void;
  onCloseWindow: () => void;
}

export const WindowPeekCard: React.FC<WindowPeekCardProps> = ({
  appName,
  windowInfo,
  onFocus,
  onCloseWindow,
}) => {
  const title = windowInfo?.title || `${appName} - Janela Ativa`;

  return (
    <div 
      className="absolute bottom-full mb-2 flex flex-col w-52 p-2.5 rounded-2xl bg-neutral-900/95 backdrop-blur-2xl border border-white/20 shadow-2xl text-white select-none animate-fade-in z-50 pointer-events-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Barra de título da janela em miniatura */}
      <div className="flex items-center justify-between gap-1 border-b border-white/10 pb-1.5 mb-1.5">
        <span className="text-[11px] font-semibold text-white/90 truncate flex-grow">
          {title}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCloseWindow();
          }}
          className="p-1 rounded-md hover:bg-rose-500/20 text-white/50 hover:text-rose-300 transition-colors"
          title="Fechar Janela"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* Miniatura visual de janela */}
      <div 
        onClick={onFocus}
        className="relative flex items-center justify-center h-12 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer group"
        title="Clique para trazer para frente"
      >
        <span className="text-[10px] text-white/40 group-hover:text-white/70 transition-colors">
          Trazer para frente
        </span>
        <ExternalLink className="w-3 h-3 text-white/40 group-hover:text-white/70 ml-1 transition-colors" />
      </div>
    </div>
  );
};
