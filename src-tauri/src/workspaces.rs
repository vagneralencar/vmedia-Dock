use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PinnedApp {
    pub id: String,
    pub name: String,
    pub exec_path: String,
    pub icon_name: String,
    pub is_running: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DockWidget {
    pub id: String,
    pub widget_type: String, // "system-stats", "clock", "media-player", "pomodoro", "drop-zone"
    pub size: String,        // "tile" (1x1) ou "wide" (2x1 ou 3x1)
    pub title: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Workspace {
    pub id: String,
    pub name: String,
    pub color: String,
    pub pinned_apps: Vec<PinnedApp>,
    pub widgets: Vec<DockWidget>,
}

impl Workspace {
    pub fn default_workspaces() -> Vec<Self> {
        vec![
            Workspace {
                id: "work".to_string(),
                name: "Trabalho".to_string(),
                color: "#3b82f6".to_string(), // Azul
                pinned_apps: vec![
                    PinnedApp {
                        id: "browser".to_string(),
                        name: "Navegador".to_string(),
                        exec_path: "chrome.exe".to_string(),
                        icon_name: "Globe".to_string(),
                        is_running: true,
                    },
                    PinnedApp {
                        id: "code".to_string(),
                        name: "VS Code".to_string(),
                        exec_path: "code.exe".to_string(),
                        icon_name: "Code2".to_string(),
                        is_running: true,
                    },
                    PinnedApp {
                        id: "terminal".to_string(),
                        name: "Terminal".to_string(),
                        exec_path: "wt.exe".to_string(),
                        icon_name: "Terminal".to_string(),
                        is_running: false,
                    },
                ],
                widgets: vec![
                    DockWidget {
                        id: "terminal-1".to_string(),
                        widget_type: "terminal".to_string(),
                        size: "tile".to_string(),
                        title: "Mini Terminal".to_string(),
                    },
                    DockWidget {
                        id: "clock-1".to_string(),
                        widget_type: "clock".to_string(),
                        size: "tile".to_string(),
                        title: "Relógio".to_string(),
                    },
                    DockWidget {
                        id: "sys-1".to_string(),
                        widget_type: "system-stats".to_string(),
                        size: "tile".to_string(),
                        title: "Atividade".to_string(),
                    },
                    DockWidget {
                        id: "github-1".to_string(),
                        widget_type: "github".to_string(),
                        size: "wide".to_string(),
                        title: "GitHub".to_string(),
                    },
                    DockWidget {
                        id: "pomodoro-1".to_string(),
                        widget_type: "pomodoro".to_string(),
                        size: "tile".to_string(),
                        title: "Pomodoro".to_string(),
                    },
                ],
            },
            Workspace {
                id: "personal".to_string(),
                name: "Pessoal".to_string(),
                color: "#10b981".to_string(), // Verde
                pinned_apps: vec![
                    PinnedApp {
                        id: "browser".to_string(),
                        name: "Navegador".to_string(),
                        exec_path: "chrome.exe".to_string(),
                        icon_name: "Globe".to_string(),
                        is_running: false,
                    },
                    PinnedApp {
                        id: "music".to_string(),
                        name: "Spotify".to_string(),
                        exec_path: "spotify.exe".to_string(),
                        icon_name: "Music".to_string(),
                        is_running: true,
                    },
                    PinnedApp {
                        id: "chat".to_string(),
                        name: "Discord".to_string(),
                        exec_path: "discord.exe".to_string(),
                        icon_name: "MessageSquare".to_string(),
                        is_running: false,
                    },
                ],
                widgets: vec![
                    DockWidget {
                        id: "terminal-2".to_string(),
                        widget_type: "terminal".to_string(),
                        size: "tile".to_string(),
                        title: "Mini Terminal".to_string(),
                    },
                    DockWidget {
                        id: "weather-1".to_string(),
                        widget_type: "weather".to_string(),
                        size: "wide".to_string(),
                        title: "Clima".to_string(),
                    },
                    DockWidget {
                        id: "media-1".to_string(),
                        widget_type: "media-player".to_string(),
                        size: "wide".to_string(),
                        title: "Tocando Agora".to_string(),
                    },
                    DockWidget {
                        id: "drop-1".to_string(),
                        widget_type: "drop-zone".to_string(),
                        size: "tile".to_string(),
                        title: "Prateleira".to_string(),
                    },
                ],
            },
        ]
    }
}
