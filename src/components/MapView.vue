<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import MessageEtat from "./MessageEtat.vue";
import BoutonFavori from "./BoutonFavori.vue";

const props = defineProps({
  arbres: {
    type: Array,
    required: true,
  },
});

const mapContainer = ref(null);
const erreur = ref("");
const chargement = ref(true);
const selection = ref(null);
let map = null;
let demonte = false;
const donnees = computed(() => ({
  type: "FeatureCollection",
  features: props.arbres.map((arbre) => ({
    type: "Feature",
    geometry: { type: "Point", coordinates: [arbre.longitude, arbre.latitude] },
    properties: { id: arbre.id },
  })),
}));

function synchroniser() {
  if (!map?.getStyle()) return;
  const source = map.getSource("arbres");
  if (source) source.setData(donnees.value);
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
      style: "https://tiles.openfreemap.org/styles/bright",
      center: [-73.5673, 45.5017],
      zoom: 10,
    });
    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.on("load", synchroniser);
    map.on("click", "arbres-points", (event) => {
      const id = event.features?.[0]?.properties?.id;
      selection.value = props.arbres.find((arbre) => arbre.id === id) || null;
    });
    map.on("mouseenter", "arbres-points", () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "arbres-points", () => {
      map.getCanvas().style.cursor = "";
    });
    map.on("error", () => {
      erreur.value =
        "Le fond de carte est partiellement indisponible. La liste des arbres reste accessible.";
    });
  } catch {
    if (!demonte) {
      erreur.value =
        "La carte ne peut pas s’ouvrir sur cet appareil. Utilisez la liste des arbres.";
    }
  } finally {
    if (!demonte) chargement.value = false;
  }
});

onUnmounted(() => {
  demonte = true;
  map?.remove();
});
</script>

<template>
  <MessageEtat v-if="chargement">Chargement de la carte…</MessageEtat>
  <MessageEtat v-if="erreur" type="error">
    {{ erreur }}
    <RouterLink to="/arbres">Voir la liste</RouterLink>
  </MessageEtat>
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
      <RouterLink :to="'/arbres/' + selection.id + '/modifier'">
        Modifier cet arbre
      </RouterLink>
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
