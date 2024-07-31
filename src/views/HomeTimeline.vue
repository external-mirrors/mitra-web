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
          <i18n-t keypath="welcome.welcome">
            <router-link :to="{ name: 'about' }">{{ instance.title }}</router-link>
          </i18n-t>
        </h1>
        <span v-if="!canCreatePost()">{{ $t('welcome.read_only_mode') }}</span>
        <router-link class="btn secondary" :to="{ name: 'profile-directory' }">
          {{ $t('welcome.browse_directory') }}
        </router-link>
      </div>
      <post-list
        :posts="posts"
        @load-next-page="loadNextPage"
      ></post-list>
    </template>
  </sidebar-layout>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import { useRouter } from "vue-router"

import { Post, addRelationships, getHomeTimeline } from "@/api/posts"
import { Permissions } from "@/api/users"
import Loader from "@/components/Loader.vue"
import PostEditor from "@/components/PostEditor.vue"
import PostList from "@/components/PostList.vue"
import SidebarLayout from "@/components/SidebarLayout.vue"
import { useInstanceInfo } from "@/composables/instance"
import { useCurrentUser } from "@/composables/user"

const router = useRouter()
const { currentUser, ensureAuthToken, onInvalidAuthToken } = useCurrentUser()
const { instance } = useInstanceInfo()

const posts = ref<Post[]>([])
const isLoading = ref(false)

function canCreatePost(): boolean {
  if (currentUser.value === null) {
    // User has logged out
    return false
  }
  return currentUser.value
    .role.permissions.includes(Permissions.CreatePost)
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
    console.error("timeline loading error:", error.message)
    if (error.message === "access token is invalid") {
      onInvalidAuthToken()
      router.push({ name: "landing-page" })
      return
    } else {
      throw error
    }
  }
  posts.value = page
  isLoading.value = false
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
  }

  span {
    font-size: 1.2rem;
  }
}
</style>
