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

export function trierArbres(arbres, tri) {
  const copie = [...arbres];

  if (tri === "espece-az") {
    return copie.sort((a, b) => {
        //pour trier en ordre alphabetique
      return a.essenceFr.localeCompare(b.essenceFr);
    });
  }

  if (tri === "espece-za") {
    return copie.sort((a, b) => {
        
      return b.essenceFr.localeCompare(a.essenceFr);
    });
  }

  if (tri === "diametre-croissant") {
    return copie.sort((a, b) => {
        // ?? Infinity est pour mettre tout les arbres sans diametre a la fin
      return (a.diametre ?? Infinity) - (b.diametre ?? Infinity);
    });
  }

  if (tri === "diametre-decroissant") {
    return copie.sort((a, b) => {
        // meme chose mais -1 pour les mettre au debut en ordre decroissant
      return (b.diametre ?? -1) - (a.diametre ?? -1);
    });
  }

  return copie;
}