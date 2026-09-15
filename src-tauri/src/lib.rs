<<<<<<< Updated upstream
pub mod models;
pub mod validation;

=======
>>>>>>> Stashed changes
// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri::Manager;

mod commands;
mod models;
mod repository;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app = tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let dossier = app.path().app_data_dir()?;
            std::fs::create_dir_all(&dossier)?;
            app.manage(commands::AppState {
                chemin: dossier.join("arbres.json"),
                verrou: std::sync::Mutex::new(()),
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::lister_arbres,
            commands::importer_arbres,
            commands::ajouter_arbre,
            commands::modifier_arbre,
            commands::supprimer_arbre
        ])
        .run(tauri::generate_context!());
    app.expect("error while running tauri application");
}
