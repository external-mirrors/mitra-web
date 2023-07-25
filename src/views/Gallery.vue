<template>
  <div class="page wide" v-if="profile">
    <div class="page-content">
      <router-link
        class="back-btn"
        title="Back"
        :to="{ name: 'profile-by-acct', params: { acct: profile.acct }}"
      >
        <img src="@/assets/feather/arrow-left.svg">
      </router-link>
      <h1><profile-display-name :profile="profile"></profile-display-name> gallery</h1>
      <div class="post-grid">
        <router-link
          v-for="post in posts"
          class="post"
          :key="post.id"
          :to="{ name: 'post', params: { postId: post.id }}"
        >
          <post-attachment
            class="media"
            :attachment="post.media_attachments[0]"
            :is-sensitive="post.sensitive"
          >
          </post-attachment>
        </router-link>
      </div>
      <loader v-if="isLoading"></loader>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import { useRoute } from "vue-router"

import { getProfileTimeline, Post as PostObject } from "@/api/posts"
import { lookupProfile, ProfileWrapper } from "@/api/users"
import Loader from "@/components/Loader.vue"
import PostAttachment from "@/components/PostAttachment.vue"
import ProfileDisplayName from "@/components/ProfileDisplayName.vue"
import { useTheme } from "@/composables/theme"
import { useCurrentUser } from "@/composables/user"

const route = useRoute()
const { authToken } = useCurrentUser()
const { loadTheme } = useTheme()

const profile = ref<ProfileWrapper | null>(null)
const posts = ref<PostObject[]>([])
const isLoading = ref(false)

onMounted(async () => {
  isLoading.value = true
  loadTheme()
  const _profile = await lookupProfile(
    authToken.value,
    route.params.acct as string,
  )
  profile.value = new ProfileWrapper(_profile)
  posts.value = await getProfileTimeline(
    authToken.value,
    profile.value.id,
    false,
    false,
    true,
  )
  isLoading.value = false
})
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/theme";

$page-width: $wide-content-width + $content-gap + $wide-sidebar-width;

.page-content {
  margin: 0 auto;
  max-width: 100%;
  width: $page-width;

  .back-btn {
    display: block;
    position: absolute;
    top: $body-padding;

    img {
      filter: var(--text-colorizer);
      height: 40px;
      width: 40px;
    }
  }

  h1 {
    margin: $block-outer-padding 0;
    text-align: center;
  }
}

.post-grid {
  display: grid;
  gap: $block-outer-padding;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  padding-bottom: 5%;

  .post {
    height: 30vh;
    min-width: 0;

    .media {
      height: 100%;
    }
  }
}

.loader {
  margin: 0 auto;
}

@media screen and (max-width: $screen-breakpoint-x-small) {
  .post-grid {
    grid-template-columns: 1fr;
  }
}
</style>
