import React, { useState } from 'react';
import { PinnedApp } from '../../types/dock';
import { useDockStore } from '../../stores/dockStore';
import { WindowPeekCard } from './WindowPeekCard';
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
  index: number;
  activeColor: string;
  onContextMenu?: (e: React.MouseEvent, app: PinnedApp) => void;
  onDragStart?: (e: React.DragEvent, index: number) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, index: number) => void;
}

export const DockIcon: React.FC<DockIconProps> = ({ 
  app, 
  index,
  activeColor, 
  onContextMenu,
  onDragStart,
  onDragOver,
  onDrop,
}) => {
  const { launchApp, openWindows, focusWindow, closeWindow } = useDockStore();
  const [isHovered, setIsHovered] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);

  const IconComponent = iconMap[app.icon_name] || Layers;

  // Busca janela aberta correspondente
  const activeWindow = openWindows.find((w) => 
    w.process_name.toLowerCase() === app.exec_path.toLowerCase() ||
    w.title.toLowerCase().includes(app.name.toLowerCase())
  );

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
      draggable
      onDragStart={(e) => onDragStart && onDragStart(e, index)}
      onDragOver={(e) => onDragOver && onDragOver(e)}
      onDrop={(e) => onDrop && onDrop(e, index)}
    >
      {/* Window Peek Card (se o app estiver em execução e sob hover) */}
      {isHovered && app.is_running && (
        <WindowPeekCard
          appName={app.name}
          windowInfo={activeWindow}
          onFocus={() => activeWindow && focusWindow(activeWindow.id)}
          onCloseWindow={() => activeWindow && closeWindow(activeWindow.id)}
        />
      )}

      {/* Tooltip com nome do App (quando não for Window Peek) */}
      {isHovered && !app.is_running && (
        <div className="absolute -top-9 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-white text-[11px] font-medium shadow-lg pointer-events-none whitespace-nowrap animate-fade-in border border-white/10 z-50">
          {app.name}
        </div>
      )}

      {/* Botão do Ícone com Magnification Zoom */}
      <button
        onClick={handleClick}
        onContextMenu={(e) => {
          if (onContextMenu) {
            e.preventDefault();
            onContextMenu(e, app);
          }
        }}
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
