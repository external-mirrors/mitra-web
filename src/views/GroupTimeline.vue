<template>
  <sidebar-layout>
    <template #content>
      <div v-if="group" class="group-info">
        <router-link
          :to="getActorLocation('profile', group)"
        >
          {{ group.getDisplayName() }}
        </router-link>
      </div>
      <div v-if="!isLoading && posts.length === 0" class="content-message">
        {{ $t('post_list.no_posts_found') }}
      </div>
      <post-list
        :posts="posts"
        @load-next-page="loadNextPage"
      ></post-list>
      <loader v-if="isLoading"></loader>
    </template>
  </sidebar-layout>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute } from "vue-router"

import { getGroupTimeline } from "@/api/groups"
import { addRelationships, Post } from "@/api/posts"
import { getProfile, ProfileWrapper } from "@/api/users"
import Loader from "@/components/Loader.vue"
import PostList from "@/components/PostList.vue"
import SidebarLayout from "@/components/SidebarLayout.vue"
import { useActorHandle } from "@/composables/handle"
import { useTitle } from "@/composables/title"
import { useCurrentUser } from "@/composables/user"

const { t } = useI18n({ useScope: "global" })
const route = useRoute()
const { getActorLocation } = useActorHandle()
const { ensureAuthToken } = useCurrentUser()
const { setPageTitle } = useTitle()

const group = ref<ProfileWrapper | null>(null)
const posts = ref<Post[]>([])
const isLoading = ref(false)

async function loadTimelinePage(
  authToken: string,
  maxId?: string,
): Promise<Post[]> {
  if (group.value === null) {
    throw new Error("group info is not present")
  }
  const page = await getGroupTimeline(
    authToken,
    group.value.id,
    maxId,
  )
  await addRelationships(authToken, page)
  return page
}

async function loadNextPage(maxId: string) {
  const authToken = ensureAuthToken()
  const nextPage = await loadTimelinePage(authToken, maxId)
  posts.value = [...posts.value, ...nextPage]
}

onMounted(async () => {
  setPageTitle(t("groups.group"))
  isLoading.value = true
  const authToken = ensureAuthToken()
  const _group = await getProfile(
    authToken,
    route.params.groupId as string,
  )
  group.value = new ProfileWrapper(_group)
  setPageTitle(group.value.getDisplayName())
  posts.value = await loadTimelinePage(authToken)
  isLoading.value = false
})
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/mixins";
@import "../styles/theme";

.group-info {
  @include content-message;

  margin-bottom: $block-outer-padding;
}

.content-message {
  @include content-message;
}

.loader {
  margin: $block-outer-padding auto;
}
</style>
