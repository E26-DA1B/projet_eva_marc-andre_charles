<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import MessageEtat from "./MessageEtat.vue";
import BoutonFavori from "./BoutonFavori.vue";
const props = defineProps({ arbres: { type: Array, required: true } });
const mapContainer = ref(null);
const erreur = ref("");
const chargement = ref(true);
const selection = ref(null);
let map = null;
let demonte = false;
let delai;
const controleur = new AbortController();
const donnees = computed(() => ({
  type: "FeatureCollection",
  features: props.arbres.map((arbre) => ({
    type: "Feature",
    geometry: { type: "Point", coordinates: [arbre.longitude, arbre.latitude] },
    properties: { id: arbre.id },
  })),
}));
const fondSimple = {
  version: 8,
  sources: {},
  layers: [
    {
      id: "fond",
      type: "background",
      paint: { "background-color": "#e8efe6" },
    },
  ],
};
function synchroniser() {
  if (!map?.getStyle()) return;
  if (map.getSource("arbres")) map.getSource("arbres").setData(donnees.value);
  else {
    map.addSource("arbres", { type: "geojson", data: donnees.value });
    map.addLayer({
      id: "arbres-points",
      type: "circle",
      source: "arbres",
      paint: {
        "circle-radius": 5,
        "circle-color": "#176b3a",
        "circle-stroke-width": 1,
        "circle-stroke-color": "#ffffff",
      },
    });
  }
}
watch(donnees, () => {
  selection.value = null;
  synchroniser();
});
onMounted(async () => {
  try {
    map = new maplibregl.Map({
      container: mapContainer.value,
      style: fondSimple,
      center: [-73.5673, 45.5017],
      zoom: 10,
    });
    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.on("style.load", synchroniser);
    map.on("error", () => {
      erreur.value =
        "Le fond de carte est partiellement indisponible. La liste des arbres reste accessible.";
    });
    map.on("click", "arbres-points", (event) => {
      selection.value =
        props.arbres.find(
          (arbre) => arbre.id === event.features?.[0]?.properties.id,
        ) || null;
    });
    map.on("mouseenter", "arbres-points", () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "arbres-points", () => {
      map.getCanvas().style.cursor = "";
    });
    // Le fond distant est facultatif : la collection demeure utilisable sans réseau.
    delai = setTimeout(() => controleur.abort(), 10000);
    const reponse = await fetch("https://tiles.openfreemap.org/styles/bright", {
      signal: controleur.signal,
    });
    if (!reponse.ok) throw new Error("Fond indisponible");
    const style = await reponse.json();
    if (!demonte) map.setStyle(style);
  } catch {
    if (!demonte)
      erreur.value = map
        ? "Fond de carte indisponible. Les points sont affichés sur un fond simplifié; utilisez la liste pour les détails."
        : "La carte ne peut pas s’ouvrir sur cet appareil. Utilisez la liste des arbres.";
  } finally {
    clearTimeout(delai);
    if (!demonte) chargement.value = false;
  }
});
onUnmounted(() => {
  demonte = true;
  clearTimeout(delai);
  controleur.abort();
  map?.remove();
});
</script>

<template>
  <MessageEtat v-if="chargement">Chargement du fond de carte…</MessageEtat>
  <MessageEtat v-if="erreur" type="error"
    >{{ erreur }}
    <RouterLink to="/arbres">Voir la liste</RouterLink></MessageEtat
  >
  <p class="aide">
    Cliquez sur un point pour consulter un arbre. Les détails sont aussi
    accessibles dans la liste.
  </p>
  <div
    ref="mapContainer"
    class="map"
    role="region"
    aria-label="Carte interactive des arbres de Montréal"
  ></div>
  <article v-if="selection" class="panneau selection">
    <h2>{{ selection.essenceFr }}</h2>
    <p>
      {{ selection.arrondissement }} · Diamètre :
      {{
        selection.diametre === null
          ? "non renseigné"
          : selection.diametre + " cm"
      }}
    </p>
    <div class="actions">
      <BoutonFavori :arbre="selection" />
      <RouterLink :to="'/arbres/' + selection.id + '/modifier'"
        >Modifier cet arbre</RouterLink
      >
    </div>
  </article>
</template>

<style scoped>
.map {
  width: 100%;
  height: min(60vh, 600px);
  min-height: 320px;
  border-radius: 16px;
  border: 1px solid #cbd9ce;
}
.selection {
  margin-top: 16px;
}
</style>
