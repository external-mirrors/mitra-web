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
      <div
        v-if="group && canViewFollowers()"
        class="tab-bar"
      >
        <a
          class="tab"
          :class="{ active: tabName === 'members' }"
          @click="switchTab('members')"
        >
          {{ $t('groups.members') }}
        </a>
        <a
          class="tab"
          :class="{ active: tabName === 'followers' }"
          @click="switchTab('followers')"
        >
          {{ $t('groups.followers') }}
        </a>
      </div>
      <div
        v-if="!isLoading && tabName === 'members' && members.length === 0"
        class="content-message"
      >
        {{ $t('groups.group_members_are_not_known') }}
      </div>
      <div
        v-if="tabName === 'members'"
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
      <div
        v-else-if="tabName === 'followers'"
        class="profile-list"
      >
        <router-link
          v-for="profile in followers"
          :key="profile.id"
          :to="getActorLocation('profile', profile)"
        >
          <profile-list-item :profile="profile"></profile-list-item>
        </router-link>
        <button
          v-if="followersNextPageUrl"
          class="btn secondary next-btn"
          @click="loadFollowersPage()"
        >
          {{ $t('profile_list.show_more_users') }}
        </button>
      </div>
      <loader v-if="isLoading"></loader>
    </template>
  </sidebar-layout>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute, useRouter } from "vue-router"

import {
  getGroupFollowers,
  getGroupMembers,
  Affiliation,
} from "@/api/groups"
import { getProfile, Profile, ProfileWrapper } from "@/api/users"
import Loader from "@/components/Loader.vue"
import ProfileListItem from "@/components/ProfileListItem.vue"
import SidebarLayout from "@/components/SidebarLayout.vue"
import { useActorHandle } from "@/composables/handle"
import { useTitle } from "@/composables/title"
import { useCurrentUser } from "@/composables/user"

const route = useRoute()
const router = useRouter()
const { t } = useI18n({ useScope: "global" })
const { getActorLocation } = useActorHandle()
const { ensureAuthToken, ensureCurrentUser } = useCurrentUser()
const { setPageTitle } = useTitle()

const tabName = ref<"members" | "followers">("members")
const group = ref<ProfileWrapper | null>(null)
const currentUserAffiliation = ref<"admin" | "member" | "none">("none")
const members = ref<Affiliation[]>([])
const followers = ref<Profile[]>([])
const followersNextPageUrl = ref<string | null>(null)
const isLoading = ref(false)

function getAffiliationDisplay(affiliation: "admin" | "member"): string {
  return t(`groups.affiliation_${affiliation}`)
}

async function switchTab(name: "members" | "followers") {
  router.push({ name: "group-member-list", params: { tabName: name } })
}

function canViewFollowers(): boolean {
  return currentUserAffiliation.value === "admin"
}

async function loadFollowersPage() {
  if (group.value === null) {
    return
  }
  isLoading.value = true
  const authToken = ensureAuthToken()
  const page = await getGroupFollowers(
    authToken,
    group.value.id,
    followersNextPageUrl.value ?? undefined,
  )
  followers.value.push(...page.profiles)
  followersNextPageUrl.value = page.nextPageUrl
  isLoading.value = false
}

onMounted(async () => {
  setPageTitle(t("groups.group"))
  tabName.value = route.params.tabName as "members" | "followers"
  isLoading.value = true
  const authToken = ensureAuthToken()
  const _group = await getProfile(
    authToken,
    route.params.groupId as string,
  )
  group.value = new ProfileWrapper(_group)
  setPageTitle(group.value.getDisplayName())
  const _members = await getGroupMembers(authToken, group.value.id)
  const currentUserMembership = _members
    .find(member => member.account.id === ensureCurrentUser().id)
  currentUserAffiliation.value = currentUserMembership?.affiliation ?? "none"
  if (tabName.value === "members") {
    members.value = _members
  } else if (tabName.value === "followers") {
    await loadFollowersPage()
  }
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

.tab-bar {
  @include tab-bar;

  flex-grow: 1;
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
