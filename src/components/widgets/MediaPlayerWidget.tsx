import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Music } from 'lucide-react';
import { tauriService } from '../../services/tauri';
import { MediaTrackInfo } from '../../types/dock';

export const MediaPlayerWidget: React.FC = () => {
  const [track, setTrack] = useState<MediaTrackInfo>({
    title: 'Garota de Ipanema',
    artist: 'Tom Jobim & Vinicius',
    is_playing: true,
    progress_percent: 45,
  });

  // Atualiza dados da mídia em reprodução
  useEffect(() => {
    let isMounted = true;
    const fetchTrack = async () => {
      try {
        const current = await tauriService.getMediaTrack();
        if (isMounted && current && current.title) {
          setTrack(current);
        }
      } catch (err) {
        console.error('Erro ao ler mídia:', err);
      }
    };

    fetchTrack();
    const interval = setInterval(fetchTrack, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handlePlayPause = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setTrack((prev) => ({ ...prev, is_playing: !prev.is_playing }));
    await tauriService.sendMediaCommand('play_pause');
  };

  const handleNext = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await tauriService.sendMediaCommand('next');
    const updated = await tauriService.getMediaTrack();
    if (updated) setTrack(updated);
  };

  const handlePrev = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await tauriService.sendMediaCommand('prev');
    const updated = await tauriService.getMediaTrack();
    if (updated) setTrack(updated);
  };

  return (
    <div 
      className="flex items-center gap-2.5 px-3 h-12 min-w-[210px] rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 transition-all duration-200 cursor-pointer shadow-sm group select-none"
      title={`${track.title} - ${track.artist}`}
    >
      {/* Capa de disco / Ícone */}
      <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-400 text-white shadow-inner flex-shrink-0">
        <Music className={`w-4 h-4 ${track.is_playing ? 'animate-pulse' : ''}`} />
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
            className="h-full bg-rose-400 rounded-full transition-all duration-300" 
            style={{ width: `${track.progress_percent}%` }} 
          />
        </div>
      </div>

      {/* Controles de Mídia */}
      <div className="flex items-center gap-0.5 text-white/80">
        <button 
          onClick={handlePrev}
          className="p-1 hover:text-white hover:scale-110 active:scale-95 transition-transform"
          title="Anterior"
        >
          <SkipBack className="w-3 h-3" />
        </button>
        <button 
          onClick={handlePlayPause}
          className="p-1 hover:text-white hover:scale-110 active:scale-95 transition-transform"
          title={track.is_playing ? 'Pausar' : 'Reproduzir'}
        >
          {track.is_playing ? <Pause className="w-3.5 h-3.5 text-rose-300" /> : <Play className="w-3.5 h-3.5 text-rose-300" />}
        </button>
        <button 
          onClick={handleNext}
          className="p-1 hover:text-white hover:scale-110 active:scale-95 transition-transform"
          title="Próxima"
        >
          <SkipForward className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
