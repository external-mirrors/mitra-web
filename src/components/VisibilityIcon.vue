<template>
  <img v-if="visibility === 'public'" :src="require('@/assets/feather/globe.svg')">
  <img v-else-if="visibility === 'private'" :src="require('@/assets/tabler/users.svg')">
  <img v-else-if="visibility === 'subscribers'" :src="require('@/assets/tabler/coin.svg')">
  <img v-else-if="visibility === 'direct'" :src="require('@/assets/forkawesome/envelope-o.svg')">
</template>

<script setup lang="ts">
/* eslint-disable-next-line no-undef */
defineProps<{
  visibility: string,
}>()
</script>
