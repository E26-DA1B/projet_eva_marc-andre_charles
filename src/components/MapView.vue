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
let popup = null;
const donnees = computed(() => ({
  type: "FeatureCollection",
  features: props.arbres.map((arbre) => ({
    type: "Feature",
    geometry: { type: "Point", coordinates: [arbre.longitude, arbre.latitude] },
    properties: {
      id: arbre.id,
      couleur: couleurPourEspece(arbre.essenceFr),
      essenceFr: arbre.essenceFr,
      arrondissement: arbre.arrondissement,
      diametre: arbre.diametre,
    },
  })),
}));

function couleurPourEspece(espece) {
  let nombre = 0;
  for (let i = 0; i < espece.length; i++) nombre += espece.charCodeAt(i);
  return `hsl(${(nombre * 47) % 360}, 65%, 42%)`;
}

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
        "circle-radius": [
          "interpolate",
          ["linear"],
          ["zoom"],
          10,
          3,
          14,
          6,
          18,
          9,
        ],
        "circle-color": ["to-color", ["get", "couleur"]],
        "circle-stroke-width": 1,
        "circle-stroke-color": "#ffffff",
        "circle-opacity": 0.85,
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
    map.on("mouseenter", "arbres-points", (event) => {
      map.getCanvas().style.cursor = "pointer";

      const arbre = event.features?.[0];

      if (!arbre) {
        return;
      }

      const diametre =
        arbre.properties.diametre == null ?
          "Non renseigné"
        : `${arbre.properties.diametre} cm`;

      popup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 10,
        className: "arbre-popup",
      })
        .setLngLat(event.lngLat)
        .setHTML(
          `
      <strong>${arbre.properties.essenceFr}</strong><br>
      ${arbre.properties.arrondissement}<br>
      Diamètre : ${diametre}
    `,
        )
        .addTo(map);
    });
    map.on("mouseleave", "arbres-points", () => {
      map.getCanvas().style.cursor = "";
      popup?.remove();
      popup = null;
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
  popup?.remove();
  map?.remove();
});
</script>

<template>
  <MessageEtat v-if="chargement">Chargement de la carte…</MessageEtat>
  <MessageEtat v-if="erreur" type="error">
    {{ erreur }}
    <RouterLink to="/arbres">Voir la liste</RouterLink>
  </MessageEtat>

  <div
    ref="mapContainer"
    class="map"
    role="region"
    aria-label="Carte interactive des arbres de Montréal"
  ></div>
  <p class="aide">
    Cliquez sur un point pour consulter un arbre. Les détails sont aussi
    accessibles dans la liste.
  </p>
  <article v-if="selection" class="panneau selection">
    <h2>{{ selection.essenceFr }}</h2>
    <p>
      {{ selection.arrondissement }} · Diamètre :
      {{
        selection.diametre === null ?
          "non renseigné"
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

:deep(.arbre-popup .maplibregl-popup-content) {
  min-width: 190px;
  padding: 12px 14px;
  background: #f7fbf8;
  border: 1px solid #cbd9ce;
  border-radius: 12px;
  box-shadow: 0 8px 22px rgba(20, 55, 35, 0.18);
  color: #24352b;
  font-size: 13px;
  line-height: 1.45;
}

:deep(.arbre-popup .maplibregl-popup-content strong) {
  display: block;
  margin-bottom: 4px;
  color: #176b3a;
  font-size: 15px;
}

:deep(.arbre-popup .maplibregl-popup-tip) {
  border-top-color: #f7fbf8;
}


</style>
