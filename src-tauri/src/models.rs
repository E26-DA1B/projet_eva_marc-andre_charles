// serialize pour envoyer l'arbre vers Vue
// deserialize pour recevoir un arbre venant de Vue
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
// convertit les noms Rust en camelCase pour Vue
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
    rue: Option<String>,
    date_plantation: Option<String>,
    arbre_remarquable: Option<String>,
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
        rue: Option<String>,
        date_plantation: Option<String>,
        arbre_remarquable: Option<String>,
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
            rue,
            date_plantation,
            arbre_remarquable,
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
    pub fn rue(&self) -> Option<&str> {
        self.rue.as_deref()
    }
    pub fn date_plantation(&self) -> Option<&str> {
        self.date_plantation.as_deref()
    }
    pub fn arbre_remarquable(&self) -> Option<&str> {
        self.arbre_remarquable.as_deref()
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
