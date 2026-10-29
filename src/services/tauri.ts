import { Workspace, SystemMetrics, AppConfig, WindowInfo } from '../types/dock';

const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

export const tauriService = {
  async loadConfig(): Promise<AppConfig> {
    if (isTauri) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        return await invoke<AppConfig>('load_config');
      } catch (err) {
        console.error('Falha ao carregar configuração nativa:', err);
      }
    }

    // Carrega do LocalStorage em ambiente Web de desenvolvimento
    const saved = localStorage.getItem('vmedia_dock_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Erro ao ler do LocalStorage:', e);
      }
    }

    return {
      theme: 'glass',
      auto_hide: false,
      bar_position: 'bottom',
      workspaces: await this.getWorkspaces(),
    };
  },

  async saveConfig(config: AppConfig): Promise<void> {
    if (isTauri) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('save_config', { config });
        return;
      } catch (err) {
        console.error('Falha ao salvar configuração nativa:', err);
      }
    }

    // Salva no LocalStorage no navegador
    localStorage.setItem('vmedia_dock_config', JSON.stringify(config));
  },

  async getWorkspaces(): Promise<Workspace[]> {
    if (isTauri) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        return await invoke<Workspace[]>('get_workspaces');
      } catch (err) {
        console.error('Falha ao chamar get_workspaces:', err);
      }
    }

    return [
      {
        id: 'work',
        name: 'Trabalho',
        color: '#3b82f6',
        pinned_apps: [
          { id: 'browser', name: 'Navegador', exec_path: 'chrome.exe', icon_name: 'Globe', is_running: true },
          { id: 'code', name: 'VS Code', exec_path: 'code.exe', icon_name: 'Code2', is_running: true },
          { id: 'terminal', name: 'Terminal', exec_path: 'wt.exe', icon_name: 'Terminal', is_running: false },
        ],
        widgets: [
          { id: 'terminal-1', widget_type: 'terminal', size: 'tile', title: 'Mini Terminal' },
          { id: 'clock-1', widget_type: 'clock', size: 'tile', title: 'Relógio' },
          { id: 'sys-1', widget_type: 'system-stats', size: 'tile', title: 'Atividade' },
          { id: 'github-1', widget_type: 'github', size: 'wide', title: 'GitHub' },
          { id: 'pomodoro-1', widget_type: 'pomodoro', size: 'tile', title: 'Pomodoro' },
        ],
      },
      {
        id: 'personal',
        name: 'Pessoal',
        color: '#10b981',
        pinned_apps: [
          { id: 'browser', name: 'Navegador', exec_path: 'chrome.exe', icon_name: 'Globe', is_running: false },
          { id: 'music', name: 'Spotify', exec_path: 'spotify.exe', icon_name: 'Music', is_running: true },
          { id: 'chat', name: 'Discord', exec_path: 'discord.exe', icon_name: 'MessageSquare', is_running: false },
        ],
        widgets: [
          { id: 'terminal-2', widget_type: 'terminal', size: 'tile', title: 'Mini Terminal' },
          { id: 'weather-1', widget_type: 'weather', size: 'wide', title: 'Clima' },
          { id: 'media-1', widget_type: 'media-player', size: 'wide', title: 'Tocando Agora' },
          { id: 'drop-1', widget_type: 'drop-zone', size: 'tile', title: 'Prateleira' },
        ],
      },
    ];
  },

  async getSystemMetrics(): Promise<SystemMetrics> {
    if (isTauri) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        return await invoke<SystemMetrics>('get_system_metrics');
      } catch (err) {
        console.error('Falha ao chamar get_system_metrics:', err);
      }
    }

    return {
      cpu_usage: Math.round(18 + Math.random() * 45),
      memory_used_mb: 8400,
      memory_total_mb: 16384,
      memory_percentage: 51.2,
    };
  },

  async listOpenWindows(): Promise<WindowInfo[]> {
    if (isTauri) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        return await invoke<WindowInfo[]>('list_open_windows');
      } catch (err) {
        console.error('Falha ao listar janelas:', err);
      }
    }

    return [
      { id: 101, title: 'Google Chrome', process_name: 'chrome.exe', is_minimized: false },
      { id: 102, title: 'Visual Studio Code', process_name: 'code.exe', is_minimized: false },
    ];
  },

  async registerAppBar(hwnd: number, position: 'bottom' | 'top', height: number): Promise<void> {
    if (isTauri) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('register_app_bar', { hwnd, position, height });
      } catch (err) {
        console.error('Falha ao registrar AppBar:', err);
      }
    }
  },

  async launchApp(path: string): Promise<string> {
    if (isTauri) {
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke<string>('launch_app', { path });
    }
    console.log(`[Mock Launch]: ${path}`);
    return `Iniciado: ${path}`;
  },
};
