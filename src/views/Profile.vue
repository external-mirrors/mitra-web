<template>
  <sidebar-layout>
    <template #content>
      <div class="not-found" v-if="!profile && !isLoading">
        {{ $t('profile.not_found') }}
      </div>
      <div
        class="profile-block"
        v-if="profile"
        :data-profile-id="profile.id"
      >
        <div class="profile-banner">
          <img v-if="profile.header && !isProfileImageEmpty(profile.header)" :src="profile.header">
        </div>
        <div class="profile-info-group">
          <div class="avatar-menu-group">
            <div class="avatar-group">
              <avatar :profile="profile"></avatar>
              <div class="badges">
                <div class="badge" v-if="isAdminProfile()">{{ $t('profile.admin') }}</div>
                <div class="badge" v-if="profile.bot">{{ $t('profile.automated') }}</div>
                <router-link
                  v-if="profile.is_group"
                  class="badge"
                  :to="{ name: 'group-timeline', params: { groupId: profile.id } }"
                >
                  {{ $t('profile.group') }}
                </router-link>
                <div
                  class="badge"
                  v-if="aliases.length > 0"
                  :title="aliases.map(profile => profile.url).join(', ')"
                >
                  Alias
                </div>
                <div class="badge" v-if="isFollowedBy()">{{ $t('profile.follows_you') }}</div>
                <div class="badge" v-if="isSubscriptionValid()">{{ $t('profile.subscription') }}</div>
                <div class="badge" v-if="isSubscriber()">{{ $t('profile.subscriber') }}</div>
                <div class="badge" v-if="isMuted()">{{ $t('profile.muted') }}</div>
              </div>
            </div>
            <div
              class="dropdown-menu-wrapper"
              v-click-away="hideProfileMenu"
            >
              <button @click="toggleProfileMenu()">
                <icon-more :title="$t('profile.more')"></icon-more>
              </button>
              <menu
                v-if="profileMenuVisible"
                class="dropdown-menu right"
              >
                <li v-if="!isLocalUser()">
                  <a
                    :href="profile.url"
                    target="_blank"
                    rel="noreferrer"
                    @click="hideProfileMenu()"
                  >
                    {{ $t('profile.open_profile_page') }}
                  </a>
                </li>
                <li v-if="isLocalUser()">
                  <a
                    :href="feedUrl"
                    target="_blank"
                  >
                    {{ $t('profile.atom_feed') }}
                  </a>
                </li>
                <li v-if="canHideReposts()">
                  <button @click="onFollow(false, undefined)">
                    {{ $t('profile.hide_reposts') }}
                  </button>
                </li>
                <li v-if="canShowReposts()">
                  <button @click="onFollow(true, undefined)">
                    {{ $t('profile.show_reposts') }}
                  </button>
                </li>
                <li v-if="canHideReplies()">
                  <button @click="onFollow(undefined, false)">
                    {{ $t('profile.hide_replies') }}
                  </button>
                </li>
                <li v-if="canShowReplies()">
                  <button @click="onFollow(undefined, true)">
                    {{ $t('profile.show_replies') }}
                  </button>
                </li>
                <li v-if="!isCurrentUser()">
                  <button @click="hideProfileMenu(); customFeedDialogVisible = true">
                    {{ $t('profile.view_custom_feeds') }}
                  </button>
                </li>
                <li v-if="isFollowedBy()">
                  <button @click="onRemoveFollower()">
                    {{ $t('profile.remove_from_followers') }}
                  </button>
                </li>
                <li v-if="isCurrentUser()">
                  <router-link
                    :to="{ name: 'follow-request-list', params: { tabName: 'incoming' } }"
                  >
                    {{ $t('profile.view_follow_requests') }}
                  </router-link>
                </li>
                <li v-if="canMute()">
                  <button @click="onMute()">
                    {{ $t('profile.mute') }}
                  </button>
                </li>
                <li v-if="canUnmute()">
                  <button @click="onUnmute()">
                    {{ $t('profile.unmute') }}
                  </button>
                </li>
                <li v-if="isCurrentUser()">
                  <router-link
                    :to="{ name: 'mute-list' }"
                  >
                    {{ $t('profile.view_muted_users') }}
                  </router-link>
                </li>
                <li v-if="isCurrentUser()">
                  <router-link
                    :to="{ name: 'group-list', params: { tabName: 'following' } }"
                  >
                    {{ $t('profile.view_groups') }}
                  </router-link>
                </li>
                <li v-if="isCurrentUser()">
                  <router-link
                    :to="{ name: 'custom-feed-list' }"
                  >
                    {{ $t('profile.view_custom_feeds') }}
                  </router-link>
                </li>
                <li v-if="canViewSubscriber()">
                  <router-link
                    :to="{ name: 'subscriber', params: { profileId: profile.id } }"
                  >
                    {{ $t('profile.subscriber_details') }}
                  </router-link>
                </li>
                 <li v-if="canVerifyEthereumAddress()">
                  <button
                    @click="hideProfileMenu(); onVerifyEthereumAddress()"
                  >
                    {{ $t('profile.link_ethereum_address') }}
                  </button>
                </li>
                <li v-if="isCurrentUser()">
                  <router-link
                    :to="{ name: 'identity-proof' }"
                  >
                    {{ $t('profile.link_cryptographic_key') }}
                  </router-link>
                </li>
                <li v-if="canLoadRemotePosts()">
                  <button @click="hideProfileMenu(); onLoadRemotePosts('featured')">
                    {{ $t('profile.load_featured_posts') }}
                  </button>
                </li>
                <li v-if="canLoadRemotePosts()">
                  <button @click="hideProfileMenu(); onLoadRemotePosts('outbox')">
                    {{ $t('profile.load_latest_posts') }}
                  </button>
                </li>
                <li v-if="isAdmin()" role="separator"></li>
                <li v-if="isAdmin()">
                  <button @click="hideProfileMenu(); copyProfileId()">
                    {{ $t('profile.copy_profile_id') }}
                  </button>
                </li>
                <li v-if="isAdmin()">
                  <button @click="hideProfileMenu(); copyActorId()">
                    {{ $t('profile.copy_actor_id') }}
                  </button>
                </li>
                <li v-if="canDeleteProfile()">
                  <button @click="hideProfileMenu(); onAdminDeleteProfile()">
                    {{ $t('admin.users.delete_user') }}
                  </button>
                </li>
              </menu>
            </div>
            <modal-dialog
              :open="customFeedDialogVisible"
              @close="customFeedDialogVisible = false"
            >
              <profile-custom-feeds-dialog
                :profile-id="profile.id"
              ></profile-custom-feeds-dialog>
            </modal-dialog>
          </div>
          <div class="name-buttons-group">
            <div class="name-group">
              <profile-display-name :profile="profile">
              </profile-display-name>
              <div
                class="actor-address"
                :title="actorHandle"
              >
                {{ actorHandle }}
              </div>
            </div>
            <div class="buttons">
              <router-link
                v-if="isCurrentUser()"
                class="btn"
                :to="{ name: 'settings-profile' }"
              >
                {{ $t('profile.edit_profile') }}
              </router-link>
              <button v-if="canAcceptFollowRequest()" class="btn" @click="onAcceptFollowRequest()">
                {{ $t('profile.accept_follow_request') }}
              </button>
              <button v-if="canAcceptFollowRequest()" class="btn" @click="onRejectFollowRequest()">
                {{ $t('profile.reject_follow_request') }}
              </button>
              <button
                v-if="canFollow()"
                class="btn btn-with-icon"
                :title="profile.locked ? $t('profile.manually_approves_followers') : undefined"
                :disabled="isProcessingFollow"
                @click="onFollow()"
              >
                <span>{{ $t('profile.follow') }}</span>
                <icon-lock v-if="profile.locked"></icon-lock>
              </button>
              <button
                v-if="canUnfollow()"
                class="btn"
                :disabled="isProcessingUnfollow"
                @click="onUnfollow()"
              >
                <template v-if="isFollowRequestPending()">
                  {{ $t('profile.cancel_follow_request') }}
                </template>
                <template v-else>{{ $t('profile.unfollow') }}</template>
              </button>
              <universal-link
                v-if="subscriptionPageLocation && canSubscribe()"
                :to="subscriptionPageLocation"
                :title="$t('profile.subscribe_long')"
                class="btn btn-with-icon"
              >
                <template #link-content>
                  <span>{{ $t('profile.subscribe') }}</span>
                  <icon-premium></icon-premium>
                </template>
              </universal-link>
            </div>
          </div>
          <div
            ref="profileBioElement"
            class="bio"
            v-html="profile.note || ''"
          ></div>
          <div
            v-if="fields.length > 0"
            ref="profileFieldsElement"
            class="extra-fields"
          >
            <div
              v-for="field, index in fields"
              class="field"
              :class="{
                hidden: index + 1 > FIELDS_DISPLAY_LIMIT && !fieldsDisplayAll,
                verified: field.verified_at,
                legacy: field.is_legacy_proof && isCurrentUser()
              }"
              :key="field.name"
            >
              <div class="name" :title="field.name">{{ field.name }}</div>
              <div
                class="value"
                :class="{ 'value-expanded': expandedFields.includes(index) }"
                v-html="field.value"
                @click="expandedFields.push(index)"
              ></div>
              <template v-if="field.verified_at">
                <a
                  class="verified-icon"
                  v-if="field.is_legacy_proof && isCurrentUser()"
                  :title="$t('profile.renew_verification')"
                  @click="updateIdentityProof(field.name)"
                >
                  <icon-refresh></icon-refresh>
                </a>
                <div
                  class="verified-icon"
                  v-else
                  :title="$t('profile.verified')"
                  @click.ctrl="removeIdentityProof(field)"
                >
                  <icon-check></icon-check>
                </div>
              </template>
            </div>
            <button
              v-if="fields.length > FIELDS_DISPLAY_LIMIT && !fieldsDisplayAll"
              type="button"
              class="extra-fields-more"
              @click="fieldsDisplayAll = true"
            >
              {{ $t('profile.show_more_fields') }}
            </button>
          </div>
          <div v-if="isLocalUser()" class="stats">
            <component
              class="stats-item"
              :is="isCurrentUser() ? 'a' : 'span'"
              @click="isCurrentUser() && switchTab('posts')"
            >
              <span class="value">{{ profile.statuses_count }}</span>
              <span class="label">{{ $t('profile.stats_posts') }}</span>
            </component>
            <component
              class="stats-item"
              :is="isCurrentUser() ? 'a' : 'span'"
              @click="isCurrentUser() && switchTab('followers')"
            >
              <span class="value">{{ profile.followers_count }}</span>
              <span class="label">{{ $t('profile.stats_followers') }}</span>
            </component>
            <component
              class="stats-item"
              :is="isCurrentUser() ? 'a' : 'span'"
              @click="isCurrentUser() && switchTab('following')"
            >
              <span class="value">{{ profile.following_count }}</span>
              <span class="label">{{ $t('profile.stats_following') }}</span>
            </component>
            <component
              class="stats-item"
              v-if="profile.subscribers_count > 0"
              :is="isCurrentUser() ? 'a' : 'span'"
              @click="isCurrentUser() && switchTab('subscribers')"
            >
              <span class="value">{{ profile.subscribers_count }}</span>
              <span class="label">{{ $t('profile.stats_subscribers') }}</span>
            </component>
          </div>
        </div>
      </div>
      <div class="tab-bar" v-if="profile">
        <template v-if="tabName === 'posts' || tabName === 'posts-featured' || tabName === 'reactions'">
          <a
            class="tab"
            :class="{ active: tabName === 'posts' }"
            @click="switchTab('posts')"
          >
            {{ $t('profile.tab_posts') }}
          </a>
          <a
            class="tab"
            :class="{ active: tabName === 'posts-featured' }"
            @click="switchTab('posts-featured')"
          >
            {{ $t('profile.tab_featured') }}
          </a>
          <a
            v-if="isCurrentUser()"
            class="tab"
            :class="{ active: tabName === 'reactions' }"
            @click="switchTab('reactions')"
          >
            {{ $t('profile.tab_reactions') }}
          </a>
          <router-link class="tab" :to="getActorLocation('profile-gallery', profile)">
            {{ $t('profile.tab_gallery') }}
          </router-link>
        </template>
        <span v-else-if="tabName === 'followers'" class="tab active">
          {{ $t('profile.tab_followers') }}
        </span>
        <span v-else-if="tabName === 'following'" class="tab active">
          {{ $t('profile.tab_following') }}
        </span>
        <span v-else-if="tabName === 'subscribers'" class="tab active">
          {{ $t('profile.tab_subscribers') }}
        </span>
      </div>
      <div
        v-if="profile && tabName === 'posts'"
        class="filter-bar"
      >
        <label class="filter-btn">
          <input
            type="checkbox"
            v-model="postListFilters.reposts"
            :disabled="isLoading"
          >
          {{ $t('profile.show_reposts') }}
        </label>
        <label class="filter-btn">
          <input
            type="checkbox"
            v-model="postListFilters.replies"
            :disabled="isLoading"
          >
            {{ $t('profile.show_replies') }}
        </label>
      </div>
      <loader v-if="isLoading"></loader>
      <div
        v-if="profile"
        :style="{ visibility: isLoading ? 'hidden' : 'visible' }"
      >
        <template v-if="tabName === 'posts' || tabName === 'posts-featured' || tabName === 'reactions'">
          <div v-if="posts.length === 0" class="empty-list">
            {{ $t('post_list.no_posts_found') }}
          </div>
          <post-list
            ref="postListElement"
            :posts="posts"
            @load-next-page="loadPostListPage"
          ></post-list>
        </template>
        <template v-else-if="tabName === 'followers' || tabName === 'following'">
          <router-link
            class="profile-list-item"
            v-for="profile in followList"
            :key="profile.id"
            :to="getActorLocation('profile', profile)"
          >
            <profile-list-item :profile="profile"></profile-list-item>
          </router-link>
          <button
            v-if="followListNextPageUrl"
            class="btn secondary next-btn"
            @click="loadFollowListPage()"
          >
            {{ $t('profile_list.show_more_profiles') }}
          </button>
        </template>
        <template v-else-if="tabName === 'subscribers'">
          <router-link
            class="profile-list-item"
            v-for="subscription in subscriptions"
            :key="subscription.id"
            :to="{ name: 'subscriber', params: { profileId: subscription.sender.id } }"
          >
            <profile-list-item :profile="subscription.sender">
              <template #profile-footer>
                <div class="subscription-info">
                  {{ $t('subscriptions.subscription_expires_on', { date: formatDate(subscription.expires_at) }) }}
                </div>
              </template>
            </profile-list-item>
          </router-link>
          <button
            v-if="subscriptionListNextPageUrl"
            class="btn secondary next-btn"
            @click="loadSubscriptionListPage()"
          >
            {{ $t('profile_list.show_more_profiles') }}
          </button>
        </template>
      </div>
    </template>
  </sidebar-layout>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute, useRouter } from "vue-router"

