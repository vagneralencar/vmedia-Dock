import { Workspace, SystemMetrics, AppConfig, WindowInfo, AIProviderQuota, MediaTrackInfo, MonitorInfo, UpdateInfo, GitHubContributionsData } from '../types/dock';

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
    const saved = typeof window !== 'undefined' ? localStorage.getItem('vmedia_dock_config') : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.workspaces) && parsed.workspaces.length > 0) {
          return parsed;
        }
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
          { id: 'ai-1', widget_type: 'ai-quota', size: 'wide', title: 'Cotas de IA' },
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

  async focusWindow(hwnd: number): Promise<void> {
    if (isTauri) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('focus_window', { hwnd });
      } catch (err) {
        console.error('Falha ao focar janela:', err);
      }
    }
    console.log(`[Mock Focus Window]: ${hwnd}`);
  },

  async closeWindow(hwnd: number): Promise<void> {
    if (isTauri) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('close_window', { hwnd });
      } catch (err) {
        console.error('Falha ao fechar janela:', err);
      }
    }
    console.log(`[Mock Close Window]: ${hwnd}`);
  },

  async setAutostart(enable: boolean): Promise<void> {
    if (isTauri) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('set_autostart', { enable });
      } catch (err) {
        console.error('Falha ao definir autostart:', err);
      }
    }
    console.log(`[Autostart]: ${enable}`);
  },

  async selectFile(): Promise<string | null> {
    if (isTauri) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        return await invoke<string | null>('select_file');
      } catch (err) {
        console.error('Falha ao abrir seletor nativo:', err);
      }
    }
    // Fallback para ambiente Web / Mock de desenvolvimento
    const input = window.prompt('Informe o caminho do executável (.exe):', 'C:\\Program Files\\App\\app.exe');
    return input || null;
  },

  async extractIcon(path: string): Promise<string | null> {
    if (isTauri) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        return await invoke<string | null>('extract_icon', { path });
      } catch (err) {
        console.error('Falha ao extrair ícone:', err);
      }
    }
    return null;
  },

  async getAIQuotas(): Promise<AIProviderQuota[]> {
    if (isTauri) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        return await invoke<AIProviderQuota[]>('get_ai_quotas');
      } catch (err) {
        console.error('Falha ao coletar cotas de IA nativas:', err);
      }
    }

    // Fallback padrão
    return [
      {
        id: 'claude',
        name: 'Claude Code (WSL)',
        used_requests: 38,
        total_requests: 50,
        used_percentage: 76,
        resets_in: '2h 45m',
        status: 'warning',
        cost_estimate_usd: 4.20,
        source: 'wsl',
      },
      {
        id: 'cursor',
        name: 'Cursor Pro',
        used_requests: 485,
        total_requests: 500,
        used_percentage: 97,
        resets_in: '42m',
        status: 'exceeded',
        cost_estimate_usd: 19.90,
        source: 'windows',
      },
      {
        id: 'openai',
        name: 'OpenAI Codex',
        used_requests: 120,
        total_requests: 500,
        used_percentage: 24,
        resets_in: '1d 12h',
        status: 'ok',
        cost_estimate_usd: 1.85,
        source: 'auto',
      },
      {
        id: 'gemini',
        name: 'Gemini 1.5 Pro',
        used_requests: 14,
        total_requests: 100,
        used_percentage: 14,
        resets_in: '5h 10m',
        status: 'ok',
        cost_estimate_usd: 0.45,
        source: 'auto',
      },
    ];
  },

  async getMediaTrack(): Promise<MediaTrackInfo> {
    if (isTauri) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        return await invoke<MediaTrackInfo>('get_media_track');
      } catch (err) {
        console.error('Falha ao obter mídia nativa:', err);
      }
    }

    return {
      title: 'Garota de Ipanema',
      artist: 'Tom Jobim & Vinicius',
      is_playing: true,
      progress_percent: 45,
    };
  },

  async sendMediaCommand(command: 'play_pause' | 'next' | 'prev'): Promise<void> {
    if (isTauri) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('send_media_command', { command });
      } catch (err) {
        console.error('Falha ao enviar comando de mídia:', err);
      }
    }
    console.log(`[Media Command]: ${command}`);
  },

  async openSettingsWindow(): Promise<void> {
    if (isTauri) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('open_settings_window');
        return;
      } catch (err) {
        console.error('Falha ao abrir janela nativa de ajustes:', err);
      }
    }
  },

  async closeSettingsWindow(): Promise<void> {
    if (isTauri) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('close_settings_window');
        return;
      } catch (err) {
        console.error('Falha ao fechar janela nativa de ajustes:', err);
      }
    }
  },

  async startDragWindow(): Promise<void> {
    if (isTauri) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('start_drag_window');
        return;
      } catch (err) {
        console.error('Falha ao iniciar arraste da janela:', err);
      }
    }
  },

  async listMonitors(): Promise<MonitorInfo[]> {
    if (isTauri) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        return await invoke<MonitorInfo[]>('list_monitors');
      } catch (err) {
        console.error('Falha ao listar monitores:', err);
      }
    }
    return [
      { index: 0, name: 'Tela 1 (Principal)', width: 1920, height: 1080, is_current: true },
    ];
  },

  async positionDockWindow(position?: 'bottom' | 'top', monitorIndex?: number): Promise<void> {
    if (isTauri) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('position_dock_window', {
          position,
          monitorIndex: monitorIndex !== undefined ? monitorIndex : null,
        });
        return;
      } catch (err) {
        console.error('Falha ao posicionar janela do dock:', err);
      }
    }
  },

  async getGitHubContributions(username?: string): Promise<GitHubContributionsData> {
    if (isTauri) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        return await invoke<GitHubContributionsData>('get_github_contributions', { username });
      } catch (err) {
        console.error('Falha ao obter contribuições nativas do GitHub:', err);
      }
    }

    // Fallback Web com chamada direta
    try {
      const u = username || 'vagneralencar';
      const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${u}?y=last`);
      if (res.ok) {
        const data = await res.json();
        const days = data.contributions || [];
        const recent = days.slice(-36).map((d: any) => d.level || 0);
        const weeks: number[][] = [];
        for (let i = 0; i < recent.length; i += 4) {
          weeks.push(recent.slice(i, i + 4));
        }
        return {
          total_contributions: data.total?.lastYear || 0,
          weeks,
          username: u,
        };
      }
    } catch (e) {
      console.error('Erro no fallback do GitHub:', e);
    }

    return {
      total_contributions: 49,
      weeks: [
        [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0],
        [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 3, 0]
      ],
      username: username || 'vagneralencar',
    };
  },

  async checkForUpdates(repo?: string): Promise<UpdateInfo> {
    if (isTauri) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        return await invoke<UpdateInfo>('check_for_updates', { repo });
      } catch (err: any) {
        throw new Error(err?.toString() || 'Erro ao verificar atualizações');
      }
    }
    return {
      current_version: '0.1.0',
      latest_version: '0.1.0',
      has_update: false,
      release_notes: 'Você está usando a versão mais recente.',
      repo: repo || 'vagneralencar/vmedia-dock',
    };
  },

  async installUpdate(downloadUrl: string, repo?: string): Promise<string> {
    if (isTauri) {
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke<string>('install_update', { downloadUrl, repo });
    }
    return 'Simulação de atualização concluída';
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
