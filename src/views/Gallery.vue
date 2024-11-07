<template>
  <div class="page wide" v-if="profile">
    <div class="page-content">
      <router-link
        class="back-btn"
        :title="$t('gallery.back')"
        :to="getActorLocation('profile', profile)"
      >
        <icon-arrow-left></icon-arrow-left>
      </router-link>
      <h1>
        <i18n-t keypath="gallery.name_gallery" scope="global">
          <template #name>
            <profile-display-name :profile="profile"></profile-display-name>
          </template>
        </i18n-t>
      </h1>
      <div
        v-if="posts.length > 0"
        class="post-grid"
      >
        <div
          v-for="post in posts"
          class="post"
          :key="post.id"
        >
          <post-attachment
            class="media"
            :attachment="post.media_attachments[0]"
            :is-sensitive="post.sensitive"
          >
          </post-attachment>
          <router-link
            class="post-link"
            :title="$t('gallery.view_post')"
            :to="{ name: 'post', params: { postId: post.id }}"
          >
            <icon-comment></icon-comment>
          </router-link>
        </div>
      </div>
      <h2 v-else-if="!isLoading" class="empty">
        {{ $t('gallery.no_media_found') }}
      </h2>
      <loader v-if="isLoading"></loader>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute } from "vue-router"

import { getProfileTimeline, Post as PostObject } from "@/api/posts"
import { getProfile, lookupProfile, ProfileWrapper } from "@/api/users"
import IconArrowLeft from "@/assets/feather/arrow-left.svg?component"
import IconComment from "@/assets/forkawesome/comment-o.svg?component"
import Loader from "@/components/Loader.vue"
import PostAttachment from "@/components/PostAttachment.vue"
import ProfileDisplayName from "@/components/ProfileDisplayName.vue"
import { useActorHandle } from "@/composables/handle"
import { useTheme } from "@/composables/theme"
import { useTitle } from "@/composables/title"
import { useCurrentUser } from "@/composables/user"

const { t } = useI18n({ useScope: "global" })
const route = useRoute()
const { getActorHandle, getActorLocation } = useActorHandle()
const { authToken } = useCurrentUser()
const { loadTheme } = useTheme()
const { setPageTitle } = useTitle()

const profile = ref<ProfileWrapper | null>(null)
const posts = ref<PostObject[]>([])
const isLoading = ref(false)

onMounted(async () => {
  setPageTitle(t("gallery.gallery"))
  isLoading.value = true
  loadTheme()
  let _profile
  if (route.params.acct) {
    _profile = await lookupProfile(
      authToken.value,
      route.params.acct as string,
    )
  } else {
    _profile = await getProfile(
      authToken.value,
      route.params.profileId as string,
    )
  }
  profile.value = new ProfileWrapper(_profile)
  setPageTitle(t("gallery.gallery_with_handle", { handle: getActorHandle(profile.value) }))
  posts.value = await getProfileTimeline(
    authToken.value,
    profile.value.id,
    false,
    false, // with reposts
    false,
    true,
  )
  isLoading.value = false
})
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/mixins";

$page-width: $wide-content-width + $content-gap + $wide-sidebar-width;

.page-content {
  margin: 0 auto;
  max-width: 100%;
  width: $page-width;

  .back-btn {
    display: block;
    position: absolute;
    top: $body-padding;

    svg {
      height: 40px;
      stroke: var(--text-color);
      width: 40px;
    }
  }

  h1 {
    margin-bottom: $block-outer-padding * 2;
    margin-top: $block-outer-padding * 2 - $body-padding;
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
    position: relative;

    .media {
      height: 100%;
    }
  }
}

.post-link {
  @include media-btn;

  /* Same positioning is used PostAttachment.vue */
  bottom: $body-padding;
  position: absolute;
  right: $body-padding;
  /* .show-image z-index + 1 */
  z-index: 2;
}

.empty {
  text-align: center;
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
