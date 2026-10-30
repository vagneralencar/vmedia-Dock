use serde::{Deserialize, Serialize};
use std::fs::{create_dir_all, read_to_string, write};
use std::path::PathBuf;
use crate::workspaces::Workspace;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppConfig {
    pub theme: String,
    pub auto_hide: bool,
    pub bar_position: String, // "bottom" ou "top"
    pub icon_size: Option<u32>,
    pub autostart: Option<bool>,
    pub update_repo: Option<String>,
    pub github_username: Option<String>,
    pub weather_city: Option<String>,
    pub pomodoro_minutes: Option<u32>,
    pub pause_in_fullscreen: Option<bool>,
    pub workspaces: Vec<Workspace>,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            theme: "glass".to_string(),
            auto_hide: false,
            bar_position: "bottom".to_string(),
            icon_size: Some(48),
            autostart: Some(false),
            update_repo: Some("vagneralencar/vmedia-dock".to_string()),
            github_username: Some("vagneralencar".to_string()),
            weather_city: Some("São Paulo".to_string()),
            pomodoro_minutes: Some(25),
            pause_in_fullscreen: Some(true),
            workspaces: Workspace::default_workspaces(),
        }
    }
}

pub struct ConfigService;

impl ConfigService {
    fn get_config_path() -> Result<PathBuf, String> {
        let base_dir: PathBuf = if cfg!(target_os = "windows") {
            std::env::var("APPDATA")
                .map(PathBuf::from)
                .unwrap_or_else(|_| PathBuf::from("."))
        } else if cfg!(target_os = "macos") {
            std::env::var("HOME")
                .map(|h| PathBuf::from(h).join("Library").join("Application Support"))
                .unwrap_or_else(|_| PathBuf::from("."))
        } else {
            std::env::var("XDG_CONFIG_HOME")
                .map(PathBuf::from)
                .or_else(|_| std::env::var("HOME").map(|h| PathBuf::from(h).join(".config")))
                .unwrap_or_else(|_| PathBuf::from("."))
        };

        let app_dir = base_dir.join("vmedia-dock");
        create_dir_all(&app_dir).map_err(|e| format!("Falha ao criar diretório de configuração: {}", e))?;

        Ok(app_dir.join("config.json"))
    }

    pub fn load() -> AppConfig {
        match Self::get_config_path() {
            Ok(path) => {
                if path.exists() {
                    if let Ok(content) = read_to_string(&path) {
                        if let Ok(config) = serde_json::from_str::<AppConfig>(&content) {
                            return config;
                        }
                    }
                }
                let default_cfg = AppConfig::default();
                let _ = Self::save(&default_cfg);
                default_cfg
            }
            Err(_) => AppConfig::default(),
        }
    }

    pub fn save(config: &AppConfig) -> Result<(), String> {
        let path = Self::get_config_path()?;
        let serialized = serde_json::to_string_pretty(config)
            .map_err(|e| format!("Falha ao serializar configuração: {}", e))?;
        
        write(&path, serialized)
            .map_err(|e| format!("Falha ao salvar arquivo de configuração: {}", e))?;

        Ok(())
    }
}
