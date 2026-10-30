use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UpdateInfo {
    pub current_version: String,
    pub latest_version: String,
    pub has_update: bool,
    pub release_notes: String,
    pub download_url: Option<String>,
    pub asset_name: Option<String>,
    pub published_at: Option<String>,
    pub repo: String,
}

#[derive(Debug, Deserialize)]
struct GitHubRelease {
    tag_name: String,
    name: Option<String>,
    body: Option<String>,
    published_at: Option<String>,
    assets: Option<Vec<GitHubAsset>>,
}

#[derive(Debug, Deserialize)]
struct GitHubAsset {
    name: String,
    browser_download_url: String,
}

pub struct UpdaterService;

impl UpdaterService {
    pub fn current_version() -> String {
        env!("CARGO_PKG_VERSION").to_string()
    }

    /// Valida estritamente o formato "owner/repo" para impedir injeção de URL ou comandos
    pub fn validate_repo_slug(repo: &str) -> Result<String, String> {
        let trimmed = repo.trim().trim_matches('/');
        let parts: Vec<&str> = trimmed.split('/').collect();
        if parts.len() != 2 || parts[0].is_empty() || parts[1].is_empty() {
            return Err("Formato de repositório inválido. Use 'usuario/repositorio'.".to_string());
        }

        let is_safe_part = |s: &str| {
            s.len() <= 100
                && s.chars()
                    .all(|c| c.is_ascii_alphanumeric() || c == '-' || c == '_' || c == '.')
                && !s.contains("..")
        };

        if !is_safe_part(parts[0]) || !is_safe_part(parts[1]) {
            return Err("Nome de repositório contém caracteres não permitidos.".to_string());
        }

        Ok(format!("{}/{}", parts[0], parts[1]))
    }

    /// Compara duas versões semânticas (ex: "0.1.0" vs "v0.2.0")
    pub fn is_newer_version(current: &str, latest: &str) -> bool {
        let parse_ver = |v: &str| -> Vec<u32> {
            v.trim()
                .trim_start_matches(['v', 'V'])
                .split('-')
                .next()
                .unwrap_or("0.0.0")
                .split('.')
                .map(|n| n.parse::<u32>().unwrap_or(0))
                .collect()
        };

        let cur = parse_ver(current);
        let lat = parse_ver(latest);

        for i in 0..3 {
            let c = *cur.get(i).unwrap_or(&0);
            let l = *lat.get(i).unwrap_or(&0);
            if l > c {
                return true;
            } else if l < c {
                return false;
            }
        }
        false
    }

    /// Consulta a última release no GitHub Releases de forma segura via HTTPS
    pub fn check_github_release(repo: &str) -> Result<UpdateInfo, String> {
        let safe_repo = Self::validate_repo_slug(repo)?;
        let current_version = Self::current_version();
        let api_url = format!("https://api.github.com/repos/{}/releases/latest", safe_repo);

        let raw_json = Self::fetch_https_json(&api_url)?;
        let release: GitHubRelease = serde_json::from_str(&raw_json)
            .map_err(|_| "Não foi possível ler os dados da versão no GitHub.".to_string())?;

        let latest_version = release.tag_name.trim_start_matches(['v', 'V']).to_string();
        let has_update = Self::is_newer_version(&current_version, &latest_version);

        // Procura o instalador Windows (.exe ou .msi) nos assets da release
        let mut download_url = None;
        let mut asset_name = None;

        if let Some(assets) = release.assets {
            let preferred = assets
                .iter()
                .find(|a| {
                    let lower = a.name.to_lowercase();
                    (lower.ends_with("-setup.exe") || lower.ends_with(".exe") || lower.ends_with(".msi"))
                        && !lower.contains("uninstall")
                });

            if let Some(asset) = preferred {
                if Self::validate_download_url(&asset.browser_download_url, &safe_repo).is_ok() {
                    download_url = Some(asset.browser_download_url.clone());
                    asset_name = Some(asset.name.clone());
                }
            }
        }

        let notes = release
            .body
            .or(release.name)
            .unwrap_or_else(|| "Melhorias de estabilidade e desempenho.".to_string());

        Ok(UpdateInfo {
            current_version,
            latest_version,
            has_update,
            release_notes: notes,
            download_url,
            asset_name,
            published_at: release.published_at,
            repo: safe_repo,
        })
    }

