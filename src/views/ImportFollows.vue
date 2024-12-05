<template>
  <sidebar-layout>
    <template #content>
      <h1>{{ $t('import_follows.import_follows') }}</h1>
      <form class="import-follows">
        <div class="input-group">
          <textarea
            id="follows"
            :placeholder="$t('import_follows.follows_csv')"
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
          {{ $t('import_follows.import') }}
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

import { importFollows } from "@/api/settings"
import SidebarLayout from "@/components/SidebarLayout.vue"
import { useActorHandle } from "@/composables/handle"
import { useTitle } from "@/composables/title"
import { useCurrentUser } from "@/composables/user"

const { t } = useI18n({ useScope: "global" })
const router = useRouter()
const { getActorLocation } = useActorHandle()
const { currentUser, ensureAuthToken } = useCurrentUser()
const { setPageTitle } = useTitle()

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

onMounted(() => {
  setPageTitle(t("import_follows.import_follows"))
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
