<template>
  <div id="main" :class="{ wide: currentUser === null }">
    <div class="content">
      <slot name="content"></slot>
    </div>
    <sidebar></sidebar>
  </div>
</template>

<script setup lang="ts">
import { $ } from "vue/macros"

import { useCurrentUser } from "@/store/user"
import Sidebar from "./Sidebar.vue"

const { currentUser } = $(useCurrentUser())
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/theme";
</style>
