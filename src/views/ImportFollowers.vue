<template>
  <sidebar-layout>
    <template #content>
      <h1>Import followers</h1>
      <form>
        <div class="input-group">
          <input
            type="text"
            id="from-actor-id"
            placeholder="From (actor ID)"
            v-model="fromActorId"
          >
        </div>
        <div class="input-group">
          <textarea
            id="followers"
            placeholder="Followers (CSV)"
            v-model="followersCsv"
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
import { onMounted, ref } from "vue"
import { useRouter } from "vue-router"

import { importFollowers } from "@/api/settings"
import SidebarLayout from "@/components/SidebarLayout.vue"
import { useActorHandle } from "@/composables/handle"
import { useTitle } from "@/composables/title"
import { useCurrentUser } from "@/composables/user"

const router = useRouter()
const { getActorLocation } = useActorHandle()
const { currentUser, ensureAuthToken, setCurrentUser } = useCurrentUser()
const { setPageTitle } = useTitle()

const fromActorId = ref("")
const followersCsv = ref("")
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

function canImport(): boolean {
  return fromActorId.value.length > 0 && followersCsv.value.length > 0
}

async function submit() {
  if (currentUser.value === null) {
    return
  }
  let user
  isLoading.value = true
  try {
    user = await importFollowers(
      ensureAuthToken(),
      fromActorId.value,
      followersCsv.value,
    )
  } catch (error: any) {
    isLoading.value = false
    errorMessage.value = error.message
    return
  }
  isLoading.value = false
  errorMessage.value = null
  setCurrentUser(user)
  router.push(getActorLocation("profile", currentUser.value))
}

onMounted(() => {
  setPageTitle("Import followers")
})
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/mixins";
@import "../styles/theme";

form {
  @include content-form;
}
</style>
