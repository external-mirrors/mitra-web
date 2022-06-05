<template>
  <template v-if="post.reblog">
    <div class="action">
      <img :src="require('@/assets/feather/repeat.svg')">
      <router-link :to="{ name: 'profile', params: { profileId: post.account.id }}">
        {{ post.account.display_name || post.account.username }}
      </router-link>
      <span>reposted</span>
    </div>
    <post
      :post="post.reblog"
      @post-deleted="onPostDeleted(post.reblog.id); onPostDeleted(post.id)"
    ></post>
  </template>
  <post v-else :post="post" @post-deleted="onPostDeleted(post.id)"></post>
</template>

<script setup lang="ts">
import type { Post as PostObject } from "@/api/posts"
import Post from "@/components/Post.vue"

/* eslint-disable-next-line no-undef */
defineProps<{
  post: PostObject,
}>()
/* eslint-disable-next-line no-undef */
const emit = defineEmits<{(event: "post-deleted", postId: string): void}>()

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
