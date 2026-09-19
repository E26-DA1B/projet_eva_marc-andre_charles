use unicode_normalization::UnicodeNormalization;

fn normaliser(texte: &str) -> String {
    texte.to_lowercase().nfd().filter(|c| !('\u{0300}'..='\u{036F}').contains(c)).collect::<String>()
}