import { adminDeleteProfile } from "@/api/admin"
import { replaceShortcodes } from "@/api/emojis"
import { Post, getProfileTimeline, getReactions } from "@/api/posts"
import {
  acceptFollowRequest,
  rejectFollowRequest,
  follow,
  unfollow,
  mute,
  unmute,
  Relationship,
  getRelationship,
  getFollowers,
  getFollowing,
  removeFollower,
} from "@/api/relationships"
import { getReceivedSubscriptions, Subscription } from "@/api/subscriptions-common"
import {
  deleteIdentityProof,
  getAliases,
  getProfile,
  isProfileImageEmpty,
  isRemoteProfile,
  loadRemotePosts,
  lookupProfile,
  Profile,
  ProfileField,
  ProfileWrapper,
} from "@/api/users"
import IconPremium from "@/assets/extra-icons/spark.svg?component"
import IconMore from "@/assets/feather/more-vertical.svg?component"
import IconCheck from "@/assets/forkawesome/check.svg?component"
import IconLock from "@/assets/forkawesome/lock.svg?component"
import IconRefresh from "@/assets/forkawesome/refresh.svg?component"
import Avatar from "@/components/Avatar.vue"
import Loader from "@/components/Loader.vue"
import ModalDialog from "@/components/ModalDialog.vue"
import ProfileCustomFeedsDialog from "@/components/ProfileCustomFeedsDialog.vue"
import PostList from "@/components/PostList.vue"
import ProfileDisplayName from "@/components/ProfileDisplayName.vue"
import ProfileListItem from "@/components/ProfileListItem.vue"
import SidebarLayout from "@/components/SidebarLayout.vue"
import UniversalLink from "@/components/UniversalLink.vue"
import { useDateTime } from "@/composables/date-time"
import { useEthereumAddressVerification } from "@/composables/ethereum-address-verification"
import { useActorHandle } from "@/composables/handle"
import { useInstanceInfo } from "@/composables/instance"
import { useSubscribe } from "@/composables/subscribe"
import { useTitle } from "@/composables/title"
import { useCurrentUser } from "@/composables/user"
import { BACKEND_URL } from "@/constants"
import { hasEthereumWallet } from "@/utils/ethereum"
import { replaceTextNodes } from "@/utils/html"

