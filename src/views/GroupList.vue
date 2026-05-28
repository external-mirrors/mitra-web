<template>
  <sidebar-layout>
    <template #content>
      <h1 class="content-header">
        {{ $t('groups.groups') }}
      </h1>
      <div v-if="!isLoading" class="group-list">
        <router-link
          v-for="group in groups"
          :key="group.id"
          :to="{ name: 'group-timeline', params: { groupId: group.id } }"
        >
          <profile-list-item :profile="group"></profile-list-item>
        </router-link>
      </div>
      <button
        v-if="isPageFull()"
        class="btn secondary next-btn"
        @click="loadPage()"
      >
        {{ $t('groups.show_more_groups') }}
      </button>
      <loader v-if="isLoading"></loader>
    </template>
  </sidebar-layout>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import { useI18n } from "vue-i18n"

import { getFollowedGroups } from "@/api/groups"
import { Profile } from "@/api/users"
import Loader from "@/components/Loader.vue"
import ProfileListItem from "@/components/ProfileListItem.vue"
import SidebarLayout from "@/components/SidebarLayout.vue"
import { useTitle } from "@/composables/title"
import { useCurrentUser } from "@/composables/user"

const { t } = useI18n({ useScope: "global" })
const { ensureAuthToken } = useCurrentUser()
const { setPageTitle } = useTitle()

const groups = ref<Profile[]>([])
const isLoading = ref(false)

function isPageFull(): boolean {
  return (
    isLoading.value === false
    && groups.value.length !== 0
    && groups.value.length % 40 === 0
  )
}

async function loadPage() {
  const authToken = ensureAuthToken()
  const offset = groups.value.length
  const nextPage = await getFollowedGroups(authToken, offset)
  groups.value = [...groups.value, ...nextPage]
}

onMounted(async () => {
  setPageTitle(t("groups.groups"))
  isLoading.value = true
  await loadPage()
  isLoading.value = false
})
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/mixins";
@import "../styles/theme";

.content-header {
  @include content-list-header;

  font-size: inherit;
}

.content-message {
  @include content-message;

  margin-bottom: $block-outer-padding;
}

.group-list {
  display: flex;
  flex-direction: column;
  gap: $block-outer-padding;
  margin-bottom: $block-outer-padding;
}

.group {
  background-color: var(--block-background-color);
  border-radius: $block-border-radius;
  display: flex;
  gap: $block-inner-padding;
  padding: $block-inner-padding;
}

.next-btn {
  margin-bottom: $block-outer-padding;
}

.loader {
  margin: $block-outer-padding auto;
}
</style>
