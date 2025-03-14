<template>
  <menu class="emoji-picker">
    <li v-if="isLoading"><loader></loader></li>
    <template v-else>
      <li class="search">
        <input
          type="search"
          ref="searchInputElement"
          :placeholder="$t('emoji_picker.search')"
          v-model="searchQuery"
          @keydown.enter.prevent
        >
      </li>
      <li v-if="searchQuery.length > 0 && searchResults.length === 0">
        {{ $t('emoji_picker.no_emojis_found') }}
      </li>
      <li v-else-if="searchQuery.length > 0" class="emoji-grid-wrapper">
        <div class="emoji-grid">
          <button
            v-for="emoji in searchResults"
            :key="emoji.name"
            @click.prevent="pick(emoji.text)"
          >
            <emoji-image :emoji="emoji" :lazy="true"></emoji-image>
          </button>
        </div>
      </li>
      <li v-else class="emoji-grid-wrapper">
        <div class="emoji-grid">
          <button
            v-for="emoji in favoriteEmojiList"
            :key="emoji.name"
            @click.prevent="pick(emoji.text)"
          >
            <emoji-image :emoji="emoji" :lazy="true"></emoji-image>
          </button>
        </div>
        <div class="emoji-grid" v-if="customEmojiList.length > 0">
          <button
            v-for="emoji in customEmojiList"
            :key="emoji.name"
            @click.prevent="pick(emoji.text)"
          >
            <emoji-image :emoji="emoji" :lazy="true"></emoji-image>
          </button>
        </div>
      </li>
    </template>
  </menu>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from "vue"

import { getCustomEmojis, getUnicodeEmojis, Emoji } from "@/api/emojis"
import EmojiImage from "@/components/EmojiImage.vue"
import Loader from "@/components/Loader.vue"

/* eslint-disable-next-line func-call-spacing */
const emit = defineEmits<{
  (event: "emoji-picked", name: string): void,
}>()

const FAVORITE_EMOJIS = [
  "❤️",
  "😆",
  "🤔",
  "😢",
  "😡",
  "🎉",
  "💯",
  "👀",
]

const searchInputElement = ref<HTMLInputElement | null>(null)

const favoriteEmojiList = ref<Emoji[]>([])
const customEmojiList = ref<Emoji[]>([])
const allEmojiList = ref<Emoji[]>([])
const searchQuery = ref<string>("")
const isLoading = ref(false)

const searchResults = computed(() => {
  return allEmojiList.value
    .filter(emoji => emoji.name.includes(searchQuery.value))
})

function pick(emojiText: string) {
  emit("emoji-picked", emojiText)
}

onMounted(async () => {
  isLoading.value = true
  const { emojiToName } = await import("gemoji")
  favoriteEmojiList.value = FAVORITE_EMOJIS.map(emoji => {
    const name = emojiToName[emoji]
    return { name, text: emoji, url: null }
  })
  const unicodeEmojis = await getUnicodeEmojis()
  const customEmojis = await getCustomEmojis()
  customEmojiList.value = [...customEmojis]
  const allEmojis = [...unicodeEmojis, ...customEmojis]
  allEmojis.sort((a, b) => a.name.localeCompare(b.name))
  allEmojiList.value = allEmojis
  isLoading.value = false

  await nextTick()
  if (searchInputElement.value !== null) {
    searchInputElement.value.focus()
  }
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

  &:not(:last-child) {
    border-bottom: 1px solid var(--separator-color);
    margin-bottom: calc($block-inner-padding / 2);
    padding-bottom: calc($block-inner-padding / 2);
  }

  button {
    height: $emoji-size;
    width: $emoji-size;
  }
}

.loader {
  --loader-size: #{$icon-size};
  --loader-width: 2px;
}
</style>
