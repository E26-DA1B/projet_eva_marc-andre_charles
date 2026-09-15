import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  calculerResume,
  creerServiceArbres,
  filtrerArbres,
  lireCsv,
  validerArbre,
} from "../src/services/arbresService.js";

const valide = {
  essenceFr: "Érable à sucre",
  essenceLatin: "Acer saccharum",
  arrondissement: "Verdun",
  diametre: 25,
  longitude: -73.57,
  latitude: 45.5,
};

test("les favoris acceptent les arbres existants sans doublon (#19)", async () => {
  const service = creerServiceArbres(async () => []);
  await service.initialiser();
  const id = service.ajouter(valide);
  assert.throws(() => service.ajouterFavori("absent"), /existe plus/);
  service.ajouterFavori(id);
  service.ajouterFavori(id);
  assert.equal(service.estFavori(id), true);
  assert.equal(service.obtenirFavoris().length, 1);
  assert.equal(service.etat.arbres.length, 1);
});

test("les favoris reflètent les modifications et disparaissent avec l’arbre (#20)", async () => {
  const service = creerServiceArbres(async () => []);
  await service.initialiser();
  const premier = service.ajouter(valide);
  const second = service.ajouter({ ...valide, essenceFr: "Bouleau" });
  service.ajouterFavori(premier);
  assert.deepEqual(
    service.obtenirFavoris().map((arbre) => arbre.id),
    [premier],
  );
  service.modifier(premier, { ...valide, diametre: 40 });
  assert.equal(service.obtenirFavoris()[0].diametre, 40);
  service.supprimer(premier);
  assert.deepEqual(service.obtenirFavoris(), []);
  assert.deepEqual(service.etat.favoris, []);
  assert.equal(service.obtenir(second).essenceFr, "Bouleau");
});

test("retirer un favori conserve l’arbre; une nouvelle session repart sans favoris (#21)", async () => {
  const service = creerServiceArbres(async () => [{ ...valide, id: "csv-1" }]);
  await service.initialiser();
  service.ajouterFavori("csv-1");
  service.retirerFavori("csv-1");
  service.retirerFavori("csv-1");
  assert.equal(service.estFavori("csv-1"), false);
  assert.equal(service.etat.arbres.length, 1);
  service.ajouterFavori("csv-1");
  await service.initialiser();
  assert.equal(service.obtenirFavoris().length, 1);
  const autreSession = creerServiceArbres(async () => [
    { ...valide, id: "csv-1" },
  ]);
  await autreSession.initialiser();
  assert.deepEqual(autreSession.obtenirFavoris(), []);
});

test("le CSV livré se lit et contient des coordonnées valides et des identifiants uniques", () => {
  const arbres = lireCsv(
    readFileSync(
      new URL("../public/data/liste_arbre.csv", import.meta.url),
      "utf8",
    ),
  );
  assert.equal(arbres.length, 122480);
  assert.equal(new Set(arbres.map((arbre) => arbre.id)).size, arbres.length);
  assert.ok(
    arbres.every(
      (arbre) =>
        Number.isFinite(arbre.latitude) && Number.isFinite(arbre.longitude),
    ),
  );
  assert.equal(calculerResume(arbres).essences, 604);
});
test("un CSV absent remplacé par du HTML, ou un CSV malformé, ne devient pas une collection vide", () => {
  assert.throws(() => lireCsv("<!doctype html><html></html>"), /invalide/);
  assert.throws(
    () => lireCsv('EMP_NO,Essence_fr,ARROND_NOM,Longitude,Latitude\n1,"nom'),
    /invalide/,
  );
  assert.deepEqual(
    lireCsv("EMP_NO,Essence_fr,ARROND_NOM,Longitude,Latitude\n"),
    [],
  );
});
test("la validation refuse les blancs et les nombres hors limites, et accepte les bornes", () => {
  assert.deepEqual(validerArbre(valide), {});
  for (const champ of [
    "essenceFr",
    "arrondissement",
    "diametre",
    "longitude",
    "latitude",
  ]) {
    assert.ok(validerArbre({ ...valide, [champ]: "   " })[champ]);
  }
  for (const [champ, valeur] of [
    ["diametre", -1],
    ["diametre", 1001],
    ["latitude", 91],
    ["longitude", -181],
    ["latitude", NaN],
  ]) {
    assert.ok(validerArbre({ ...valide, [champ]: valeur })[champ]);
  }
  assert.deepEqual(
    validerArbre({ ...valide, diametre: 0.1, latitude: -90, longitude: 180 }),
    {},
  );
});
test("une session permet ajout, modification, suppression sans accepter une mutation invalide", async () => {
  const service = creerServiceArbres(async () => []);
  assert.throws(() => service.ajouter(valide), /chargement/);
  await service.initialiser();
  const id = service.ajouter({ ...valide, essenceFr: " Érable à sucre " });
  assert.equal(service.obtenir(id).essenceFr, "Érable à sucre");
  assert.throws(() => service.modifier(id, { ...valide, diametre: -2 }));
  assert.equal(service.obtenir(id).diametre, 25);
  service.modifier(id, { ...valide, diametre: 40 });
  assert.equal(calculerResume(service.etat.arbres).diametreMoyen, 40);
  await service.initialiser();
  assert.equal(service.etat.arbres.length, 1);
  service.supprimer(id);
  assert.equal(service.etat.arbres.length, 0);
  assert.throws(() => service.supprimer(id), /existe plus/);
  assert.throws(() => service.modifier(id, valide), /existe plus/);
  assert.notEqual(service.ajouter(valide), id);
  const autreSession = creerServiceArbres(async () => []);
  await autreSession.initialiser();
  assert.equal(autreSession.etat.arbres.length, 0);
});
test("une erreur de chargement est visible et permet une nouvelle tentative", async () => {
  let appels = 0;
  const service = creerServiceArbres(async () => {
    if (++appels === 1) throw new Error("CSV indisponible");
    return [];
  });
  const attente = service.initialiser();
  assert.equal(service.etat.chargement, true);
  assert.equal(service.initialiser(), attente);
  await attente;
  assert.equal(service.etat.erreur, "CSV indisponible");
  assert.equal(service.etat.initialise, false);
  assert.equal(service.etat.chargement, false);
  await service.initialiser();
  assert.equal(service.etat.initialise, true);
  assert.equal(service.etat.erreur, "");
  assert.equal(appels, 2);
});
test("recherche sans accents, filtre et tri combinés ne modifient pas la collection", () => {
  const arbres = [
    { ...valide, id: "1", diametre: 10 },
    { ...valide, id: "2", diametre: 50 },
    { ...valide, id: "3", arrondissement: "Lachine", diametre: 20 },
  ];
  assert.deepEqual(
    filtrerArbres(arbres, "ERABLE", "Verdun", "diametre").map(
      (arbre) => arbre.id,
    ),
    ["2", "1"],
  );
  assert.deepEqual(
    arbres.map((arbre) => arbre.id),
    ["1", "2", "3"],
  );
  assert.equal(filtrerArbres(arbres, "aucun-resultat").length, 0);
});
test("les résumés vides ou sans diamètre ne produisent ni NaN ni moyenne trompeuse", () => {
  assert.deepEqual(calculerResume([]), {
    total: 0,
    essences: 0,
    arrondissements: 0,
    diametreMoyen: null,
  });
  assert.equal(
    calculerResume([
      { ...valide, diametre: null },
      { ...valide, diametre: 30 },
    ]).diametreMoyen,
    30,
  );
});
