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
          Welcome to <router-link :to="{ name: 'about' }">{{ instance.title }}</router-link>!
        </h1>
        <span v-if="!canCreatePost()">Your account is in read-only mode</span>
        <router-link class="btn secondary" :to="{ name: 'profile-directory' }">Browse profile directory</router-link>
      </div>
      <post-list
        :posts="posts"
        @load-next-page="loadNextPage"
      ></post-list>
    </template>
  </sidebar-layout>
</template>

<script setup lang="ts">
import { onMounted } from "vue"
import { $ref } from "vue/macros"
import { useRouter } from "vue-router"

import { Post, getHomeTimeline } from "@/api/posts"
import { getRelationships } from "@/api/relationships"
import { Permissions } from "@/api/users"
import Loader from "@/components/Loader.vue"
import PostEditor from "@/components/PostEditor.vue"
import PostList from "@/components/PostList.vue"
import SidebarLayout from "@/components/SidebarLayout.vue"
import { useInstanceInfo } from "@/composables/instance"
import { useCurrentUser } from "@/composables/user"

const router = useRouter()
const { onInvalidAuthToken, ensureAuthToken, ensureCurrentUser } = useCurrentUser()
const { instance } = useInstanceInfo()

let posts = $ref<Post[]>([])
let isLoading = $ref(false)

function canCreatePost(): boolean {
  const user = ensureCurrentUser()
  return user.role.permissions.includes(Permissions.CreatePost)
}

function insertPost(post: Post) {
  posts = [post, ...posts]
}

async function addRelationships(posts: Post[]): Promise<void> {
  const authors = posts.flatMap((post) => {
    const result = [post.account.id]
    if (post.reblog) {
      result.push(post.reblog.account.id)
    }
    return result
  })
  const authToken = ensureAuthToken()
  const relationships = await getRelationships(authToken, authors)
  for (const relationship of relationships) {
    for (const post of posts) {
      if (post.account.id === relationship.id) {
        post.relationship = relationship
      }
      if (post.reblog && post.reblog.account.id === relationship.id) {
        post.reblog.relationship = relationship
      }
    }
  }
}

async function loadTimelinePage(
  authToken: string,
  maxId?: string,
): Promise<Post[]> {
  const page = await getHomeTimeline(authToken, maxId)
  await addRelationships(page)
  return page
}

async function loadTimeline() {
  isLoading = true
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
  posts = page
  isLoading = false
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
  posts = [...posts, ...nextPage]
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
