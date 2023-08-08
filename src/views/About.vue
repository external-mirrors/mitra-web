<template>
  <sidebar-layout v-if="currentUser && instance">
    <template #content>
      <h1>{{ instance.title }}</h1>
      <div class="description static-text" v-html="instance.description"></div>
      <details class="technical-info static-text">
        <summary>Technical Info</summary>
        mitra version: {{ getMitraVersion(instance.version) }}
        <br>
        mitra-web version: {{ APP_VERSION }}
      </details>
    </template>
  </sidebar-layout>
  <static-page v-else-if="currentUser === null && instance" class="wide">
    <template #heading>{{ instance.title }}</template>
    <template #text>
      <div class="description" v-html="instance.description"></div>
    </template>
  </static-page>
</template>

<script setup lang="ts">
import { $ } from "vue/macros"

import { APP_VERSION } from "@/constants"
import SidebarLayout from "@/components/SidebarLayout.vue"
import StaticPage from "@/components/StaticPage.vue"
import { useCurrentUser } from "@/composables/user"
import { useInstanceInfo } from "@/composables/instance"

const { currentUser } = $(useCurrentUser())
const { instance } = $(useInstanceInfo())

function getMitraVersion(apiVersion: string): string {
  const match = apiVersion.match(/.+Mitra ([\d.]+)/)
  if (match) {
    return match[1]
  } else {
    return "unknown"
  }
}
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/theme";

.description {
  word-wrap: break-word;
}

/* Internal page */
.content {
  h1 {
    font-size: 18px * 2.5;
    margin-bottom: calc($block-outer-padding / 2);
  }

  .description {
    font-size: 18px;
  }
}

.technical-info {
  font-size: 18px;
  margin-top: $block-outer-padding;

  summary {
    font-weight: bold;
  }
}
</style>
