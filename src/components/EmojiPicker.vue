<template>
  <menu class="emoji-picker">
    <li v-if="isLoading"><loader></loader></li>
    <template v-else>
      <li class="search">
        <input
          type="search"
          :placeholder="$t('emoji_picker.search')"
          v-model="searchQuery"
          @keydown.enter.prevent
        >
      </li>
      <li v-if="searchQuery.length > 0 && getSearchResults().length === 0">
        {{ $t('emoji_picker.no_emojis_found') }}
      </li>
      <li v-else-if="searchQuery.length > 0" class="emoji-grid-wrapper">
        <div class="emoji-grid">
          <button
            class="emoji"
            v-for="emoji in getSearchResults()"
            :key="emoji.shortcode"
            :title="getEmojiShortcode(emoji.shortcode)"
            @click.prevent="pick(getEmojiShortcode(emoji.shortcode))"
          >
            <img loading="lazy" :src="emoji.url">
          </button>
        </div>
      </li>
      <li v-else class="emoji-grid-wrapper">
        <div class="emoji-grid">
          <button
            class="emoji"
            v-for="emoji in customEmojis"
            :key="emoji.shortcode"
            :title="getEmojiShortcode(emoji.shortcode)"
            @click.prevent="pick(getEmojiShortcode(emoji.shortcode))"
          >
            <img loading="lazy" :src="emoji.url">
          </button>
        </div>
      </li>
    </template>
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
const searchQuery = ref<string>("")
const isLoading = ref(false)

function getSearchResults() {
  return customEmojis.value
    .filter(emoji => emoji.shortcode.includes(searchQuery.value))
}

function pick(emojiText: string) {
  emit("emoji-picked", emojiText)
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
  min-width: 120px;
}

.search {
  input {
    border: 1px solid var(--separator-color);
    border-radius: $btn-border-radius;
  }
}

.emoji-grid-wrapper {
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

.loader {
  --loader-size: #{$icon-size};
  --loader-width: 2px;
}
</style>
