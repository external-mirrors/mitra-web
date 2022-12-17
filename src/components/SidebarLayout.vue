<template>
  <header v-if="currentUser !== null">
    <div id="header">
      <div id="nav">
        <router-link to="/" class="home-btn">
          <img :src="require('@/assets/feather/home.svg')">
          <span>Home</span>
        </router-link>
        <search />
      </div>
      <div id="profile">
        <router-link
          class="profile-link"
          :to="{ name: 'profile', params: { profileId: currentUser.id }}"
        >
          <avatar :profile="currentUser"></avatar>
          <div class="profile-name">@{{ currentUser.username }}</div>
        </router-link>
      </div>
    </div>
  </header>
  <div v-else id="header-public" class="wide">
    <instance-info></instance-info>
  </div>
  <div id="main" :class="{ wide: currentUser === null }">
    <div class="content">
      <slot name="content"></slot>
    </div>
    <sidebar v-if="currentUser !== null"></sidebar>
  </div>
</template>

<script setup lang="ts">
import { $ } from "vue/macros"

import { useCurrentUser } from "@/store/user"
import Avatar from "@/components/Avatar.vue"
import InstanceInfo from "@/components/InstanceInfo.vue"
import Search from "@/components/Search.vue"
import Sidebar from "@/components/Sidebar.vue"

const { currentUser } = $(useCurrentUser())
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/theme";

header {
  background-color: $background-color;
  box-sizing: border-box;
  height: $header-height;
  margin-bottom: $block-outer-padding;
  padding: $body-padding;
  position: sticky;
  top: 0;
  z-index: 1;
}

#header {
  display: flex;
  flex-direction: row;
  gap: $content-gap;
  height: 100%;
  margin: 0 auto;
  max-width: $content-width + $content-gap + $sidebar-width;
}

#nav {
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: $body-padding;
  min-width: $content-min-width;
  width: $content-width;

  .home-btn {
    align-items: center;
    background-color: $block-background-color;
    border-radius: $btn-border-radius;
    box-shadow: $shadow;
    box-sizing: border-box;
    color: $text-color;
    display: flex;
    flex-direction: row;
    flex-shrink: 0;
    height: 100%;
    padding: 7px $body-padding;

    img {
      filter: $text-colorizer;
      height: 1.2em;
      margin-right: 5px;
    }

    span {
      padding-top: 1px;
    }

    &:hover {
      background-color: $btn-background-color;
      color: $btn-text-color;

      img {
        filter: $btn-text-colorizer;
      }
    }
  }

  .search {
    background-color: $block-background-color;
    box-shadow: $shadow;
    height: 100%;
    margin: 0 0 0 auto;
    width: 250px;
  }
}

#profile {
  flex-shrink: 0;
  width: $sidebar-width;

  .profile-link {
    align-items: center;
    display: flex;
    flex-direction: row;
    height: 100%;
  }

  .profile-name {
    margin-left: 10px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .avatar {
    height: $avatar-size;
    width: $avatar-size;
  }
}

#header-public {
  background-color: $background-color;
  margin: 0 auto;
  position: sticky;
  top: 0;
  width: $wide-content-width;
  z-index: 1;
}

.instance-info {
  max-width: $wide-content-width;
  min-width: $content-min-width;
  width: $wide-content-width;
}

#main {
  align-items: flex-start;
  display: flex;
  flex-direction: row;
  gap: $content-gap;
  margin: 0 auto;
  max-width: $content-width + $content-gap + $sidebar-width;
}

#main:not(.wide) {
  padding: 0 $body-padding;
}

.content {
  box-sizing: border-box;
  max-width: $content-width;
  min-width: $content-min-width;
  width: $content-width;
}

#main.wide {
  /* main element should not have top padding to make scrollTo impl simpler */
  margin-top: 1px;
  max-width: $wide-content-width;
  padding-top: 0;

  .content {
    max-width: $wide-content-width;
    min-width: $content-min-width;
    width: $wide-content-width;
  }
}

@media screen and (max-width: $screen-breakpoint-medium) {
  #header,
  #main {
    /* Equal to header's bottom padding + margin */
    gap: $block-outer-padding + $body-padding;
  }
}

@media screen and (max-width: $screen-breakpoint-small) {
  header {
    margin-bottom: 0;
  }

  #header {
    gap: $body-padding;
  }

  #nav {
    min-width: auto;
    width: 100%;

    .search {
      width: auto;
    }
  }

  #profile {
    width: auto;

    .profile-name {
      display: none;
    }
  }

  #header-public {
    width: auto;
  }

  #main {
    flex-direction: column-reverse;
    gap: 0;
  }

  #main.wide {
    max-width: none;
  }

  #main .content,
  #main.wide .content,
  .instance-info {
    max-width: none;
    min-width: auto;
    width: 100%;
  }
}

@media screen and (max-width: $screen-breakpoint-x-small) {
  #nav .home-btn {
    img {
      margin-right: 0;
    }

    span {
      display: none;
    }
  }
}
</style>
