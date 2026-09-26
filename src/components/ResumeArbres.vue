<script setup>
import { computed } from "vue";
import { calculerResume } from "../services/statistiquesService.js";
const props = defineProps({
  arbres: { type: Array, required: true },
  statistiques: { type: Object, default: null },
});
const resume = computed(() =>
  props.statistiques ? props.statistiques : calculerResume(props.arbres),
);
</script>
<template>
  <dl class="statistiques">
    <div>
      <dt>Arbres</dt>
      <dd>{{ resume.total }}</dd>
    </div>
    <div>
      <dt>Essences</dt>
      <dd>{{ resume.essences }}</dd>
    </div>
    <div>
      <dt>Arrondissements</dt>
      <dd>{{ resume.arrondissements }}</dd>
    </div>
    <div>
      <dt>Diamètre moyen</dt>
      <dd>
        {{
          resume.diametreMoyen === null
            ? "—"
            : `${resume.diametreMoyen.toLocaleString("fr-CA", { maximumFractionDigits: 1 })} cm`
        }}
      </dd>
    </div>
  </dl>
</template>

<style scoped>
.statistiques {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin: 24px 0;
}
.statistiques > div {
  background: white;
  border: 1px solid #d9e3d6;
  border-radius: 13px;
  padding: 18px;
}
.statistiques dt {
  color: #5b6f60;
  font-size: 14px;
}
.statistiques dd {
  margin: 4px 0 0;
  color: #1b5734;
  font-weight: 700;
  font-size: 28px;
}
@media (max-width: 650px) {
  .statistiques {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .statistiques > div {
    padding: 14px;
  }
  .statistiques dd {
    font-size: 24px;
  }
}
</style>
