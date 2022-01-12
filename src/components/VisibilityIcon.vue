<template>
  <img v-if="visibility === 'public'" :src="require('@/assets/feather/globe.svg')">
  <img v-else-if="visibility === 'direct'" :src="require('@/assets/forkawesome/envelope-o.svg')">
</template>

<script setup lang="ts">
/* eslint-disable no-undef */
defineProps<{
  visibility: string,
}>()
</script>
