<template>
  <sidebar-layout @reload-home="loadTimeline">
    <template #content>
      <post-editor
        v-if="canCreatePost()"
        :in-reply-to="null"
        @post-created="insertPost"
      ></post-editor>
      <loader v-if="isLoading"></loader>
      <post-list :posts="posts" @load-next-page="loadNextPage"></post-list>
    </template>
  </sidebar-layout>
</template>

<script setup lang="ts">
import { onMounted } from "vue"
import { $ref } from "vue/macros"
import { useRouter } from "vue-router"

import { Post, getHomeTimeline } from "@/api/posts"
import { Permissions } from "@/api/users"
import Loader from "@/components/Loader.vue"
import PostEditor from "@/components/PostEditor.vue"
import PostList from "@/components/PostList.vue"
import SidebarLayout from "@/components/SidebarLayout.vue"
import { useCurrentUser } from "@/store/user"

const router = useRouter()
const { ensureAuthToken, ensureCurrentUser } = useCurrentUser()

let posts = $ref<Post[]>([])
let isLoading = $ref(false)

function canCreatePost(): boolean {
  const user = ensureCurrentUser()
  return user.role.permissions.includes(Permissions.CreatePost)
}

function insertPost(post: Post) {
  posts = [post, ...posts]
}

async function loadTimeline() {
  isLoading = true
  const authToken = ensureAuthToken()
  try {
    posts = await getHomeTimeline(authToken)
  } catch (error: any) {
    if (error.message === "access token is invalid") {
      router.push({ name: "landing-page" })
      return
    } else {
      throw error
    }
  }
  isLoading = false
}

async function loadNextPage(maxId: string) {
  const authToken = ensureAuthToken()
  const nextPage = await getHomeTimeline(authToken, maxId)
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
</style>
