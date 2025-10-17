<template>
  <span class="emoji" :title="title">
    <template v-if="emoji.url">
      <img :src="emoji.url" :alt="title" :loading="lazy ? 'lazy' : undefined">
    </template>
    <template v-else>
      {{ emoji.text }}
    </template>
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue"

import { getEmojiShortcode, Emoji } from "@/api/emojis"

const props = defineProps<{
  emoji: Emoji,
  lazy?: boolean,
}>()

const title = computed(() => {
  if (props.emoji.name !== null) {
    return getEmojiShortcode(props.emoji.name)
  } else {
    // No tooltip
    return undefined
  }
})
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/mixins";

.emoji {
  @include emoji;

  display: inline-block;
  font-size: calc($emoji-size / $line-height);
  height: $emoji-size;
  min-width: $emoji-size;
  text-align: center;
  width: $emoji-size;

  /* for emoji picker (lazy loading) */
  img {
    height: inherit;
    width: inherit;
  }
}
</style>
