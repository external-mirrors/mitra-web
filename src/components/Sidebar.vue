<template>
  <div v-if="isUserAuthenticated" class="sidebar">
    <router-link class="sidebar-link" to="/notifications">
      <div class="icon">
        <img :src="require('@/assets/feather/bell.svg')">
        <div v-if="unreadNotificationCount > 0" class="icon-badge">{{ unreadNotificationCount }}</div>
      </div>
      <span>Notifications</span>
    </router-link>
    <router-link class="sidebar-link" to="/local">
      <div class="icon"><img :src="require('@/assets/feather/server.svg')"></div>
      <span>Local</span>
    </router-link>
    <router-link class="sidebar-link" to="/profile-directory">
      <div class="icon"><img :src="require('@/assets/feather/users.svg')"></div>
      <span>Profile directory</span>
    </router-link>
    <router-link class="sidebar-link" to="/about">
      <div class="icon"><img :src="require('@/assets/feather/help-circle.svg')"></div>
      <span>About</span>
    </router-link>
    <a class="sidebar-link" @click="logout()">
      <div class="icon"><img :src="require('@/assets/feather/log-out.svg')"></div>
      <span>Logout</span>
    </a>
  </div>
  <div v-else-if="!isUserAuthenticated && instance" class="sidebar wide">
    <h1 class="instance-title">{{ instance.title }}</h1>
    <div class="instance-description">{{ instance.short_description }}</div>
    <router-link class="btn" :to="{name: 'about-public'}">Learn more</router-link>
  </div>
</template>

<script lang="ts">
import { Options, Vue, setup } from "vue-class-component"

import { InstanceInfo } from "@/api/instance"
import Avatar from "@/components/Avatar.vue"
import { useInstanceInfo } from "@/store/instance"
import { useNotifications } from "@/store/notifications"
import { useCurrentUser } from "@/store/user"

@Options({
  components: { Avatar },
})
export default class Sidebar extends Vue {

  private store = setup(() => {
    const { instance } = useInstanceInfo()
    const { loadNotifications, getUnreadNotificationCount } = useNotifications()
    const { currentUser, setCurrentUser, ensureAuthToken, setAuthToken } = useCurrentUser()
    return {
      instance,
      currentUser,
      setCurrentUser,
      ensureAuthToken,
      setAuthToken,
      loadNotifications,
      getUnreadNotificationCount,
    }
  })

  async created() {
    if (this.isUserAuthenticated) {
      // TODO: reload notifications periodically
      await this.store.loadNotifications(this.store.ensureAuthToken())
    }
  }

  get isUserAuthenticated(): boolean {
    return this.store.currentUser !== null
  }

  get unreadNotificationCount(): number {
    return this.store.getUnreadNotificationCount()
  }

  async logout() {
    this.store.setCurrentUser(null)
    this.store.setAuthToken(null)
    this.$router.push({ name: "landing-page" })
  }

  get instance(): InstanceInfo | null {
    return this.store.instance
  }

}
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/mixins";
@import "../styles/theme";

.sidebar {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.sidebar:not(.wide) {
  background-color: $background-color;
  flex-shrink: 0;
  gap: $block-outer-padding * 1.5;
  position: sticky;
  top: $header-height + $block-outer-padding;
  width: $sidebar-width;
  z-index: 2; /* header + 1 */
}

.sidebar-link {
  align-items: center;
  display: flex;
  flex-direction: row;
  font-size: 18px;

  .icon {
    height: 20px;
    margin-left: 8px;
    margin-right: 10px;
    position: relative;
    text-align: center;
    width: 25px;

    img {
      filter: $link-colorizer;
      height: 100%;
    }

    .icon-badge {
      background-color: $block-background-color;
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
      filter: $link-hover-colorizer;
    }
  }

  &.router-link-exact-active {
    color: $link-hover-color;

    img {
      filter: $link-hover-colorizer;
    }
  }
}

.sidebar.wide {
  @include block-btn;

  background-color: $block-background-color;
  border-radius: $block-border-radius;
  flex-shrink: 1;
  gap: $block-inner-padding;
  padding: $block-inner-padding;
  width: $wide-sidebar-width;

  h1 {
    font-size: 32px;
    font-weight: bold;
  }

  .btn {
    width: min-content;
  }
}

@media screen and (max-width: $screen-breakpoint-small) {
  .sidebar:not(.wide) {
    flex-direction: row;
    gap: 0;
    justify-content: space-between;
    padding-bottom: $body-padding;
    top: $header-height;
    width: 100%;
  }

  .sidebar-link {
    span {
      display: none;
    }
  }

  .sidebar.wide {
    margin-bottom: $body-padding;
    width: 100%;
  }
}
</style>
