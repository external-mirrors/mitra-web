<template>
  <div id="main">
    <div class="content about" v-if="instance">
      <h1>{{ instance.title }}</h1>
      <div class="description static-text" v-html="renderMarkdown(instance.description)"></div>
    </div>
    <sidebar></sidebar>
  </div>
</template>

<script setup lang="ts">
import { $ } from "vue/macros"

import Sidebar from "@/components/Sidebar.vue"
import { useInstanceInfo } from "@/store/instance"
import { renderMarkdown } from "@/utils/markdown"

const { instance } = $(useInstanceInfo())
</script>

<style scoped lang="scss">
@import "../styles/layout";

.description {
  font-size: 18px;
  font-weight: lighter;
  line-height: 2;
}
</style>
