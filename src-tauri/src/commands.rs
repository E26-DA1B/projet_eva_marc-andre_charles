use crate::{models::Arbre, repository, validation};
use std::{path::PathBuf, sync::Mutex};
use tauri::State;

pub struct AppState {
    pub chemin: PathBuf,
    pub chemin_favoris: PathBuf,
    pub chemin_observations: PathBuf,
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
pub fn lister_favoris(state: State<'_, AppState>) -> Result<Vec<String>, String> {
    let _verrou = state.verrou.lock().map_err(|e| e.to_string())?;
    repository::charger_favoris(&state.chemin_favoris)
}

#[tauri::command]
pub fn ajouter_favori(id: String, state: State<'_, AppState>) -> Result<Vec<String>, String> {
    let _verrou = state.verrou.lock().map_err(|e| e.to_string())?;
    let arbres = repository::charger_arbres(&state.chemin)?;
    if !arbres.iter().any(|arbre| arbre.id() == id) {
        return Err("Arbre introuvable.".to_string());
    }
    repository::ajouter_favori(&state.chemin_favoris, id)
}

#[tauri::command]
pub fn retirer_favori(id: String, state: State<'_, AppState>) -> Result<Vec<String>, String> {
    let _verrou = state.verrou.lock().map_err(|e| e.to_string())?;
    repository::retirer_favori(&state.chemin_favoris, &id)
}

#[tauri::command]
pub fn lister_observations(
    state: State<'_, AppState>,
) -> Result<std::collections::HashMap<String, String>, String> {
    let _verrou = state.verrou.lock().map_err(|e| e.to_string())?;
    repository::charger_observations(&state.chemin_observations)
}

#[tauri::command]
pub fn sauvegarder_observation(
    id: String,
    texte: String,
    state: State<'_, AppState>,
) -> Result<std::collections::HashMap<String, String>, String> {
    if texte.chars().count() > 1000 {
        return Err("L’observation doit contenir au maximum 1 000 caractères.".to_string());
    }
    let _verrou = state.verrou.lock().map_err(|e| e.to_string())?;
    let arbres = repository::charger_arbres(&state.chemin)?;
    if !arbres.iter().any(|arbre| arbre.id() == id) {
        return Err("Arbre introuvable.".to_string());
    }
    repository::sauvegarder_observation(&state.chemin_observations, id, texte)
}

#[tauri::command]
pub fn ajouter_arbre(arbre: Arbre, state: State<'_, AppState>) -> Result<Arbre, String> {
    validation::valider_arbre(&arbre)?;
    let _verrou = state.verrou.lock().map_err(|e| e.to_string())?;
    repository::ajouter(&state.chemin, arbre)
}

#[tauri::command]
pub fn modifier_arbre(
    id: String,
    arbre: Arbre,
    state: State<'_, AppState>,
) -> Result<Arbre, String> {
    validation::valider_arbre(&arbre)?;
    let _verrou = state.verrou.lock().map_err(|e| e.to_string())?;
    repository::modifier(&state.chemin, &id, arbre)
}

#[tauri::command]
pub fn supprimer_arbre(id: String, state: State<'_, AppState>) -> Result<(), String> {
    let _verrou = state.verrou.lock().map_err(|e| e.to_string())?;
    repository::supprimer(&state.chemin, &id)?;
    repository::retirer_favori(&state.chemin_favoris, &id)?;
    let mut observations = repository::charger_observations(&state.chemin_observations)?;
    observations.remove(&id);
    repository::sauvegarder_observations(&state.chemin_observations, &observations)
}
