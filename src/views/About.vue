<template>
  <sidebar-layout v-if="currentUser">
    <template #content v-if="instance">
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
      <div v-html="instance.description"></div>
    </template>
  </static-page>
</template>

<script setup lang="ts">
import { $ } from "vue/macros"

import { APP_VERSION } from "@/constants"
import SidebarLayout from "@/components/SidebarLayout.vue"
import StaticPage from "@/components/StaticPage.vue"
import { useCurrentUser } from "@/store/user"
import { useInstanceInfo } from "@/store/instance"

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

/* Internal page */
.content .description {
  font-size: 18px;
}

.technical-info {
  font-size: 18px;
  margin-top: 25px;

  summary {
    font-weight: bold;
  }
}
</style>
