<template>
  <sidebar-layout>
    <template #content>
      <div v-if="!isLoading && thread.length === 0" class="not-found">
        {{ $t('post_list.post_not_found') }}
      </div>
      <template
        v-for="(post, index) in thread"
        :key="post.id"
      >
        <div
          v-if="!post.pleroma.parent_visible"
          class="post-hidden"
        >
          {{ $t('post_list.post_is_not_available') }}
        </div>
        <post
          :post="post"
          :highlighted="isHighlighted(post)"
          :in-thread="true"
          @highlight="onPostHighlight($event)"
          @navigate-to="onPostNavigate($event)"
          @comment-created="onCommentCreated(index, $event)"
          @post-deleted="onPostDeleted(index)"
        ></post>
      </template>
      <loader v-if="isLoading"></loader>
    </template>
  </sidebar-layout>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref } from "vue"
import { useRoute } from "vue-router"

import {
  addRelationships,
  getPostThread,
  Post as PostObject,
} from "@/api/posts"
import Loader from "@/components/Loader.vue"
import Post from "@/components/Post.vue"
import SidebarLayout from "@/components/SidebarLayout.vue"
import { useCurrentUser } from "@/composables/user"

const route = useRoute()
const { authToken } = useCurrentUser()

const selectedId = ref(route.params.postId as string)
const highlightedId = ref<string | null>(null)
const thread = ref<PostObject[]>([])
const isLoading = ref(true)

async function loadThread(
  authToken: string | null,
  selectedId: string,
): Promise<PostObject[]> {
  const posts = await getPostThread(authToken, selectedId)
  if (authToken !== null) {
    await addRelationships(authToken, posts)
  }
  return posts
}

onMounted(async () => {
  try {
    thread.value = await loadThread(authToken.value, selectedId.value)
  } catch (error: any) {
    if (error.message === "post not found") {
      // Show "not found" text
      return
    }
    throw error
  } finally {
    isLoading.value = false
  }
  await nextTick()
  // TODO: scrolls to wrong position if posts above it have images
  scrollTo(selectedId.value)
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
  if (selectedId.value === postId) {
    return
  }
  // Update postId in page URL
  window.history.pushState(
    {},
    "",
    window.location.pathname.replace(selectedId.value, postId),
  )
  selectedId.value = postId
}

function isHighlighted(post: PostObject): boolean {
  if (thread.value.length === 1) {
    return false
  }
  return post.id === selectedId.value || post.id === highlightedId.value
}

function onPostHighlight(postId: string | null) {
  highlightedId.value = postId
}

function onPostNavigate(postId: string) {
  scrollTo(postId, { behavior: "smooth" })
}

function onCommentCreated(index: number, post: PostObject) {
  // Insert comment after parent post
  thread.value.splice(index + 1, 0, post)
}

function onPostDeleted(postIndex: number) {
  thread.value.splice(postIndex, 1)
}
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/mixins";

.not-found {
  @include content-message;
}

.post-hidden {
  background-color: var(--block-background-color);
  border-radius: $block-border-radius;
  padding: $block-inner-padding;
  text-align: center;
}

.post,
.post-edit-form,
.post-hidden {
  margin: 0 0 $block-outer-padding;
}

.loader {
  margin: $block-outer-padding auto;
}
</style>
