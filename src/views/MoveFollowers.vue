<template>
  <sidebar-layout>
    <template #content>
      <h1>{{ $t('move_followers.move_followers') }}</h1>
      <form>
        <div class="input-group">
          <input
            type="text"
            id="target"
            :placeholder="$t('move_followers.target_address')"
            v-model="target"
          >
        </div>
        <button
          type="submit"
          class="btn"
          :disabled="!canMove() || isLoading"
          @click.prevent="submit()"
        >
          {{ $t('move_followers.move') }}
        </button>
        <div class="error-message" v-if="errorMessage">{{ errorMessage }}</div>
      </form>
    </template>
  </sidebar-layout>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import { useI18n } from "vue-i18n"
import { useRouter } from "vue-router"

import { moveFollowers } from "@/api/settings"
import SidebarLayout from "@/components/SidebarLayout.vue"
import { useActorHandle } from "@/composables/handle"
import { useTitle } from "@/composables/title"
import { useCurrentUser } from "@/composables/user"

const { t } = useI18n({ useScope: "global" })
const router = useRouter()
const { getActorLocation } = useActorHandle()
const { currentUser, ensureAuthToken, setCurrentUser } = useCurrentUser()
const { setPageTitle } = useTitle()

const target = ref("")
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

function canMove(): boolean {
  return target.value.length > 0
}

async function submit() {
  if (currentUser.value === null) {
    return
  }
  let user
  isLoading.value = true
  try {
    user = await moveFollowers(
      ensureAuthToken(),
      target.value.replace(/^@/, ""),
    )
  } catch (error: any) {
    isLoading.value = false
    errorMessage.value = error.message
    return
  }
  isLoading.value = false
  errorMessage.value = null
  setCurrentUser(user)
  router.push(getActorLocation("profile", user))
}

onMounted(() => {
  setPageTitle(t("move_followers.move_followers"))
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
