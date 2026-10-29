import React, { useEffect, useState } from 'react';
import { useDockStore } from './stores/dockStore';
import { DockBar } from './components/dock/DockBar';
import { SettingsModal } from './components/settings/SettingsModal';

export const App: React.FC = () => {
  const { fetchWorkspaces, workspaces, setActiveWorkspace, isLoading } = useDockStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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

  if (isLoading) {
    return null;
  }

  return (
    <>
      <main className="fixed inset-x-0 bottom-3 flex items-center justify-center p-2 pointer-events-auto">
        <DockBar onOpenSettings={() => setIsSettingsOpen(true)} />
      </main>

      {/* Modal de Ajustes */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </>
  );
};

export default App;
