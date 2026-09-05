<script setup>
import { onMounted, onUnmounted, ref } from "vue";
// Import de MapLibre pour afficher la map
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
// Import de Papaparse pour parse le csv en geoJSON utilisable par MapLibre
import Papa from "papaparse";

// Contien la ref vers l'element html qui contiendra la map
const mapContainer = ref(null);
let map = null;

function chargerArbres() {
  // Lecture du csv avec les titres de colonnes comme nom de propriete + les chiffres en string convertie en nombres
  Papa.parse("/data/arbres-test.csv", {
    download: true,
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,

    complete: (resultats) => {
      const arbresGeoJson = resultats.data
        .filter((arbre) => {
          return (
            //Conserve larbre seulement si il possede une longitude ET une latitude
            Number.isFinite(arbre.Longitude) && Number.isFinite(arbre.Latitude)
          );
        })
        .map((arbre) => {
          return {
            // Element obligatoire pour la construction du GeoJSON utilisable par MapLibre
            type: "Feature",

            geometry: {
              type: "Point",
              coordinates: [arbre.Longitude, arbre.Latitude],
            },

            properties: {
              id: arbre.EMP_NO,
              essenceFr: arbre.Essence_fr || "Inconnue",
              essenceLatin: arbre.Essence_latin || "Inconnue",
              arrondissement: arbre.ARROND_NOM || "Inconnu",
              diametre: arbre.DHP ?? null,
            },
          };
        });

      // ajouter nos donnes geoJSON a la map
      map.addSource("arbres", {
        type: "geojson",

        data: {
          type: "FeatureCollection",
          features: arbresGeoJson,
        },
      });

      // AJOUTER une couche pour dessiner nos point (arbres)
      map.addLayer({
        id: "arbres-points",
        type: "circle",
        source: "arbres",

        paint: {
          "circle-radius": 5,
          "circle-color": "#168c45",
          "circle-stroke-width": 1,
          "circle-stroke-color": "#ffffff",
        },
      });

      // DEBUG
      console.log(`${arbresGeoJson.length} arbres affichés`);
    },

    error: (erreur) => {
      console.error("Erreur de lecture du CSV :", erreur);
    },
  });
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

  //appel notre fonction chargerArbres seulement lorsque la carte est pret.
  map.on("load", () => {
    chargerArbres();
  });
});

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
