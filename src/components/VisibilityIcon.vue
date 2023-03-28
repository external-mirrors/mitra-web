<template>
  <img v-if="visibility === 'public'" src="@/assets/feather/globe.svg">
  <img v-else-if="visibility === 'private'" src="@/assets/tabler/users.svg">
  <img v-else-if="visibility === 'subscribers'" src="@/assets/tabler/coin.svg">
  <img v-else-if="visibility === 'direct'" src="@/assets/forkawesome/envelope-o.svg">
</template>

<script setup lang="ts">
/* eslint-disable-next-line no-undef */
defineProps<{
  visibility: string,
}>()
</script>
