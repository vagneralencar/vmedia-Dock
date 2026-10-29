import { Workspace, SystemMetrics } from '../types/dock';

// Detecta se estamos rodando dentro do WebView do Tauri
const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

export const tauriService = {
  async getWorkspaces(): Promise<Workspace[]> {
    if (isTauri) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        return await invoke<Workspace[]>('get_workspaces');
      } catch (err) {
        console.error('Falha ao chamar get_workspaces no Tauri:', err);
      }
    }

    // Mock para desenvolvimento web rápido
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

    // Mock com variações dinâmicas para preview
    return {
      cpu_usage: Math.round(18 + Math.random() * 25),
      memory_used_mb: 8400,
      memory_total_mb: 16384,
      memory_percentage: 51.2,
    };
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
