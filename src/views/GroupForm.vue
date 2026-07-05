<template>
  <sidebar-layout>
    <template #content>
      <h1>
        <template v-if="groupId">
          {{ $t('group_form.edit_group') }}
        </template>
        <template v-else>
          {{ $t('group_form.create_group') }}
        </template>
      </h1>
      <form class="create-feed" @submit.prevent="onCreateGroup">
        <input
          v-if="!groupId"
          type="text"
          :placeholder="$t('group_form.group_name')"
          v-model.trim="groupName"
        >
        <textarea
          ref="groupDescriptionElement"
          :placeholder="$t('group_form.description')"
          v-model.trim="groupDescription"
        ></textarea>
        <button
          type="submit"
          class="btn"
          :disabled="!groupId && groupName.length === 0"
        >
          <template v-if="groupId !== null">
            {{ $t('group_form.save') }}
          </template>
          <template v-else>
            {{ $t('group_form.create') }}
          </template>
        </button>
        <div
          v-if="errorMessage"
          class="error-message"
        >
          {{ errorMessage }}
        </div>
      </form>
      <loader v-if="isLoading"></loader>
    </template>
  </sidebar-layout>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute, useRouter } from "vue-router"

import {
  createGroup,
  getGroupSource,
  updateGroup,
} from "@/api/groups"
import Loader from "@/components/Loader.vue"
import SidebarLayout from "@/components/SidebarLayout.vue"
import { useTitle } from "@/composables/title"
import { useCurrentUser } from "@/composables/user"
import { setupAutoResize } from "@/utils/autoresize"

const { t } = useI18n({ useScope: "global" })
const route = useRoute()
const router = useRouter()
const { ensureAuthToken } = useCurrentUser()
const { setPageTitle } = useTitle()

const groupId = ref<string | null>(null)
const groupName = ref<string>("")
const groupDescription = ref<string>("")
const groupDescriptionElement = ref<HTMLTextAreaElement | null>(null)
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

async function onCreateGroup() {
  const authToken = ensureAuthToken()
  isLoading.value = true
  try {
    if (groupId.value !== null) {
      await updateGroup(
        authToken,
        groupId.value,
        groupDescription.value,
      )
    } else {
      await createGroup(
        authToken,
        groupName.value,
        groupDescription.value,
      )
    }
  } catch (error: any) {
    errorMessage.value = error.message
    return
  } finally {
    isLoading.value = false
  }
  errorMessage.value = null
  router.push({ name: "group-list", params: { tabName: "moderating" } })
}

onMounted(async () => {
  isLoading.value = true
  if (route.params.groupId) {
    groupId.value = route.params.groupId as string
    const authToken = ensureAuthToken()
    const source = await getGroupSource(authToken, groupId.value)
    groupDescription.value = source.description
    setPageTitle(t("group_form.edit_group"))
  } else {
    setPageTitle(t("group_form.create_group"))
  }
  isLoading.value = false
  await nextTick()
  if (groupDescriptionElement.value !== null) {
    setupAutoResize(groupDescriptionElement.value)
  }
})
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/mixins";
@import "../styles/theme";

form {
  @include content-form;

  margin-bottom: $block-outer-padding;
}

.loader {
  margin: $block-outer-padding auto;
}
</style>
