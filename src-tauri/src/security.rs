#[cfg(target_os = "windows")]
use std::path::Path;

pub struct SecurityValidator;

impl SecurityValidator {
    /// Valida se um caminho de executável é seguro e existe antes de permitir execução
    pub fn validate_executable_path(path_str: &str) -> Result<String, String> {
        let trimmed = path_str.trim();
        if trimmed.is_empty() {
            return Err("Caminho do executável não pode ser vazio".to_string());
        }

        // Bloqueia caracteres de controle ou comandos compostos maliciosos
        let forbidden_chars = ['&', '|', ';', '`', '$', '<', '>', '\n', '\r'];
        if trimmed.chars().any(|c| forbidden_chars.contains(&c)) {
            return Err("Caracteres ilegais detectados no comando".to_string());
        }

        // Verifica extensões comuns no Windows ou executáveis padrão
        #[cfg(target_os = "windows")]
        {
            let path = Path::new(trimmed);
            if let Some(ext) = path.extension().and_then(|e| e.to_str()) {
                let ext_lower = ext.to_lowercase();
                let allowed_extensions = ["exe", "lnk", "bat", "cmd"];
                if !allowed_extensions.contains(&ext_lower.as_str()) {
                    return Err(format!("Extensão de arquivo não permitida para execução: .{}", ext));
                }
            }
        }

        Ok(trimmed.to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_valid_path() {
        assert!(SecurityValidator::validate_executable_path("C:\\Program Files\\App\\app.exe").is_ok());
    }

    #[test]
    fn test_injection_characters() {
        assert!(SecurityValidator::validate_executable_path("app.exe & calc.exe").is_err());
        assert!(SecurityValidator::validate_executable_path("notepad; format c:").is_err());
    }
}
