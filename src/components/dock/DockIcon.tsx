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
  const { launchApp, openWindows, focusWindow, closeWindow, iconSize } = useDockStore();
  const [isHovered, setIsHovered] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);

  const IconComponent = iconMap[app.icon_name] || Layers;

  // Identifica de forma resiliente se existe janela aberta para o aplicativo
  const isMatchingWindow = (w: { title: string; process_name: string }, targetApp: PinnedApp) => {
    const titleLow = w.title.toLowerCase();
    const nameLow = targetApp.name.toLowerCase();
    const execLow = targetApp.exec_path.toLowerCase();

    // 1. Casos específicos conhecidos
    if (execLow.includes('wt') || execLow.includes('cmd') || execLow.includes('powershell') || nameLow.includes('terminal')) {
      if (titleLow.includes('terminal') || titleLow.includes('powershell') || titleLow.includes('cmd') || titleLow.includes('bash') || titleLow.includes('wsl')) {
        return true;
      }
    }
    if (execLow.includes('code') || nameLow.includes('vs code') || nameLow.includes('visual studio')) {
      if (titleLow.includes('visual studio code') || titleLow.includes(' - code')) {
        return true;
      }
    }
    if (execLow.includes('chrome') || nameLow.includes('navegador') || nameLow.includes('chrome')) {
      if (titleLow.includes('chrome') || titleLow.includes('google chrome')) {
        return true;
      }
    }
    if (execLow.includes('spotify') || nameLow.includes('spotify')) {
      if (titleLow.includes('spotify')) {
        return true;
      }
    }

    // 2. Correspondência geral por nome de app ou executável
    const exeName = execLow.split('\\').pop()?.split('/').pop()?.replace('.exe', '') || '';
    return (
      (exeName.length > 2 && titleLow.includes(exeName)) ||
      (nameLow.length > 2 && titleLow.includes(nameLow))
    );
  };

  const activeWindow = openWindows.find((w) => isMatchingWindow(w, app));
  const isAppRunning = Boolean(activeWindow || app.is_running);

  const handleClick = () => {
    setIsBouncing(true);
    if (activeWindow) {
      // Se já está aberto, foca a janela em vez de abrir uma nova duplicada!
      focusWindow(activeWindow.id);
    } else {
      launchApp(app.exec_path);
    }
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
      {isHovered && isAppRunning && (
        <WindowPeekCard
          appName={app.name}
          windowInfo={activeWindow}
          onFocus={() => activeWindow && focusWindow(activeWindow.id)}
          onCloseWindow={() => activeWindow && closeWindow(activeWindow.id)}
        />
      )}

      {/* Tooltip com nome do App (quando não for Window Peek) */}
      {isHovered && !isAppRunning && (
        <div className="absolute bottom-full mb-2.5 px-2.5 py-1 rounded-lg bg-black/85 backdrop-blur-md text-white text-[11px] font-medium shadow-xl pointer-events-none whitespace-nowrap animate-fade-in border border-white/10 z-50">
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
        style={{
          width: `${iconSize}px`,
          height: `${iconSize}px`,
        }}
        className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-b from-white/20 to-white/5 hover:from-white/30 hover:to-white/10 backdrop-blur-md border border-white/25 shadow-md transition-all duration-200 active:scale-90 cursor-pointer ${
          isBouncing ? 'animate-bounce' : 'hover:-translate-y-2 hover:scale-110'
        }`}
      >
        <IconComponent 
          style={{
            width: `${Math.round(iconSize * 0.5)}px`,
            height: `${Math.round(iconSize * 0.5)}px`,
          }}
          className="text-white drop-shadow-sm transition-transform duration-200 group-hover:scale-105" 
        />
      </button>

      {/* Indicador de App em Execução */}
      {isAppRunning && (
        <div 
          className="w-1.5 h-1.5 rounded-full mt-1 transition-all duration-300 shadow-sm"
          style={{ backgroundColor: activeColor }}
        />
      )}
    </div>
  );
};
