import { create } from 'zustand';
import { Workspace, SystemMetrics, WindowInfo } from '../types/dock';
import { tauriService } from '../services/tauri';

interface DockState {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  metrics: SystemMetrics | null;
  openWindows: WindowInfo[];
  isLoading: boolean;
  theme: 'glass' | 'neon' | 'dark';
  barPosition: 'bottom' | 'top';
  autoHide: boolean;
  
  // Ações
  fetchWorkspaces: () => Promise<void>;
  setActiveWorkspace: (id: string) => void;
  updateMetrics: () => Promise<void>;
  fetchOpenWindows: () => Promise<void>;
  launchApp: (path: string) => Promise<void>;
  setTheme: (theme: 'glass' | 'neon' | 'dark') => void;
  setBarPosition: (position: 'bottom' | 'top') => void;
  toggleAutoHide: () => void;
  removeAppFromWorkspace: (appId: string) => void;
  togglePinApp: (appId: string) => void;
}

export const useDockStore = create<DockState>((set, get) => ({
  workspaces: [],
  activeWorkspaceId: 'work',
  metrics: null,
  openWindows: [],
  isLoading: true,
  theme: 'glass',
  barPosition: 'bottom',
  autoHide: false,

  fetchWorkspaces: async () => {
    try {
      const config = await tauriService.loadConfig();
      set({ 
        workspaces: config.workspaces, 
        theme: config.theme,
        barPosition: config.bar_position,
        autoHide: config.auto_hide,
        activeWorkspaceId: config.workspaces[0]?.id || 'work',
        isLoading: false 
      });
    } catch (err) {
      console.error('Erro ao carregar configurações:', err);
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

  fetchOpenWindows: async () => {
    try {
      const openWindows = await tauriService.listOpenWindows();
      set({ openWindows });
    } catch (err) {
      console.error('Erro ao carregar janelas abertas:', err);
    }
  },

  launchApp: async (path: string) => {
    try {
      await tauriService.launchApp(path);
    } catch (err) {
      console.error('Erro ao abrir app:', err);
    }
  },

  setTheme: (theme) => {
    set({ theme });
    const state = get();
    tauriService.saveConfig({
      theme,
      bar_position: state.barPosition,
      auto_hide: state.autoHide,
      workspaces: state.workspaces,
    });
  },

  setBarPosition: (barPosition) => {
    set({ barPosition });
    const state = get();
    tauriService.saveConfig({
      theme: state.theme,
      bar_position: barPosition,
      auto_hide: state.autoHide,
      workspaces: state.workspaces,
    });
  },

  toggleAutoHide: () => {
    const newAutoHide = !get().autoHide;
    set({ autoHide: newAutoHide });
    const state = get();
    tauriService.saveConfig({
      theme: state.theme,
      bar_position: state.barPosition,
      auto_hide: newAutoHide,
      workspaces: state.workspaces,
    });
  },

  removeAppFromWorkspace: (appId: string) => {
    const { workspaces, activeWorkspaceId } = get();
    const updated = workspaces.map((ws) => {
      if (ws.id === activeWorkspaceId) {
        return {
          ...ws,
          pinned_apps: ws.pinned_apps.filter((app) => app.id !== appId),
        };
      }
      return ws;
    });

    set({ workspaces: updated });
    const state = get();
    tauriService.saveConfig({
      theme: state.theme,
      bar_position: state.barPosition,
      auto_hide: state.autoHide,
      workspaces: updated,
    });
  },

  togglePinApp: (appId: string) => {
    const { workspaces, activeWorkspaceId } = get();
    const updated = workspaces.map((ws) => {
      if (ws.id === activeWorkspaceId) {
        return {
          ...ws,
          pinned_apps: ws.pinned_apps.map((app) => 
            app.id === appId ? { ...app, is_running: !app.is_running } : app
          ),
        };
      }
      return ws;
    });

    set({ workspaces: updated });
    const state = get();
    tauriService.saveConfig({
      theme: state.theme,
      bar_position: state.barPosition,
      auto_hide: state.autoHide,
      workspaces: updated,
    });
  },
}));