const FIELDS_DISPLAY_LIMIT = 10

const route = useRoute()
const router = useRouter()
const { t } = useI18n({ useScope: "global" })
const { formatDate } = useDateTime()
const {
  authToken,
  currentUser,
  ensureAuthToken,
  isAdmin,
} = useCurrentUser()
const { verifyEthereumAddress } = useEthereumAddressVerification()
const { getActorHandle, getActorLocation } = useActorHandle()
const { instance } = useInstanceInfo()
const { getSubscriptionLink } = useSubscribe()
const { setPageTitle } = useTitle()

const profileBioElement = ref<HTMLElement | null>(null)
const profileFieldsElement = ref<HTMLElement | null>(null)
const postListElement = ref<InstanceType<typeof PostList> | null>(null)

const profile = ref<ProfileWrapper | null>(null)
const relationship = ref<Relationship | null>(null)
const aliases = ref<Profile[]>([])
const fieldsDisplayAll = ref(false)
const expandedFields = ref<number[]>([])

const profileMenuVisible = ref(false)
const customFeedDialogVisible = ref(false)
const isProcessingFollow = ref(false)
const isProcessingUnfollow = ref(false)

const tabName = ref("posts")
const isLoading = ref(false)
const posts = ref<Post[]>([])
const postListFilters = ref<{ reposts: boolean, replies: boolean }>({ reposts: true, replies: false })
const followList = ref<Profile[]>([])
const followListNextPageUrl = ref<string | null>(null)
const subscriptions = ref<Subscription[]>([])
const subscriptionListNextPageUrl = ref<string | null>(null)

