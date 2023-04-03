<template>
  <sidebar-layout>
    <template #content>
      <h1>Aliases</h1>
      <section v-if="aliases.declared.length > 0">
        <h2>Not verified</h2>
        <router-link
          v-for="profile in aliases.declared"
          :key="profile.id"
          :to="{ name: 'profile-by-acct', params: { acct: profile.acct } }"
        >
          <profile-list-item :profile="profile"></profile-list-item>
        </router-link>
      </section>
      <section v-if="aliases.verified.length > 0">
        <h2>Verified</h2>
        <router-link
          v-for="profile in aliases.verified"
          :key="profile.id"
          :to="{ name: 'profile-by-acct', params: { acct: profile.acct } }"
        >
          <profile-list-item :profile="profile"></profile-list-item>
        </router-link>
      </section>
      <div class="not-found" v-if="isEmpty() && !isLoading">
        No aliases found
      </div>
      <loader v-if="isLoading"></loader>
    </template>
  </sidebar-layout>
</template>

<script setup lang="ts">
import { onMounted } from "vue"
import { $, $ref } from "vue/macros"

import { getAliases, Aliases } from "@/api/users"
import SidebarLayout from "@/components/SidebarLayout.vue"
import Loader from "@/components/Loader.vue"
import ProfileListItem from "@/components/ProfileListItem.vue"
import { useCurrentUser } from "@/store/user"

const { ensureCurrentUser } = $(useCurrentUser())

let aliases = $ref<Aliases>({ declared: [], verified: [] })
let isLoading = $ref(false)

onMounted(async () => {
  isLoading = true
  aliases = await getAliases(ensureCurrentUser().id)
  isLoading = false
})

function isEmpty(): boolean {
  return aliases.declared.length === 0 && aliases.verified.length === 0
}
</script>

<style scoped lang="scss">
@import "../styles/layout";

section {
  margin-bottom: $block-outer-padding;
}

.profile {
  margin-bottom: $block-outer-padding;
}

.loader {
  margin: $block-outer-padding auto;
}
</style>
