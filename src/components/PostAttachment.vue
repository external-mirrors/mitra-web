<template>
  <img v-if="attachment.type === 'image'" :src="attachment.url">
  <video v-else-if="attachment.type === 'video'" :src="attachment.url" controls></video>
  <a v-else :href="attachment.url">{{ attachment.url }}</a>
</template>

<script setup lang="ts">
import { Attachment } from "@/api/posts"

/* eslint-disable-next-line no-undef */
defineProps<{
  attachment: Attachment,
}>()
</script>

<style scoped lang="scss">
@import "../styles/theme";
@import "../styles/mixins";

a {
  @include block-link;

  word-wrap: break-word;
}

img {
  display: block;
  width: 100%;
}

video {
  width: 100%;
}
</style>
