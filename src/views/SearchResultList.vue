<template>
  <sidebar-layout>
    <template #content>
      <loader v-if="isLoading"></loader>
      <div v-if="!isLoading" class="search-message">
        <template v-if="errorMessage">{{ errorMessage }}</template>
        <template v-else-if="profiles.length > 0">
          {{ $t('search_results.people', { n: profiles.length }) }}
        </template>
        <template v-else-if="posts.length > 0">
          {{ $t('search_results.posts', { n: posts.length }) }}
        </template>
        <template v-else-if="tags.length > 0">
          {{ $t('search_results.tags', { n: tags.length }) }}
        </template>
        <template v-else>
          {{ $t('search_results.no_results') }}
        </template>
      </div>
      <div v-if="!isLoading" class="search-result-list">
        <router-link
          class="search-result"
          v-for="profile in profiles"
          :key="profile.id"
          :to="getActorLocation('profile', profile)"
        >
          <profile-list-item :profile="profile"></profile-list-item>
        </router-link>
        <post
          v-for="post in posts"
          :post="post"
          :highlighted="false"
          :in-thread="false"
          :key="post.id"
          @post-deleted="onPostDeleted(post.id)"
        ></post>
        <router-link
          class="search-result tag"
          v-for="tag in tags"
          :key="tag.name"
          :to="{ name: 'tag', params: { tagName: tag.name } }"
        >
          #{{ tag.name }}
        </router-link>
      </div>
    </template>
  </sidebar-layout>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import { useRoute } from "vue-router"

import { Post as PostObject, Tag } from "@/api/posts"
import { getSearchResults } from "@/api/search"
import { Profile } from "@/api/users"
import Loader from "@/components/Loader.vue"
import Post from "@/components/Post.vue"
import ProfileListItem from "@/components/ProfileListItem.vue"
import SidebarLayout from "@/components/SidebarLayout.vue"
import { useActorHandle } from "@/composables/handle"
import { useCurrentUser } from "@/composables/user"

const route = useRoute()
const { getActorLocation } = useActorHandle()
const { ensureAuthToken } = useCurrentUser()

const searchQuery = ref<string | null>(null)
const isLoading = ref(false)
const errorMessage = ref("")

const profiles = ref<Profile[]>([])
const posts = ref<PostObject[]>([])
const tags = ref<Tag[]>([])

function onPostDeleted(postId: string) {
  const postIndex = posts.value.findIndex((post) => post.id === postId)
  posts.value.splice(postIndex, 1)
}

onMounted(async () => {
  const q = route.query?.q
  if (typeof q === "string") {
    isLoading.value = true
    searchQuery.value = q
    try {
      const results = await getSearchResults(
        ensureAuthToken(),
        searchQuery.value,
      )
      profiles.value = results.accounts
      posts.value = results.statuses
      tags.value = results.hashtags
    } catch (error: any) {
      errorMessage.value = error.message
    }
    isLoading.value = false
  }
})
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/mixins";

.search-message {
  @include content-message;
}

.search-result-list {
  border-radius: $block-border-radius;
  box-sizing: border-box;
}

.loader {
  margin: $block-outer-padding auto;
}

.search-result-list {
  margin-top: $block-outer-padding;
}

.search-result {
  background-color: var(--block-background-color);
  border-bottom: 1px solid var(--separator-color);
  display: block;

  &:first-child {
    border-top-left-radius: inherit;
    border-top-right-radius: inherit;
  }

  &:last-child {
    border-bottom: none;
    border-bottom-left-radius: inherit;
    border-bottom-right-radius: inherit;
  }
}

.post {
  margin-bottom: $block-outer-padding;
}

.tag {
  padding: $block-inner-padding;
}
</style>
