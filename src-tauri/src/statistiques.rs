use crate::models::Arbre;
use serde::Serialize;
// HashSet permet de compter les valeurs sans doublon
use std::collections::HashSet;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Statistiques {
    pub total: usize,
    pub essences: usize,
    pub arrondissements: usize,
    pub diametre_moyen: Option<f64>,
}

// Recoit une liste d'arbres et retourne les statistiques
pub fn calculer_statistiques(arbres: &[Arbre]) -> Statistiques {
    let mut essences = HashSet::new();
    let mut arrondissements = HashSet::new();
    let mut somme_diametres = 0.0;
    let mut nombre_diametres = 0;

    for arbre in arbres {
        essences.insert(arbre.essence_fr());
        arrondissements.insert(arbre.arrondissement());

        if let Some(diametre) = arbre.diametre() {
            if diametre.is_finite() && diametre > 0.0 {
                somme_diametres += diametre;
                nombre_diametres += 1;
            }
        }
    }

    let diametre_moyen = if nombre_diametres > 0 {
        Some(somme_diametres / nombre_diametres as f64)
    } else {
        None
    };

    Statistiques {
        total: arbres.len(),
        essences: essences.len(),
        arrondissements: arrondissements.len(),
        diametre_moyen,
    }
}