async function loadProfile(): Promise<ProfileWrapper | null> {
  let _profile
  try {
    if (route.params.acct) {
      _profile = await lookupProfile(
        authToken.value,
        route.params.acct as string,
      )
    } else {
      _profile = await getProfile(
        authToken.value,
        route.params.profileId as string,
      )
    }
  } catch (error: any) {
    if (error.message === "profile not found") {
      // Show "not found" text
      return null
    }
    throw error
  }
  if (isRemoteProfile(_profile) && currentUser.value === null) {
    // Only authenticated users can view remote profiles
    return null
  }
  loadRelationship(_profile)
  loadAliases(_profile)
  return new ProfileWrapper(_profile)
}

function addCustomEmojis() {
  if (profile.value === null) {
    throw new Error("profile doesn't exist")
  }
  const emojis = profile.value.emojis
  if (profileBioElement.value !== null) {
    replaceTextNodes(profileBioElement.value, (text: string) => {
      return replaceShortcodes(text, emojis)
    })
  }
  if (profileFieldsElement.value !== null) {
    const elements = profileFieldsElement.value
      .querySelectorAll(".name, .value")
    for (const element of elements) {
      if (!(element instanceof HTMLElement)) {
        continue
      }
      replaceTextNodes(element, (text: string) => {
        return replaceShortcodes(text, emojis)
      })
    }
  }
}

