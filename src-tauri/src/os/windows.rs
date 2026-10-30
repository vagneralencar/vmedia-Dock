use super::{OSManager, WindowInfo};

pub struct WindowsOSManager;

impl WindowsOSManager {
    pub fn new() -> Self {
        Self
    }

    #[cfg(target_os = "windows")]
    pub fn focus_window(&self, hwnd: isize) -> Result<(), String> {
        use windows::Win32::Foundation::HWND;
        use windows::Win32::UI::WindowsAndMessaging::{SetForegroundWindow, ShowWindow, SW_RESTORE};

        unsafe {
            let hwnd_val = HWND(hwnd as _);
            let _ = ShowWindow(hwnd_val, SW_RESTORE);
            let _ = SetForegroundWindow(hwnd_val);
        }
        Ok(())
    }

    #[cfg(not(target_os = "windows"))]
    pub fn focus_window(&self, hwnd: isize) -> Result<(), String> {
        log::info!("Simulando foco na janela: {}", hwnd);
        Ok(())
    }

    #[cfg(target_os = "windows")]
    pub fn close_window(&self, hwnd: isize) -> Result<(), String> {
        use windows::Win32::Foundation::{HWND, LPARAM, WPARAM};
        use windows::Win32::UI::WindowsAndMessaging::{PostMessageW, WM_CLOSE};

        unsafe {
            let hwnd_val = HWND(hwnd as _);
            PostMessageW(hwnd_val, WM_CLOSE, WPARAM(0), LPARAM(0))
                .map_err(|e| format!("Falha ao fechar janela: {}", e))?;
        }
        Ok(())
    }

    #[cfg(target_os = "windows")]
    pub fn set_autostart(&self, enable: bool) -> Result<(), String> {
        use std::env;
        use std::process::Command;

        let current_exe = env::current_exe().map_err(|e| format!("Erro ao obter executável: {}", e))?;
        let exe_path = current_exe.to_string_lossy().to_string();

        if enable {
            // Adiciona na chave Run do usuário atual via reg.exe
            let status = Command::new("reg")
                .args([
                    "add",
                    r"HKCU\Software\Microsoft\Windows\CurrentVersion\Run",
                    "/v",
                    "VMediaDock",
                    "/t",
                    "REG_SZ",
                    "/d",
                    &format!("\"{}\"", exe_path),
                    "/f",
                ])
                .status()
                .map_err(|e| format!("Erro ao registrar inicialização: {}", e))?;

            if !status.success() {
                return Err("Falha ao adicionar registro de autostart no Windows".to_string());
            }
        } else {
            // Remove da chave Run se existir
            let _ = Command::new("reg")
                .args([
                    "delete",
                    r"HKCU\Software\Microsoft\Windows\CurrentVersion\Run",
                    "/v",
                    "VMediaDock",
                    "/f",
                ])
                .status();
        }

        Ok(())
    }

    #[cfg(target_os = "windows")]
    pub fn select_file(&self) -> Result<Option<String>, String> {
        use std::process::Command;
        // Abre o diálogo nativo do Windows via powershell COM OpenFileDialog
        let script = r#"[System.Reflection.Assembly]::LoadWithPartialName("System.windows.forms") | Out-Null; $f = New-Object System.Windows.Forms.OpenFileDialog; $f.Filter = "Executáveis (*.exe;*.lnk)|*.exe;*.lnk|Todos (*.*)|*.*"; if($f.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK){ Write-Output $f.FileName }"#;
        
        let output = Command::new("powershell")
            .args(["-NoProfile", "-Command", script])
            .output()
            .map_err(|e| format!("Erro ao abrir seletor: {}", e))?;

        let res = String::from_utf8_lossy(&output.stdout).trim().to_string();
        if res.is_empty() {
            Ok(None)
        } else {
            Ok(Some(res))
        }
    }

