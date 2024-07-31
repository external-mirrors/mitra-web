<template>
  <sidebar-layout>
    <template #content>
      <h1>Import follows</h1>
      <form class="import-follows">
        <div class="input-group">
          <textarea
            id="follows"
            placeholder="Follows (CSV)"
            v-model="followsCsv"
          >
          </textarea>
        </div>
        <button
          type="submit"
          class="btn"
          :disabled="!canImport() || isLoading"
          @click.prevent="submit()"
        >
          Import
        </button>
        <div class="error-message" v-if="errorMessage">{{ errorMessage }}</div>
      </form>
    </template>
  </sidebar-layout>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"

import { importFollows } from "@/api/settings"
import SidebarLayout from "@/components/SidebarLayout.vue"
import { useActorHandle } from "@/composables/handle"
import { useCurrentUser } from "@/composables/user"

const router = useRouter()
const { getActorLocation } = useActorHandle()
const { currentUser, ensureAuthToken } = useCurrentUser()

const followsCsv = ref("")
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

function canImport(): boolean {
  return followsCsv.value.length > 0
}

async function submit() {
  if (currentUser.value === null) {
    return
  }
  isLoading.value = true
  try {
    await importFollows(
      ensureAuthToken(),
      followsCsv.value,
    )
  } catch (error: any) {
    isLoading.value = false
    errorMessage.value = error.message
    return
  }
  isLoading.value = false
  errorMessage.value = null
  router.push(getActorLocation("profile", currentUser.value))
}
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/mixins";
@import "../styles/theme";

form {
  @include content-form;
}
</style>
