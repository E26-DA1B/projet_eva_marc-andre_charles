<script setup>
import { computed, nextTick, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { arbresService, validerArbre } from "../services/arbresService";
import { notifier } from "../services/notificationService";
import MessageEtat from "../components/MessageEtat.vue";
const props = defineProps({ id: String });
const router = useRouter();
const existant = props.id ? arbresService.obtenir(props.id) : null;
const introuvable = Boolean(props.id && !existant);
const formulaire = reactive({
  essenceFr: "",
  essenceLatin: "",
  arrondissement: "",
  diametre: "",
  longitude: "",
  latitude: "",
  ...existant,
});
const erreurs = ref({});
const erreurOperation = ref("");
const enCours = ref(false);
const elementFormulaire = ref(null);
const arrondissements = computed(() =>
  [
    ...new Set(arbresService.etat.arbres.map((arbre) => arbre.arrondissement)),
  ].sort(),
);
const champs = [
  {
    nom: "essenceFr",
    titre: "Essence (nom français)",
    type: "text",
    obligatoire: true,
    exemple: "Érable à sucre",
  },
  {
    nom: "essenceLatin",
    titre: "Nom latin (facultatif)",
    type: "text",
    exemple: "Acer saccharum",
  },
  {
    nom: "arrondissement",
    titre: "Arrondissement",
    type: "text",
    obligatoire: true,
    exemple: "Le Plateau-Mont-Royal",
    liste: "arrondissements",
  },
  {
    nom: "diametre",
    titre: "Diamètre du tronc (cm)",
    type: "number",
    obligatoire: true,
    min: 0.1,
    max: 1000,
    exemple: "25",
    aide: "De 0,1 à 1 000 cm.",
  },
  {
    nom: "longitude",
    titre: "Longitude",
    type: "number",
    obligatoire: true,
    min: -180,
    max: 180,
    exemple: "-73.5673",
    aide: "De -180 à 180. À Montréal : environ -73,6.",
  },
  {
    nom: "latitude",
    titre: "Latitude",
    type: "number",
    obligatoire: true,
    min: -90,
    max: 90,
    exemple: "45.5017",
    aide: "De -90 à 90. À Montréal : environ 45,5.",
  },
];
async function enregistrer() {
  if (enCours.value) return;
  erreurOperation.value = "";
  erreurs.value = validerArbre(formulaire);
  if (Object.keys(erreurs.value).length) {
    await nextTick();
    elementFormulaire.value.querySelector('[aria-invalid="true"]')?.focus();
    return;
  }
  enCours.value = true;
  try {
    if (props.id) arbresService.modifier(props.id, formulaire);
    else arbresService.ajouter(formulaire);
    notifier(
      props.id ? "Arbre modifié avec succès." : "Arbre ajouté avec succès.",
    );
    await router.push("/arbres");
  } catch (erreur) {
    erreurOperation.value = erreur.message;
  } finally {
    enCours.value = false;
  }
}
</script>

<template>
  <section>
    <div class="titre-page">
      <div>
        <p class="surtitre">Votre collection</p>
        <h1>{{ id ? "Modifier un arbre" : "Ajouter un arbre" }}</h1>
      </div>
      <RouterLink to="/arbres">Retour à la liste</RouterLink>
    </div>
    <MessageEtat v-if="introuvable" type="error"
      >Cet arbre n’existe plus.
      <RouterLink to="/arbres">Retourner à la liste</RouterLink>.</MessageEtat
    >
    <form
      v-else
      ref="elementFormulaire"
      class="panneau formulaire"
      novalidate
      :aria-busy="enCours"
      @submit.prevent="enregistrer"
    >
      <p>Les champs marqués d’un * sont obligatoires.</p>
      <MessageEtat v-if="Object.keys(erreurs).length" type="error"
        >Corrigez les champs indiqués avant d’enregistrer.</MessageEtat
      >
      <MessageEtat v-if="erreurOperation" type="error">{{
        erreurOperation
      }}</MessageEtat>
      <div class="grille-formulaire">
        <div v-for="champ in champs" :key="champ.nom" class="champ">
          <label :for="champ.nom"
            >{{ champ.titre }}{{ champ.obligatoire ? " *" : "" }}</label
          >
          <input
            :id="champ.nom"
            v-model="formulaire[champ.nom]"
            :type="champ.type"
            :required="champ.obligatoire"
            :min="champ.min"
            :max="champ.max"
            :maxlength="champ.type === 'text' ? 120 : undefined"
            :step="champ.type === 'number' ? 'any' : undefined"
            :placeholder="champ.exemple"
            :list="champ.liste"
            :aria-invalid="Boolean(erreurs[champ.nom])"
            :aria-describedby="
              [
                champ.aide ? champ.nom + '-aide' : '',
                erreurs[champ.nom] ? champ.nom + '-erreur' : '',
              ]
                .filter(Boolean)
                .join(' ') || undefined
            "
          />
          <small v-if="champ.aide" :id="champ.nom + '-aide'" class="aide">{{
            champ.aide
          }}</small>
          <small
            v-if="erreurs[champ.nom]"
            :id="champ.nom + '-erreur'"
            class="erreur-champ"
            >{{ erreurs[champ.nom] }}</small
          >
        </div>
      </div>
      <datalist id="arrondissements">
        <option v-for="nom in arrondissements" :key="nom" :value="nom" />
      </datalist>
      <div class="actions">
        <button type="submit" :disabled="enCours">
          {{
            enCours
              ? "Enregistrement…"
              : id
                ? "Enregistrer les modifications"
                : "Ajouter à la collection"
          }}</button
        ><RouterLink class="bouton secondaire" to="/arbres">Annuler</RouterLink>
      </div>
    </form>
  </section>
</template>
