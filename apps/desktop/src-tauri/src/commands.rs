use std::path::{Path, PathBuf};

use serde::Serialize;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BackendInformation {
    application: &'static str,
    version: &'static str,
    native_analyzer_path: Option<String>,
}

fn analyzer_candidates() -> [PathBuf; 4] {
    let filename = if cfg!(windows) {
        "algoviz-analyzer.exe"
    } else {
        "algoviz-analyzer"
    };

    [
        Path::new("build/dev/native/clang-tool").join(filename),
        Path::new("build/release/native/clang-tool").join(filename),
        Path::new("../../build/dev/native/clang-tool").join(filename),
        Path::new("../../build/release/native/clang-tool").join(filename),
    ]
}

#[tauri::command]
pub fn get_backend_information() -> BackendInformation {
    let path = analyzer_candidates()
        .into_iter()
        .find(|candidate| candidate.is_file())
        .map(|candidate| candidate.to_string_lossy().into_owned());

    BackendInformation {
        application: "AlgoViz",
        version: env!("CARGO_PKG_VERSION"),
        native_analyzer_path: path,
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
