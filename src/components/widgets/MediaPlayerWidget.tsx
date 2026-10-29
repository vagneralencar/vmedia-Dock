import React, { useState } from 'react';
import { Play, Pause, SkipForward, Music } from 'lucide-react';

export const MediaPlayerWidget: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [track] = useState({
    title: 'Garota de Ipanema',
    artist: 'Tom Jobim & Vinicius',
    progress: 45, // porcentagem
  });

  return (
    <div 
      className="flex items-center gap-2.5 px-3 h-12 min-w-[200px] rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 transition-all duration-200 cursor-pointer shadow-sm group"
      title={`${track.title} - ${track.artist}`}
    >
      {/* Capa de disco / Ícone */}
      <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-400 text-white shadow-inner flex-shrink-0">
        <Music className={`w-4 h-4 ${isPlaying ? 'animate-pulse' : ''}`} />
      </div>

      {/* Info da Faixa */}
      <div className="flex flex-col flex-grow min-w-0">
        <span className="text-xs font-semibold text-white truncate leading-tight">
          {track.title}
        </span>
        <span className="text-[10px] text-white/60 truncate leading-tight">
          {track.artist}
        </span>
        
        {/* Barra de Progresso */}
        <div className="w-full bg-white/10 h-1 rounded-full mt-1 overflow-hidden">
          <div 
            className="h-full bg-rose-400 rounded-full" 
            style={{ width: `${track.progress}%` }} 
          />
        </div>
      </div>

      {/* Controles de Mídia */}
      <div className="flex items-center gap-1 text-white/80">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setIsPlaying(!isPlaying);
          }}
          className="p-1 hover:text-white hover:scale-110 active:scale-95 transition-transform"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
        <button 
          onClick={(e) => e.stopPropagation()}
          className="p-1 hover:text-white hover:scale-110 active:scale-95 transition-transform"
        >
          <SkipForward className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
