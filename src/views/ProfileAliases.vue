<template>
  <sidebar-layout>
    <template #content>
      <h1>Identities</h1>
      <section>If you want to move from another account to this one, here you can create an alias, which is required before you can proceed with moving followers from the old account to this one.</section>
      <section v-if="aliases.declared_all.length > 0">
        <h2>Declared aliases</h2>
        <div class="profile-group" v-for="alias in aliases.declared_all" :key="alias.id">
          <router-link
            v-if="alias.account !== null"
            :to="getActorLocation('profile', alias.account)"
          >
            <profile-list-item :profile="alias.account"></profile-list-item>
          </router-link>
          <profile-list-item
            v-else
            :profile="defaultProfile({ display_name: 'Unknown', url: alias.id })"
          ></profile-list-item>
          <button
            class="remove-alias icon"
            title="Remove alias"
            @click="onRemoveAlias(alias.id)"
          >
            <icon-delete></icon-delete>
          </button>
        </div>
      </section>
      <section v-if="aliases.verified.length > 0">
        <h2>Verified aliases</h2>
        <router-link
          v-for="profile in aliases.verified"
          :key="profile.id"
          :to="getActorLocation('profile', profile)"
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
              v-model.trim="newAlias"
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
import { onMounted, ref } from "vue"

import { searchProfilesByAcct } from "@/api/search"
import { addAlias, removeAlias } from "@/api/settings"
import { defaultProfile, getAliases, Aliases, Profile } from "@/api/users"
import IconDelete from "@/assets/feather/x.svg?component"
import SidebarLayout from "@/components/SidebarLayout.vue"
import Loader from "@/components/Loader.vue"
import ProfileListItem from "@/components/ProfileListItem.vue"
import { useActorHandle } from "@/composables/handle"
import { useCurrentUser } from "@/composables/user"

const { getActorLocation } = useActorHandle()
const { ensureCurrentUser, ensureAuthToken } = useCurrentUser()

const aliases = ref<Aliases>({ declared: [], declared_all: [], verified: [] })
const isLoading = ref(false)
const newAlias = ref<string>("")
const newAliasSuggestions = ref<Profile[]>([])
const newAliasError = ref<string | null>(null)

onMounted(async () => {
  isLoading.value = true
  aliases.value = await getAliases(ensureCurrentUser().id)
  isLoading.value = false
})

function canAddAlias(): boolean {
  return newAlias.value.length > 0 && newAliasError.value === null
}

async function onAddAlias() {
  isLoading.value = true
  const profiles = await searchProfilesByAcct(
    ensureAuthToken(),
    newAlias.value,
    true,
    5,
  )
  if (profiles.length === 0) {
    newAliasError.value = "profile not found"
    isLoading.value = false
    return
  }
  if (profiles.length === 1 && profiles[0].acct === newAlias.value) {
    try {
      aliases.value = await addAlias(ensureAuthToken(), newAlias.value)
    } catch (error: any) {
      newAliasError.value = error.message
      isLoading.value = false
      return
    }
    newAlias.value = ""
  } else {
    newAliasSuggestions.value = profiles
  }
  isLoading.value = false
}

async function onRemoveAlias(actorId: string) {
  isLoading.value = true
  aliases.value = await removeAlias(ensureAuthToken(), actorId)
  isLoading.value = false
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

.profile-group {
  @include block-icon;

  margin-bottom: $block-outer-padding;
  position: relative;

  .profile {
    margin-bottom: 0;
  }

  .remove-alias {
    align-items: center;
    display: flex;
    padding: calc($block-inner-padding / 2);
    position: absolute;
    right: 0;
    top: 0;
  }
}

form {
  @include content-form;
  @include content-form-suggestions;
}

.loader {
  margin: $block-outer-padding auto;
}
</style>
