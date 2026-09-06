<script setup>
import { onMounted } from "vue";
import { arbresService } from "./services/arbresService";
import { notification, effacerNotification } from "./services/notificationService";
import MessageEtat from "./components/MessageEtat.vue";
import logo from "/logo.jpg";

const etat = arbresService.etat;

onMounted(() => {
  arbresService.initialiser();
});
</script>

<template>
  <a class="lien-evitement" href="#contenu">Aller au contenu</a>
  <header class="entete">
    <div class="marque"> 
      <img :src="logo" alt="Logo Arbres de Montréal" id="logo" />
      <div>
        <strong>Arbres de Montréal</strong>
        <small>Explorer et suivre la forêt urbaine</small>
      </div>
    </div>
    <nav aria-label="Navigation principale">
      <RouterLink to="/">Tableau de bord</RouterLink>
      <RouterLink to="/carte">Carte</RouterLink>
      <RouterLink to="/arbres">Liste des arbres</RouterLink>
      <RouterLink to="/favoris">Mes favoris ({{ etat.favoris.length }})</RouterLink>
      <RouterLink to="/ajouter">Ajouter un arbre</RouterLink>
    </nav>
  </header>

  <main id="contenu" tabindex="-1">
    <p class="note-session">
      Démonstration TP2 · Les changements sont temporaires et disparaissent au
      rechargement.
    </p>

    <MessageEtat
      v-if="notification.texte"
      :type="notification.type"
      dismissible
      @fermer="effacerNotification"
    >
      {{ notification.texte }}
    </MessageEtat>

    <MessageEtat v-if="etat.chargement">Chargement des arbres…</MessageEtat>
    <MessageEtat v-else-if="etat.erreur" type="error">
      <p>{{ etat.erreur }}</p>
      <button type="button" @click="arbresService.initialiser">Réessayer</button>
    </MessageEtat>

    <RouterView v-else-if="etat.initialise" />
  </main>

  <footer>
    Projet de session · Vue 3 + Tauri 2 · Échantillon d’arbres publics de Montréal
  </footer>
</template>