    #[cfg(not(target_os = "windows"))]
    pub fn select_file(&self) -> Result<Option<String>, String> {
        Ok(Some("/usr/bin/code".to_string()))
    }

    #[cfg(target_os = "windows")]
    pub fn extract_icon(&self, path: &str) -> Result<Option<String>, String> {
        use windows::core::PCWSTR;
        use windows::Win32::UI::Shell::ExtractIconExW;
        use windows::Win32::UI::WindowsAndMessaging::{DestroyIcon, HICON};

        let wide_path: Vec<u16> = path.encode_utf16().chain(std::iter::once(0)).collect();
        let mut large_icon = HICON::default();
        let mut small_icon = HICON::default();

        unsafe {
            let count = ExtractIconExW(
                PCWSTR(wide_path.as_ptr()),
                0,
                Some(&mut large_icon),
                Some(&mut small_icon),
                1,
            );

            if count > 0 && !large_icon.is_invalid() {
                let _ = DestroyIcon(large_icon);
                if !small_icon.is_invalid() {
                    let _ = DestroyIcon(small_icon);
                }
                return Ok(Some("extracted".to_string()));
            }
        }
        Ok(None)
    }

    #[cfg(not(target_os = "windows"))]
    pub fn extract_icon(&self, _path: &str) -> Result<Option<String>, String> {
        Ok(None)
    }

    #[cfg(target_os = "windows")]
    pub fn is_foreground_fullscreen(&self) -> bool {
        use windows::Win32::UI::WindowsAndMessaging::{GetForegroundWindow, GetWindowRect, GetDesktopWindow};
        use windows::Win32::Foundation::RECT;

        unsafe {
            let fg_hwnd = GetForegroundWindow();
            if fg_hwnd.is_invalid() {
                return false;
            }
            let desktop_hwnd = GetDesktopWindow();
            let mut fg_rect = RECT::default();
            let mut desk_rect = RECT::default();

            if GetWindowRect(fg_hwnd, &mut fg_rect).is_ok() && GetWindowRect(desktop_hwnd, &mut desk_rect).is_ok() {
                let is_fullscreen = fg_rect.left <= desk_rect.left
                    && fg_rect.top <= desk_rect.top
                    && fg_rect.right >= desk_rect.right
                    && fg_rect.bottom >= desk_rect.bottom;
                return is_fullscreen;
            }
        }
        false
    }

    #[cfg(not(target_os = "windows"))]
    pub fn is_foreground_fullscreen(&self) -> bool {
        false
    }
}

#[cfg(target_os = "windows")]
impl OSManager for WindowsOSManager {
    fn is_fullscreen(&self) -> bool {
        self.is_foreground_fullscreen()
    }

    fn register_app_bar(&self, hwnd: isize, position: &str, height: i32) -> Result<(), String> {
        use windows::Win32::Foundation::{HWND, RECT};
        use windows::Win32::UI::Shell::{
            SHAppBarMessage, APPBARDATA, ABM_NEW, ABM_SETPOS, ABE_BOTTOM, ABE_TOP,
        };
        use windows::Win32::UI::WindowsAndMessaging::{GetSystemMetrics, SM_CXSCREEN, SM_CYSCREEN};

        unsafe {
            let hwnd_val = HWND(hwnd as _);
            let mut abd = APPBARDATA {
                cbSize: std::mem::size_of::<APPBARDATA>() as u32,
                hWnd: hwnd_val,
                uCallbackMessage: 0,
                uEdge: if position == "top" { ABE_TOP } else { ABE_BOTTOM },
                rc: RECT::default(),
                lParam: Default::default(),
            };

            // 1. Registra a janela como AppBar do Windows
            SHAppBarMessage(ABM_NEW, &mut abd);

            // 2. Define os limites da tela
            let screen_w = GetSystemMetrics(SM_CXSCREEN);
            let screen_h = GetSystemMetrics(SM_CYSCREEN);

            if position == "top" {
                abd.rc = RECT {
                    left: 0,
                    top: 0,
                    right: screen_w,
                    bottom: height,
                };
            } else {
                abd.rc = RECT {
                    left: 0,
                    top: screen_h - height,
                    right: screen_w,
                    bottom: screen_h,
                };
            }

            // 3. Aplica a posição e reserva o espaço para evitar sobreposição de janelas
            SHAppBarMessage(ABM_SETPOS, &mut abd);
        }

        Ok(())
    }

