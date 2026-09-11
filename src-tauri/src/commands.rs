use unicode_normalization::UnicodeNormalization

fn normaliser(texte: &str) -> String {
    texte.nfd()
        .filter(|c| !unicode_normalization::char::is_combining_mark(*c))
        .collect::<String>()
        .to_lowercase()

}

