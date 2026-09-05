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
  <main>
    <header>
      <h1>ARBRE PUBLIC DE MTL</h1>
    </header>
    <section class="recherche">
      <label for="recherche-espece">Rechercher une espèce</label>

      <input
        id="recherche-espece"
        v-model="recherche"
        type="text"
        placeholder="Ex. érable"
      />
      <label for="arrondissement">Arrondissement</label>

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
      <label for="diametre-min">Diamètre minimum</label>
      <input
        id="diametre-min"
        v-model="diametreMin"
        type="number"
        min="0"
        placeholder="Ex. 20"
      />

      <label for="diametre-max">Diamètre maximum</label>
      <input
        id="diametre-max"
        v-model="diametreMax"
        type="number"
        min="0"
        placeholder="Ex. 50"
      />

      <label for="tri">Trier par</label>
      <select id="tri" v-model="triSelectionne">
        <option value="">Aucun tri</option>
        <option value="espece-az">Espèce A à Z</option>
        <option value="espece-za">Espèce Z à A</option>
        <option value="diametre-croissant">Diamètre croissant</option>
        <option value="diametre-decroissant">Diamètre décroissant</option>
      </select>
    </section>
    <section class="resume" aria-label="Statistiques des arbres">
      <p v-if="chargement" role="status">Chargement des statistiques…</p>
      <div v-else-if="erreur" role="alert">
        {{ erreur }} <button type="button" @click="charger">Réessayer</button>
      </div>
      <template v-else>
        <ResumeArbres :arbres="arbres" />
        <p>
          Statistiques de l’échantillon fourni. Les diamètres absents sont
          exclus de la moyenne.
        </p>
      </template>
    </section>
    <!-- composant MapView.vue, affiche la map et le point de chaque arbres -->
    <MapView :arbres="arbresFiltres" />
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
  font-family: Arial, sans-serif;
}

main {
  display: grid;
  grid-template-rows: 60px auto auto minmax(320px, 1fr);
  width: 100%;
  height: 100%;
}

header {
  display: flex;
  align-items: center;
  padding: 0 20px;
  color: white;
  background-color: #176b3a;
}

h1 {
  margin: 0;
  font-size: 22px;
}
.resume {
  padding: 0 20px;
  background: #f4f7f2;
}
.resume p {
  color: #586c5d;
  font-size: 13px;
}
</style>
