import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { calculerResume } from "../src/services/statistiquesService.js";
import { lireCsv } from "../src/services/donneesArbres.js";

test("les statistiques utilisent le CSV livré avec le projet", () => {
  const arbres = lireCsv(
    readFileSync(
      new URL("../public/data/arbres-test.csv", import.meta.url),
      "utf8",
    ),
  );
  const resume = calculerResume(arbres);
  assert.equal(resume.total, 1000);
  assert.equal(resume.essences, 126);
  assert.equal(resume.arrondissements, 1);
  assert.equal(resume.diametreMoyen, 25.752);
});

test("la moyenne ignore les diamètres absents ou invalides", () => {
  const arbres = [
    { essenceFr: "Érable", arrondissement: "Verdun", diametre: 20 },
    { essenceFr: "Érable", arrondissement: "Verdun", diametre: 40 },
    { essenceFr: "Bouleau", arrondissement: "Lachine", diametre: null },
    { essenceFr: "Bouleau", arrondissement: "Lachine", diametre: -1 },
  ];
  assert.deepEqual(calculerResume(arbres), {
    total: 4,
    essences: 2,
    arrondissements: 2,
    diametreMoyen: 30,
  });
  assert.equal(calculerResume([{ diametre: null }]).diametreMoyen, null);
});

test("une collection vide donne des totaux nuls et aucune moyenne", () => {
  assert.deepEqual(calculerResume([]), {
    total: 0,
    essences: 0,
    arrondissements: 0,
    diametreMoyen: null,
  });
});

test("un CSV invalide ne produit pas de statistiques trompeuses", () => {
  assert.throws(() => lireCsv("<!doctype html><html></html>"), /invalide/);
});
