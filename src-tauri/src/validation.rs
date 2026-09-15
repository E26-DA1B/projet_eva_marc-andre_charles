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

#[cfg(test)]
mod tests {
    use super::*;

    fn arbre_valide() -> Arbre {
        Arbre::new(
            "1".to_string(),
            Some(100),
            "Érable à sucre".to_string(),
            Some("Acer saccharum".to_string()),
            "Verdun".to_string(),
            Some(25.0),
            -73.57,
            45.5,
            None,
            None,
            None,
        )
    }

    #[test]
    fn accepte_un_arbre_valide() {
        assert!(valider_arbre(&arbre_valide()).is_ok());
    }

    #[test]
    fn refuse_les_champs_obligatoires_vides() {
        let mut arbre = arbre_valide();
        arbre = Arbre::new(
            arbre.id().to_string(),
            arbre.numero_inventaire(),
            "   ".to_string(),
            arbre.essence_latin().map(str::to_string),
            arbre.arrondissement().to_string(),
            arbre.diametre(),
            arbre.longitude(),
            arbre.latitude(),
            arbre.rue().map(str::to_string),
            arbre.date_plantation().map(str::to_string),
            arbre.arbre_remarquable().map(str::to_string),
        );
        assert!(valider_arbre(&arbre).is_err());
    }

    #[test]
    fn refuse_un_diametre_hors_limites() {
        let mut arbre = arbre_valide();
        arbre = Arbre::new(
            arbre.id().to_string(),
            arbre.numero_inventaire(),
            arbre.essence_fr().to_string(),
            arbre.essence_latin().map(str::to_string),
            arbre.arrondissement().to_string(),
            Some(1001.0),
            arbre.longitude(),
            arbre.latitude(),
            arbre.rue().map(str::to_string),
            arbre.date_plantation().map(str::to_string),
            arbre.arbre_remarquable().map(str::to_string),
        );
        assert!(valider_arbre(&arbre).is_err());
    }

    #[test]
    fn refuse_des_coordonnees_hors_limites() {
        let mut arbre = arbre_valide();
        arbre = Arbre::new(
            arbre.id().to_string(),
            arbre.numero_inventaire(),
            arbre.essence_fr().to_string(),
            arbre.essence_latin().map(str::to_string),
            arbre.arrondissement().to_string(),
            arbre.diametre(),
            181.0,
            91.0,
            arbre.rue().map(str::to_string),
            arbre.date_plantation().map(str::to_string),
            arbre.arbre_remarquable().map(str::to_string),
        );
        assert!(valider_arbre(&arbre).is_err());
    }
}
