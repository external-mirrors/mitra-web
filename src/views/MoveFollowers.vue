<template>
  <sidebar-layout>
    <template #content>
      <h1>Move followers</h1>
      <form class="move-followers">
        <div class="input-group">
          <input
            type="text"
            id="from-actor-id"
            placeholder="From actor ID"
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
          :disabled="!canMove()"
          @click.prevent="move()"
        >
          Move
        </button>
      </form>
    </template>
  </sidebar-layout>
</template>

<script setup lang="ts">
import { $, $ref } from "vue/macros"
import { useRouter } from "vue-router"

import SidebarLayout from "@/components/SidebarLayout.vue"
import { useSignedActivity } from "@/composables/signed-activity"
import { useCurrentUser } from "@/store/user"

const router = useRouter()
const { currentUser } = $(useCurrentUser())
const { signMoveActivity } = useSignedActivity()

const fromActorId = $ref("")
const followersCsv = $ref("")

function canMove(): boolean {
  return fromActorId.length > 0 && followersCsv.length > 0
}

async function move() {
  if (currentUser === null) {
    return
  }
  await signMoveActivity(fromActorId, followersCsv)
  router.push({ name: "profile", params: { profileId: currentUser.id } })
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
