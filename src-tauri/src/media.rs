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
            use windows::Win32::UI::WindowsAndMessaging::{
                keybd_event, KEYEVENTF_KEYUP, VK_MEDIA_NEXT_TRACK, VK_MEDIA_PLAY_PAUSE, VK_MEDIA_PREV_TRACK,
            };

            let vk = match command {
                "play_pause" => VK_MEDIA_PLAY_PAUSE.0 as u8,
                "next" => VK_MEDIA_NEXT_TRACK.0 as u8,
                "prev" => VK_MEDIA_PREV_TRACK.0 as u8,
                _ => return Err("Comando de mídia desconhecido".to_string()),
            };

            unsafe {
                keybd_event(vk, 0, Default::default(), 0);
                keybd_event(vk, 0, KEYEVENTF_KEYUP, 0);
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
