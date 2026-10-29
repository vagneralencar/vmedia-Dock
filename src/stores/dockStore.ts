import { create } from 'zustand';
import { Workspace, SystemMetrics } from '../types/dock';
import { tauriService } from '../services/tauri';

interface DockState {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  metrics: SystemMetrics | null;
  isLoading: boolean;
  theme: 'glass' | 'neon' | 'dark';
  
  // Ações
  fetchWorkspaces: () => Promise<void>;
  setActiveWorkspace: (id: string) => void;
  updateMetrics: () => Promise<void>;
  launchApp: (path: string) => Promise<void>;
  setTheme: (theme: 'glass' | 'neon' | 'dark') => void;
}

export const useDockStore = create<DockState>((set) => ({
  workspaces: [],
  activeWorkspaceId: 'work',
  metrics: null,
  isLoading: true,
  theme: 'glass',

  fetchWorkspaces: async () => {
    try {
      const data = await tauriService.getWorkspaces();
      set({ 
        workspaces: data, 
        activeWorkspaceId: data[0]?.id || 'work',
        isLoading: false 
      });
    } catch (err) {
      console.error('Erro ao carregar workspaces:', err);
      set({ isLoading: false });
    }
  },

  setActiveWorkspace: (id: string) => {
    set({ activeWorkspaceId: id });
  },

  updateMetrics: async () => {
    try {
      const metrics = await tauriService.getSystemMetrics();
      set({ metrics });
    } catch (err) {
      console.error('Erro ao atualizar métricas:', err);
    }
  },

  launchApp: async (path: string) => {
    try {
      await tauriService.launchApp(path);
    } catch (err) {
      console.error('Erro ao abrir app:', err);
    }
  },

  setTheme: (theme) => set({ theme }),
}));
