<template>
  <sidebar-layout>
    <template #content>
      <div v-if="group" class="group-info">
        <router-link
          :to="{ name: 'group-timeline', params: { groupId: group.id } }"
        >
          {{ group.getDisplayName() }}
        </router-link>
      </div>
      <div v-if="!isLoading && members.length === 0" class="content-message">
        {{ $t('groups.group_members_are_not_known') }}
      </div>
      <div
        class="profile-list"
      >
        <router-link
          v-for="member in members"
          :key="member.account.id"
          :to="getActorLocation('profile', member.account)"
        >
          <profile-list-item :profile="member.account">
            <template #profile-actions>
                <div class="member-info">
                  {{ getAffiliationDisplay(member.affiliation) }}
                </div>
              </template>
          </profile-list-item>
        </router-link>
      </div>
      <loader v-if="isLoading"></loader>
    </template>
  </sidebar-layout>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute } from "vue-router"

import { getGroupMembers, Affiliation } from "@/api/groups"
import { getProfile, ProfileWrapper } from "@/api/users"
import Loader from "@/components/Loader.vue"
import ProfileListItem from "@/components/ProfileListItem.vue"
import SidebarLayout from "@/components/SidebarLayout.vue"
import { useActorHandle } from "@/composables/handle"
import { useTitle } from "@/composables/title"
import { useCurrentUser } from "@/composables/user"

const route = useRoute()
const { t } = useI18n({ useScope: "global" })
const { getActorLocation } = useActorHandle()
const { ensureAuthToken } = useCurrentUser()
const { setPageTitle } = useTitle()

const group = ref<ProfileWrapper | null>(null)
const members = ref<Affiliation[]>([])
const isLoading = ref(false)

function getAffiliationDisplay(affiliation: string): string {
  return t(`groups.affiliation_${affiliation}`)
}

onMounted(async () => {
  setPageTitle(t("groups.group"))
  isLoading.value = true
  const authToken = ensureAuthToken()
  const _group = await getProfile(
    authToken,
    route.params.groupId as string,
  )
  group.value = new ProfileWrapper(_group)
  setPageTitle(group.value.getDisplayName())
  members.value = await getGroupMembers(group.value.id)
  isLoading.value = false
})
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/mixins";
@import "../styles/theme";

.group-info {
  @include content-message;

  margin-bottom: $block-outer-padding;
}

.content-message {
  @include content-message;

  margin-bottom: $block-outer-padding;
}

.profile-list {
  display: flex;
  flex-direction: column;
  gap: $block-outer-padding;
  margin-bottom: $block-outer-padding;
}

.profile {
  .member-info {
    @include badge;
  }
}

.loader {
  margin: $block-outer-padding auto;
}
</style>
