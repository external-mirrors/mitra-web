<template>
  <form class="search" @submit.prevent="search()">
    <input type="search" placeholder="Search..." v-model="q">
    <button v-if="q" type="button" @click="clear()">
      <img src="@/assets/feather/delete.svg">
    </button>
    <button type="submit" :disabled="!q">
      <img src="@/assets/feather/search.svg">
    </button>
  </form>
</template>

<script setup lang="ts">
import { $ref } from "vue/macros"
import { useRouter } from "vue-router"

const router = useRouter()
let q = $ref("")

function clear() {
  q = ""
}

function search() {
  router.push({ name: "search", query: { q: q } })
}
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/theme";

.search {
  border-radius: $btn-border-radius;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  gap: 10px;
  padding: 7px 15px;
}

input[type="search"] {
  appearance: none;
  background-color: transparent;
  border: none;
  box-sizing: border-box;
  font-size: 15px;
  height: 100%;
  min-width: 0; /* fix for firefox 78 */
  padding: 0;
}

input[type="search"]::-webkit-search-cancel-button {
  appearance: none;
}

button {
  border-radius: 0 $btn-border-radius $btn-border-radius 0;
  font-size: 15px;
  height: 100%;

  img {
    filter: var(--text-colorizer);
    height: 1.2em;
    min-width: 1.2em;
    object-fit: contain;
    vertical-align: middle;
    width: 1.2em;
  }
}
</style>
