<template>
  <div v-if="isUserAuthenticated()" class="sidebar">
    <router-link class="sidebar-link" to="/notifications">
      <div class="icon">
        <icon-bell></icon-bell>
        <div v-if="unreadNotificationCount > 0" class="icon-badge">{{ unreadNotificationCount }}</div>
      </div>
      <span>{{ $t('navigation.notifications') }}</span>
    </router-link>
    <router-link class="sidebar-link" to="/local">
      <div class="icon"><icon-community></icon-community></div>
      <span>{{ $t('navigation.local') }}</span>
    </router-link>
    <router-link
      v-if="canViewFederatedTimeline()"
      class="sidebar-link"
      :to="{ name: 'known-network' }"
    >
      <div class="icon"><icon-globe></icon-globe></div>
      <span>{{ $t('navigation.federated') }}</span>
    </router-link>
    <router-link class="sidebar-link" to="/profile-directory">
      <div class="icon"><icon-users></icon-users></div>
      <span>{{ $t('navigation.profile_directory') }}</span>
    </router-link>
    <router-link class="sidebar-link" :to="{ name: 'bookmark-list' }">
      <div class="icon"><icon-bookmarks></icon-bookmarks></div>
      <span>{{ $t('navigation.bookmarks') }}</span>
    </router-link>
    <router-link class="sidebar-link" :to="{ name: 'settings' }">
      <div class="icon"><icon-settings></icon-settings></div>
      <span>{{ $t('navigation.settings') }}</span>
    </router-link>
    <router-link class="sidebar-link" to="/about">
      <div class="icon"><icon-help></icon-help></div>
      <span>{{ $t('navigation.about') }}</span>
    </router-link>
    <a class="sidebar-link" @click="logout()">
      <div class="icon"><icon-logout></icon-logout></div>
      <span>{{ $t('navigation.logout') }}</span>
    </a>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"

import { revokeAccessToken } from "@/api/users"
import IconBell from "@/assets/feather/bell.svg?component"
import IconCommunity from "@/assets/tabler/building-community.svg?component"
import IconGlobe from "@/assets/feather/globe.svg?component"
import IconHelp from "@/assets/feather/help-circle.svg?component"
import IconLogout from "@/assets/feather/log-out.svg?component"
import IconSettings from "@/assets/feather/settings.svg?component"
import IconUsers from "@/assets/feather/users.svg?component"
import IconBookmarks from "@/assets/tabler/bookmarks.svg?component"
import { useInstanceInfo } from "@/composables/instance"
import { useNotifications } from "@/composables/notifications"
import { useCurrentUser } from "@/composables/user"

const route = useRoute()
const router = useRouter()
const {
  currentUser,
  endSession,
  ensureAuthToken,
  isAdmin,
} = useCurrentUser()
const { instance } = useInstanceInfo()
const { loadNotifications, getUnreadNotificationCount } = useNotifications()

onMounted(async () => {
  if (isUserAuthenticated() && route.name !== "notifications") {
    await loadNotifications(ensureAuthToken())
  }
})

function isUserAuthenticated(): boolean {
  return currentUser.value !== null
}

const unreadNotificationCount = computed<number>(() => {
  return getUnreadNotificationCount()
})

function canViewFederatedTimeline(): boolean {
  const federatedTimelineRestricted = instance.value?.federated_timeline_restricted ?? true
  return !federatedTimelineRestricted || isAdmin()
}

async function logout() {
  await revokeAccessToken(ensureAuthToken())
  endSession()
  router.push({ name: "landing-page" })
}
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/theme";

$sidebar-icon-size: 20px;

.sidebar {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  gap: $block-outer-padding * 1.5;
  position: sticky;
  top: $header-height + $block-outer-padding;
  width: $sidebar-width;
  z-index: $header-z-index - 1; /* sidebar is below header to avoid overlap on narrow screens */
}

.sidebar-link {
  align-items: center;
  display: flex;
  flex-direction: row;
  font-size: 18px;

  .icon {
    /* margin + padding + width ~= avatar-size */
    height: $sidebar-icon-size;
    margin-left: 8px;
    margin-right: 10px;
    position: relative;
    text-align: center;
    width: $sidebar-icon-size + 5px;

    svg {
      height: $sidebar-icon-size;
      stroke: var(--link-color);
      width: $sidebar-icon-size;
    }

    .icon-badge {
      background-color: var(--block-background-color);
      border-radius: 50%;
      font-size: 0.8rem;
      height: 1em;
      line-height: 1em;
      padding: 1px;
      position: absolute;
      right: -0.5em;
      top: -0.5em;
      width: 1em;
    }
  }

  &:hover {
    svg {
      stroke: var(--link-hover-color);
    }
  }

  &.router-link-exact-active {
    color: var(--link-hover-color);

    svg {
      stroke: var(--link-hover-color);
    }
  }
}

@media screen and (max-width: $screen-breakpoint-small) {
  .sidebar {
    background-color: var(--background-color);
    box-sizing: content-box;
    flex-direction: row;
    gap: 0;
    justify-content: space-between;
    margin: 0 (0 - $body-padding) 1px; /* adding offset for post outline */
    padding: $body-padding;
    top: $header-height - $body-padding;
    width: 100%;
  }

  .sidebar-link {
    span {
      display: none;
    }

    .icon {
      margin: 0;
    }
  }
}
</style>
