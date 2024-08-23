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
            :key="emoji.name"
            :title="getEmojiShortcode(emoji.name)"
            @click.prevent="pick(emoji.text)"
          >
            <template v-if="emoji.url">
              <img loading="lazy" :src="emoji.url">
            </template>
            <template v-else>
              {{ emoji.text }}
            </template>
          </button>
        </div>
      </li>
      <li v-else class="emoji-grid-wrapper">
        <div class="emoji-grid">
          <button
            class="emoji"
            v-for="emoji in unicodeEmojiList"
            :key="emoji.name"
            :title="getEmojiShortcode(emoji.name)"
            @click.prevent="pick(emoji.text)"
          >
            {{ emoji.text }}
          </button>
        </div>
        <div class="emoji-grid" v-if="customEmojiList.length > 0">
          <button
            class="emoji"
            v-for="emoji in customEmojiList"
            :key="emoji.name"
            :title="getEmojiShortcode(emoji.name)"
            @click.prevent="pick(emoji.text)"
          >
            <img loading="lazy" :src="emoji.url as string">
          </button>
        </div>
      </li>
    </template>
  </menu>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"

import { getCustomEmojis, getEmojiShortcode } from "@/api/emojis"
import Loader from "@/components/Loader.vue"

/* eslint-disable-next-line func-call-spacing */
const emit = defineEmits<{
  (event: "emoji-picked", name: string): void,
}>()

const DEFAULT_EMOJIS = [
  "❤️",
  "😆",
  "🤔",
  "😢",
  "😡",
  "🎉",
  "💯",
  "👀",
]

interface Emoji {
  name: string,
  text: string,
  url: string | null,
}

const unicodeEmojiList = ref<Emoji[]>([])
const customEmojiList = ref<Emoji[]>([])
const searchQuery = ref<string>("")
const isLoading = ref(false)

function getSearchResults(): Emoji[] {
  return [...unicodeEmojiList.value, ...customEmojiList.value]
    .filter(emoji => emoji.name.includes(searchQuery.value))
}

function pick(emojiText: string) {
  emit("emoji-picked", emojiText)
}

onMounted(async () => {
  isLoading.value = true
  const { emojiToName } = await import("gemoji")
  unicodeEmojiList.value = DEFAULT_EMOJIS.map(emoji => {
    const name = emojiToName[emoji]
    return { name, text: emoji, url: null }
  })
  const customEmojis = await getCustomEmojis()
  customEmojiList.value = customEmojis.map(emoji => {
    return {
      name: emoji.shortcode,
      text: getEmojiShortcode(emoji.shortcode),
      url: emoji.url,
    }
  })
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
    font-size: calc($emoji-size / $emoji-line-height);
    height: $emoji-size;
    line-height: $emoji-line-height;
    text-align: center;
    width: $emoji-size;
  }

  &:not(:last-child) {
    border-bottom: 1px solid var(--separator-color);
    margin-bottom: calc($block-inner-padding / 2);
    padding-bottom: calc($block-inner-padding / 2);
  }
}

.loader {
  --loader-size: #{$icon-size};
  --loader-width: 2px;
}
</style>
