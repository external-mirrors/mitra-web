<template>
  <form
    class="search"
    @submit.prevent="search()"
    v-click-away="hideHelp"
  >
    <input
      type="search"
      ref="inputElement"
      :placeholder="$t('navigation.search')"
      v-model="q"
      @focus="showHelp"
    >
    <button v-if="q" type="button" class="icon" @click="clear()">
      <icon-delete></icon-delete>
    </button>
    <button type="submit" class="icon" :disabled="!q">
      <icon-search></icon-search>
    </button>
    <menu v-if="isHelpVisible" class="help">
      <li v-for="[prefix, label] in searchOptions" :key="prefix">
        <button type="button" @click="insertPrefix(prefix)">
          <span class="prefix">{{ prefix }}</span>
          <span>{{ label }}</span>
        </button>
      </li>
    </menu>
  </form>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { useI18n } from "vue-i18n"
import { useRouter } from "vue-router"

import IconDelete from "@/assets/feather/delete.svg?component"
import IconSearch from "@/assets/feather/search.svg?component"

const { t } = useI18n({ useScope: "global" })
const router = useRouter()

const inputElement = ref<HTMLInputElement | null>(null)
const q = ref("")
const isHelpVisible = ref(false)

const searchOptions = computed(() => {
  return [
    ["@", t("navigation.search_account")],
    ["#", t("navigation.search_hashtag")],
    [">", t("navigation.search_text")],
  ]
})

function showHelp() {
  isHelpVisible.value = true
}

function hideHelp() {
  isHelpVisible.value = false
}

function insertPrefix(prefix: string) {
  q.value = prefix
  if (inputElement.value !== null) {
    inputElement.value.focus()
  }
}

function clear() {
  q.value = ""
}

function search() {
  router.push({ name: "search", query: { q: q.value } })
}
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/theme";

.search {
  background-color: var(--block-background-color);
  border-radius: $btn-border-radius;
  box-shadow: $menu-shadow-size var(--shadow-color);
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  gap: $input-padding;
  padding: 0 $body-padding;
  position: relative;
}

input[type="search"] {
  background-color: transparent;
  border: none;
  height: 100%;
  min-width: 0; /* fix for firefox 78 */
  padding: 0;
}

input[type="search"]::-webkit-search-cancel-button {
  appearance: none;
}

button.icon {
  border-radius: 0 $btn-border-radius $btn-border-radius 0;
  height: 100%;

  svg {
    height: 1.2em;
    min-width: 1.2em;
    object-fit: contain;
    stroke: var(--text-color);
    vertical-align: middle;
    width: 1.2em;
  }
}

.help {
  background-color: inherit;
  border-radius: inherit;
  box-shadow: inherit;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: $input-padding;
  left: 0;
  margin-top: 1px;
  padding: $input-padding $body-padding;
  position: absolute;
  top: 100%;
  width: 100%;
  z-index: $header-z-index + 1;

  button {
    color: var(--secondary-text-color);
    width: 100%;

    &:hover {
      color: var(--secondary-text-hover-color);
    }

    .prefix {
      display: inline-block;
      font-weight: bold;
      margin-right: $whitespace;
      text-align: center;
      width: 1em;
    }
  }
}

</style>
