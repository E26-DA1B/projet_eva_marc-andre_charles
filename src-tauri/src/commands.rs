use crate::{models::Arbre, repository};
use std::{path::PathBuf, sync::Mutex};
use tauri::State;

pub struct AppState {
    pub chemin: PathBuf,
    pub verrou: Mutex<()>,
}

#[tauri::command]
pub fn lister_arbres(state: State<'_, AppState>) -> Result<Vec<Arbre>, String> {
    let _verrou = state.verrou.lock().map_err(|e| e.to_string())?;
    repository::charger_arbres(&state.chemin)
}

#[tauri::command]
pub fn importer_arbres(arbres: Vec<Arbre>, state: State<'_, AppState>) -> Result<(), String> {
    let _verrou = state.verrou.lock().map_err(|e| e.to_string())?;
    repository::importer(&state.chemin, &arbres)
}

#[tauri::command]
pub fn ajouter_arbre(arbre: Arbre, state: State<'_, AppState>) -> Result<Arbre, String> {
    let _verrou = state.verrou.lock().map_err(|e| e.to_string())?;
    repository::ajouter(&state.chemin, arbre)
}

#[tauri::command]
pub fn modifier_arbre(
    id: String,
    arbre: Arbre,
    state: State<'_, AppState>,
) -> Result<Arbre, String> {
    let _verrou = state.verrou.lock().map_err(|e| e.to_string())?;
    repository::modifier(&state.chemin, &id, arbre)
}

#[tauri::command]
pub fn supprimer_arbre(id: String, state: State<'_, AppState>) -> Result<(), String> {
    let _verrou = state.verrou.lock().map_err(|e| e.to_string())?;
    repository::supprimer(&state.chemin, &id)
}
