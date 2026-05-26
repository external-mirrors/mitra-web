<template>
  <sidebar-layout @reload-home="loadTimeline">
    <template #content>
      <post-editor
        v-if="canCreatePost()"
        :post="null"
        :in-reply-to="null"
        :repost-of="null"
        @post-saved="insertPost"
      ></post-editor>
      <loader v-if="isLoading"></loader>
      <div
        v-if="posts.length === 0 && !isLoading"
        class="timeline-empty"
      >
        <h1 v-if="instance">
          <i18n-t keypath="welcome.welcome" scope="global">
            <template #server>
              <router-link :to="{ name: 'about' }">{{ instance.title }}</router-link>
            </template>
          </i18n-t>
        </h1>
        <span v-if="!canCreatePost()">{{ $t('welcome.read_only_mode') }}</span>
        <router-link class="btn secondary" :to="{ name: 'profile-directory' }">
          {{ $t('welcome.browse_directory') }}
        </router-link>
      </div>
      <post-list
        :posts="posts"
        :marker="visibleMarker"
        @load-next-page="loadNextPage"
      ></post-list>
    </template>
  </sidebar-layout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { useI18n } from "vue-i18n"
import { useRouter } from "vue-router"

import { getHomeMarker, updateHomeMarker } from "@/api/markers"
import { Post, addRelationships, getHomeTimeline } from "@/api/posts"
import { Permissions } from "@/api/users"
import Loader from "@/components/Loader.vue"
import PostEditor from "@/components/PostEditor.vue"
import PostList from "@/components/PostList.vue"
import SidebarLayout from "@/components/SidebarLayout.vue"
import { useInstanceInfo } from "@/composables/instance"
import { useTitle } from "@/composables/title"
import { useCurrentUser } from "@/composables/user"

const { t } = useI18n({ useScope: "global" })
const router = useRouter()
const {
  currentUser,
  ensureAuthToken,
  isTokenValidationError,
  onInvalidAuthToken,
} = useCurrentUser()
const { instance } = useInstanceInfo()
const { setPageTitle } = useTitle()

const posts = ref<Post[]>([])
const marker = ref<string | null>(null)
const isLoading = ref(false)

const visibleMarker = computed(() => {
  const firstPostFromOther = posts.value
    .find(post => post.account.id !== currentUser.value?.id)
  if (marker.value && marker.value === firstPostFromOther?.id) {
    // Move marker if posts above it are user's own posts
    return posts.value[0].id
  } else {
    return marker.value
  }
})

async function updateMarker() {
  if (posts.value.length === 0) {
    // Empty list
    return
  }
  if (posts.value[0].id === marker.value) {
    // Marker is already up to date
    return
  }
  const authToken = ensureAuthToken()
  await updateHomeMarker(authToken, posts.value[0].id)
}

function canCreatePost(): boolean {
  if (currentUser.value === null) {
    // User has logged out
    return false
  }
  return currentUser.value
    .role.permissions_names.includes(Permissions.CreatePost)
}

function insertPost(post: Post) {
  posts.value = [post, ...posts.value]
}

async function loadTimelinePage(
  authToken: string,
  maxId?: string,
): Promise<Post[]> {
  const page = await getHomeTimeline(authToken, maxId)
  await addRelationships(authToken, page)
  return page
}

async function loadTimeline() {
  isLoading.value = true
  const authToken = ensureAuthToken()
  window.scrollTo({ top: 0, behavior: "smooth" })
  let page
  try {
    page = await loadTimelinePage(authToken)
  } catch (error: any) {
    if (isTokenValidationError(error)) {
      onInvalidAuthToken()
      router.push({ name: "landing-page" })
      return
    } else {
      throw error
    }
  }
  posts.value = page
  isLoading.value = false
  // Load marker position after showing posts
  const homeMarker = await getHomeMarker(authToken)
  if (homeMarker !== null) {
    marker.value = homeMarker.last_read_id
  }
  updateMarker()
}

async function loadNextPage(maxId: string) {
  const authToken = ensureAuthToken()
  let nextPage: Post[] = []
  try {
    nextPage = await loadTimelinePage(authToken, maxId)
  } catch (error: any) {
    console.error("timeline loading error:", error.message)
  }
  // Always update array to remove "loading" status
  posts.value = [...posts.value, ...nextPage]
}

onMounted(async () => {
  setPageTitle(t("navigation.home"))
  await loadTimeline()
})
</script>

<style scoped lang="scss">
@import "../styles/layout";

.post-form {
  margin-bottom: $block-outer-padding * 2;
}

.loader {
  margin: $block-outer-padding auto;
}

.timeline-empty {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: $block-outer-padding;

  h1 {
    font-size: 1.4rem;
    margin: 0;

    a {
      text-decoration: underline;
    }
  }

  span {
    font-size: 1.2rem;
  }
}
</style>
