import React, { useEffect, useState } from 'react';
import { useDockStore } from './stores/dockStore';
import { DockBar } from './components/dock/DockBar';
import { SettingsModal } from './components/settings/SettingsModal';
import { CommandPalette } from './components/dock/CommandPalette';
import { ContextMenu, ContextMenuData } from './components/dock/ContextMenu';
import { PinnedApp } from './types/dock';
import { tauriService } from './services/tauri';

export const App: React.FC = () => {
  const { 
    fetchWorkspaces, 
    workspaces, 
    setActiveWorkspace, 
    barPosition,
    autoHide,
    removeAppFromWorkspace,
    togglePinApp,
    launchApp,
    isLoading 
  } = useDockStore();

  // Todos os hooks chamados no topo incondicionalmente (React Rules of Hooks)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [contextMenuData, setContextMenuData] = useState<ContextMenuData>(null);
  const [isBarHovered, setIsBarHovered] = useState(false);

  useEffect(() => {
    fetchWorkspaces();

    const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
    let unlistenFn: (() => void) | null = null;
    if (isTauri) {
      import('@tauri-apps/api/event').then(({ listen }) => {
        listen('config-updated', () => {
          fetchWorkspaces();
        }).then((unlisten) => {
          unlistenFn = unlisten;
        });
      });
    }

    return () => {
      if (unlistenFn) unlistenFn();
    };
  }, [fetchWorkspaces]);

  const openSettings = () => {
    const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
    if (isTauri) {
      tauriService.openSettingsWindow();
    } else {
      setIsSettingsOpen(true);
    }
  };

  // Listener de atalhos de teclado globais
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey) {
        // Atalho numérico (1 a 9) para trocar ambientes
        const num = parseInt(e.key, 10);
        if (!isNaN(num) && num >= 1 && num <= workspaces.length) {
          const targetWs = workspaces[num - 1];
          if (targetWs) {
            e.preventDefault();
            setActiveWorkspace(targetWs.id);
          }
        }

        // Ctrl + Alt + P ou Alt + Espaço para abrir o Command Palette rápido
        if (e.key.toLowerCase() === 'p' || (e.altKey && e.code === 'Space')) {
          e.preventDefault();
          setIsPaletteOpen(prev => !prev);
        }

        // Ctrl + Alt + S para abrir Ajustes
        if (e.key.toLowerCase() === 's' || e.key === ',') {
          e.preventDefault();
          openSettings();
        }

        // Ctrl + Alt + Espaço para alternar visibilidade instantânea
        if (e.code === 'Space') {
          e.preventDefault();
          setIsBarHovered((prev) => !prev);
        }

        // Ctrl + Alt + N para adicionar aplicativo
        if (e.key.toLowerCase() === 'n') {
          e.preventDefault();
          (async () => {
            const path = await tauriService.selectFile();
            if (path) {
              const name = path.split('\\').pop()?.split('/').pop()?.replace('.exe', '') || 'App';
              useDockStore.getState().addAppToWorkspace({
                name,
                exec_path: path,
                icon_name: 'AppWindow',
              });
            }
          })();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [workspaces, setActiveWorkspace]);

  const handleAppContextMenu = (e: React.MouseEvent, app: PinnedApp) => {
    e.preventDefault();
    setContextMenuData({
      type: 'app',
      app,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleDockContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuData({
      type: 'dock',
      x: e.clientX,
      y: e.clientY,
    });
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-transparent pointer-events-none">
        <div className="px-4 py-2 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs">
          Carregando VMedia Dock...
        </div>
      </div>
    );
  }

  const isDockVisible = !autoHide || isBarHovered;
  const positionClass = barPosition === 'top' ? 'top-3' : 'bottom-3';
  const hideTransformClass = autoHide && !isDockVisible 
    ? (barPosition === 'top' ? '-translate-y-28 opacity-0 pointer-events-none' : 'translate-y-28 opacity-0 pointer-events-none') 
    : 'translate-y-0 opacity-100 pointer-events-auto';

  return (
    <>
      {/* Sensor de Borda para Auto-Hide (Trigger na borda da tela) */}
      {autoHide && (
        <div 
          onMouseEnter={() => setIsBarHovered(true)}
          className={`fixed inset-x-0 ${barPosition === 'top' ? 'top-0' : 'bottom-0'} h-4 z-40 bg-transparent`}
        />
      )}

      <main 
        onMouseEnter={() => setIsBarHovered(true)}
        onMouseLeave={() => setIsBarHovered(false)}
        className={`fixed inset-x-0 ${positionClass} flex items-center justify-center p-2 transition-all duration-300 ease-out z-30 ${hideTransformClass}`}
      >
        <DockBar 
          onOpenSettings={openSettings}
          onAppContextMenu={handleAppContextMenu}
          onDockContextMenu={handleDockContextMenu}
        />
      </main>

      {/* Command Palette Rápido (Spotlight) */}
      <CommandPalette 
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        onOpenSettings={openSettings}
      />

      {/* Menu de Contexto Flutuante */}
      <ContextMenu
        data={contextMenuData}
        onClose={() => setContextMenuData(null)}
        onOpenSettings={openSettings}
        onTogglePinApp={togglePinApp}
        onRemoveApp={removeAppFromWorkspace}
        onLaunchApp={launchApp}
      />

      {/* Modal de Ajustes */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </>
  );
};

export default App;
