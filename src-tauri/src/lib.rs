mod security;
mod system;
mod workspaces;

use security::SecurityValidator;
use system::{MetricsService, SystemMetrics};
use workspaces::Workspace;
use tauri::State;

struct AppState {
    metrics_service: MetricsService,
}

#[tauri::command]
fn get_system_metrics(state: State<AppState>) -> Result<SystemMetrics, String> {
    state.metrics_service.get_metrics()
}

#[tauri::command]
fn get_workspaces() -> Vec<Workspace> {
    Workspace::default_workspaces()
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
        // Fallback para desenvolvimento em ambiente não-Windows
        log::info!("Simulando inicialização segura do app: {}", safe_path);
    }

    Ok(format!("Aplicativo iniciado: {}", safe_path))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let metrics_service = MetricsService::new();
    let app_state = AppState { metrics_service };

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
            launch_app
        ])
        .run(tauri::generate_context!())
        .expect("Erro ao inicializar o VMedia Dock");
}
