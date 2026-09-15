pub mod models;
pub mod validation;
// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri::Manager;

mod commands;
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
                chemin_favoris: dossier.join("favoris.json"),
                verrou: std::sync::Mutex::new(()),
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::lister_arbres,
            commands::importer_arbres,
            commands::lister_favoris,
            commands::ajouter_favori,
            commands::retirer_favori,
            commands::ajouter_arbre,
            commands::modifier_arbre,
            commands::supprimer_arbre
        ])
        .run(tauri::generate_context!());
    app.expect("erreur lors de l'exécution de l'application Tauri");
}
