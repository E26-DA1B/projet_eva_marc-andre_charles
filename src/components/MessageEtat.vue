<script setup>
defineProps({ type: { type: String, default: "info" }, dismissible: Boolean });
defineEmits(["fermer"]);
</script>
<template>
  <div
    class="message"
    :class="`message-${type}`"
    :role="type === 'error' ? 'alert' : 'status'"
  >
    <div><slot /></div>
    <button
      v-if="dismissible"
      type="button"
      class="bouton-discret"
      aria-label="Fermer le message"
      @click="$emit('fermer')"
    >
      Fermer
    </button>
  </div>
</template>
