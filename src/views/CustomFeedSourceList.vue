<template>
  <sidebar-layout>
    <template #content>
      <div v-if="feed && !isFeedFormVisible" class="feed-name">
        <router-link
          :to="{ name: 'custom-feed-timeline', params: { feedId: feed.id } }"
        >
          {{ feed.title }}
        </router-link>
        <button
          class="icon"
          :title="$t('custom_feeds.rename_feed.rename_feed')"
          @click="onEditFeed()"
        >
          <icon-edit></icon-edit>
        </button>
        <button
          class="icon"
          :title="$t('custom_feeds.delete_feed')"
          @click="onDeleteFeed(feed.id)"
        >
          <icon-delete></icon-delete>
        </button>
      </div>
      <form
        v-if="isFeedFormVisible"
        class="feed-form"
        @submit.prevent="onUpdateFeed()"
      >
        <input
          type="text"
          v-model="feedName"
        >
        <div class="button-row">
          <button
            type="submit"
            class="btn"
            :disabled="isFeedFormLoading"
          >
            {{ $t('custom_feeds.rename_feed.save') }}
          </button>
          <button
            type="button"
            class="btn secondary"
            :disabled="isFeedFormLoading"
            @click="onCancelEdit()"
          >
            {{ $t('custom_feeds.rename_feed.cancel') }}
          </button>
        </div>
      </form>
      <div
        class="source-list"
        :class="{ obscured: isFeedFormVisible }"
      >
        <form
          v-if="feed"
          class="add-source"
          @submit.prevent="onAddSource"
        >
          <div class="input-group search-group">
            <input
              type="text"
              :placeholder="$t('custom_feeds.enter_address')"
              v-model.trim="newSourceAddress"
              @input="newSource = null; newSourceSuggestions = []"
            >
            <div class="suggestions" v-if="newSourceSuggestions.length > 0">
              <button
                type="button"
                class="suggestion"
                v-for="user in newSourceSuggestions"
                :key="user.id"
                @click="pickUser(user)"
              >
                {{ getActorAddress(user) }}
              </button>
            </div>
          </div>
          <div class="submit-row">
            <button
              type="submit"
              class="btn"
              :disabled="newSourceAddress.length === 0 || isNewSourceLoading"
            >
              {{ $t('custom_feeds.add_user') }}
            </button>
            <div
              class="error-message"
              v-if="newSourceError"
            >
              {{ newSourceError }}
            </div>
          </div>
        </form>
        <div v-if="!isLoading" class="content-warning">
          <icon-info></icon-info>
          <span>{{ $t('custom_feeds.posts_will_not_be_displayed') }}</span>
        </div>
        <router-link
          v-for="source in sources"
          :key="source.id"
          :to="getActorLocation('profile', source)"
        >
          <profile-list-item :profile="source">
            <template #profile-actions>
              <button
                class="icon"
                :title="$t('custom_feeds.remove_user_from_feed')"
                @click.prevent="onRemoveSource(source.id)"
              >
                <icon-remove></icon-remove>
              </button>
          </template>
          </profile-list-item>
        </router-link>
        <button
          v-if="canLoadNextPage()"
          class="btn secondary next-btn"
          :disabled="isNextPageLoading"
          @click="loadNextPage()"
        >
            {{ $t('profile_list.show_more_users') }}
        </button>
      </div>
      <loader v-if="isLoading"></loader>
    </template>
  </sidebar-layout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute, useRouter } from "vue-router"

import { PAGE_SIZE } from "@/api/common"
import {
  addCustomFeedSource,
  deleteCustomFeed,
  getCustomFeed,
  getCustomFeedSources,
  removeCustomFeedSource,
  updateCustomFeed,
  CustomFeed,
} from "@/api/custom-feeds"
import { searchProfilesByAcct } from "@/api/search"
import { Profile } from "@/api/users"
import IconDelete from "@/assets/feather/trash.svg?component"
import IconEdit from "@/assets/feather/edit-3.svg?component"
import IconInfo from "@/assets/feather/info.svg?component"
import IconRemove from "@/assets/feather/x.svg?component"
import Loader from "@/components/Loader.vue"
import ProfileListItem from "@/components/ProfileListItem.vue"
import SidebarLayout from "@/components/SidebarLayout.vue"
import { useActorHandle } from "@/composables/handle"
import { useTitle } from "@/composables/title"
import { useCurrentUser } from "@/composables/user"

const route = useRoute()
const router = useRouter()
const { t } = useI18n({ useScope: "global" })
const { getActorAddress, getActorLocation } = useActorHandle()
const { ensureAuthToken } = useCurrentUser()
const { setPageTitle } = useTitle()

const feed = ref<CustomFeed | null>(null)
const feedLoaded = computed(() => {
  if (feed.value === null) {
    throw new Error("feed info is not loaded")
  }
  return feed.value
})

const feedName = ref("")
const isFeedFormVisible = ref(false)
const isFeedFormLoading = ref(false)

function onEditFeed() {
  isFeedFormVisible.value = true
  feedName.value = feedLoaded.value.title
}

function onCancelEdit() {
  isFeedFormVisible.value = false
}

async function onUpdateFeed() {
  isFeedFormLoading.value = true
  feed.value = await updateCustomFeed(
    ensureAuthToken(),
    feedLoaded.value.id,
    feedName.value,
  )
  setPageTitle(feed.value.title)
  isFeedFormLoading.value = false
  isFeedFormVisible.value = false
}

