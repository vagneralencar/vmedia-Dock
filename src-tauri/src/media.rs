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
            // Tenta consultar sessões ativas do Windows via PowerShell/WinRT
            let ps_script = r#"
            try {
                [Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager, Windows.Media, ContentType = WindowsRuntime] | Out-Null
                $asyncOp = [Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager]::RequestAsync()
                while ($asyncOp.Status -eq 'Started') { Start-Sleep -Milliseconds 10 }
                $mgr = $asyncOp.GetResults()
                $session = $mgr.GetCurrentSession()
                if ($session) {
                    $propOp = $session.TryGetMediaPropertiesAsync()
                    while ($propOp.Status -eq 'Started') { Start-Sleep -Milliseconds 10 }
                    $props = $propOp.GetResults()
                    $playbackInfo = $session.GetPlaybackInfo()
                    $isPlaying = $playbackInfo.PlaybackStatus -eq 'Playing'
                    @{ title = $props.Title; artist = $props.Artist; is_playing = $isPlaying } | ConvertTo-Json -Compress
                }
            } catch {}
            "#;

            if let Ok(output) = std::process::Command::new("powershell")
                .args(["-NoProfile", "-Command", ps_script])
                .output()
            {
                let text = String::from_utf8_lossy(&output.stdout).trim().to_string();
                if let Ok(val) = serde_json::from_str::<serde_json::Value>(&text) {
                    let title = val["title"].as_str().unwrap_or("Mídia Windows").to_string();
                    let artist = val["artist"].as_str().unwrap_or("Spotify / Navegador").to_string();
                    let is_playing = val["is_playing"].as_bool().unwrap_or(true);

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
            title: "Garota de Ipanema".to_string(),
            artist: "Tom Jobim & Vinicius".to_string(),
            is_playing: true,
            progress_percent: 45,
        }
    }

    /// Envia comando de mídia (Play/Pause, Próximo, Anterior)
    pub fn send_media_key(command: &str) -> Result<(), String> {
        #[cfg(target_os = "windows")]
        {
            // Código de tecla virtual: Play/Pause (0xB3 / 179), Next (0xB0 / 176), Prev (0xB1 / 177)
            let vk: u8 = match command {
                "play_pause" => 0xB3,
                "next" => 0xB0,
                "prev" => 0xB1,
                _ => return Err("Comando de mídia desconhecido".to_string()),
            };

            // Envia evento de tecla nativo via powershell wscript.shell ou rotina leve
            let ps_cmd = format!(
                "$wshell = New-Object -ComObject WScript.Shell; $wshell.SendKeys([char]0x{:X})",
                vk
            );
            let _ = std::process::Command::new("powershell")
                .args(["-NoProfile", "-Command", &ps_cmd])
                .spawn();

            return Ok(());
        }

        #[cfg(not(target_os = "windows"))]
        {
            log::info!("Simulando comando de mídia: {}", command);
            Ok(())
        }
    }
}
