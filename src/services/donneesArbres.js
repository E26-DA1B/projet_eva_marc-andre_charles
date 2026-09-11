import Papa from "papaparse";

export function lireCsv(texte) {
  const resultat = Papa.parse(texte, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });
  const colonnes = [
    "EMP_NO",
    "Essence_fr",
    "ARROND_NOM",
    "Longitude",
    "Latitude",
  ];
  if (
    resultat.errors.length ||
    !colonnes.every((champ) => resultat.meta.fields?.includes(champ))
  )
    throw new Error(
      "Le fichier des arbres est invalide. Vérifiez le CSV fourni avec le projet.",
    );
  return resultat.data
    .filter(
      (arbre) =>
        Number.isFinite(arbre.Longitude) &&
        Number.isFinite(arbre.Latitude) &&
        Math.abs(arbre.Longitude) <= 180 &&
        Math.abs(arbre.Latitude) <= 90,
    )
    .map((arbre, index) => ({
      id: `csv-${index + 1}`,
      numeroInventaire: arbre.EMP_NO,
      essenceFr: arbre.Essence_fr || "Inconnue",
      essenceLatin: arbre.Essence_latin || "",
      arrondissement: arbre.ARROND_NOM || "Inconnu",
      diametre: Number.isFinite(arbre.DHP) && arbre.DHP > 0 ? arbre.DHP : null,
      longitude: arbre.Longitude,
      latitude: arbre.Latitude,
    }));
}

export async function chargerArbres() {
  const reponse = await fetch("/data/liste_arbre.csv").catch(() => {
    throw new Error(
      "Impossible de charger les arbres. Vérifiez l’accès aux données locales puis réessayez.",
    );
  });
  if (!reponse.ok)
    throw new Error(
      "Impossible de charger les arbres. Vérifiez le fichier arbres-test.csv.",
    );
  return lireCsv(await reponse.text());
}
