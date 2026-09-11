// serialize pour envoyer l'arbre vers Vue
// Deserialize pour recevoir un arbre venant de Vue
use serde::{Deserialize, Serialize};


#[derive(Debug, Clone, Serialize, Deserialize)]
//renommer les noms ex : numeroInventaire a numero_inventaire (pour rust)
#[serde(rename_all = "camelCase")]
pub struct Arbre {
    id: String,
    numero_inventaire: Option<i64>,
    essence_fr: String,
    essence_latin: Option<String>,
    arrondissement: String,
    diametre: Option<f64>,
    longitude: f64,
    latitude: f64,
}

impl Arbre {
    pub fn new(
        id: String,
        numero_inventaire: Option<i64>,
        essence_fr: String,
        essence_latin: Option<String>,
        arrondissement: String,
        diametre: Option<f64>,
        longitude: f64,
        latitude: f64,
    ) -> Self {
        Self {
            id,
            numero_inventaire,
            essence_fr,
            essence_latin,
            arrondissement,
            diametre,
            longitude,
            latitude,
        }
    }

    pub fn id(&self) -> &str {
        &self.id
    }
    pub fn numero_inventaire(&self) -> Option<i64> {
        self.numero_inventaire
    }
    pub fn essence_fr(&self) -> &str {
        &self.essence_fr
    }
    pub fn essence_latin(&self) -> Option<&str> {
        self.essence_latin.as_deref()
    }
    pub fn arrondissement(&self) -> &str {
        &self.arrondissement
    }
    pub fn diametre(&self) -> Option<f64> {
        self.diametre
    }
    pub fn longitude(&self) -> f64 {
        self.longitude
    }
    pub fn latitude(&self) -> f64 {
        self.latitude
    }

    pub fn modifier_diametre(&mut self, nouveau_diametre: Option<f64>) -> Result<(), String> {
        if let Some(diametre) = nouveau_diametre {
            if diametre < 0.1 || diametre > 1000.0 {
                return Err("Le diamètre doit être entre 0,1 et 1000 cm.".to_string());
            }
        }

        self.diametre = nouveau_diametre;

        Ok(())
    }
}