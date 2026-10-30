import { create } from 'zustand';
import { Workspace, SystemMetrics, WindowInfo, UpdateInfo } from '../types/dock';
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
  iconSize: number; // 32 a 64 px
  autostart: boolean;
  updateRepo: string;
  updateInfo: UpdateInfo | null;
  isCheckingUpdate: boolean;
  githubUsername: string;
  weatherCity: string;
  pomodoroMinutes: number;
  
  // Ações
  fetchWorkspaces: () => Promise<void>;
  setActiveWorkspace: (id: string) => void;
  updateMetrics: () => Promise<void>;
  fetchOpenWindows: () => Promise<void>;
  launchApp: (path: string) => Promise<void>;
  setTheme: (theme: 'glass' | 'neon' | 'dark') => void;
  setBarPosition: (position: 'bottom' | 'top') => void;
  setIconSize: (size: number) => void;
  toggleAutoHide: () => void;
  toggleAutostart: () => Promise<void>;
  setUpdateRepo: (repo: string) => void;
  setGithubUsername: (username: string) => void;
  setWeatherCity: (city: string) => void;
  setPomodoroMinutes: (minutes: number) => void;
  checkForUpdates: () => Promise<UpdateInfo | null>;
  addAppToWorkspace: (app: { name: string; exec_path: string; icon_name: string }) => void;
  removeAppFromWorkspace: (appId: string) => void;
  togglePinApp: (appId: string) => void;
  toggleWidget: (widgetType: string, title: string) => void;
  reorderApps: (startIndex: number, endIndex: number) => void;
  focusWindow: (hwnd: number) => Promise<void>;
  closeWindow: (hwnd: number) => Promise<void>;
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
  iconSize: 48,
  autostart: false,
  updateRepo: 'vagneralencar/vmedia-dock',
  updateInfo: null,
  isCheckingUpdate: false,
  githubUsername: 'vagneralencar',
  weatherCity: 'São Paulo',
  pomodoroMinutes: 25,

  fetchWorkspaces: async () => {
    try {
      const config = await tauriService.loadConfig();
      const defaultWorkspaces = await tauriService.getWorkspaces();
      const workspaces = (config && Array.isArray(config.workspaces) && config.workspaces.length > 0)
        ? config.workspaces
        : defaultWorkspaces;

      set({ 
        workspaces, 
        theme: config?.theme || 'glass',
        barPosition: config?.bar_position || 'bottom',
        autoHide: !!config?.auto_hide,
        iconSize: config?.icon_size || 48,
        autostart: !!config?.autostart,
        updateRepo: config?.update_repo || 'vagneralencar/vmedia-dock',
        githubUsername: config?.github_username || 'vagneralencar',
        weatherCity: config?.weather_city || 'São Paulo',
        pomodoroMinutes: config?.pomodoro_minutes || 25,
        activeWorkspaceId: workspaces[0]?.id || 'work',
        isLoading: false 
      });
    } catch (err) {
      console.error('Erro ao carregar configurações:', err);
      const defaultWorkspaces = await tauriService.getWorkspaces();
      set({ 
        workspaces: defaultWorkspaces,
        activeWorkspaceId: defaultWorkspaces[0]?.id || 'work',
        isLoading: false 
      });
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
      icon_size: state.iconSize,
      autostart: state.autostart,
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
      icon_size: state.iconSize,
      autostart: state.autostart,
      workspaces: state.workspaces,
    });
    tauriService.positionDockWindow(barPosition);
  },

  setIconSize: (iconSize) => {
    set({ iconSize });
    const state = get();
    tauriService.saveConfig({
      theme: state.theme,
      bar_position: state.barPosition,
      auto_hide: state.autoHide,
      icon_size: iconSize,
      autostart: state.autostart,
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
      icon_size: state.iconSize,
      autostart: state.autostart,
      workspaces: state.workspaces,
    });
  },

  toggleAutostart: async () => {
    const newAutostart = !get().autostart;
    set({ autostart: newAutostart });
    await tauriService.setAutostart(newAutostart);
    const state = get();
    tauriService.saveConfig({
      theme: state.theme,
      bar_position: state.barPosition,
      auto_hide: state.autoHide,
      icon_size: state.iconSize,
      autostart: newAutostart,
      update_repo: state.updateRepo,
      workspaces: state.workspaces,
    });
  },

  setUpdateRepo: (repo: string) => {
    set({ updateRepo: repo });
    const state = get();
    tauriService.saveConfig({
      theme: state.theme,
      bar_position: state.barPosition,
      auto_hide: state.autoHide,
      icon_size: state.iconSize,
      autostart: state.autostart,
      update_repo: repo,
      github_username: state.githubUsername,
      workspaces: state.workspaces,
    });
  },

  setGithubUsername: (username: string) => {
    set({ githubUsername: username });
    const state = get();
    tauriService.saveConfig({
      theme: state.theme,
      bar_position: state.barPosition,
      auto_hide: state.autoHide,
      icon_size: state.iconSize,
      autostart: state.autostart,
      update_repo: state.updateRepo,
      github_username: username,
      weather_city: state.weatherCity,
      pomodoro_minutes: state.pomodoroMinutes,
      workspaces: state.workspaces,
    });
  },

  setWeatherCity: (city: string) => {
    set({ weatherCity: city });
    const state = get();
    tauriService.saveConfig({
      theme: state.theme,
      bar_position: state.barPosition,
      auto_hide: state.autoHide,
      icon_size: state.iconSize,
      autostart: state.autostart,
      update_repo: state.updateRepo,
      github_username: state.githubUsername,
      weather_city: city,
      pomodoro_minutes: state.pomodoroMinutes,
      workspaces: state.workspaces,
    });
  },

  setPomodoroMinutes: (minutes: number) => {
    set({ pomodoroMinutes: minutes });
    const state = get();
    tauriService.saveConfig({
      theme: state.theme,
      bar_position: state.barPosition,
      auto_hide: state.autoHide,
      icon_size: state.iconSize,
      autostart: state.autostart,
      update_repo: state.updateRepo,
      github_username: state.githubUsername,
      weather_city: state.weatherCity,
      pomodoro_minutes: minutes,
      workspaces: state.workspaces,
    });
  },

  checkForUpdates: async () => {
    const { updateRepo } = get();
    set({ isCheckingUpdate: true });
    try {
      const info = await tauriService.checkForUpdates(updateRepo);
      set({ updateInfo: info, isCheckingUpdate: false });
      return info;
    } catch (err) {
      console.error('Erro na checagem de atualizações:', err);
      set({ isCheckingUpdate: false });
      return null;
    }
  },

  addAppToWorkspace: (newApp) => {
    const { workspaces, activeWorkspaceId } = get();
    const updated = workspaces.map((ws) => {
      if (ws.id === activeWorkspaceId) {
        const app = {
          id: `app-${Date.now()}`,
          name: newApp.name,
          exec_path: newApp.exec_path,
          icon_name: newApp.icon_name || 'Layers',
          is_running: false,
        };
        return {
          ...ws,
          pinned_apps: [...ws.pinned_apps, app],
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
      icon_size: state.iconSize,
      autostart: state.autostart,
      workspaces: updated,
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
      icon_size: state.iconSize,
      autostart: state.autostart,
      workspaces: updated,
    });
  },

  toggleWidget: (widgetType, title) => {
    const { workspaces, activeWorkspaceId } = get();
    const updated = workspaces.map((ws) => {
      if (ws.id === activeWorkspaceId) {
        const exists = ws.widgets.some((w) => w.widget_type === widgetType);
        const widgets = exists
          ? ws.widgets.filter((w) => w.widget_type !== widgetType)
          : [
              ...ws.widgets,
              {
                id: `widget-${widgetType}-${Date.now()}`,
                widget_type: widgetType as any,
                size: (['github', 'weather', 'media-player'].includes(widgetType) ? 'wide' : 'tile') as any,
                title,
              },
            ];

        return { ...ws, widgets };
      }
      return ws;
    });

    set({ workspaces: updated });
    const state = get();
    tauriService.saveConfig({
      theme: state.theme,
      bar_position: state.barPosition,
      auto_hide: state.autoHide,
      icon_size: state.iconSize,
      autostart: state.autostart,
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

  reorderApps: (startIndex: number, endIndex: number) => {
    const { workspaces, activeWorkspaceId } = get();
    const updated = workspaces.map((ws) => {
      if (ws.id === activeWorkspaceId) {
        const apps = [...ws.pinned_apps];
        const [removed] = apps.splice(startIndex, 1);
        if (removed) {
          apps.splice(endIndex, 0, removed);
        }
        return {
          ...ws,
          pinned_apps: apps,
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

  focusWindow: async (hwnd: number) => {
    try {
      await tauriService.focusWindow(hwnd);
    } catch (err) {
      console.error('Erro ao focar janela:', err);
    }
  },

  closeWindow: async (hwnd: number) => {
    try {
      await tauriService.closeWindow(hwnd);
      // Atualiza a lista após fechar
      await get().fetchOpenWindows();
    } catch (err) {
      console.error('Erro ao fechar janela:', err);
    }
  },
}));
