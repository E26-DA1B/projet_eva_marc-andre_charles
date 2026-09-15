<script setup>
import { computed, nextTick, ref, watch } from "vue";
import { arbresService, obtenirMessageErreur } from "../services/arbresService";
import { notifier } from "../services/notificationService";
import ResumeArbres from "../components/ResumeArbres.vue";
import MessageEtat from "../components/MessageEtat.vue";
import BoutonFavori from "../components/BoutonFavori.vue";
import {
  rechercherParEspece,
  filtrerParArrondissement,
  filtrerParDiametre,
  trierArbres,
  obtenirSuggestionsEspeces,
} from "../services/rechercheArbres.js";
const props = defineProps({ favorisSeulement: Boolean });
const collection = computed(() =>
  props.favorisSeulement ?
    arbresService.obtenirFavoris()
  : arbresService.etat.arbres,
);
const recherche = ref("");
const arrondissement = ref("");
const diametreMin = ref("");
const diametreMax = ref("");
const tri = ref("");
const afficherSuggestions = ref(false);
const page = ref(1);
const taillePage = 20;
const confirmation = ref(null);
const dialogue = ref(null);
const annulerBouton = ref(null);
const titre = ref(null);
const arrondissements = computed(() =>
  [...new Set(collection.value.map((arbre) => arbre.arrondissement))].sort(
    (a, b) => a.localeCompare(b, "fr-CA"),
  ),
);
const resultats = computed(() =>
  trierArbres(
    filtrerParDiametre(
      filtrerParArrondissement(
        rechercherParEspece(collection.value, recherche.value),
        arrondissement.value,
      ),
      diametreMin.value,
      diametreMax.value,
    ),
    tri.value,
  ),
);
const suggestionsEspeces = computed(() =>
  obtenirSuggestionsEspeces(collection.value, recherche.value),
);
const pages = computed(() =>
  Math.max(1, Math.ceil(resultats.value.length / taillePage)),
);
const visibles = computed(() =>
  resultats.value.slice((page.value - 1) * taillePage, page.value * taillePage),
);
watch([recherche, arrondissement, diametreMin, diametreMax, tri], () => {
  page.value = 1;
});
watch(pages, (maximum) => {
  page.value = Math.min(page.value, maximum);
});
function reinitialiser() {
  recherche.value = "";
  arrondissement.value = "";
  diametreMin.value = "";
  diametreMax.value = "";
  tri.value = "";
  afficherSuggestions.value = false;
}
function selectionnerSuggestion(suggestion) {
  recherche.value = suggestion;
  afficherSuggestions.value = false;
}
async function apresFavori(ajoute) {
  if (props.favorisSeulement && !ajoute) {
    await nextTick();
    titre.value.focus();
  }
}
async function demanderSuppression(arbre) {
  confirmation.value = arbre;
  dialogue.value.showModal();
  await nextTick();
  annulerBouton.value.focus();
}
function annuler() {
  dialogue.value.close();
  confirmation.value = null;
}
async function supprimer() {
  try {
    await arbresService.supprimer(confirmation.value.id);
    notifier("Arbre supprimé de la collection.");
    annuler();
    await nextTick();
    titre.value.focus();
  } catch (erreur) {
    notifier(obtenirMessageErreur(erreur, "Impossible de supprimer cet arbre."), "error");
    annuler();
  }
}
</script>

