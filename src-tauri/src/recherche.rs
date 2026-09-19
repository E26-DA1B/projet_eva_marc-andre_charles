use unicode_normalization::UnicodeNormalization;
use crate::models::Arbre;



fn normaliser(texte: &str) -> String {
    texte.to_lowercase().nfd().filter(|c| !('\u{0300}'..='\u{036F}').contains(c)).collect::<String>()
}

fn rechercher_par_espece<'a>(arbres: &'a [Arbre], recherche: &str) -> Vec<&'a Arbre> {
    let texte_recherche = normaliser(recherche.trim());

    if texte_recherche == "" {
        return arbres.iter().collect();
    }

    arbres.iter().filter(|arbre| {
        let espece = normaliser(arbre.essence_fr());

        espece.contains(texte_recherche.as_str())
    }).collect()
}
