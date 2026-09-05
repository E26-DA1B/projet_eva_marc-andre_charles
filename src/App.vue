<script setup>
import { onMounted, ref } from "vue";
import ResumeArbres from "./components/ResumeArbres.vue";
import { chargerArbres } from "./services/donneesArbres.js";
import MapView from "./components/MapView.vue";
const arbres = ref([]);
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
    <MapView />
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
  grid-template-rows: 60px auto minmax(320px, 1fr);
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
