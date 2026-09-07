<script setup>
import { computed, ref } from "vue";
import { arbresService } from "../services/arbresService";
import MapView from "../components/MapView.vue";
import ResumeArbres from "../components/ResumeArbres.vue";
import MessageEtat from "../components/MessageEtat.vue";

import {
  rechercherParEspece,
  filtrerParArrondissement,
  filtrerParDiametre,
  trierArbres,
  obtenirSuggestionsEspeces,
} from "../services/rechercheArbres.js";

const recherche = ref("");
const arrondissementSelectionne = ref("");
const diametreMin = ref("");
const diametreMax = ref("");
const triSelectionne = ref("");

const afficherSuggestions = ref(false);

// applique tous les filtres a la collection
const arbresFiltres = computed(() => {
  const resultatRecherche = rechercherParEspece(
    arbresService.etat.arbres,
    recherche.value,
  );

  const resultatArrondissement = filtrerParArrondissement(
    resultatRecherche,
    arrondissementSelectionne.value,
  );

  const resultatDiametre = filtrerParDiametre(
    resultatArrondissement,
    diametreMin.value,
    diametreMax.value,
  );

  return trierArbres(
    resultatDiametre,
    triSelectionne.value,
  );
});

// liste des arrondissement sans doublon
const arrondissements = computed(() => {
  const liste = arbresService.etat.arbres.map(
    (arbre) => arbre.arrondissement,
  );

  return [...new Set(liste)].sort();
});

// autocompletion des especes
const suggestionsEspeces = computed(() => {
  return obtenirSuggestionsEspeces(
    arbresService.etat.arbres,
    recherche.value,
  );
});

function selectionnerSuggestion(suggestion) {
  recherche.value = suggestion;
  afficherSuggestions.value = false;
}

function reinitialiser() {
  recherche.value = "";
  arrondissementSelectionne.value = "";
  diametreMin.value = "";
  diametreMax.value = "";
  triSelectionne.value = "";
}
</script>

<template>
  <section>
    <div class="titre-page">
      <div>
        <p class="surtitre">Explorer Montréal</p>
        <h1>Carte des arbres</h1>
      </div>

      <RouterLink class="bouton secondaire" to="/arbres">
        Voir la liste
      </RouterLink>
    </div>

    <ResumeArbres :arbres="arbresFiltres" />

    <MessageEtat v-if="!arbresService.etat.arbres.length">
      Aucun arbre à afficher. Ajoutez un arbre pour commencer.
    </MessageEtat>

    <div v-else class="contenu-carte">
      <div class="zone-carte">
        <MapView :arbres="arbresFiltres" />
      </div>

      <aside class="recherche-carte panneau">
        <h2>Recherche</h2>

        <label for="recherche-espece">
          Espèce
        </label>

        <div class="champ-espece">
          <input
            id="recherche-espece"
            v-model="recherche"
            type="text"
            placeholder="Ex. érable"
            @focus="afficherSuggestions = true"
            @input="afficherSuggestions = true"
            @blur="afficherSuggestions = false"
          />

          <ul
            v-if="
              afficherSuggestions &&
              suggestionsEspeces.length > 0
            "
            class="suggestions"
          >
            <li
              v-for="suggestion in suggestionsEspeces"
              :key="suggestion"
              @mousedown.prevent="
                selectionnerSuggestion(suggestion)
              "
            >
              {{ suggestion }}
            </li>
          </ul>
        </div>

        <label for="arrondissement">
          Arrondissement
        </label>

        <select
          id="arrondissement"
          v-model="arrondissementSelectionne"
        >
          <option value="">
            Tous les arrondissements
          </option>

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
            <label for="diametre-min">
              Diamètre min.
            </label>

            <input
              id="diametre-min"
              v-model="diametreMin"
              type="number"
              min="0"
              placeholder="20"
            />
          </div>

          <div>
            <label for="diametre-max">
              Diamètre max.
            </label>

            <input
              id="diametre-max"
              v-model="diametreMax"
              type="number"
              min="0"
              placeholder="50"
            />
          </div>
        </div>

        <label for="tri">
          Trier par
        </label>

        <select
          id="tri"
          v-model="triSelectionne"
        >
          <option value="">Aucun tri</option>
          <option value="espece-az">Espèce A à Z</option>
          <option value="espece-za">Espèce Z à A</option>
          <option value="diametre-croissant">
            Diamètre croissant
          </option>
          <option value="diametre-decroissant">
            Diamètre décroissant
          </option>
        </select>

        <p class="nombre-resultats">
          {{ arbresFiltres.length }} arbre(s) trouvé(s)
        </p>

        <button
          class="secondaire"
          type="button"
          @click="reinitialiser"
        >
          Réinitialiser
        </button>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.contenu-carte {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 18px;
  align-items: start;
}

.zone-carte {
  min-width: 0;
}

.recherche-carte {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.recherche-carte h2 {
  margin: 0 0 5px;
}

.recherche-carte label {
  font-size: 13px;
  font-weight: 600;
}

.recherche-carte input,
.recherche-carte select {
  width: 100%;
  padding: 9px 10px;
}

.champ-espece {
  position: relative;
}

.suggestions {
  position: absolute;
  z-index: 20;
  top: 100%;
  left: 0;

  width: 100%;
  max-height: 220px;
  margin: 4px 0 0;
  padding: 4px 0;

  overflow-y: auto;
  list-style: none;

  background: white;
  border: 1px solid #cbd9ce;
  border-radius: 8px;
  box-shadow: 0 5px 12px rgba(0, 0, 0, 0.12);
}

.suggestions li {
  padding: 9px 10px;
  cursor: pointer;
}

.suggestions li:hover {
  background: #edf4ef;
}

.diametres {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.diametres > div {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.nombre-resultats {
  margin: 8px 0;
  font-weight: 700;
}

@media (max-width: 900px) {
  .contenu-carte {
    grid-template-columns: 1fr;
  }
}
</style>