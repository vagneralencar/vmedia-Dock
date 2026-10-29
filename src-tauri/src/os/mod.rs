pub mod windows;
pub mod macos;

use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct WindowInfo {
    pub id: u64,
    pub title: String,
    pub process_name: String,
    pub is_minimized: bool,
}

pub trait OSManager {
    fn register_app_bar(&self, hwnd: isize, position: &str, height: i32) -> Result<(), String>;
    fn unregister_app_bar(&self, hwnd: isize) -> Result<(), String>;
    fn list_open_windows(&self) -> Result<Vec<WindowInfo>, String>;
}
