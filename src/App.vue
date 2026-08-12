<script setup>
import MapView from "./components/MapView.vue";
</script>

<template>
  <main>
    <header>
      <h1>ARBRE PUBLIC DE MTL</h1>
    </header>
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
  grid-template-rows: 60px 1fr;
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
</style>
