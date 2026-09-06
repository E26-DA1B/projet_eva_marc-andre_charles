<script setup>
import { arbresService } from "../services/arbresService";
import ResumeArbres from "../components/ResumeArbres.vue";
</script>
<template>
  <section>
    <div class="titre-page">
      <div>
        <p class="surtitre">Portrait de la collection</p>
        <h1>Un regard sur nos arbres</h1>
      </div>
      <RouterLink class="bouton" to="/ajouter">Ajouter un arbre</RouterLink>
    </div>
    <p>
      Consultez l’échantillon, trouvez une essence et enrichissez votre
      collection de démonstration.
    </p>
    <ResumeArbres :arbres="arbresService.etat.arbres" />
    <div class="cartes-accueil">
      <article class="panneau">
        <span class="icone" aria-hidden="true">⌖</span>
        <h2>Explorer la carte</h2>
        <p>
          Repérez les arbres et sélectionnez un point pour découvrir son
          essence.
        </p>
        <RouterLink to="/carte">Ouvrir la carte →</RouterLink>
      </article>
      <article class="panneau">
        <span class="icone" aria-hidden="true">≡</span>
        <h2>Gérer la collection</h2>
        <p>Recherchez, filtrez et modifiez les arbres de votre session.</p>
        <RouterLink to="/arbres">Consulter les arbres →</RouterLink>
      </article>
    </div>
    <p class="aide">
      Les statistiques concernent cet échantillon seulement. Le diamètre moyen
      exclut les mesures absentes.
    </p>
  </section>
</template>
