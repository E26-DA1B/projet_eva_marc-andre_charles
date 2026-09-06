<script setup>
import { computed } from "vue";
import { arbresService } from "../services/arbresService";
import { notifier } from "../services/notificationService";

const props = defineProps({ arbre: { type: Object, required: true } });
const emit = defineEmits(["changer"]);
const favori = computed(() => arbresService.estFavori(props.arbre.id));
const action = computed(() =>
  favori.value ? "Retirer des favoris" : "Ajouter aux favoris",
);

function changer() {
  try {
    const ajouter = !favori.value;
    if (ajouter) arbresService.ajouterFavori(props.arbre.id);
    else arbresService.retirerFavori(props.arbre.id);
    notifier(
      ajouter ? "Arbre ajouté aux favoris." : "Arbre retiré des favoris.",
    );
    emit("changer", ajouter);
  } catch (erreur) {
    notifier(erreur.message, "error");
  }
}
</script>

<template>
  <button
    type="button"
    class="secondaire bouton-favori"
    :class="{ actif: favori }"
    :aria-pressed="favori"
    :aria-label="
      action +
      ' : ' +
      arbre.essenceFr +
      ' (' +
      (arbre.numeroInventaire ?? arbre.id) +
      ')'
    "
    @click="changer"
  >
    <span aria-hidden="true">{{ favori ? "★" : "☆" }}</span>
    {{ action }}
  </button>
</template>

<style scoped>
.bouton-favori {
  font-size: 13px;
  padding: 7px 10px;
}
.bouton-favori.actif {
  background: #fff3ce;
  border-color: #c79b38;
  color: #624600;
}
.bouton-favori span {
  font-size: 18px;
  line-height: 1;
}
</style>
