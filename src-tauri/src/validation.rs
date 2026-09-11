// importe structure Arbre de models.rs
use crate::models::Arbre;

// Vérifie si un arbre respecte les règles de notre application
pub fn valider_arbre(arbre: &Arbre) -> Result<(), String> {
    //essence obligatoire
    if arbre.essence_fr().trim().is_empty() {
        return Err("L'essence est obligatoire.".to_string());
    }
    if arbre.essence_fr().len() > 120 {
        return Err("L'essence doit contenir maximum 120 caractères.".to_string());
    }

    // arrondissement obligatoire
    if arbre.arrondissement().trim().is_empty() {
        return Err("L'arrondissement est obligatoire.".to_string());
    }
    if arbre.arrondissement().len() > 120 {
        return Err("L'arrondissement doit contenir maximum 120 caractères.".to_string());
    }

    //  latin facultatif
    if let Some(essence_latin) = arbre.essence_latin() {
        if essence_latin.len() > 120 {
            return Err("Le nom latin doit contenir maximum 120 caractères.".to_string());
        }
    }

    // diamètre facultatif
    if let Some(diametre) = arbre.diametre() {
        if !diametre.is_finite() || diametre < 0.1 || diametre > 1000.0 {
            return Err("Le diamètre doit être entre 0,1 et 1000 cm.".to_string());
        }
    }

    // Latitude valide
    if !arbre.latitude().is_finite() || arbre.latitude() < -90.0 || arbre.latitude() > 90.0 {
        return Err("La latitude doit être entre -90 et 90.".to_string());
    }

    // Longitude valide
    if !arbre.longitude().is_finite() || arbre.longitude() < -180.0 || arbre.longitude() > 180.0 {
        return Err("La longitude doit être entre -180 et 180.".to_string());
    }

    // rue facultative
    if let Some(rue) = arbre.rue() {
        if rue.len() > 120 {
            return Err("La rue doit contenir maximum 120 caractères.".to_string());
        }
    }

    Ok(())
}
