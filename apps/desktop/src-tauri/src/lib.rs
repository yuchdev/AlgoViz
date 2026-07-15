mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::get_backend_information,
            commands::ping_backend
        ])
        .run(tauri::generate_context!())
        .expect("failed to run AlgoViz");
}