    fn unregister_app_bar(&self, hwnd: isize) -> Result<(), String> {
        use windows::Win32::Foundation::HWND;
        use windows::Win32::UI::Shell::{SHAppBarMessage, APPBARDATA, ABM_REMOVE};

        unsafe {
            let mut abd = APPBARDATA {
                cbSize: std::mem::size_of::<APPBARDATA>() as u32,
                hWnd: HWND(hwnd as _),
                ..Default::default()
            };
            SHAppBarMessage(ABM_REMOVE, &mut abd);
        }

        Ok(())
    }

    fn list_open_windows(&self) -> Result<Vec<WindowInfo>, String> {
        use windows::Win32::Foundation::{BOOL, HWND, LPARAM};
        use windows::Win32::UI::WindowsAndMessaging::{
            EnumWindows, GetWindowTextLengthW, GetWindowTextW, IsWindowVisible, GetWindowThreadProcessId,
        };

        let mut windows_list: Vec<WindowInfo> = Vec::new();

        unsafe extern "system" fn enum_window_proc(hwnd: HWND, lparam: LPARAM) -> BOOL {
            unsafe {
                let list = &mut *(lparam.0 as *mut Vec<WindowInfo>);
                
                if IsWindowVisible(hwnd).as_bool() {
                    let len = GetWindowTextLengthW(hwnd);
                    if len > 0 {
                        let mut buf = vec![0u16; (len + 1) as usize];
                        GetWindowTextW(hwnd, &mut buf);
                        let title = String::from_utf16_lossy(&buf[..len as usize]);

                        let mut pid: u32 = 0;
                        GetWindowThreadProcessId(hwnd, Some(&mut pid));

                        // Filtra janelas de sistema ou vazias
                        if !title.is_empty() && title != "Program Manager" && title != "VMedia Dock" && title != "Settings" {
                            list.push(WindowInfo {
                                id: hwnd.0 as u64,
                                title,
                                process_name: format!("pid:{}", pid),
                                is_minimized: false,
                            });
                        }
                    }
                }
            }
            BOOL(1)
        }

        unsafe {
            EnumWindows(
                Some(enum_window_proc),
                LPARAM(&mut windows_list as *mut _ as isize),
            ).map_err(|e| format!("Falha ao listar janelas: {}", e))?;
        }

        Ok(windows_list)
    }
}

#[cfg(not(target_os = "windows"))]
impl OSManager for WindowsOSManager {
    fn register_app_bar(&self, _hwnd: isize, _position: &str, _height: i32) -> Result<(), String> {
        log::info!("Simulando registro de AppBar do Windows");
        Ok(())
    }

    fn unregister_app_bar(&self, _hwnd: isize) -> Result<(), String> {
        log::info!("Simulando desregistro de AppBar");
        Ok(())
    }

    fn list_open_windows(&self) -> Result<Vec<WindowInfo>, String> {
        Ok(vec![
            WindowInfo {
                id: 101,
                title: "Google Chrome - Nova Guia".to_string(),
                process_name: "chrome.exe".to_string(),
                is_minimized: false,
            },
            WindowInfo {
                id: 102,
                title: "Visual Studio Code - vmedia-dock".to_string(),
                process_name: "code.exe".to_string(),
                is_minimized: false,
            },
            WindowInfo {
                id: 103,
                title: "Windows Terminal".to_string(),
                process_name: "wt.exe".to_string(),
                is_minimized: false,
            },
        ])
    }
}