async function loadRelationship(profile: Profile) {
  if (currentUser.value?.id === profile.id) {
    return
  }
  relationship.value = await getRelationship(
    ensureAuthToken(),
    profile.id,
  )
}

async function loadAliases(profile: Profile) {
  if (profile.identity_proofs.length > 0) {
    const { verified } = await getAliases(profile.id)
    aliases.value = verified
  }
}

function getInitialMaxId(): string | undefined {
  const maxId = route.query.max_id
  if (typeof maxId !== "string" || maxId.length === 0) {
    return
  }
  return maxId
}

async function loadSubscriptionListPage() {
  if (profile.value === null) {
    return
  }
  let maxId
  if (subscriptionListNextPageUrl.value !== null) {
    const url = new URL(subscriptionListNextPageUrl.value)
    maxId = url.searchParams.get("max_id") ?? undefined
  }
  const page = await getReceivedSubscriptions(
    ensureAuthToken(),
    profile.value.id,
    false,
    maxId,
  )
  subscriptions.value.push(...page.subscriptions)
  subscriptionListNextPageUrl.value = page.nextPageUrl
}

async function switchTab(name: string) {
  if (!profile.value) {
    return
  }
  isLoading.value = true
  tabName.value = name
  if (postListElement.value !== null) {
    postListElement.value.resetPagination()
  }
  if (
    tabName.value === "posts" ||
    tabName.value === "posts-featured" ||
    tabName.value === "reactions"
  ) {
    posts.value.length = 0
    await loadPostListPage()
  } else if (
    (tabName.value === "followers" || tabName.value === "following") &&
    isCurrentUser()
  ) {
    followList.value.length = 0
    followListNextPageUrl.value = null
    await loadFollowListPage()
  } else if (tabName.value === "subscribers" && isCurrentUser()) {
    subscriptions.value.length = 0
    subscriptionListNextPageUrl.value = null
    await loadSubscriptionListPage()
  }
  isLoading.value = false
}

const actorHandle = computed<string>(() => {
  if (!profile.value) {
    return ""
  }
  return getActorHandle(profile.value)
})

const fields = computed<ProfileField[]>(() => {
  if (!profile.value || !instance.value) {
    return []
  }
  return profile.value.identity_proofs.concat(profile.value.fields)
})

function isCurrentUser(): boolean {
  if (!currentUser.value || !profile.value) {
    return false
  }
  return currentUser.value.id === profile.value.id
}

function isAdminProfile(): boolean {
  return isCurrentUser() && isAdmin()
}

function isFollowedBy(): boolean {
  if (!relationship.value) {
    return false
  }
  return relationship.value.followed_by
}

function isSubscriptionValid(): boolean {
  if (!relationship.value) {
    return false
  }
  return relationship.value.subscription_to
}

function isSubscriber(): boolean {
  if (!relationship.value) {
    return false
  }
  return relationship.value.subscription_from
}

function isMuted(): boolean {
  if (!relationship.value) {
    return false
  }
  return relationship.value.muting
}

function canAcceptFollowRequest(): boolean {
  if (!relationship.value) {
    return false
  }
  return relationship.value.requested_by
}

async function onAcceptFollowRequest() {
  if (!profile.value) {
    return
  }
  relationship.value = await acceptFollowRequest(
    ensureAuthToken(),
    profile.value.id,
  )
}

