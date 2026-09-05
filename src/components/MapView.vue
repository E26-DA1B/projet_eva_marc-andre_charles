<script setup>
import { onMounted, onUnmounted, ref, watch } from "vue";
// Import de MapLibre pour afficher la map
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const props = defineProps({
  arbres: {
    type: Array,
    required: true,
  },
});

// Contien la ref vers l'element html qui contiendra la map
const mapContainer = ref(null);
let map = null;

function convertirEnGeoJson(arbres) {
  return {
    type: "FeatureCollection",

    features: arbres.map((arbre) => {
      return {
        type: "Feature",

        geometry: {
          type: "Point",
          coordinates: [arbre.longitude, arbre.latitude],
        },

        properties: {
          id: arbre.id,
          essenceFr: arbre.essenceFr,
          essenceLatin: arbre.essenceLatin,
          arrondissement: arbre.arrondissement,
          diametre: arbre.diametre,
          couleur: couleurPourEspece(arbre.essenceFr),
        },
      };
    }),
  };
}

// retourne toujours la meme couleur pour une meme espece
function couleurPourEspece(espece) {
  let nombre = 0;

  for (let i = 0; i < espece.length; i++) {
    //transforme le nom exemple erables en nombre
    nombre += espece.charCodeAt(i);
  }

  //prend se nombre pour choisir une couleur dans une roue de couleur de 360 degre
  const teinte = (nombre * 47) % 360;

  return `hsl(${teinte}, 65%, 42%)`;
}

// lancer seulement lorsque la balise html existe
onMounted(() => {
  //creation de la map avec montreal comme position par default
  map = new maplibregl.Map({
    container: mapContainer.value,
    style: "https://tiles.openfreemap.org/styles/bright",
    center: [-73.5673, 45.5017],
    zoom: 10,
  });
  //cree et ajoute le zoom +- et les bouton de controle a notre map
  map.addControl(new maplibregl.NavigationControl(), "top-right");

  //cree la couche
  map.on("load", () => {
    map.addSource("arbres", {
      type: "geojson",
      data: convertirEnGeoJson(props.arbres),
    });

    map.addLayer({
      id: "arbres-points",
      type: "circle",
      source: "arbres",

      paint: {
        //change la grosseur avec 3 different zoom
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
  });
});

//quand la recherche change, affiche directement le resultat des arbres
watch(
  () => props.arbres,
  (nouveauxArbres) => {
    const source = map?.getSource("arbres");

    if (source) {
      source.setData(convertirEnGeoJson(nouveauxArbres));
    }
  },
);

// lancer seulement lorsque la balise html est enlever
onUnmounted(() => {
  map?.remove();
});
</script>

<!--Linker la ref de la balise html a notre variable mapContainer -->
<template>
  <div ref="mapContainer" class="map"></div>
</template>

<!-- applique le style seulement sur se .vue precisement -->
<style scoped>
.map {
  width: 100%;
  height: 100%;
}
</style>
