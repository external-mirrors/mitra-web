<template>
  <sidebar-layout>
    <template #content>
      <h1>{{ $t('group_form.create_group') }}</h1>
      <form class="create-feed" @submit.prevent="onCreateGroup">
        <input
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
          :disabled="groupName.length === 0"
        >
          {{ $t('group_form.create') }}
        </button>
        <div
          v-if="errorMessage"
          class="error-message"
        >
          {{ errorMessage }}
        </div>
      </form>
    </template>
  </sidebar-layout>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import { useI18n } from "vue-i18n"
import { useRouter } from "vue-router"

import { createGroup } from "@/api/groups"
import SidebarLayout from "@/components/SidebarLayout.vue"
import { useTitle } from "@/composables/title"
import { useCurrentUser } from "@/composables/user"
import { setupAutoResize } from "@/utils/autoresize"

const { t } = useI18n({ useScope: "global" })
const router = useRouter()
const { ensureAuthToken } = useCurrentUser()
const { setPageTitle } = useTitle()

const groupName = ref<string>("")
const groupDescription = ref<string>("")
const groupDescriptionElement = ref<HTMLTextAreaElement | null>(null)
const errorMessage = ref<string | null>(null)

async function onCreateGroup() {
  const authToken = ensureAuthToken()
  const name = groupName.value
  const description = groupDescription.value
  let group
  try {
    group = await createGroup(authToken, name, description)
  } catch (error: any) {
    errorMessage.value = error.message
    return
  }
  errorMessage.value = null
  router.push({ name: "group-timeline", params: { groupId: group.id } })
}

onMounted(async () => {
  setPageTitle(t("group_form.create_group"))
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
</style>
