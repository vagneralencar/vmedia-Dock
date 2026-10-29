import React from 'react';
import { useDockStore } from '../../stores/dockStore';

export const WorkspaceSwitcher: React.FC = () => {
  const { workspaces, activeWorkspaceId, setActiveWorkspace } = useDockStore();

  return (
    <div 
      className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md"
      title="Alternar Ambientes (Workspaces)"
    >
      {workspaces.map((ws, index) => {
        const isActive = ws.id === activeWorkspaceId;
        return (
          <button
            key={ws.id}
            onClick={() => setActiveWorkspace(ws.id)}
            className={`relative flex items-center justify-center transition-all duration-300 rounded-full ${
              isActive ? 'w-4 h-4 ring-2 ring-white/40 ring-offset-1 ring-offset-black/50' : 'w-2.5 h-2.5 opacity-60 hover:opacity-100 hover:scale-125'
            }`}
            style={{ backgroundColor: ws.color }}
            title={`${ws.name} (Ctrl+Alt+${index + 1})`}
          />
        );
      })}
    </div>
  );
};