async function onDeleteFeed(feedId: number) {
  if (confirm(t("custom_feeds.confirm_delete_this_feed"))) {
    await deleteCustomFeed(
      ensureAuthToken(),
      feedId,
    )
    router.push({ name: "custom-feed-list" })
  }
}

const newSourceAddress = ref<string>("")
const newSourceSuggestions = ref<Profile[]>([])
const newSource = ref<Profile | null>(null)
const newSourceError = ref<string | null>(null)
const isNewSourceLoading = ref(false)
const sources = ref<Profile[]>([])
const isLoading = ref(false)
const isNextPageLoading = ref(false)

async function findUser(): Promise<Profile | null> {
  let address = newSourceAddress.value
  if (address.charAt(0) === "@") {
    address = address.substring(1)
  }
  let users
  try {
    users = await searchProfilesByAcct(
      ensureAuthToken(),
      address,
      false, // don't resolve
      5,
    )
  } catch (error: any) {
    newSourceError.value = error.message
    return null
  }
  if (users.length === 0) {
    newSourceError.value = t("custom_feeds.user_not_found")
    return null
  } else if (users.length === 1 && getActorAddress(users[0]) === address) {
    return users[0]
  } else {
    newSourceSuggestions.value = users
    return null
  }
}

function pickUser(user: Profile): void {
  newSource.value = user
  newSourceAddress.value = getActorAddress(user)
  newSourceSuggestions.value = []
}

async function onAddSource(): Promise<void> {
  if (feed.value === null) {
    throw new Error("feed info is not present")
  }
  isNewSourceLoading.value = true
  newSourceError.value = null
  if (newSource.value === null) {
    const user = await findUser()
    if (user === null) {
      isNewSourceLoading.value = false
      return
    } else {
      newSource.value = user
    }
  }
  try {
    await addCustomFeedSource(
      ensureAuthToken(),
      feedLoaded.value.id,
      newSource.value.id,
    )
    sources.value = [newSource.value, ...sources.value]
    newSourceAddress.value = ""
    newSourceSuggestions.value = []
    newSource.value = null
    newSourceError.value = null
  } catch (error: any) {
    if (error.message === "user already added") {
      newSourceError.value = t("custom_feeds.user_is_already_in_the_list")
    } else {
      newSourceError.value = error.message
    }
  }
  isNewSourceLoading.value = false
}

async function loadSources(
  authToken: string,
  maxId?: string,
): Promise<Profile[]> {
  if (feed.value === null) {
    throw new Error("feed info is not present")
  }
  const page = await getCustomFeedSources(
    authToken,
    feedLoaded.value.id,
    maxId,
  )
  return [...sources.value, ...page]
}

function canLoadNextPage(): boolean {
  const count = sources.value.length
  return count > 0 && count % PAGE_SIZE === 0
}

async function loadNextPage() {
  isNextPageLoading.value = true
  const authToken = ensureAuthToken()
  const maxId = sources.value[sources.value.length - 1].id
  sources.value = await loadSources(authToken, maxId)
  isNextPageLoading.value = false
}

async function onRemoveSource(sourceId: string) {
  if (confirm(t("custom_feeds.confirm_remove_this_user_from_feed"))) {
    await removeCustomFeedSource(
      ensureAuthToken(),
      feedLoaded.value.id,
      sourceId,
    )
    const sourceIndex = sources.value.findIndex((source) => source.id === sourceId)
    sources.value.splice(sourceIndex, 1)
  }
}

onMounted(async () => {
  setPageTitle(t("custom_feeds.custom_feed"))
  isLoading.value = true
  const authToken = ensureAuthToken()
  feed.value = await getCustomFeed(
    authToken,
    parseInt(route.params.feedId as string),
  )
  setPageTitle(feed.value.title)
  sources.value = await loadSources(authToken)
  isLoading.value = false
})
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/mixins";
@import "../styles/theme";

.feed-name {
  @include block-icon;
  @include content-message;

  align-items: center;
  display: flex;
  flex-direction: row;
  gap: $block-inner-padding;
  margin-bottom: $block-outer-padding;

  a {
    flex-grow: 1;
  }
}

.feed-form {
  @include content-form;

  display: flex;
  gap: $block-outer-padding;
  margin-bottom: $block-outer-padding;

  .button-row {
    display: flex;
    gap: $block-outer-padding;
  }
}

.source-list {
  display: flex;
  flex-direction: column;
  gap: $block-outer-padding;
  margin-bottom: $block-outer-padding;

  &.obscured {
    opacity: 0.5;
  }
}

.source-list {
  display: flex;
  flex-direction: column;
  gap: $block-outer-padding;
  margin-bottom: $block-outer-padding;
}

.add-source {
  @include content-form;
  @include content-form-suggestions;

  .submit-row {
    align-items: center;
    display: flex;
    gap: $block-outer-padding;
  }
}

.content-warning {
  @include content-message;

  align-items: center;
  display: flex;
  flex-direction: row;
  gap: calc($block-inner-padding / 2);

  svg {
    @include standard-icon;
  }
}

.profile {
  @include block-icon;

  .icon > svg {
    vertical-align: middle;
  }
}

.next-btn {
  align-self: flex-start;
}

.loader {
  margin: $block-outer-padding auto;
}
</style>
