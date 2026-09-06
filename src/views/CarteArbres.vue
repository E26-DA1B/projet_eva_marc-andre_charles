<script setup>
import { arbresService } from "../services/arbresService";
import MapView from "../components/MapView.vue";
import ResumeArbres from "../components/ResumeArbres.vue";
import MessageEtat from "../components/MessageEtat.vue";
</script>
<template>
  <section>
    <div class="titre-page">
      <div>
        <p class="surtitre">Explorer Montréal</p>
        <h1>Carte des arbres</h1>
      </div>
      <RouterLink class="bouton secondaire" to="/arbres"
        >Voir la liste</RouterLink
      >
    </div>
    <ResumeArbres :arbres="arbresService.etat.arbres" />
    <MessageEtat v-if="!arbresService.etat.arbres.length"
      >Aucun arbre à afficher. Ajoutez un arbre pour commencer.</MessageEtat
    >
    <MapView :arbres="arbresService.etat.arbres" />
  </section>
</template>
