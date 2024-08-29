<template>
  <icon-globe v-if="visibility === 'public'"></icon-globe>
  <icon-users v-else-if="visibility === 'private'"></icon-users>
  <icon-premium v-else-if="visibility === 'subscribers'"></icon-premium>
  <icon-lock v-else-if="visibility === 'conversation'"></icon-lock>
  <icon-envelope v-else-if="visibility === 'direct'"></icon-envelope>
</template>

<script setup lang="ts">
import IconLock from "@/assets/feather/lock.svg?component"
import IconGlobe from "@/assets/feather/globe.svg?component"
import IconEnvelope from "@/assets/forkawesome/envelope-o.svg?component"
import IconPremium from "@/assets/extra-icons/spark.svg?component"
import IconUsers from "@/assets/tabler/users.svg?component"

defineProps<{
  visibility: string,
}>()
</script>