async function onRejectFollowRequest() {
  if (!profile.value) {
    return
  }
  relationship.value = await rejectFollowRequest(
    ensureAuthToken(),
    profile.value.id,
  )
}

function canFollow(): boolean {
  if (currentUser.value === null) {
    // Show 'Follow' button to guests
    return true
  }
  if (!relationship.value) {
    return false
  }
  return !relationship.value.following && !relationship.value.requested
}

function canUnfollow(): boolean {
  if (!relationship.value) {
    return false
  }
  return (relationship.value.following || relationship.value.requested)
}

function isFollowRequestPending(): boolean {
  if (!relationship.value) {
    return false
  }
  return relationship.value.requested
}

function canHideReposts(): boolean {
  if (!relationship.value) {
    return false
  }
  return (relationship.value.following || relationship.value.requested) && relationship.value.showing_reblogs
}

function canShowReposts(): boolean {
  if (!relationship.value) {
    return false
  }
  return (relationship.value.following || relationship.value.requested) && !relationship.value.showing_reblogs
}

function canHideReplies(): boolean {
  if (!relationship.value) {
    return false
  }
  return (relationship.value.following || relationship.value.requested) && relationship.value.showing_replies
}

function canShowReplies(): boolean {
  if (!relationship.value) {
    return false
  }
  return (relationship.value.following || relationship.value.requested) && !relationship.value.showing_replies
}

async function onFollow(showReposts?: boolean, showReplies?: boolean) {
  if (!currentUser.value) {
    // Viewing as guest
    alert(t("profile.follow_this_user_from_your_server", { handle: actorHandle.value }))
    return
  }
  if (!profile.value || !relationship.value) {
    return
  }
  isProcessingFollow.value = true
  relationship.value = await follow(
    ensureAuthToken(),
    profile.value.id,
    showReposts ?? relationship.value.showing_reblogs,
    showReplies ?? relationship.value.showing_replies,
  )
  isProcessingFollow.value = false
  if (
    showReposts === undefined &&
    showReplies === undefined &&
    !relationship.value.following
  ) {
    // Update follower status after 5 secs
    let count = 0
    const intervalId = setInterval(async () => {
      if (profile.value && relationship.value && !relationship.value.following && count < 5) {
        relationship.value = await getRelationship(
          ensureAuthToken(),
          profile.value.id,
        )
        count += 1
      } else {
        clearInterval(intervalId)
      }
    }, 5000)
  }
}

async function onUnfollow() {
  if (!currentUser.value || !profile.value) {
    return
  }
  isProcessingUnfollow.value = true
  relationship.value = await unfollow(
    ensureAuthToken(),
    profile.value.id,
  )
  isProcessingUnfollow.value = false
}

async function onRemoveFollower() {
  if (!currentUser.value || !profile.value) {
    return
  }
  if (confirm(t("profile.you_want_to_remove_from_followers", { name: profile.value.getDisplayName() }))) {
    relationship.value = await removeFollower(
      ensureAuthToken(),
      profile.value.id,
    )
  }
}

function canMute(): boolean {
  if (!relationship.value) {
    return false
  }
  return !relationship.value.muting
}

function canUnmute(): boolean {
  if (!relationship.value) {
    return false
  }
  return relationship.value.muting
}

async function onMute() {
  if (!currentUser.value || !profile.value) {
    return
  }
  relationship.value = await mute(
    ensureAuthToken(),
    profile.value.id,
  )
}

async function onUnmute() {
  if (!currentUser.value || !profile.value) {
    return
  }
  relationship.value = await unmute(
    ensureAuthToken(),
    profile.value.id,
  )
}

function toggleProfileMenu() {
  profileMenuVisible.value = !profileMenuVisible.value
}

function hideProfileMenu() {
  profileMenuVisible.value = false
}

function isLocalUser(): boolean {
  if (!profile.value) {
    return false
  }
  return profile.value.username === profile.value.acct
}

const feedUrl = computed<string>(() => {
  if (!profile.value || !isLocalUser()) {
    return ""
  }
  return `${BACKEND_URL}/feeds/users/${profile.value.username}`
})

function canVerifyEthereumAddress(): boolean {
  return isCurrentUser() && hasEthereumWallet()
}

async function onVerifyEthereumAddress() {
  if (!profile.value || !isCurrentUser()) {
    return
  }
  const user = await verifyEthereumAddress()
  if (user) {
    profile.value.identity_proofs = user.identity_proofs
  }
}

const subscriptionPageLocation = computed(() => {
  if (!profile.value) {
    return null
  }
  const link = getSubscriptionLink(profile.value)
  return link?.location || null
})

function canSubscribe(): boolean {
  return (
    subscriptionPageLocation.value !== null &&
    !isCurrentUser()
  )
}

function canViewSubscriber(): boolean {
  return (
    currentUser.value !== null &&
    !isCurrentUser()
  )
}

