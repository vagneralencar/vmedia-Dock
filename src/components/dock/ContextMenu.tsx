import React, { useEffect, useRef } from 'react';
import { PinnedApp } from '../../types/dock';
import { useDockStore } from '../../stores/dockStore';
import { tauriService } from '../../services/tauri';
import { 
  Play, 
  Trash2, 
  PinOff, 
  Sliders, 
  PlusCircle, 
  Layers 
} from 'lucide-react';

export type ContextMenuData = 
  | { type: 'app'; app: PinnedApp; x: number; y: number }
  | { type: 'dock'; x: number; y: number }
  | null;

interface ContextMenuProps {
  data: ContextMenuData;
  onClose: () => void;
  onOpenSettings: () => void;
  onTogglePinApp: (appId: string) => void;
  onRemoveApp: (appId: string) => void;
  onLaunchApp: (path: string) => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  data,
  onClose,
  onOpenSettings,
  onTogglePinApp,
  onRemoveApp,
  onLaunchApp,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!data) return null;

  // Garante que o menu não transborde a tela
  const style: React.CSSProperties = {
    left: Math.min(data.x, window.innerWidth - 200),
    top: Math.max(10, data.y - 140),
  };

  return (
    <div
      ref={menuRef}
      style={style}
      className="fixed z-50 min-w-[180px] p-1.5 rounded-2xl bg-neutral-900/90 backdrop-blur-2xl border border-white/20 shadow-2xl text-white text-xs select-none animate-fade-in space-y-0.5"
    >
      {data.type === 'app' ? (
        <>
          <div className="px-2.5 py-1 text-[10px] font-bold text-white/40 uppercase tracking-wider border-b border-white/10 mb-1">
            {data.app.name}
          </div>

          <button
            onClick={() => {
              onLaunchApp(data.app.exec_path);
              onClose();
            }}
            className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-white/90 hover:text-white transition-colors"
          >
            <Play className="w-3.5 h-3.5 text-emerald-400" />
            <span>Abrir aplicativo</span>
          </button>

          <button
            onClick={() => {
              // Copia o caminho do executável para a área de transferência
              navigator.clipboard.writeText(data.app.exec_path);
              onClose();
            }}
            className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-white/90 hover:text-white transition-colors"
          >
            <span className="text-sky-400 text-xs font-mono">📋</span>
            <span>Copiar caminho</span>
          </button>

          <button
            onClick={() => {
              onTogglePinApp(data.app.id);
              onClose();
            }}
            className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-white/90 hover:text-white transition-colors"
          >
            <PinOff className="w-3.5 h-3.5 text-amber-400" />
            <span>Desafixar da barra</span>
          </button>

          <div className="h-[1px] bg-white/10 my-1" />

          <button
            onClick={() => {
              onRemoveApp(data.app.id);
              onClose();
            }}
            className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-xl hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remover deste ambiente</span>
          </button>
        </>
      ) : (
        <>
          <div className="px-2.5 py-1 text-[10px] font-bold text-white/40 uppercase tracking-wider border-b border-white/10 mb-1">
            VMedia Dock
          </div>

          <button
            onClick={async () => {
              onClose();
              const path = await tauriService.selectFile();
              if (path) {
                const name = path.split('\\').pop()?.split('/').pop()?.replace('.exe', '') || 'App';
                useDockStore.getState().addAppToWorkspace({
                  name,
                  exec_path: path,
                  icon_name: 'AppWindow',
                });
              }
            }}
            className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-white/90 hover:text-white transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Adicionar Aplicativo (.exe)...</span>
          </button>

          <button
            onClick={() => {
              onOpenSettings();
              onClose();
            }}
            className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-white/90 hover:text-white transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-blue-400" />
            <span>Ajustes do Dock...</span>
          </button>

          <button
            onClick={() => {
              onOpenSettings();
              onClose();
            }}
            className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-white/90 hover:text-white transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>Gerenciar Ambientes...</span>
          </button>
        </>
      )}
    </div>
  );
};
