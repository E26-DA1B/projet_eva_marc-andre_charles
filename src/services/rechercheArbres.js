// .normalize "NFD" separe les accent des lettres et ensuite remplace les accent avec rien pour les enlever
function normaliser(texte) {
  return texte
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function rechercherParEspece(arbres, recherche) {
  const texteRecherche = normaliser(recherche.trim());

  if (texteRecherche === "") {
    return arbres;
  }

  return arbres.filter((arbre) => {
    const espece = normaliser(arbre.essenceFr);

    return espece.includes(texteRecherche);
  });
}