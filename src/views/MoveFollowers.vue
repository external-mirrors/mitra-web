<template>
  <sidebar-layout>
    <template #content>
      <h1>Move followers</h1>
      <form class="move-followers">
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
          :disabled="!canMove() || isLoading"
          @click.prevent="move()"
        >
          Move
        </button>
        <div class="error-message" v-if="errorMessage">{{ errorMessage }}</div>
      </form>
    </template>
  </sidebar-layout>
</template>

<script setup lang="ts">
import { $, $ref } from "vue/macros"
import { useRouter } from "vue-router"

import { moveFollowers } from "@/api/settings"
import SidebarLayout from "@/components/SidebarLayout.vue"
import { useActorHandle } from "@/composables/handle"
import { useCurrentUser } from "@/composables/user"

const router = useRouter()
const { getActorLocation } = useActorHandle()
const { currentUser, ensureAuthToken, setCurrentUser } = $(useCurrentUser())

const fromActorId = $ref("")
const followersCsv = $ref("")
let isLoading = $ref(false)
let errorMessage = $ref<string | null>(null)

function canMove(): boolean {
  return fromActorId.length > 0 && followersCsv.length > 0
}

async function move() {
  if (currentUser === null) {
    return
  }
  let user
  isLoading = true
  try {
    user = await moveFollowers(
      ensureAuthToken(),
      fromActorId,
      followersCsv,
    )
  } catch (error: any) {
    isLoading = false
    errorMessage = error.message
    return
  }
  isLoading = false
  errorMessage = null
  setCurrentUser(user)
  router.push(getActorLocation("profile", currentUser))
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
