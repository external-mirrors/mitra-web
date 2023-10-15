<template>
  <div v-if="isUserAuthenticated()" class="sidebar">
    <router-link class="sidebar-link" to="/notifications">
      <div class="icon">
        <img src="@/assets/feather/bell.svg">
        <div v-if="unreadNotificationCount > 0" class="icon-badge">{{ unreadNotificationCount }}</div>
      </div>
      <span>Notifications</span>
    </router-link>
    <router-link class="sidebar-link" to="/local">
      <div class="icon"><img src="@/assets/feather/server.svg"></div>
      <span>Local</span>
    </router-link>
    <router-link class="sidebar-link" to="/profile-directory">
      <div class="icon"><img src="@/assets/feather/users.svg"></div>
      <span>Profile directory</span>
    </router-link>
    <router-link
      v-if="canManageSubscriptions()"
      class="sidebar-link"
      :to="{ name: 'subscriptions-settings' }"
    >
      <div class="icon"><img src="@/assets/tabler/coin.svg"></div>
      <span>Subscriptions</span>
    </router-link>
    <router-link class="sidebar-link" :to="{ name: 'settings' }">
      <div class="icon"><img src="@/assets/feather/settings.svg"></div>
      <span>Settings</span>
    </router-link>
    <router-link class="sidebar-link" to="/about">
      <div class="icon"><img src="@/assets/feather/help-circle.svg"></div>
      <span>About</span>
    </router-link>
    <a class="sidebar-link" @click="logout()">
      <div class="icon"><img src="@/assets/feather/log-out.svg"></div>
      <span>Logout</span>
    </a>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue"
import { $, $computed } from "vue/macros"
import { useRouter } from "vue-router"

import { Permissions } from "@/api/users"
import { useInstanceInfo } from "@/composables/instance"
import { useNotifications } from "@/composables/notifications"
import { useCurrentUser } from "@/composables/user"

const router = useRouter()
const {
  currentUser,
  endUserSession,
  ensureAuthToken,
} = $(useCurrentUser())
const { getBlockchainInfo } = $(useInstanceInfo())
const { loadNotifications, getUnreadNotificationCount } = $(useNotifications())

onMounted(async () => {
  if (isUserAuthenticated()) {
    await loadNotifications(ensureAuthToken())
  }
})

function isUserAuthenticated(): boolean {
  return currentUser !== null
}

const unreadNotificationCount = $computed<number>(() => {
  return getUnreadNotificationCount()
})

function canManageSubscriptions(): boolean {
  const blockchain = getBlockchainInfo()
  const isSubscriptionsFeatureEnabled = Boolean(blockchain?.features.subscriptions)
  return (
    isSubscriptionsFeatureEnabled &&
    currentUser !== null &&
    currentUser.role.permissions.includes(Permissions.ManageSubscriptionOptions)
  )
}

async function logout() {
  await endUserSession()
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
  z-index: 99; /* header index - 1 (header should be on top) */
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

    img {
      filter: var(--link-colorizer);
      height: $sidebar-icon-size;
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
    img {
      filter: var(--link-hover-colorizer);
    }
  }

  &.router-link-exact-active {
    color: var(--link-hover-color);

    img {
      filter: var(--link-hover-colorizer);
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
    margin: 0 (0 - $body-padding);
    padding: 0 $body-padding $body-padding;
    top: $header-height;
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
