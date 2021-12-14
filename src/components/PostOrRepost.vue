<template>
  <template v-if="post.reblog">
    <div class="action">
      <img :src="require('@/assets/feather/repeat.svg')">
      <span>{{ post.account.display_name || post.account.username }} reposted</span>
    </div>
    <post
      :post="post.reblog"
      @post-deleted="onPostDeleted(post.reblog.id); onPostDeleted(post.id)"
    ></post>
  </template>
  <post v-else :post="post" @post-deleted="onPostDeleted(post.id)"></post>
</template>

<script setup lang="ts">
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Post as PostObject } from "@/api/posts"
import Post from "@/components/Post.vue"

const props = defineProps<{
  post: PostObject,
}>()

const emit = defineEmits<{(event: "post-deleted"): void}>()

function onPostDeleted(postId: string) {
  emit("post-deleted", postId)
}
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/mixins";
@import "../styles/theme";

.action {
  @include post-action;
}

.post {
  margin-bottom: $block-outer-padding;
}
</style>
