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
  | 'ai-quota'
  | 'clipboard';

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

export interface MediaTrackInfo {
  title: string;
  artist: string;
  is_playing: boolean;
  progress_percent: number;
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

export interface MonitorInfo {
  index: number;
  name: string;
  width: number;
  height: number;
  is_current: boolean;
}

export interface UpdateInfo {
  current_version: string;
  latest_version: string;
  has_update: boolean;
  release_notes: string;
  download_url?: string;
  asset_name?: string;
  published_at?: string;
  repo: string;
}

export interface GitHubContributionsData {
  total_contributions: number;
  weeks: number[][]; // matriz [coluna][linha] de níveis 0..4
  username: string;
}

export interface AppConfig {
  theme: 'glass' | 'dark' | 'neon';
  auto_hide: boolean;
  bar_position: 'bottom' | 'top';
  icon_size?: number; // Tamanho dos ícones e altura proporcional (32px a 64px)
  autostart?: boolean; // Iniciar automaticamente com o Windows
  update_repo?: string; // Repositório GitHub (ex: vagneralencar/vmedia-dock)
  github_username?: string; // Usuário GitHub para o widget de contribuições
  weather_city?: string; // Cidade para o widget de clima
  pomodoro_minutes?: number; // Minutos de foco para o pomodoro (padrão: 25)
  pause_in_fullscreen?: boolean; // Pausar animações e métricas se houver app em tela cheia
  workspaces: Workspace[];
}
