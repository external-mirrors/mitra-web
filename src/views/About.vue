<template>
  <sidebar-layout v-if="currentUser">
    <template #content v-if="instance">
      <h1>{{ instance.title }}</h1>
      <div class="description static-text" v-html="renderMarkdown(instance.description)"></div>
    </template>
  </sidebar-layout>
  <static-page v-else-if="currentUser === null && instance" class="wide">
    <template #heading>{{ instance.title }}</template>
    <template #text>
      <div v-html="renderMarkdown(instance.description)"></div>
    </template>
  </static-page>
</template>

<script setup lang="ts">
import { $ } from "vue/macros"

import SidebarLayout from "@/components/SidebarLayout.vue"
import StaticPage from "@/components/StaticPage.vue"
import { useCurrentUser } from "@/store/user"
import { useInstanceInfo } from "@/store/instance"
import { renderMarkdown } from "@/utils/markdown"

const { currentUser } = $(useCurrentUser())
const { instance } = $(useInstanceInfo())
</script>

<style scoped lang="scss">
@import "../styles/layout";

/* Internal page */
.content .description {
  font-size: 18px;
  font-weight: lighter;
  line-height: 2;
}
</style>
