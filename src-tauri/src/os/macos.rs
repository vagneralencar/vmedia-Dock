use super::{OSManager, WindowInfo};

pub struct MacOSManager;

impl MacOSManager {
    pub fn new() -> Self {
        Self
    }
}

impl OSManager for MacOSManager {
    fn register_app_bar(&self, _hwnd: isize, _position: &str, _height: i32) -> Result<(), String> {
        // macOS usa NSPanel com NSWindowCollectionBehaviorCanJoinAllSpaces
        Ok(())
    }

    fn unregister_app_bar(&self, _hwnd: isize) -> Result<(), String> {
        Ok(())
    }

    fn list_open_windows(&self) -> Result<Vec<WindowInfo>, String> {
        // Integração futura com CGWindowListCopyWindowInfo
        Ok(vec![])
    }
}
