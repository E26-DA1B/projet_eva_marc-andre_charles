<script setup>
import { computed, onMounted, ref } from "vue";
import ResumeArbres from "./components/ResumeArbres.vue";
import { chargerArbres } from "./services/donneesArbres.js";
import MapView from "./components/MapView.vue";
import {
  rechercherParEspece,
  filtrerParArrondissement,
  filtrerParDiametre,
  trierArbres,
} from "./services/rechercheArbres.js";
const arbres = ref([]);
const recherche = ref("");
const arrondissementSelectionne = ref("");
const diametreMin = ref("");
const diametreMax = ref("");
const triSelectionne = ref("");

// recherche automatiquement a chaque lettre entrer
const arbresFiltres = computed(() => {
  const resultatRecherche = rechercherParEspece(arbres.value, recherche.value);

  const resultatArrondissement = filtrerParArrondissement(
    resultatRecherche,
    arrondissementSelectionne.value,
  );

  const resultatDiametre = filtrerParDiametre(
    resultatArrondissement,
    diametreMin.value,
    diametreMax.value,
  );

  return trierArbres(resultatDiametre, triSelectionne.value);
});

// calcule le nombre de resultat
const nombreResultats = computed(() => {
  return arbresFiltres.value.length;
});

// recherche automatiquement par arondissement, set pour retirer les doublons
const arrondissements = computed(() => {
  const liste = arbres.value.map((arbre) => arbre.arrondissement);

  return [...new Set(liste)].sort();
});

const chargement = ref(true);
const erreur = ref("");
async function charger() {
  chargement.value = true;
  erreur.value = "";
  try {
    arbres.value = await chargerArbres();
  } catch (e) {
    erreur.value = e.message;
  } finally {
    chargement.value = false;
  }
}
onMounted(charger);
</script>

<template>
  <main class="application">
    <header class="entete">
      <div>
        <h1>ARBREAL</h1>
        <p>Les arbres publics de Montréal</p>
      </div>
    </header>

    <div class="contenu">
      <!-- PANNEAU GAUCHE -->
      <section class="panneau-gauche">
        <div class="resume">
          <p v-if="chargement" role="status">Chargement des statistiques…</p>

          <div v-else-if="erreur" role="alert">
            {{ erreur }}
            <button type="button" @click="charger">Réessayer</button>
          </div>

          <ResumeArbres v-else :arbres="arbresFiltres" />
        </div>

        <div class="zone-map">
          <MapView :arbres="arbresFiltres" />
        </div>
      </section>

      <!-- PANNEAU DROIT -->
      <aside class="panneau-droit">
        <!-- RECHERCHE -->
        <section class="bloc recherche">
          <div class="titre-bloc">Recherche</div>

          <div class="contenu-bloc">
            <label for="recherche-espece"> Espèce </label>

            <input
              id="recherche-espece"
              v-model="recherche"
              type="text"
              placeholder="Ex. érable"
            />

            <label for="arrondissement"> Arrondissement </label>

            <select id="arrondissement" v-model="arrondissementSelectionne">
              <option value="">Tous les arrondissements</option>

              <option
                v-for="arrondissement in arrondissements"
                :key="arrondissement"
                :value="arrondissement"
              >
                {{ arrondissement }}
              </option>
            </select>

            <div class="diametres">
              <div>
                <label for="diametre-min"> Diamètre min. </label>

                <input
                  id="diametre-min"
                  v-model="diametreMin"
                  type="number"
                  min="0"
                  placeholder="20"
                />
              </div>

              <div>
                <label for="diametre-max"> Diamètre max. </label>

                <input
                  id="diametre-max"
                  v-model="diametreMax"
                  type="number"
                  min="0"
                  placeholder="50"
                />
              </div>
            </div>

            <label for="tri"> Trier par </label>

            <select id="tri" v-model="triSelectionne">
              <option value="">Aucun tri</option>
              <option value="espece-az">Espèce A à Z</option>
              <option value="espece-za">Espèce Z à A</option>
              <option value="diametre-croissant">Diamètre croissant</option>
              <option value="diametre-decroissant">Diamètre décroissant</option>
            </select>

            <p class="resultats">{{ nombreResultats }} résultat(s)</p>
          </div>
        </section>

        <!-- FUTURE FICHE D'ARBRE -->
        <section class="bloc fiche-arbre">
          <div class="titre-bloc">Information sur l'arbre</div>

          <div class="contenu-bloc zone-fiche">
            <p>
              Sélectionnez un arbre sur la carte pour afficher ses informations.
            </p>
          </div>
        </section>
      </aside>
    </div>
  </main>
</template>

<style>
* {
  box-sizing: border-box;
}

html,
body,
#app {
  width: 100%;
  height: 100%;
  margin: 0;
}

body {
  font-family: Inter, Arial, sans-serif;

  background: #eef2ee;
  color: #25332c;
}

button,
input,
select {
  font: inherit;
}

.application {
  display: grid;
  grid-template-rows: 64px 1fr;

  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.entete {
  display: flex;
  align-items: center;
  padding: 0 24px;
  background: #183f32;
  color: white;
  border-bottom: 1px solid #2d5849;
}

.entete h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 2px;
}

.entete p {
  margin: 2px 0 0;
  color: #bfd1c7;
  font-size: 12px;
}

.contenu {
  display: grid;
  grid-template-columns: minmax(0, 72%) minmax(280px, 28%);
  min-height: 0;
}

.panneau-gauche {
  display: grid;
  grid-template-rows: auto 1fr;
  min-width: 0;
  min-height: 0;
  border-right: 1px solid #d6ded8;
}

.resume {
  padding: 12px 18px;
  background: #f7f9f6;
  border-bottom: 1px solid #d8e0da;
}

.zone-map {
  min-height: 0;
  overflow: hidden;
}

.panneau-droit {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 280px;
  min-height: 0;
  padding: 14px;
  overflow-y: auto;
  background: #edf2ee;
}

.bloc {
  overflow: hidden;
  background: white;
  border: 1px solid #d6dfd8;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(24, 63, 50, 0.06);
}

.titre-bloc {
  padding: 14px 16px;
  color: #244b3c;
  font-size: 14px;
  font-weight: 700;
  background: #f9fbf9;
  border-bottom: 1px solid #e2e8e3;
}

.contenu-bloc {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px;
}

.contenu-bloc label {
  margin-top: 3px;
  color: #596b61;
  font-size: 12px;
  font-weight: 600;
}

.contenu-bloc input,
.contenu-bloc select {
  width: 100%;
  padding: 9px 10px;
  color: #27372f;
  background: #fbfcfb;
  border: 1px solid #ccd7cf;
  border-radius: 7px;
  outline: none;
}

.contenu-bloc input:focus,
.contenu-bloc select:focus {
  border-color: #4c8065;
  box-shadow: 0 0 0 2px rgba(76, 128, 101, 0.12);
}

.diametres {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.diametres > div {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.resultats {
  margin: 8px 0 0;
  padding-top: 12px;
  color: #285f46;
  font-size: 13px;
  font-weight: 700;
  border-top: 1px solid #e2e8e3;
}

.recherche {
  flex-shrink: 0;
}

.fiche-arbre {
  flex: 1;
  min-height: 180px;
}

.zone-fiche {
  min-height: 150px;
}

.zone-fiche p {
  margin: 0;

  color: #7a8880;
  font-size: 13px;
  line-height: 1.5;
}

/* cell */
@media (max-width: 850px) {
  .contenu {
    grid-template-columns: 1fr;
  }

  .panneau-droit {
    display: none;
  }
}
</style>