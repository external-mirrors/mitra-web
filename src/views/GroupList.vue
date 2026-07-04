<template>
  <sidebar-layout>
    <template #content>
      <h1 class="content-header">
        {{ $t('groups.groups') }}
      </h1>
      <div class="tab-bar-wrapper">
        <div class="tab-bar">
          <a
            class="tab"
            :class="{ active: tabName === 'following' }"
            @click="switchTab('following')"
          >
            {{ $t('groups.following') }}
          </a>
          <a
            class="tab"
            :class="{ active: tabName === 'moderating' }"
            @click="switchTab('moderating')"
          >
            {{ $t('groups.moderating') }}
          </a>
        </div>
        <router-link
          class="btn"
          :to="{ name: 'group-create' }"
        >
          {{ $t('groups.create_group') }}
        </router-link>
      </div>
      <div class="group-list">
        <router-link
          v-for="group in groups"
          :key="group.id"
          :to="{ name: 'group-timeline', params: { groupId: group.id } }"
        >
          <profile-list-item :profile="group">
            <template #profile-actions v-if="tabName === 'moderating'">
              <button
                class="icon"
                :title="$t('groups.delete_group')"
                @click.prevent="onDeleteGroup(group.id)"
              >
                <icon-delete></icon-delete>
              </button>
          </template>
          </profile-list-item>
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

import { deleteGroup, getGroups } from "@/api/groups"
import { Profile } from "@/api/users"
import IconDelete from "@/assets/feather/trash.svg?component"
import Loader from "@/components/Loader.vue"
import ProfileListItem from "@/components/ProfileListItem.vue"
import SidebarLayout from "@/components/SidebarLayout.vue"
import { useTitle } from "@/composables/title"
import { useCurrentUser } from "@/composables/user"

const { t } = useI18n({ useScope: "global" })
const { ensureAuthToken } = useCurrentUser()
const { setPageTitle } = useTitle()

const tabName = ref<"following" | "moderating">("following")
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
  isLoading.value = true
  const authToken = ensureAuthToken()
  const offset = groups.value.length
  const nextPage = await getGroups(authToken, tabName.value, offset)
  groups.value = [...groups.value, ...nextPage]
  isLoading.value = false
}

async function switchTab(name: "following" | "moderating") {
  tabName.value = name
  groups.value = []
  await loadPage()
}

async function onDeleteGroup(groupId: string) {
  if (confirm(t("groups.confirm_delete_this_group"))) {
    await deleteGroup(ensureAuthToken(), groupId)
    const groupIndex = groups.value.findIndex((group) => group.id === groupId)
    groups.value.splice(groupIndex, 1)
  }
}

onMounted(async () => {
  setPageTitle(t("groups.groups"))
  await loadPage()
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

.tab-bar-wrapper {
  align-items: start;
  display: flex;
  gap: $block-outer-padding;
}

.tab-bar {
  @include tab-bar;

  flex-grow: 1;
  margin-bottom: $block-outer-padding;
}

.group-list {
  display: flex;
  flex-direction: column;
  gap: $block-outer-padding;
  margin-bottom: $block-outer-padding;
}

.profile {
  @include block-icon;

  .icon > svg {
    vertical-align: middle;
  }
}

.next-btn {
  margin-bottom: $block-outer-padding;
}

.loader {
  margin: $block-outer-padding auto;
}
</style>
