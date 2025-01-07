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
import { ReactionEmoji } from "@/api/posts"

const props = defineProps<{
  emoji: Emoji | ReactionEmoji,
  lazy?: boolean,
}>()

const title = computed(() => {
  if (props.emoji.name !== null) {
    return getEmojiShortcode(props.emoji.name)
  } else {
    // ReactionEmoji: no tooltip
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
  font-size: calc($emoji-size / $emoji-line-height);
  height: $emoji-size;
  line-height: $emoji-line-height;
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
