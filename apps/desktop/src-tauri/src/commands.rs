use std::env;
use std::path::{Path, PathBuf};

use serde::Serialize;

const PRODUCT_NAME: &str = "AlgoViz";

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BackendInformation {
    application: &'static str,
    version: &'static str,
    native_analyzer_path: Option<String>,
}

fn analyzer_filename() -> &'static str {
    if cfg!(windows) {
        "algoviz-analyzer.exe"
    } else {
        "algoviz-analyzer"
    }
}

fn repository_relative_candidates() -> [PathBuf; 2] {
    [
        Path::new("build/dev/native/clang-tool").join(analyzer_filename()),
        Path::new("build/release/native/clang-tool").join(analyzer_filename()),
    ]
}

fn candidate_roots() -> Vec<PathBuf> {
    let mut roots = Vec::new();

    if let Ok(current_dir) = env::current_dir() {
        roots.push(current_dir);
    }

    if let Ok(current_exe) = env::current_exe() {
        for ancestor in current_exe.ancestors().skip(1).take(8) {
            let candidate = ancestor.to_path_buf();
            if !roots.iter().any(|root| root == &candidate) {
                roots.push(candidate);
            }
        }
    }

    roots
}

fn discover_analyzer_path() -> Option<String> {
    for root in candidate_roots() {
        for relative_path in repository_relative_candidates() {
            let candidate = root.join(&relative_path);
            if candidate.is_file() {
                return Some(candidate.to_string_lossy().into_owned());
            }
        }
    }

    None
}

#[tauri::command]
pub fn get_backend_information() -> BackendInformation {
    BackendInformation {
        application: PRODUCT_NAME,
        version: env!("CARGO_PKG_VERSION"),
        native_analyzer_path: discover_analyzer_path(),
    }
}

#[tauri::command]
pub fn ping_backend(message: String) -> Result<String, String> {
    let message = message.trim();

    if message.is_empty() {
        return Err("Message must not be empty".to_owned());
    }

    Ok(format!("Rust backend received: {message}"))
}

#[cfg(test)]
mod tests {
    use super::{get_backend_information, ping_backend, PRODUCT_NAME};

    #[test]
    fn ping_backend_accepts_non_blank_input() {
        let response = ping_backend(" frontend ".to_owned()).expect("ping should succeed");
        assert_eq!(response, "Rust backend received: frontend");
    }

    #[test]
    fn ping_backend_rejects_blank_input() {
        let error = ping_backend("   ".to_owned()).expect_err("blank ping should fail");
        assert_eq!(error, "Message must not be empty");
    }

    #[test]
    fn backend_information_reports_product_metadata() {
        let info = get_backend_information();
        assert_eq!(info.application, PRODUCT_NAME);
        assert!(!info.version.is_empty());
    }
}
