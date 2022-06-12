<template>
  <static-page v-if="instance">
    <template #heading>{{ instance.title }}</template>
    <template #text>
      <div v-html="renderMarkdown(instance.description)"></div>
    </template>
  </static-page>
</template>

<script setup lang="ts">
import { $ } from "vue/macros"

import StaticPage from "@/components/StaticPage.vue"
import { useInstanceInfo } from "@/store/instance"
import { renderMarkdown } from "@/utils/markdown"

const { instance } = $(useInstanceInfo())
</script>
