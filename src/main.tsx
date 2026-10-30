import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { SettingsModal } from './components/settings/SettingsModal';
import { useDockStore } from './stores/dockStore';
import { tauriService } from './services/tauri';
import './index.css';

// Detecta se esta WebviewWindow é a janela dedicada de ajustes ("settings")
const checkIsSettingsView = (): boolean => {
  if (typeof window === 'undefined') return false;
  const internals = (window as any).__TAURI_INTERNALS__;
  const winLabel = internals?.metadata?.currentWindow?.label || internals?.metadata?.currentWebview?.label;
  if (winLabel === 'settings') return true;
  return new URLSearchParams(window.location.search).get('view') === 'settings';
};

const SettingsWindowView: React.FC = () => {
  const fetchWorkspaces = useDockStore((s) => s.fetchWorkspaces);

  useEffect(() => {
    fetchWorkspaces();

    const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
    let unlistenFn: (() => void) | null = null;
    if (isTauri) {
      import('@tauri-apps/api/event').then(({ listen }) => {
        listen('settings-opened', () => {
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

  return (
    <SettingsModal 
      isOpen={true} 
      isStandaloneWindow={true}
      onClose={async () => {
        const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
        if (isTauri) {
          await tauriService.closeSettingsWindow();
        } else {
          window.close();
        }
      }} 
    />
  );
};

const RootComponent: React.FC = () => {
  if (checkIsSettingsView()) {
    return <SettingsWindowView />;
  }

  return <App />;
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RootComponent />
  </React.StrictMode>
);
