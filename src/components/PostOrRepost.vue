<template>
  <template v-if="post.reblog">
    <div class="action">
      <img src="@/assets/feather/repeat.svg">
      <router-link
        :to="{ name: 'profile-by-acct', params: { acct: post.account.acct }}"
        :title="getActorAddress(post.account)"
        class="display-name-link"
      >
        <profile-display-name :profile="author"></profile-display-name>
      </router-link>
      <span>reposted</span>
    </div>
    <post
      :post="post.reblog"
      :highlighted="false"
      :in-thread="false"
      @post-deleted="onPostDeleted((post.reblog as PostObject).id); onPostDeleted(post.id)"
    ></post>
  </template>
  <post
    v-else
    :post="post"
    :highlighted="false"
    :in-thread="false"
    @post-deleted="onPostDeleted(post.id)"
  ></post>
</template>

<script setup lang="ts">
import { $, $computed } from "vue/macros"

import type { Post as PostObject } from "@/api/posts"
import { ProfileWrapper } from "@/api/users"
import Post from "@/components/Post.vue"
import ProfileDisplayName from "@/components/ProfileDisplayName.vue"
import { useInstanceInfo } from "@/composables/instance"

/* eslint-disable-next-line no-undef */
const props = defineProps<{
  post: PostObject,
}>()
/* eslint-disable-next-line no-undef */
const emit = defineEmits<{(event: "post-deleted", postId: string): void}>()

const { getActorAddress } = $(useInstanceInfo())

const author = $computed(() => new ProfileWrapper(props.post.account))

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

.post,
.post-edit-form {
  margin-bottom: $block-outer-padding;
}
</style>
