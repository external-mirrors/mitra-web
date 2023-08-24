<template>
  <sidebar-layout>
    <template #content>
      <loader v-if="isLoading"></loader>
      <div v-if="!isLoading" class="search-message">
        <template v-if="errorMessage">{{ errorMessage }}</template>
        <template v-else-if="profiles.length > 0">{{ profiles.length }} people</template>
        <template v-else-if="posts.length > 0">{{ posts.length }} posts</template>
        <template v-else-if="tags.length > 0">{{ tags.length }} tags</template>
        <template v-else>No results</template>
      </div>
      <div v-if="!isLoading" class="search-result-list">
        <router-link
          class="search-result"
          v-for="profile in profiles"
          :key="profile.id"
          :to="{ name: 'profile-by-acct', params: { acct: profile.acct } }"
        >
          <profile-list-item :profile="profile"></profile-list-item>
        </router-link>
        <post
          v-for="post in posts"
          :post="post"
          :highlighted="false"
          :in-thread="false"
          :key="post.id"
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
import { onMounted } from "vue"
import { $ref } from "vue/macros"
import { useRoute } from "vue-router"

import { Post as PostObject, Tag } from "@/api/posts"
import { getSearchResults } from "@/api/search"
import { Profile } from "@/api/users"
import Loader from "@/components/Loader.vue"
import Post from "@/components/Post.vue"
import ProfileListItem from "@/components/ProfileListItem.vue"
import SidebarLayout from "@/components/SidebarLayout.vue"
import { useCurrentUser } from "@/composables/user"

const route = useRoute()
const { ensureAuthToken } = useCurrentUser()

let searchQuery = $ref<string | null>(null)
let isLoading = $ref(false)
let errorMessage = $ref("")

let profiles = $ref<Profile[]>([])
let posts = $ref<PostObject[]>([])
let tags = $ref<Tag[]>([])

onMounted(async () => {
  const q = route.query?.q
  if (typeof q === "string") {
    isLoading = true
    searchQuery = q
    try {
      const results = await getSearchResults(
        ensureAuthToken(),
        searchQuery,
      )
      profiles = results.accounts
      posts = results.statuses
      tags = results.hashtags
    } catch (error: any) {
      errorMessage = error.message
    }
    isLoading = false
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
  background-color: var(--block-background-color);
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
  border-bottom: 1px solid var(--separator-color);
  display: block;

  &:last-child {
    border-bottom: none;
  }
}

.tag {
  padding: $block-inner-padding;
}
</style>
