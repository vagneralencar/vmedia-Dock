import React, { useEffect, useState } from 'react';
import { useDockStore } from './stores/dockStore';
import { DockBar } from './components/dock/DockBar';
import { SettingsModal } from './components/settings/SettingsModal';
import { ContextMenu, ContextMenuData } from './components/dock/ContextMenu';
import { PinnedApp } from './types/dock';

export const App: React.FC = () => {
  const { 
    fetchWorkspaces, 
    workspaces, 
    setActiveWorkspace, 
    barPosition,
    removeAppFromWorkspace,
    togglePinApp,
    launchApp,
    isLoading 
  } = useDockStore();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [contextMenuData, setContextMenuData] = useState<ContextMenuData>(null);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  // Listener de atalhos de teclado (Ctrl + Alt + 1..9 para trocar ambientes)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey) {
        // Atalho numérico (1 a 9)
        const num = parseInt(e.key, 10);
        if (!isNaN(num) && num >= 1 && num <= workspaces.length) {
          const targetWs = workspaces[num - 1];
          if (targetWs) {
            e.preventDefault();
            setActiveWorkspace(targetWs.id);
          }
        }

        // Ctrl + Alt + S para abrir Ajustes
        if (e.key.toLowerCase() === 's' || e.key === ',') {
          e.preventDefault();
          setIsSettingsOpen((prev) => !prev);
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
    return null;
  }

  const positionClass = barPosition === 'top' ? 'top-3' : 'bottom-3';

  return (
    <>
      <main className={`fixed inset-x-0 ${positionClass} flex items-center justify-center p-2 pointer-events-auto`}>
        <DockBar 
          onOpenSettings={() => setIsSettingsOpen(true)}
          onAppContextMenu={handleAppContextMenu}
          onDockContextMenu={handleDockContextMenu}
        />
      </main>

      {/* Menu de Contexto Flutuante */}
      <ContextMenu
        data={contextMenuData}
        onClose={() => setContextMenuData(null)}
        onOpenSettings={() => setIsSettingsOpen(true)}
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
