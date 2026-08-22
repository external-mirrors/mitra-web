<template>
  <sidebar-layout>
    <template #content>
      <div v-if="group" class="group-info">
        <router-link
          :to="getActorLocation('profile', group)"
        >
          {{ group.getDisplayName() }}
        </router-link>
        <router-link
          id="view-members"
          class="icon"
          :to="{ name: 'group-member-list', params: { groupId: group.id } }"
          :title="$t('groups.view_group_members')"
        >
          <icon-users></icon-users>
        </router-link>
        <button
          v-if="canCreatePost()"
          type="button"
          id="create-post"
          class="icon"
          @click="postEditorVisible = !postEditorVisible"
          :title="$t('groups.create_post')"
        >
          <icon-edit></icon-edit>
        </button>
      </div>
      <post-editor
        v-if="group && postEditorVisible"
        :post="null"
        :in-reply-to="null"
        :repost-of="null"
        :group="group"
        @post-saved="insertPost"
      ></post-editor>
      <div
        v-if="!isLoading && posts.length === 0 && !postEditorVisible"
        class="content-message"
      >
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

import { getGroupMembers, getGroupTimeline } from "@/api/groups"
import { addRelationships, Post } from "@/api/posts"
import { getProfile, ProfileWrapper } from "@/api/users"
import IconEdit from "@/assets/feather/edit.svg?component"
import IconUsers from "@/assets/feather/users.svg?component"
import Loader from "@/components/Loader.vue"
import PostEditor from "@/components/PostEditor.vue"
import PostList from "@/components/PostList.vue"
import SidebarLayout from "@/components/SidebarLayout.vue"
import { useActorHandle } from "@/composables/handle"
import { useTitle } from "@/composables/title"
import { useCurrentUser } from "@/composables/user"

const { t } = useI18n({ useScope: "global" })
const route = useRoute()
const { getActorLocation } = useActorHandle()
const { ensureCurrentUser, ensureAuthToken } = useCurrentUser()
const { setPageTitle } = useTitle()

const group = ref<ProfileWrapper | null>(null)
const currentUserAffiliation = ref<"admin" | "member" | "none">("none")
const postEditorVisible = ref(false)
const posts = ref<Post[]>([])
const isLoading = ref(false)

function canCreatePost(): boolean {
  if (group.value === null) {
    return false
  }
  if (group.value.locked) {
    return currentUserAffiliation.value !== "none"
  } else {
    // Public group
    return true
  }
}

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

function insertPost(post: Post) {
  posts.value = [post, ...posts.value]
  postEditorVisible.value = false
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
  const members = await getGroupMembers(authToken, group.value.id)
  const currentUserMembership = members
    .find(member => member.account.id === ensureCurrentUser().id)
  currentUserAffiliation.value = currentUserMembership?.affiliation ?? "none"
  posts.value = await loadTimelinePage(authToken)
  isLoading.value = false
})
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/mixins";
@import "../styles/theme";

.group-info {
  @include block-icon;
  @include content-message;

  align-items: center;
  display: flex;
  gap: $block-inner-padding;
  margin-bottom: $block-outer-padding;

  #view-members {
    margin-left: auto;
  }

  #create-post {
    //margin-left: auto;
  }
}

.post-form {
  margin-bottom: $block-outer-padding * 2;
}

.content-message {
  @include content-message;
}

.loader {
  margin: $block-outer-padding auto;
}
</style>
