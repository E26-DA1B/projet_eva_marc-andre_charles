import { reactive, readonly } from "vue";
import { chargerArbres } from "./donneesArbres.js";

export function validerArbre(donnees) {
  const erreurs = {};
  for (const [champ, titre] of [
    ["essenceFr", "L’essence"],
    ["arrondissement", "L’arrondissement"],
  ]) {
    if (typeof donnees[champ] !== "string" || !donnees[champ].trim())
      erreurs[champ] = `${titre} est obligatoire.`;
    else if (donnees[champ].trim().length > 120)
      erreurs[champ] = "Maximum de 120 caractères.";
  }
  if (
    typeof donnees.essenceLatin === "string" &&
    donnees.essenceLatin.trim().length > 120
  )
    erreurs.essenceLatin = "Maximum de 120 caractères.";
  for (const [champ, minimum, maximum, titre] of [
    ["diametre", 0.1, 1000, "Le diamètre"],
    ["longitude", -180, 180, "La longitude"],
    ["latitude", -90, 90, "La latitude"],
  ]) {
    const valeur = donnees[champ];
    if (
      valeur === null ||
      valeur === undefined ||
      String(valeur).trim() === "" ||
      !Number.isFinite(Number(valeur))
    )
      erreurs[champ] = `${titre} doit être un nombre.`;
    else if (Number(valeur) < minimum || Number(valeur) > maximum)
      erreurs[champ] = `${titre} doit être entre ${minimum} et ${maximum}.`;
  }
  return erreurs;
}

export { lireCsv } from "./donneesArbres.js";

// Collection en mémoire partagée par les vues. Au TP3 : remplacer les opérations par invoke().
export function creerServiceArbres(charger = chargerArbres) {
  const etat = reactive({
    arbres: [],
    favoris: [],
    chargement: false,
    initialise: false,
    erreur: "",
  });
  let requete = null;
  let prochainId = 1;
  function initialiser() {
    if (etat.initialise) return Promise.resolve();
    if (requete) return requete;
    etat.chargement = true;
    etat.erreur = "";
    requete = Promise.resolve()
      .then(charger)
      .then((arbres) => {
        etat.arbres = arbres;
        etat.initialise = true;
      })
      .catch((erreur) => {
        etat.erreur =
          erreur instanceof Error
            ? erreur.message
            : "Impossible de charger les arbres.";
      })
      .finally(() => {
        etat.chargement = false;
        requete = null;
      });
    return requete;
  }
  function preparer(donnees) {
    if (!etat.initialise)
      throw new Error("Attendez le chargement des données avant de continuer.");
    const erreurs = validerArbre(donnees);
    if (Object.keys(erreurs).length) throw new Error(Object.values(erreurs)[0]);
    return {
      essenceFr: donnees.essenceFr.trim(),
      essenceLatin: (donnees.essenceLatin || "").trim(),
      arrondissement: donnees.arrondissement.trim(),
      diametre: Number(donnees.diametre),
      longitude: Number(donnees.longitude),
      latitude: Number(donnees.latitude),
    };
  }
  function ajouter(donnees) {
    const valeurs = preparer(donnees);
    const arbre = {
      ...valeurs,
      id: `local-${prochainId++}`,
      numeroInventaire: null,
    };
    etat.arbres.push(arbre);
    return arbre.id;
  }
  function modifier(id, donnees) {
    const valeurs = preparer(donnees);
    const arbre = etat.arbres.find((element) => element.id === id);
    if (!arbre) throw new Error("Cet arbre n’existe plus.");
    Object.assign(arbre, valeurs);
  }
  function supprimer(id) {
    const index = etat.arbres.findIndex((arbre) => arbre.id === id);
    if (index < 0) throw new Error("Cet arbre n’existe plus.");
    etat.arbres.splice(index, 1);
    etat.favoris = etat.favoris.filter((favori) => favori !== id);
  }
  function ajouterFavori(id) {
    if (!etat.arbres.some((arbre) => arbre.id === id))
      throw new Error("Cet arbre n’existe plus.");
    // Un même arbre ne peut apparaître qu’une seule fois dans les favoris.
    if (!etat.favoris.includes(id)) etat.favoris.push(id);
  }
  function retirerFavori(id) {
    etat.favoris = etat.favoris.filter((favori) => favori !== id);
  }
  return {
    etat: readonly(etat),
    initialiser,
    obtenir: (id) => readonly(etat.arbres).find((arbre) => arbre.id === id),
    ajouter,
    modifier,
    supprimer,
    ajouterFavori,
    retirerFavori,
    estFavori: (id) => etat.favoris.includes(id),
    obtenirFavoris: () =>
      readonly(etat.arbres).filter((arbre) => etat.favoris.includes(arbre.id)),
  };
}

const normaliser = (texte) =>
  String(texte)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr-CA");
export function filtrerArbres(
  arbres,
  recherche = "",
  arrondissement = "",
  tri = "essence",
) {
  const terme = normaliser(recherche.trim());
  return arbres
    .filter(
      (arbre) =>
        (!arrondissement || arbre.arrondissement === arrondissement) &&
        normaliser(
          `${arbre.essenceFr} ${arbre.essenceLatin} ${arbre.arrondissement} ${arbre.numeroInventaire ?? ""}`,
        ).includes(terme),
    )
    .slice()
    .sort((a, b) =>
      tri === "diametre"
        ? (b.diametre ?? -1) - (a.diametre ?? -1)
        : a.essenceFr.localeCompare(b.essenceFr, "fr-CA"),
    );
}
export { calculerResume } from "./statistiquesService.js";
export const arbresService = creerServiceArbres();
