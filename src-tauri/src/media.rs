use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MediaTrackInfo {
    pub title: String,
    pub artist: String,
    pub is_playing: bool,
    pub progress_percent: u32,
}

pub struct MediaService;

impl MediaService {
    /// Obtém dados da mídia em reprodução no Windows (SMTC) ou fallback
    pub fn get_current_track() -> MediaTrackInfo {
        #[cfg(target_os = "windows")]
        {
            use std::os::windows::process::CommandExt;
            const CREATE_NO_WINDOW: u32 = 0x08000000;

            // Tenta consultar sessões ativas do Windows via PowerShell/WinRT de forma assíncrona oculta
            let ps_script = r#"
            $ProgressPreference = 'SilentlyContinue';
            try {
                [Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager, Windows.Media, ContentType = WindowsRuntime] | Out-Null
                $asyncOp = [Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager]::RequestAsync()
                $i = 0
                while ($asyncOp.Status -eq 'Started' -and $i -lt 20) { Start-Sleep -Milliseconds 15; $i++ }
                if ($asyncOp.Status -eq 'Completed') {
                    $mgr = $asyncOp.GetResults()
                    $session = $mgr.GetCurrentSession()
                    if ($session) {
                        $propOp = $session.TryGetMediaPropertiesAsync()
                        $j = 0
                        while ($propOp.Status -eq 'Started' -and $j -lt 20) { Start-Sleep -Milliseconds 15; $j++ }
                        if ($propOp.Status -eq 'Completed') {
                            $props = $propOp.GetResults()
                            $playbackInfo = $session.GetPlaybackInfo()
                            $isPlaying = $playbackInfo.PlaybackStatus -eq 'Playing'
                            if ($props.Title) {
                                @{ title = $props.Title; artist = $props.Artist; is_playing = $isPlaying } | ConvertTo-Json -Compress
                            }
                        }
                    }
                }
            } catch {}
            "#;

            if let Ok(output) = std::process::Command::new("powershell")
                .creation_flags(CREATE_NO_WINDOW)
                .args(["-NoProfile", "-NonInteractive", "-Command", ps_script])
                .output()
            {
                let text = String::from_utf8_lossy(&output.stdout).trim().to_string();
                if let Ok(val) = serde_json::from_str::<serde_json::Value>(&text) {
                    let title = val["title"].as_str().unwrap_or("").to_string();
                    let artist = val["artist"].as_str().unwrap_or("Spotify / Mídia").to_string();
                    let is_playing = val["is_playing"].as_bool().unwrap_or(false);

                    if !title.is_empty() {
                        return MediaTrackInfo {
                            title,
                            artist,
                            is_playing,
                            progress_percent: 50,
                        };
                    }
                }
            }
        }

        // Fallback dinâmico padrão
        MediaTrackInfo {
            title: "Nenhuma mídia ativa".to_string(),
            artist: "Spotify / YouTube".to_string(),
            is_playing: false,
            progress_percent: 0,
        }
    }

    /// Envia comando de mídia (Play/Pause, Próximo, Anterior)
    pub fn send_media_key(command: &str) -> Result<(), String> {
        #[cfg(target_os = "windows")]
        {
            use windows::Win32::UI::WindowsAndMessaging::{PostMessageW, HWND_BROADCAST, WM_APPCOMMAND};
            use windows::Win32::Foundation::{LPARAM, WPARAM};

            // APPCOMMAND_MEDIA_PLAY_PAUSE = 14, APPCOMMAND_MEDIA_NEXTTRACK = 11, APPCOMMAND_MEDIA_PREVIOUSTRACK = 12
            let app_cmd: usize = match command {
                "play_pause" => 14,
                "next" => 11,
                "prev" => 12,
                _ => return Err("Comando de mídia desconhecido".to_string()),
            };

            let lparam = (app_cmd << 16) as isize;

            unsafe {
                let _ = PostMessageW(HWND_BROADCAST, WM_APPCOMMAND, WPARAM(0), LPARAM(lparam));
            }

            return Ok(());
        }

        #[cfg(not(target_os = "windows"))]
        {
            log::info!("Simulando comando de mídia: {}", command);
            Ok(())
        }
    }
}
