export function calculerResume(arbres) {
  const diametres = arbres
    .map((arbre) => arbre.diametre)
    .filter((valeur) => Number.isFinite(valeur) && valeur > 0);
  return {
    total: arbres.length,
    essences: new Set(arbres.map((arbre) => arbre.essenceFr)).size,
    arrondissements: new Set(arbres.map((arbre) => arbre.arrondissement)).size,
    diametreMoyen: diametres.length
      ? diametres.reduce((somme, valeur) => somme + valeur, 0) /
        diametres.length
      : null,
  };
}