function copyProfileId(): void {
  if (!profile.value) {
    return
  }
  navigator.clipboard.writeText(profile.value.id)
}

function copyActorId(): void {
  if (!profile.value) {
    return
  }
  navigator.clipboard.writeText(profile.value.actor_id)
}

function canLoadRemotePosts(): boolean {
  return (
    profile.value !== null &&
    currentUser.value !== null &&
    !isLocalUser()
  )
}

async function onLoadRemotePosts(collection: string) {
  if (!profile.value) {
    return
  }
  await loadRemotePosts(
    ensureAuthToken(),
    profile.value.id,
    collection,
  )
  alert(t("misc.reload_page"))
}

function canDeleteProfile(): boolean {
  return (
    profile.value !== null &&
    currentUser.value !== null &&
    !isCurrentUser() &&
    isAdmin()
  )
}

async function onAdminDeleteProfile() {
  if (!profile.value) {
    return
  }
  if (confirm(t("admin.users.confirm_delete_user", { address: profile.value.acct }))) {
    const authToken = ensureAuthToken()
    await adminDeleteProfile(authToken, profile.value.id)
    router.push({ name: "home" })
  }
}

async function updateIdentityProof(fieldName: string) {
  if (fieldName === "$ETH") {
    if (!canVerifyEthereumAddress()) {
      alert("Ethereum wallet is not detected")
      return
    }
    await onVerifyEthereumAddress()
  } else if (fieldName === "Key") {
    router.push({ name: "identity-proof" })
  }
}

async function removeIdentityProof(field: ProfileField) {
  if (!profile.value || !isCurrentUser()) {
    return
  }
  if (confirm(t("profile.do_you_want_to_remove_this_identity_proof"))) {
    const authToken = ensureAuthToken()
    let did
    if (field.name === "$ETH") {
      did = `did:pkh:eip155:1:${field.value}`
    } else {
      did = `did:key:${field.value}`
    }
    const user = await deleteIdentityProof(authToken, did)
    profile.value.identity_proofs = user.identity_proofs
  }
}

async function loadPostListPage(maxId?: string) {
  if (!profile.value) {
    return
  }
  if (!maxId && tabName.value === "posts") {
    maxId = getInitialMaxId()
  }
  if (tabName.value === "reactions") {
    const page = await getReactions(
      ensureAuthToken(),
      true, // show all
      maxId,
    )
    posts.value = [...posts.value, ...page.posts]
    return
  }
  const page = await getProfileTimeline(
    authToken.value,
    profile.value.id,
    tabName.value === "posts" && !postListFilters.value.replies,
    tabName.value === "posts" && !postListFilters.value.reposts,
    tabName.value === "posts-featured",
    false,
    maxId,
  )
  posts.value = [...posts.value, ...page.posts]
}

async function loadFollowListPage() {
  if (!profile.value) {
    return
  }
  let loadFollowList
  if (tabName.value === "followers") {
    loadFollowList = getFollowers
  } else if (tabName.value === "following") {
    loadFollowList = getFollowing
  } else {
    throw new Error("wrong tab")
  }
  const page = await loadFollowList(
    ensureAuthToken(),
    profile.value.id,
    followListNextPageUrl.value ?? undefined,
  )
  followList.value.push(...page.profiles)
  followListNextPageUrl.value = page.nextPageUrl
}

onMounted(async () => {
  setPageTitle(t("profile.profile"))
  isLoading.value = true
  profile.value = await loadProfile()
  if (profile.value === null) {
    // Show "not found" text
    isLoading.value = false
    return
  }
  await nextTick()
  setPageTitle(t("profile.profile_with_handle", { handle: getActorHandle(profile.value) }))
  addCustomEmojis()
  await switchTab("posts")
  isLoading.value = false
})

watch(postListFilters.value, () => switchTab("posts"))
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/mixins";
@import "../styles/theme";

$avatar-size: 170px;

.profile-block {
  @include block-btn;

  background-color: var(--block-background-color);
  border-radius: $block-border-radius;
  margin-bottom: $block-outer-padding;

  .profile-banner {
    background-color: var(--btn-background-color);
    border-radius: $block-border-radius $block-border-radius 0 0;
    height: 200px;

    img {
      border-radius: inherit;
      height: 100%;
      object-fit: cover;
      width: 100%;
    }
  }
}

.profile-info-group {
  display: flex;
  flex-direction: column;
  gap: $block-inner-padding;
  padding: $block-inner-padding;
}

