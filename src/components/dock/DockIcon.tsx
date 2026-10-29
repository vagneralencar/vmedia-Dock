import React, { useState } from 'react';
import { PinnedApp } from '../../types/dock';
import { useDockStore } from '../../stores/dockStore';
import { 
  Globe, 
  Code2, 
  Terminal, 
  Music, 
  MessageSquare, 
  Folder, 
  Layers, 
  LucideIcon 
} from 'lucide-react';

// Mapeamento dinâmico de ícones para clean code
const iconMap: Record<string, LucideIcon> = {
  Globe,
  Code2,
  Terminal,
  Music,
  MessageSquare,
  Folder,
  Layers,
};

interface DockIconProps {
  app: PinnedApp;
  activeColor: string;
}

export const DockIcon: React.FC<DockIconProps> = ({ app, activeColor }) => {
  const { launchApp } = useDockStore();
  const [isHovered, setIsHovered] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);

  const IconComponent = iconMap[app.icon_name] || Layers;

  const handleClick = () => {
    setIsBouncing(true);
    launchApp(app.exec_path);
    setTimeout(() => setIsBouncing(false), 800);
  };

  return (
    <div 
      className="relative flex flex-col items-center group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Tooltip com nome do App */}
      {isHovered && (
        <div className="absolute -top-9 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-white text-[11px] font-medium shadow-lg pointer-events-none whitespace-nowrap animate-fade-in border border-white/10 z-50">
          {app.name}
        </div>
      )}

      {/* Botão do Ícone com Magnification Zoom */}
      <button
        onClick={handleClick}
        className={`relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-b from-white/20 to-white/5 hover:from-white/30 hover:to-white/10 backdrop-blur-md border border-white/25 shadow-md transition-all duration-200 active:scale-90 cursor-pointer ${
          isBouncing ? 'animate-bounce' : 'hover:-translate-y-2 hover:scale-110'
        }`}
      >
        <IconComponent className="w-6 h-6 text-white drop-shadow-sm transition-transform duration-200 group-hover:scale-105" />
      </button>

      {/* Indicador de App em Execução */}
      {app.is_running && (
        <div 
          className="w-1.5 h-1.5 rounded-full mt-1 transition-all duration-300 shadow-sm"
          style={{ backgroundColor: activeColor }}
        />
      )}
    </div>
  );
};
