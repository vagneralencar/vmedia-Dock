mod ai_quota;
mod config;
mod media;
mod os;
mod security;
mod system;
mod updater;
mod workspaces;

use ai_quota::{AIQuotaCollector, AIQuotaInfo};
use config::{AppConfig, ConfigService};
use media::{MediaService, MediaTrackInfo};
use os::windows::WindowsOSManager;
use os::{OSManager, WindowInfo};
use security::SecurityValidator;
use system::{MetricsService, SystemMetrics};
use updater::{UpdateInfo, UpdaterService};
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
fn check_fullscreen_app(state: State<AppState>) -> bool {
    state.os_manager.is_fullscreen()
}

#[tauri::command]
fn get_workspaces() -> Vec<Workspace> {
    ConfigService::load().workspaces
}

#[derive(serde::Serialize, Clone)]
struct MonitorInfo {
    index: usize,
    name: String,
    width: u32,
    height: u32,
    is_current: bool,
}

#[tauri::command]
fn load_config() -> AppConfig {
    ConfigService::load()
}

#[tauri::command]
fn save_config(app_handle: tauri::AppHandle, config: AppConfig) -> Result<(), String> {
    use tauri::Emitter;
    let res = ConfigService::save(&config);
    let _ = app_handle.emit("config-updated", &config);
    res
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

#[tauri::command]
fn select_file(state: State<AppState>) -> Result<Option<String>, String> {
    state.os_manager.select_file()
}

#[tauri::command]
fn extract_icon(path: String, state: State<AppState>) -> Result<Option<String>, String> {
    state.os_manager.extract_icon(&path)
}

#[tauri::command]
fn get_ai_quotas() -> Vec<AIQuotaInfo> {
    AIQuotaCollector::collect_all_quotas()
}

#[tauri::command]
fn get_media_track() -> MediaTrackInfo {
    MediaService::get_current_track()
}

#[tauri::command]
fn send_media_command(command: String) -> Result<(), String> {
    MediaService::send_media_key(&command)
}

#[derive(serde::Serialize, Clone)]
struct GitHubContributionsPayload {
    total_contributions: u32,
    weeks: Vec<Vec<u32>>,
    username: String,
}

#[tauri::command]
async fn get_github_contributions(username: Option<String>) -> Result<GitHubContributionsPayload, String> {
    let user = username
        .filter(|u| !u.trim().is_empty())
        .or_else(|| ConfigService::load().github_username)
        .unwrap_or_else(|| "vagneralencar".to_string());

    let clean_user = user.trim().trim_start_matches('@');
    if !clean_user.chars().all(|c| c.is_ascii_alphanumeric() || c == '-') || clean_user.is_empty() {
        return Err("Nome de usuário GitHub inválido".to_string());
    }

    let url = format!("https://github-contributions-api.jogruber.de/v4/{}?y=last", clean_user);

    #[derive(serde::Deserialize)]
    struct DayItem {
        level: u32,
    }

    #[derive(serde::Deserialize)]
    struct TotalObj {
        #[serde(rename = "lastYear")]
        last_year: Option<u32>,
    }

    #[derive(serde::Deserialize)]
    struct ApiResponse {
        total: Option<TotalObj>,
        contributions: Option<Vec<DayItem>>,
    }

    let output_str = {
        #[cfg(target_os = "windows")]
        {
            use std::os::windows::process::CommandExt;
            use std::process::Command;
            const CREATE_NO_WINDOW: u32 = 0x08000000;
            let script = format!(
                "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; \
                 $ProgressPreference = 'SilentlyContinue'; \
                 try {{ \
                   $res = Invoke-WebRequest -Uri '{}' -UseBasicParsing -TimeoutSec 10; \
                   Write-Output $res.Content \
                 }} catch {{ \
                   Write-Output '{{}}' \
                 }}",
                url
            );

            let out = Command::new("powershell")
                .creation_flags(CREATE_NO_WINDOW)
                .args(["-NoProfile", "-NonInteractive", "-Command", &script])
                .output()
                .map_err(|e| format!("Erro ao consultar GitHub: {}", e))?;

            String::from_utf8_lossy(&out.stdout).trim().to_string()
        }

        #[cfg(not(target_os = "windows"))]
        {
            use std::process::Command;
            let out = Command::new("curl")
                .args(["-sSL", "--max-time", "10", &url])
                .output()
                .map_err(|e| format!("Erro ao consultar curl: {}", e))?;
            String::from_utf8_lossy(&out.stdout).trim().to_string()
        }
    };

    let parsed: ApiResponse = serde_json::from_str(&output_str).unwrap_or(ApiResponse {
        total: None,
        contributions: None,
    });

    let total = parsed.total.and_then(|t| t.last_year).unwrap_or(0);
    let days = parsed.contributions.unwrap_or_default();

    // Pegamos os últimos 36 dias para preencher 9 colunas x 4 linhas perfeitamente
    let target_days_count = 36;
    let recent_days: Vec<u32> = if days.len() >= target_days_count {
        days[days.len() - target_days_count..].iter().map(|d| d.level).collect()
    } else {
        days.iter().map(|d| d.level).collect()
    };

    // Divide em 9 colunas com 4 itens cada
    let mut weeks = Vec::new();
    for chunk in recent_days.chunks(4) {
        let mut col = chunk.to_vec();
        while col.len() < 4 {
            col.push(0);
        }
        weeks.push(col);
    }

    while weeks.len() < 9 {
        weeks.push(vec![0, 0, 0, 0]);
    }

    Ok(GitHubContributionsPayload {
        total_contributions: total,
        weeks,
        username: clean_user.to_string(),
    })
}

#[tauri::command]
async fn check_for_updates(repo: Option<String>) -> Result<UpdateInfo, String> {
    let target_repo = repo
        .filter(|r| !r.trim().is_empty())
        .or_else(|| ConfigService::load().update_repo)
        .unwrap_or_else(|| "vagneralencar/vmedia-dock".to_string());

    UpdaterService::check_github_release(&target_repo)
}

#[tauri::command]
async fn install_update(
    app_handle: tauri::AppHandle,
    download_url: String,
    repo: Option<String>,
) -> Result<String, String> {
    let target_repo = repo
        .filter(|r| !r.trim().is_empty())
        .or_else(|| ConfigService::load().update_repo)
        .unwrap_or_else(|| "vagneralencar/vmedia-dock".to_string());

    let path = UpdaterService::download_and_launch_installer(&download_url, &target_repo)?;

    // Encerra o app atual após iniciar o instalador para permitir substituição limpa do binário
    #[cfg(target_os = "windows")]
    {
        app_handle.exit(0);
    }

    Ok(format!("Instalador iniciado: {}", path.display()))
}

#[tauri::command]
async fn open_settings_window(app_handle: tauri::AppHandle) -> Result<(), String> {
    use tauri::{Emitter, Manager};

    if let Some(existing) = app_handle.get_webview_window("settings") {
        let _ = existing.show();
        let _ = existing.unminimize();
        let _ = existing.set_focus();
        let _ = app_handle.emit("settings-opened", ());
        return Ok(());
    }

    let url = tauri::WebviewUrl::App("index.html".into());
    let _win = tauri::WebviewWindowBuilder::new(&app_handle, "settings", url)
        .title("Ajustes do VMedia Dock")
        .inner_size(760.0, 560.0)
        .min_inner_size(680.0, 480.0)
        .resizable(true)
        .decorations(true)
        .transparent(false)
        .center()
        .always_on_top(true)
        .skip_taskbar(false)
        .build()
        .map_err(|e| format!("Falha ao criar janela de ajustes: {}", e))?;

    Ok(())
}

#[tauri::command]
fn close_settings_window(app_handle: tauri::AppHandle) -> Result<(), String> {
    use tauri::Manager;

    if let Some(existing) = app_handle.get_webview_window("settings") {
        let _ = existing.hide();
    }
    Ok(())
}

#[tauri::command]
fn start_drag_window(app_handle: tauri::AppHandle) -> Result<(), String> {
    use tauri::Manager;

    if let Some(window) = app_handle.get_webview_window("main") {
        window
            .start_dragging()
            .map_err(|e| format!("Falha ao arrastar janela: {}", e))?;
    }
    Ok(())
}

#[tauri::command]
fn list_monitors(app_handle: tauri::AppHandle) -> Result<Vec<MonitorInfo>, String> {
    use tauri::Manager;

    let mut result = Vec::new();
    if let Some(window) = app_handle.get_webview_window("main") {
        let current_pos = window
            .current_monitor()
            .ok()
            .flatten()
            .map(|m| (*m.position(), *m.size()));

        if let Ok(monitors) = window.available_monitors() {
            for (idx, m) in monitors.into_iter().enumerate() {
                let pos = *m.position();
                let size = *m.size();
                let is_current = current_pos
                    .map(|(cp, cs)| cp.x == pos.x && cp.y == pos.y && cs.width == size.width)
                    .unwrap_or(idx == 0);
                let raw_name = m
                    .name()
                    .cloned()
                    .unwrap_or_else(|| format!("Tela {}", idx + 1));
                let clean_name = raw_name.trim_start_matches(r"\\.\").to_string();

                result.push(MonitorInfo {
                    index: idx,
                    name: format!("Tela {} ({})", idx + 1, clean_name),
                    width: size.width,
                    height: size.height,
                    is_current,
                });
            }
        }
    }
    Ok(result)
}

#[tauri::command]
fn position_dock_window(
    app_handle: tauri::AppHandle,
    position: Option<String>,
    monitor_index: Option<usize>,
) -> Result<(), String> {
    use tauri::Manager;
    use tauri::PhysicalPosition;

    if let Some(window) = app_handle.get_webview_window("main") {
        let target_monitor = if let Some(idx) = monitor_index {
            window
                .available_monitors()
                .ok()
                .and_then(|mut list| if idx < list.len() { Some(list.swap_remove(idx)) } else { None })
        } else {
            window
                .current_monitor()
                .ok()
                .flatten()
                .or_else(|| window.primary_monitor().ok().flatten())
        };

        if let Some(monitor) = target_monitor {
            // Usa work_area() para respeitar a barra de tarefas do Windows (nunca sobrepor a taskbar)
            let work_area = monitor.work_area();
            let win_size = window
                .outer_size()
                .unwrap_or(tauri::PhysicalSize { width: 960, height: 180 });
            let pos_choice = position.as_deref().unwrap_or("bottom");

            let x = work_area.position.x + ((work_area.size.width as i32 - win_size.width as i32) / 2);
            let y = if pos_choice == "top" {
                work_area.position.y + 6
            } else {
                // Posiciona imediatamente acima da barra de tarefas do Windows (work_area)
                work_area.position.y + (work_area.size.height as i32 - win_size.height as i32 - 4)
            };

            let _ = window.set_position(PhysicalPosition::new(x, y));
        }
    }
    Ok(())
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
        .on_window_event(|window, event| {
            // Quando o usuário clica no [X] da janela de Ajustes, apenas oculta para reabrir instantaneamente depois
            if window.label() == "settings" {
                if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                    api.prevent_close();
                    let _ = window.hide();
                }
            }
        })
        .setup(|app| {
            // Cria o System Tray nativo na barra de tarefas do Windows
            use tauri::tray::TrayIconBuilder;
            use tauri::menu::{Menu, MenuItem};
            use tauri::Manager;

            let show_item = MenuItem::with_id(app, "show", "Exibir / Ocultar Dock", true, None::<&str>)?;
            let settings_item = MenuItem::with_id(app, "settings", "Ajustes do VMedia Dock...", true, None::<&str>)?;
            let quit_item = MenuItem::with_id(app, "quit", "Sair do VMedia Dock", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_item, &settings_item, &quit_item])?;

            let tray_builder = TrayIconBuilder::new()
                .menu(&menu)
                .show_menu_on_left_click(true)
                .tooltip("VMedia Dock")
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            if let Ok(visible) = window.is_visible() {
                                if visible {
                                    let _ = window.hide();
                                } else {
                                    let _ = window.show();
                                    let _ = window.set_focus();
                                }
                            }
                        }
                    }
                    "settings" => {
                        let handle = app.clone();
                        tauri::async_runtime::spawn(async move {
                            let _ = open_settings_window(handle).await;
                        });
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                });

            let _tray = if let Some(icon) = app.default_window_icon() {
                tray_builder.icon(icon.clone()).build(app)?
            } else {
                tray_builder.build(app)?
            };

            // Posiciona o dock usando a posição salva na configuração e respeitando a work_area (acima da Taskbar)
            let initial_cfg = ConfigService::load();
            let _ = position_dock_window(app.handle().clone(), Some(initial_cfg.bar_position), None);

            Ok(())
        })
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
            set_autostart,
            select_file,
            extract_icon,
            get_ai_quotas,
            get_media_track,
            send_media_command,
            open_settings_window,
            close_settings_window,
            start_drag_window,
            list_monitors,
            position_dock_window,
            check_for_updates,
            install_update,
            check_fullscreen_app,
            get_github_contributions
        ])
        .run(tauri::generate_context!())
        .expect("Erro ao inicializar o VMedia Dock");
}
