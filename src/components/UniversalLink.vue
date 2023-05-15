<template>
  <a
    v-if="typeof to === 'string'"
    :title="title"
    :href="to"
    target="_blank"
    rel="noreferrer"
  >
    <slot name="link-content"></slot>
  </a>
  <router-link
    v-else
    :title="title"
    :to="to"
  >
    <slot name="link-content"></slot>
  </router-link>
</template>

<script setup lang="ts">
import { RouteLocationRaw } from "vue-router"

/* eslint-disable-next-line no-undef */
defineProps<{
  to: string | RouteLocationRaw,
  title: string,
}>()
</script>
