<template>
  <menu class="emoji-picker">
    <li v-if="isLoading"><loader></loader></li>
    <li v-else-if="customEmojis.length === 0">No custom emojis</li>
    <li v-else class="custom-emojis">
      <div class="emoji-grid">
        <button
          class="emoji"
          v-for="emoji in customEmojis"
          :key="emoji.shortcode"
          :title="getEmojiShortcode(emoji.shortcode)"
          @click.prevent="pick(emoji)"
        >
          <img loading="lazy" :src="emoji.url">
        </button>
      </div>
    </li>
  </menu>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"

import { getCustomEmojis, getEmojiShortcode, CustomEmoji } from "@/api/emojis"
import Loader from "@/components/Loader.vue"

/* eslint-disable-next-line func-call-spacing */
const emit = defineEmits<{
  (event: "emoji-picked", name: string): void,
}>()

const customEmojis = ref<CustomEmoji[]>([])
const isLoading = ref(false)

function pick(emoji: CustomEmoji) {
  emit("emoji-picked", emoji.shortcode)
}

onMounted(async () => {
  isLoading.value = true
  customEmojis.value = await getCustomEmojis()
  isLoading.value = false
})
</script>

<style scoped lang="scss">
@import "../styles/layout";

.emoji-picker {
  .custom-emojis {
    max-height: 200px;
    overflow-y: scroll;
  }

  .emoji-grid {
    display: grid;
    gap: calc($block-inner-padding / 2);
    grid-template-columns: repeat(auto-fit, minmax(min-content, $emoji-size));
    margin-right: calc($block-inner-padding / 2); /* extra space for scrollbar */
    max-width: ($emoji-size + calc($block-inner-padding / 2)) * 4;

    .emoji {
      display: flex;
      height: $emoji-size;
      width: $emoji-size;
    }
  }
}

.loader {
  --loader-size: #{$icon-size};
  --loader-width: 2px;
}
</style>
