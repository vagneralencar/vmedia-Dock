use super::{OSManager, WindowInfo};

pub struct WindowsOSManager;

impl WindowsOSManager {
    pub fn new() -> Self {
        Self
    }
}

#[cfg(target_os = "windows")]
impl OSManager for WindowsOSManager {
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
            EnumWindows, GetWindowTextLengthW, GetWindowTextW, IsWindowVisible,
        };

        let mut windows_list: Vec<WindowInfo> = Vec::new();

        unsafe extern "system" fn enum_window_proc(hwnd: HWND, lparam: LPARAM) -> BOOL {
            let list = &mut *(lparam.0 as *mut Vec<WindowInfo>);
            
            if IsWindowVisible(hwnd).as_bool() {
                let len = GetWindowTextLengthW(hwnd);
                if len > 0 {
                    let mut buf = vec![0u16; (len + 1) as usize];
                    GetWindowTextW(hwnd, &mut buf);
                    let title = String::from_utf16_lossy(&buf[..len as usize]);

                    // Filtra janelas de sistema ou vazias
                    if !title.is_empty() && title != "Program Manager" && title != "VMedia Dock" {
                        list.push(WindowInfo {
                            id: hwnd.0 as u64,
                            title,
                            process_name: "App".to_string(),
                            is_minimized: false,
                        });
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
                title: "Google Chrome".to_string(),
                process_name: "chrome.exe".to_string(),
                is_minimized: false,
            },
            WindowInfo {
                id: 102,
                title: "Visual Studio Code".to_string(),
                process_name: "code.exe".to_string(),
                is_minimized: false,
            },
        ])
    }
}