    /// Valida se a URL de download pertence estritamente ao GitHub Releases do repositório configurado
    pub fn validate_download_url(url: &str, safe_repo: &str) -> Result<String, String> {
        let trimmed = url.trim();
        let expected_prefix = format!("https://github.com/{}/releases/download/", safe_repo);

        if !trimmed.starts_with(&expected_prefix) {
            return Err("URL de atualização não confiável: deve pertencer ao GitHub Releases oficial.".to_string());
        }

        let lower = trimmed.to_lowercase();
        if !lower.ends_with(".exe") && !lower.ends_with(".msi") {
            return Err("Formato de instalador inválido: apenas .exe ou .msi são permitidos.".to_string());
        }

        let forbidden = ['\'', '"', ';', '&', '|', '`', '$', '\n', '\r', ' '];
        if trimmed.chars().any(|c| forbidden.contains(&c)) {
            return Err("URL de download contém caracteres inválidos.".to_string());
        }

        Ok(trimmed.to_string())
    }

    #[cfg(target_os = "windows")]
    fn fetch_https_json(url: &str) -> Result<String, String> {
        use std::os::windows::process::CommandExt;
        use std::process::Command;

        const CREATE_NO_WINDOW: u32 = 0x08000000;
        let script = format!(
            "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; \
             $ProgressPreference = 'SilentlyContinue'; \
             try {{ \
               $res = Invoke-WebRequest -Uri '{}' -Headers @{{'User-Agent'='VMedia-Dock-Updater'}} -UseBasicParsing -TimeoutSec 15; \
               Write-Output $res.Content \
             }} catch {{ \
               Write-Error $_.Exception.Message; exit 1 \
             }}",
            url
        );

        let output = Command::new("powershell")
            .creation_flags(CREATE_NO_WINDOW)
            .args(["-NoProfile", "-NonInteractive", "-Command", &script])
            .output()
            .map_err(|e| format!("Falha ao consultar servidor de atualização: {}", e))?;

        if !output.status.success() {
            return Err("Nenhuma release pública encontrada para este repositório no GitHub.".to_string());
        }

        Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
    }

    #[cfg(not(target_os = "windows"))]
    fn fetch_https_json(url: &str) -> Result<String, String> {
        use std::process::Command;

        let output = Command::new("curl")
            .args(["-sSL", "-A", "VMedia-Dock-Updater", "--max-time", "15", url])
            .output()
            .map_err(|e| format!("Erro ao consultar GitHub: {}", e))?;

        if !output.status.success() {
            return Err("Nenhuma release encontrada no GitHub.".to_string());
        }

        Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
    }

    /// Baixa o instalador na pasta temporária do sistema e inicia a atualização
    pub fn download_and_launch_installer(download_url: &str, repo: &str) -> Result<PathBuf, String> {
        let safe_repo = Self::validate_repo_slug(repo)?;
        let safe_url = Self::validate_download_url(download_url, &safe_repo)?;

        let ext = if safe_url.to_lowercase().ends_with(".msi") {
            "msi"
        } else {
            "exe"
        };

        let installer_path = std::env::temp_dir().join(format!("vmedia-dock-update-setup.{}", ext));

        #[cfg(target_os = "windows")]
        {
            use std::os::windows::process::CommandExt;
            use std::process::Command;

            const CREATE_NO_WINDOW: u32 = 0x08000000;
            let dest_str = installer_path.to_string_lossy().replace('\'', "''");

            let dl_script = format!(
                "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; \
                 $ProgressPreference = 'SilentlyContinue'; \
                 Invoke-WebRequest -Uri '{}' -OutFile '{}' -Headers @{{'User-Agent'='VMedia-Dock-Updater'}} -UseBasicParsing -TimeoutSec 120",
                safe_url, dest_str
            );

            let status = Command::new("powershell")
                .creation_flags(CREATE_NO_WINDOW)
                .args(["-NoProfile", "-NonInteractive", "-Command", &dl_script])
                .status()
                .map_err(|e| format!("Falha ao baixar instalador: {}", e))?;

            if !status.success() {
                return Err("Não foi possível concluir o download do instalador.".to_string());
            }

            let metadata = std::fs::metadata(&installer_path)
                .map_err(|_| "Arquivo do instalador não encontrado após download.".to_string())?;

            if metadata.len() < 100_000 {
                let _ = std::fs::remove_file(&installer_path);
                return Err("O arquivo baixado é inválido ou está incompleto.".to_string());
            }

            // Inicia o instalador NSIS ou MSI
            if ext == "msi" {
                Command::new("msiexec")
                    .args(["/i", &installer_path.to_string_lossy(), "/passive"])
                    .spawn()
                    .map_err(|e| format!("Erro ao iniciar instalador MSI: {}", e))?;
            } else {
                // Instalador NSIS do Tauri (/P = passive com barra de progresso e reinício automático)
                Command::new(&installer_path)
                    .arg("/P")
                    .spawn()
                    .map_err(|e| format!("Erro ao iniciar instalador: {}", e))?;
            }
        }

        Ok(installer_path)
    }
}
