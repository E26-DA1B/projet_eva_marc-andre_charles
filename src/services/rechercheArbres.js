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

export function filtrerParArrondissement(arbres, arrondissement) {
  if (arrondissement === "") {
    return arbres;
  }

  return arbres.filter((arbre) => {
    return arbre.arrondissement === arrondissement;
  });
}

export function filtrerParDiametre(arbres, diametreMin, diametreMax) {
  return arbres.filter((arbre) => {
    if (arbre.diametre == null) {
      return diametreMin === "" && diametreMax === "";
    }

    if (diametreMin !== "" && arbre.diametre < Number(diametreMin)) {
      return false;
    }

    if (diametreMax !== "" && arbre.diametre > Number(diametreMax)) {
      return false;
    }

    return true;
  });
}