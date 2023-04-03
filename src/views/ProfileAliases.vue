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
      <section>
        <h2>Add alias</h2>
        <form @submit.prevent="onAddAlias()">
          <div class="input-group">
            <input
              id="alias"
              type="text"
              v-model="newAlias"
              placeholder="Fediverse address"
              @input="newAliasSuggestions = []; newAliasError = null"
            >
            <div class="suggestions" v-if="newAliasSuggestions.length > 0">
              <button
                class="suggestion"
                v-for="profile in newAliasSuggestions"
                :key="profile.id"
                @click="newAlias = profile.acct; newAliasSuggestions = []"
              >
                {{ profile.acct }}
              </button>
            </div>
          </div>
          <button
            type="submit"
            class="btn"
            :disabled="!canAddAlias()"
          >
            Add
          </button>
          <div class="error-message" v-if="newAliasError">
            {{ newAliasError }}
          </div>
        </form>
      </section>
      <loader v-if="isLoading"></loader>
    </template>
  </sidebar-layout>
</template>

<script setup lang="ts">
import { onMounted } from "vue"
import { $, $ref } from "vue/macros"

import { searchProfilesByAcct } from "@/api/search"
import { addAlias } from "@/api/settings"
import { getAliases, Aliases, Profile } from "@/api/users"
import SidebarLayout from "@/components/SidebarLayout.vue"
import Loader from "@/components/Loader.vue"
import ProfileListItem from "@/components/ProfileListItem.vue"
import { useCurrentUser } from "@/store/user"

const { ensureCurrentUser, ensureAuthToken } = $(useCurrentUser())

let aliases = $ref<Aliases>({ declared: [], verified: [] })
let isLoading = $ref(false)
let newAlias = $ref<string>("")
let newAliasSuggestions = $ref<Profile[]>([])
let newAliasError = $ref<string | null>(null)

onMounted(async () => {
  isLoading = true
  aliases = await getAliases(ensureCurrentUser().id)
  isLoading = false
})

function canAddAlias(): boolean {
  return newAlias.length > 0 && newAliasError === null
}

async function onAddAlias() {
  isLoading = true
  const profiles = await searchProfilesByAcct(
    ensureAuthToken(),
    newAlias,
    true,
    5,
  )
  if (profiles.length === 0) {
    newAliasError = "Profile not found"
    isLoading = false
    return
  }
  if (profiles.length === 1 && profiles[0].acct === newAlias) {
    aliases = await addAlias(ensureAuthToken(), newAlias)
    newAlias = ""
  } else {
    newAliasSuggestions = profiles
  }
  isLoading = false
}
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/mixins";
@import "../styles/theme";

section {
  margin-bottom: $block-outer-padding;
}

.profile {
  margin-bottom: $block-outer-padding;
}

form {
  @include content-form;

  .suggestions {
    background-color: var(--block-background-color);
    border-radius: $btn-border-radius;
    display: flex;
    flex-direction: column;
    margin-top: 1px;

    .suggestion {
      padding: calc($input-padding / 2) $input-padding;
      text-align: left;
      word-wrap: break-word;

      &:first-child {
        padding-top: $input-padding;
      }

      &:last-child {
        padding-bottom: $input-padding;
      }
    }
  }
}

.loader {
  margin: $block-outer-padding auto;
}
</style>