.avatar-menu-group {
  display: flex;
  flex-direction: row;
  gap: $block-inner-padding;

  .avatar-group {
    align-items: flex-start;
    display: flex;
    flex-direction: row;
    flex-grow: 1;
    flex-wrap: wrap;
    gap: calc($block-inner-padding / 2) $block-inner-padding;
  }

  .avatar {
    height: $avatar-size;
    margin-right: auto;
    margin-top: calc(-1 * ($avatar-size / 2 + $block-inner-padding));
    min-width: $avatar-size;
    padding: 7px;
    width: $avatar-size;
  }

  .badges {
    display: flex;
    flex-wrap: wrap;
    gap: calc($block-inner-padding / 2) $block-inner-padding;
  }

  .badge {
    @include badge;
  }

  .dropdown-menu-wrapper {
    @include block-dropdown-menu;

    /* stylelint-disable-next-line selector-max-compound-selectors */
    button svg {
      height: 32px;
      min-width: 20px;
      object-fit: none;
      stroke: var(--link-color);
      width: 20px;

      /* stylelint-disable-next-line selector-max-compound-selectors */
      &:hover {
        stroke: var(--link-hover-color);
      }
    }
  }

  dialog {
    width: 200px;
  }
}

.name-buttons-group {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: $block-inner-padding;

  .name-group {
    flex-grow: 1;
    font-size: 16px;
    line-height: 1.3;
    overflow-x: hidden;

    .display-name {
      font-weight: bold;
    }

    .actor-address {
      color: var(--secondary-text-color);
      overflow-x: hidden;
      text-overflow: ellipsis;
      user-select: all;
    }
  }

  .buttons {
    display: flex;
    flex-wrap: wrap;
    gap: $block-inner-padding;
    max-width: 100%;
  }
}

.btn-with-icon {
  align-items: center;
  display: flex;
  gap: $input-padding;

  svg {
    $icon-size: 1em;

    fill: var(--btn-text-color);
    height: $icon-size;
    min-width: $icon-size;
    width: $icon-size;
  }

  &:hover {
    svg {
      fill: var(--text-color);
    }
  }

  &[disabled] {
    svg {
      fill: var(--btn-disabled-text-color) !important;
    }
  }
}

.bio {
  @include emoji-inline;

  unicode-bidi: plaintext;
  white-space: pre-line;
  word-wrap: break-word;

  :deep(a) {
    @include block-external-link;
  }

  :deep(p) {
    &:not(:last-child) {
      margin-bottom: 1rem;
    }
  }

  :deep(ul),
  :deep(ol) {
    list-style-position: inside;
  }
}

.extra-fields {
  border-bottom: 1px solid var(--separator-color);

  &:last-child {
    border-bottom: none;
  }

  .field {
    border-top: 1px solid var(--separator-color);
    display: flex;
    gap: calc($block-inner-padding / 2);
    padding: calc($block-inner-padding / 2) 0;

    .name {
      @include emoji-inline;

      font-weight: bold;
      min-width: 120px;
      overflow-x: hidden;
      text-overflow: ellipsis;
      width: 120px;
    }

    .value {
      @include emoji-inline;

      flex-grow: 1;
      overflow-x: hidden;
      text-overflow: ellipsis;
    }

    .value-expanded {
      word-wrap: break-word;
    }

    &.hidden {
      display: none;
    }

    &.verified {
      font-weight: bold;
    }

    /* stylelint-disable-next-line selector-max-compound-selectors */
    .verified-icon svg {
      fill: var(--text-color);
      height: 1em;
      min-width: 1em;
      width: 1em;
    }

    &.legacy {
      color: var(--secondary-text-color);

      /* stylelint-disable-next-line selector-max-compound-selectors */
      .verified-icon svg {
        fill: var(--secondary-text-color);
      }
    }
  }
}

.extra-fields-more {
  border-top: 1px solid var(--separator-color);
  padding: calc($block-inner-padding / 2) 0;
  text-align: center;
  width: 100%;
}

.stats {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  font-weight: bold;
  gap: $block-inner-padding 30px;
  text-align: center;

  .stats-item {
    align-items: baseline;
    display: flex;
    gap: 5px;

    .value {
      font-size: 18px;
    }

    .label {
      color: var(--secondary-text-color);
    }
  }
}

.tab-bar {
  @include tab-bar;

  margin-bottom: $block-outer-padding;
}

.filter-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.filter-btn {
  align-items: center;
  background-color: var(--block-background-color);
  border-radius: $block-border-radius;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  padding: calc($block-inner-padding / 4) calc($block-inner-padding / 2);
}

.profile-list-item {
  display: block;
  margin-bottom: $block-outer-padding;
}

.subscription-info {
  margin-top: $block-inner-padding;
}

.loader {
  margin: 0 auto;
}

.not-found {
  @include content-message;
}

.empty-list {
  @include content-message;

  background-color: transparent;
  text-align: center;
}

@media screen and (max-width: $screen-breakpoint-small) {
  .tab {
    flex-basis: 50%;
  }
}
</style>
