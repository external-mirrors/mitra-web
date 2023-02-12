<template>
  <sidebar-layout>
    <template #content>
      <div v-if="!isLoading && thread.length === 0" class="not-found">
        Not found
      </div>
      <post
        v-for="(post, index) in thread"
        :key="post.id"
        :post="post"
        :highlighted="isHighlighted(post)"
        :in-thread="true"
        @highlight="onPostHighlight($event)"
        @navigate-to="onPostNavigate($event)"
        @comment-created="onCommentCreated(index, $event)"
        @post-deleted="onPostDeleted(index)"
      ></post>
      <loader v-if="isLoading"></loader>
    </template>
  </sidebar-layout>
</template>

<script setup lang="ts">
import { nextTick, onMounted } from "vue"
import { $, $ref } from "vue/macros"
import { useRoute } from "vue-router"

import { Post as PostObject, getPostThread } from "@/api/posts"
import Loader from "@/components/Loader.vue"
import Post from "@/components/Post.vue"
import SidebarLayout from "@/components/SidebarLayout.vue"
import { useCurrentUser } from "@/store/user"

const route = useRoute()
const { authToken } = $(useCurrentUser())

let selectedId = $ref(route.params.postId as string)
let highlightedId = $ref<string | null>(null)
let thread = $ref<PostObject[]>([])
let isLoading = $ref(true)
const loaded = $ref(getPostThread(authToken, selectedId))

onMounted(async () => {
  try {
    thread = await loaded
  } catch (error: any) {
    if (error.message === "post not found") {
      // Show "not found" text
      return
    }
    throw error
  } finally {
    isLoading = false
  }
  await nextTick()
  // TODO: scrolls to wrong position if posts above it have images
  scrollTo(selectedId)
})

function scrollTo(postId: string, options: any = {}) {
  const container = document.getElementById("main")
  if (!container) {
    return
  }
  const containerOffset = container.offsetTop // sticky header height or top margin
  const postElem: HTMLElement | null = container.querySelector(`div[data-post-id="${postId}"]`)
  if (postElem === null) {
    return
  }
  window.scroll({
    top: (postElem.offsetTop - containerOffset),
    left: 0,
    ...options,
  })
  if (selectedId === postId) {
    return
  }
  // Update postId in page URL
  window.history.pushState(
    {},
    "",
    window.location.pathname.replace(selectedId, postId),
  )
  selectedId = postId
}

function isHighlighted(post: PostObject): boolean {
  if (thread.length === 1) {
    return false
  }
  return post.id === selectedId || post.id === highlightedId
}

function onPostHighlight(postId: string | null) {
  highlightedId = postId
}

function onPostNavigate(postId: string) {
  scrollTo(postId, { behavior: "smooth" })
}

function onCommentCreated(index: number, post: PostObject) {
  // Insert comment after parent post
  thread.splice(index + 1, 0, post)
}

function onPostDeleted(postIndex: number) {
  thread.splice(postIndex, 1)
}
</script>

<style scoped lang="scss">
@import "../styles/layout";

.not-found {
  font-size: 20px;
  text-align: center;
}

.post {
  margin: 0 0 $block-outer-padding;
}

.loader {
  margin: $block-outer-padding auto;
}
</style>