<template>
  <section>
    <div class="titre-page">
      <div>
        <p class="surtitre">Votre collection</p>
        <h1 ref="titre" tabindex="-1">
          {{ favorisSeulement ? "Mes favoris" : "Liste des arbres" }}
        </h1>
      </div>
      <RouterLink v-if="favorisSeulement" class="bouton secondaire" to="/arbres"
        >Explorer les arbres</RouterLink
      >
      <RouterLink v-else class="bouton" to="/ajouter"
        >Ajouter un arbre</RouterLink
      >
    </div>
    <div class="filtres panneau">
      <div class="champ champ-suggestion">
        <label for="recherche">Rechercher</label
        ><input
          id="recherche"
          v-model="recherche"
          type="search"
          autocomplete="off"
          @focus="afficherSuggestions = true"
          @input="afficherSuggestions = true"
          @blur="afficherSuggestions = false"
          placeholder="Essence, arrondissement, numéro…"
        />
        <ul
          v-if="afficherSuggestions && suggestionsEspeces.length"
          class="suggestions"
        >
          <li
            v-for="suggestion in suggestionsEspeces"
            :key="suggestion"
            @mousedown.prevent="selectionnerSuggestion(suggestion)"
          >
            {{ suggestion }}
          </li>
        </ul>
      </div>
      <div class="champ">
        <label for="arrondissement-filtre">Arrondissement</label
        ><select id="arrondissement-filtre" v-model="arrondissement">
          <option value="">Tous les arrondissements</option>
          <option v-for="nom in arrondissements" :key="nom" :value="nom">
            {{ nom }}
          </option>
        </select>
      </div>
      <div class="champ">
        <label for="diametre-min">Diametre min.</label>
        <input id="diametre-min" v-model="diametreMin" type="number" min="0" />
      </div>
      <div class="champ">
        <label for="diametre-max">Diametre max.</label>
        <input id="diametre-max" v-model="diametreMax" type="number" min="0" />
      </div>
      <div class="champ">
        <label for="tri">Trier par</label
        ><select id="tri" v-model="tri">
          <option value="">Aucun tri</option>
          <option value="espece-az">Essence A a Z</option>
          <option value="espece-za">Essence Z a A</option>
          <option value="diametre-croissant">Diametre croissant</option>
          <option value="diametre-decroissant">Diametre decroissant</option>
        </select>
      </div>
      <button class="secondaire" type="button" @click="reinitialiser">
        Réinitialiser les filtres
      </button>
    </div>
    <p role="status">
      {{ resultats.length }} arbre(s) trouvé(s) sur {{ collection.length
      }}{{ favorisSeulement ? " favori(s)" : "" }}.
    </p>
    <ResumeArbres :arbres="resultats" />
    <MessageEtat v-if="favorisSeulement && !collection.length">
      Vous n’avez pas encore de favoris. Ajoutez des arbres aux favoris depuis
      la liste ou la carte.
      <RouterLink to="/arbres">Explorer les arbres</RouterLink>.
    </MessageEtat>
    <MessageEtat v-else-if="!collection.length"
      >Votre collection est vide.
      <RouterLink to="/ajouter">Ajouter un premier arbre</RouterLink
      >.</MessageEtat
    >
    <MessageEtat v-else-if="!resultats.length"
      >Aucun arbre ne correspond à ces critères. Modifiez la recherche ou
      réinitialisez les filtres.</MessageEtat
    >
    <template v-else>
      <div class="tableau-conteneur">
        <table>
          <caption class="sr-only">
            Arbres correspondant aux filtres
          </caption>
          <thead>
            <tr>
              <th scope="col">Essence</th>
              <th scope="col">Arrondissement</th>
              <th scope="col">Diamètre</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="arbre in visibles" :key="arbre.id">
              <td>
                <strong>{{ arbre.essenceFr }}</strong
                ><small>{{
                  arbre.essenceLatin || "Nom latin non renseigné"
                }}</small
                ><small>{{
                  arbre.numeroInventaire === null ?
                    "Ajout de cette session"
                  : "Inventaire " + arbre.numeroInventaire
                }}</small>
              </td>
              <td>{{ arbre.arrondissement }}</td>
              <td>
                {{
                  arbre.diametre === null ?
                    "Non renseigné"
                  : arbre.diametre + " cm"
                }}
              </td>
              <td>
                <div class="actions">
                  <BoutonFavori :arbre="arbre" @changer="apresFavori" />
                  <RouterLink
                    :to="'/arbres/' + arbre.id + '/modifier'"
                    :aria-label="'Modifier ' + arbre.essenceFr"
                    >Modifier</RouterLink
                  ><button
                    class="bouton-discret danger-texte"
                    type="button"
                    :aria-label="'Supprimer ' + arbre.essenceFr"
                    @click="demanderSuppression(arbre)"
                  >
                    Supprimer
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <nav class="pagination" aria-label="Pagination des arbres">
        <button class="secondaire" :disabled="page === 1" @click="page--">
          Précédent</button
        ><span>Page {{ page }} sur {{ pages }}</span
        ><button class="secondaire" :disabled="page === pages" @click="page++">
          Suivant
        </button>
      </nav>
    </template>
    <dialog
      ref="dialogue"
      aria-labelledby="titre-suppression"
      aria-describedby="description-suppression"
      @cancel.prevent="annuler"
      @close="confirmation = null"
    >
      <h2 id="titre-suppression">Supprimer cet arbre?</h2>
      <p id="description-suppression">
        {{ confirmation?.essenceFr }} sera retiré de la collection pour cette
        session.
      </p>
      <div class="actions">
        <button ref="annulerBouton" class="secondaire" @click="annuler">
          Annuler</button
        ><button class="danger" @click="supprimer">
          Confirmer la suppression
        </button>
      </div>
    </dialog>
  </section>
</template>
