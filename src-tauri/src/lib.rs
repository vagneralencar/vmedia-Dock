mod config;
mod os;
mod security;
mod system;
mod workspaces;

use config::{AppConfig, ConfigService};
use os::windows::WindowsOSManager;
use os::{OSManager, WindowInfo};
use security::SecurityValidator;
use system::{MetricsService, SystemMetrics};
use workspaces::Workspace;
use tauri::State;

struct AppState {
    metrics_service: MetricsService,
    os_manager: WindowsOSManager,
}

#[tauri::command]
fn get_system_metrics(state: State<AppState>) -> Result<SystemMetrics, String> {
    state.metrics_service.get_metrics()
}

#[tauri::command]
fn get_workspaces() -> Vec<Workspace> {
    ConfigService::load().workspaces
}

#[tauri::command]
fn load_config() -> AppConfig {
    ConfigService::load()
}

#[tauri::command]
fn save_config(config: AppConfig) -> Result<(), String> {
    ConfigService::save(&config)
}

#[tauri::command]
fn list_open_windows(state: State<AppState>) -> Result<Vec<WindowInfo>, String> {
    state.os_manager.list_open_windows()
}

#[tauri::command]
fn register_app_bar(hwnd: isize, position: String, height: i32, state: State<AppState>) -> Result<(), String> {
    state.os_manager.register_app_bar(hwnd, &position, height)
}

#[tauri::command]
fn unregister_app_bar(hwnd: isize, state: State<AppState>) -> Result<(), String> {
    state.os_manager.unregister_app_bar(hwnd)
}

#[tauri::command]
fn focus_window(hwnd: isize, state: State<AppState>) -> Result<(), String> {
    state.os_manager.focus_window(hwnd)
}

#[tauri::command]
fn close_window(hwnd: isize, state: State<AppState>) -> Result<(), String> {
    state.os_manager.close_window(hwnd)
}

#[tauri::command]
fn launch_app(path: String) -> Result<String, String> {
    let safe_path = SecurityValidator::validate_executable_path(&path)?;
    
    #[cfg(target_os = "windows")]
    {
        use std::process::Command;
        Command::new("cmd")
            .args(["/C", "start", "", &safe_path])
            .spawn()
            .map_err(|e| format!("Falha ao iniciar aplicativo: {}", e))?;
    }

    #[cfg(not(target_os = "windows"))]
    {
        log::info!("Simulando inicialização segura do app: {}", safe_path);
    }

    Ok(format!("Aplicativo iniciado: {}", safe_path))
}

#[tauri::command]
fn set_autostart(enable: bool, state: State<AppState>) -> Result<(), String> {
    state.os_manager.set_autostart(enable)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let metrics_service = MetricsService::new();
    let os_manager = WindowsOSManager::new();
    let app_state = AppState {
        metrics_service,
        os_manager,
    };

    tauri::Builder::default()
        .manage(app_state)
        .plugin(
            tauri_plugin_log::Builder::default()
                .level(log::LevelFilter::Info)
                .build(),
        )
        .invoke_handler(tauri::generate_handler![
            get_system_metrics,
            get_workspaces,
            load_config,
            save_config,
            list_open_windows,
            register_app_bar,
            unregister_app_bar,
            focus_window,
            close_window,
            launch_app,
            set_autostart
        ])
        .run(tauri::generate_context!())
        .expect("Erro ao inicializar o VMedia Dock");
}
