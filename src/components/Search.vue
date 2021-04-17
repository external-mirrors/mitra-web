<template>
  <form class="search" @submit.prevent="search($event)">
    <input type="text" placeholder="Search..." v-model="q">
    <button v-if="q" type="button" class="btn" @click="clear()">
      <img :src="require('@/assets/feather/delete.svg')">
    </button>
    <button type="submit" class="btn" :disabled="!q">
      <img :src="require('@/assets/feather/search.svg')">
    </button>
  </form>
</template>

<script lang="ts">
import { Vue } from "vue-class-component"

export default class Search extends Vue {

  q = ""

  clear() {
    this.q = ""
  }

  search() {
    this.$router.push({ name: "search", query: { q: this.q } })
  }

}
</script>

<style scoped lang="scss">
@import "../styles/theme";

.search {
  border-radius: $btn-border-radius;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  gap: 10px;
  padding: 7px 15px;
}

input {
  background-color: transparent;
  border: none;
  box-sizing: border-box;
  font-size: 15px;
  height: 100%;
  min-width: 0; /* fix for firefox 78 */
  padding: 0;
}

button {
  background-color: transparent;
  border-radius: 0 $btn-border-radius $btn-border-radius 0;
  font-size: 15px;
  height: 100%;
  padding: 0;

  img {
    filter: $text-colorizer;
    height: 1.2em;
    min-width: 1.2em;
    object-fit: contain;
    vertical-align: middle;
    width: 1.2em;
  }

  &:hover {
    background-color: transparent;
  }
}
</style>
