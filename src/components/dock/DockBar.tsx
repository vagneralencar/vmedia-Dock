import React from 'react';
import { useDockStore } from '../../stores/dockStore';
import { DockIcon } from './DockIcon';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import { ClockWidget } from '../widgets/ClockWidget';
import { SystemStatsWidget } from '../widgets/SystemStatsWidget';
import { MediaPlayerWidget } from '../widgets/MediaPlayerWidget';
import { PomodoroWidget } from '../widgets/PomodoroWidget';
import { DropZoneWidget } from '../widgets/DropZoneWidget';
import { WeatherWidget } from '../widgets/WeatherWidget';
import { GitHubWidget } from '../widgets/GitHubWidget';
import { TerminalWidget } from '../widgets/TerminalWidget';
import { Sliders } from 'lucide-react';
import { PinnedApp } from '../../types/dock';

interface DockBarProps {
  onOpenSettings?: () => void;
  onAppContextMenu?: (e: React.MouseEvent, app: PinnedApp) => void;
  onDockContextMenu?: (e: React.MouseEvent) => void;
}

export const DockBar: React.FC<DockBarProps> = ({ 
  onOpenSettings,
  onAppContextMenu,
  onDockContextMenu,
}) => {
  const { 
    workspaces, 
    activeWorkspaceId, 
    theme, 
    iconSize,
    reorderApps,
    fetchOpenWindows 
  } = useDockStore();

  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    fetchOpenWindows();
    const interval = setInterval(fetchOpenWindows, 4000);
    return () => clearInterval(interval);
  }, [fetchOpenWindows]);

  const handleDragStart = (_e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (_e: React.DragEvent, targetIndex: number) => {
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      reorderApps(draggedIndex, targetIndex);
    }
    setDraggedIndex(null);
  };

  const currentWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];

  if (!currentWorkspace) {
    return null;
  }

  // Renderizador modular de widgets (Clean Code / Open-Closed Principle)
  const renderWidget = (type: string, id: string) => {
    switch (type) {
      case 'clock':
        return <ClockWidget key={id} />;
      case 'system-stats':
        return <SystemStatsWidget key={id} />;
      case 'media-player':
        return <MediaPlayerWidget key={id} />;
      case 'pomodoro':
        return <PomodoroWidget key={id} />;
      case 'drop-zone':
        return <DropZoneWidget key={id} />;
      case 'weather':
        return <WeatherWidget key={id} />;
      case 'github':
        return <GitHubWidget key={id} />;
      case 'pet':
      case 'terminal':
        return <TerminalWidget key={id} />;
      default:
        return null;
    }
  };

  const getThemeClass = () => {
    switch (theme) {
      case 'dark':
        return 'bg-black/90 backdrop-blur-md border-neutral-700/60 shadow-2xl';
      case 'neon':
        return 'bg-slate-950/75 backdrop-blur-2xl border-cyan-400/50 shadow-[0_0_25px_rgba(6,182,212,0.35)]';
      case 'glass':
      default:
        return 'bg-black/40 backdrop-blur-2xl border-white/20 shadow-2xl';
    }
  };

  return (
    <div 
      className="flex items-center justify-center w-full select-none"
      onContextMenu={(e) => {
        if (onDockContextMenu) {
          e.preventDefault();
          onDockContextMenu(e);
        }
      }}
    >
      <div 
        className={`flex items-center gap-2.5 px-4 py-2 rounded-3xl border transition-all duration-300 hover:border-white/30 ${getThemeClass()}`}
        style={{
          boxShadow: `0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 25px -5px ${currentWorkspace.color}33`,
        }}
      >
        {/* Seletor de Ambientes */}
        <WorkspaceSwitcher />

        {/* Separador vertical */}
        <div 
          style={{ height: `${Math.round(iconSize * 0.65)}px` }} 
          className="w-[1px] bg-white/15 my-auto" 
        />

        {/* Lista de Aplicativos Fixados do Ambiente Atual */}
        <div className="flex items-center gap-2">
          {currentWorkspace.pinned_apps.map((app, index) => (
            <DockIcon 
              key={app.id} 
              app={app} 
              index={index}
              activeColor={currentWorkspace.color} 
              onContextMenu={onAppContextMenu}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            />
          ))}
        </div>

        {/* Separador entre Apps e Widgets */}
        {currentWorkspace.widgets.length > 0 && (
          <div 
            style={{ height: `${Math.round(iconSize * 0.65)}px` }} 
            className="w-[1px] bg-white/15 my-auto" 
          />
        )}

        {/* Seção de Widgets Vivos */}
        <div className="flex items-center gap-2">
          {currentWorkspace.widgets.map((widget) => renderWidget(widget.widget_type, widget.id))}
        </div>

        {/* Botão de Ajustes do Dock */}
        {onOpenSettings && (
          <>
            <div 
              style={{ height: `${Math.round(iconSize * 0.65)}px` }} 
              className="w-[1px] bg-white/15 my-auto" 
            />
            <button
              onClick={onOpenSettings}
              style={{
                width: `${Math.max(28, Math.round(iconSize * 0.65))}px`,
                height: `${Math.max(28, Math.round(iconSize * 0.65))}px`,
              }}
              className="flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/15 text-white/50 hover:text-white transition-all cursor-pointer"
              title="Ajustes do VMedia Dock"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
