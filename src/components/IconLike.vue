<template>
  <icon-thumbs-up v-if="instance?.like_emoji === 'thumbs_up'"></icon-thumbs-up>
  <icon-heart v-else-if="instance?.like_emoji === 'heart'"></icon-heart>
</template>

<script setup lang="ts">
import IconHeart from "@/assets/feather/heart.svg?component"
import IconThumbsUp from "@/assets/forkawesome/thumbs-o-up.svg?component"
import { useInstanceInfo } from "@/composables/instance"

const { instance } = useInstanceInfo()
</script>
