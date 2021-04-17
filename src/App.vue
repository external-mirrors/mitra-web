<template>
  <header v-if="!isPublicPage">
    <div id="header">
      <div id="nav">
        <router-link to="/" class="home-btn">
          <img :src="require('@/assets/feather/home.svg')">
          <span>Home</span>
        </router-link>
        <search  />
      </div>
      <div id="profile">
        <router-link v-if="profile" class="profile-link" :to="{ name: 'profile', params: { profileId: profile.id }}">
          <avatar :profile="profile"></avatar>
          <div class="profile-name">@{{ profile.username }}</div>
        </router-link>
      </div>
    </div>
  </header>
  <router-view :key="$route.fullPath" :class="{'wide': isPublicPage}" />
</template>

<script lang="ts">
import { Options, Vue, setup } from "vue-class-component"

import { User } from "@/api/users"
import { useCurrentUser } from "@/store/user"
import { useInstanceInfo } from "@/store/instance"
import Avatar from "@/components/Avatar.vue"
import Search from "@/components/Search.vue"

@Options({
  components: {
    Avatar,
    Search,
  },
})
export default class App extends Vue {

  private store = setup(() => {
    const { currentUser } = useCurrentUser()
    const { loadInstanceInfo } = useInstanceInfo()
    return { currentUser, loadInstanceInfo }
  })

  created() {
    this.store.loadInstanceInfo()
  }

  get isPublicPage(): boolean {
    return (
      this.store.currentUser === null ||
      this.$route.name === "post-overlay"
    )
  }

  get profile(): User | null {
    return this.store.currentUser
  }

}
</script>

<style lang="scss">
@import "styles/reset";
@import "styles/layout";
@import "styles/theme";

html {
  min-height: 100%;
}

body {
  background: $background-color;
  color: $text-color;
  font-family: Arial, sans-serif;
  font-size: $text-font-size;
}

a {
  color: $link-color;
  cursor: pointer;
  text-decoration: none;

  &:hover {
    color: $link-hover-color;
  }
}

.static-text p {
  a {
    text-decoration: underline;
    text-decoration-skip-ink: none;

    &:hover {
      text-decoration: none;
    }
  }
}

input,
textarea {
  background-color: $block-background-color;
  border: 1px solid $block-background-color;
  box-shadow: none;
  box-sizing: border-box;
  color: $text-color;
  font-family: Arial, sans-serif;
  font-size: $text-font-size;
  margin: 0;
  padding: 10px;
  width: 100%;

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: $secondary-text-color;
    opacity: 1;
  }
}

input[type="file"] {
  background-color: transparent;
  border: none;
  padding: 2px 1px;
}

textarea {
  resize: vertical;
}

.btn {
  background-color: $btn-background-color;
  border: none;
  border-radius: $btn-border-radius;
  color: $btn-text-color;
  cursor: pointer;
  display: inline-block;
  font-size: $text-font-size;
  font-weight: bold;
  padding: 10px 30px;
  white-space: nowrap;

  &:hover {
    background-color: $btn-background-hover-color;
    color: $btn-text-hover-color;
  }
}

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
    color: $btn-text-color;
    display: flex;
    flex-direction: row;
    flex-shrink: 0;
    height: 100%;
    padding: 7px $body-padding;

    img {
      filter: $btn-text-colorizer;
      height: 1.2em;
      margin-right: 5px;
    }

    span {
      padding-top: 1px;
    }

    &:hover {
      background-color: $btn-text-color;
      color: $btn-text-hover-color;

      img {
        filter: $btn-text-hover-colorizer;
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
  max-width: $content-width;
  min-width: $content-min-width;
  width: $content-width;

  h1 {
    font-size: 32px;
    font-weight: bold;
    margin: 0 0 $block-outer-padding * 1.5;
  }
}

.wide {
  /* Reserve space for floating avatar */
  padding: 0 $content-gap * 1.5;
}

#main.wide {
  /* main element should not have top padding to make scrollTo impl simpler */
  margin-top: $content-gap;
  max-width: $wide-content-width + $content-gap + $wide-sidebar-width;

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

  .wide {
    padding: $body-padding;
  }

  #main.wide {
    margin-top: 0;
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

  #main {
    flex-direction: column-reverse;
    gap: 0;
  }

  #main .content,
  #main.wide .content {
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
