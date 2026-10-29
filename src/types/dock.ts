export interface PinnedApp {
  id: string;
  name: string;
  exec_path: string;
  icon_name: string;
  is_running: boolean;
}

export type WidgetType = 
  | 'system-stats' 
  | 'clock' 
  | 'media-player' 
  | 'pomodoro' 
  | 'drop-zone'
  | 'weather'
  | 'github'
  | 'pet'
  | 'terminal'
  | 'ai-quota';

export interface AIProviderQuota {
  id: string;
  name: string;
  used_requests: number;
  total_requests: number;
  used_percentage: number;
  resets_in: string; // Ex: "4h 15m"
  status: 'ok' | 'warning' | 'exceeded';
  cost_estimate_usd?: number;
  source?: string; // 'windows' | 'wsl' | 'auto'
}

export type WidgetSize = 'tile' | 'wide';

export interface DockWidget {
  id: string;
  widget_type: WidgetType;
  size: WidgetSize;
  title: string;
}

export interface Workspace {
  id: string;
  name: string;
  color: string;
  pinned_apps: PinnedApp[];
  widgets: DockWidget[];
}

export interface SystemMetrics {
  cpu_usage: number;
  memory_used_mb: number;
  memory_total_mb: number;
  memory_percentage: number;
}

export interface WindowInfo {
  id: number;
  title: string;
  process_name: string;
  is_minimized: boolean;
}

export interface AppConfig {
  theme: 'glass' | 'dark' | 'neon';
  auto_hide: boolean;
  bar_position: 'bottom' | 'top';
  icon_size?: number; // Tamanho dos ícones e altura proporcional (32px a 64px)
  autostart?: boolean; // Iniciar automaticamente com o Windows
  workspaces: Workspace[];
}
