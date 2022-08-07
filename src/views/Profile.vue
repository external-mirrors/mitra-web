<template>
  <sidebar-layout v-if="profile">
    <template #content>
      <div class="profile-block">
        <div class="profile-header">
          <img v-if="profile.header" :src="profile.header">
        </div>
        <div class="avatar-menu-group">
          <div class="avatar-group">
            <avatar :profile="profile"></avatar>
            <div class="badges">
              <div class="badge" v-if="isFollowedBy()">Follows you</div>
              <div class="badge" v-if="isSubscriptionValid()">Subscription</div>
              <div class="badge" v-if="isSubscriber()">Subscriber</div>
            </div>
          </div>
          <div
            class="dropdown-menu-wrapper"
            v-click-away="hideProfileMenu"
          >
            <button title="More" @click="toggleProfileMenu()">
              <img :src="require('@/assets/feather/more-vertical.svg')">
            </button>
            <menu v-if="profileMenuVisible" class="dropdown-menu">
              <li v-if="!isLocalUser()">
                <a
                  title="Open profile page"
                  :href="profile.url"
                  target="_blank"
                  rel="noreferrer"
                  @click="hideProfileMenu()"
                >
                  Open profile page
                </a>
              </li>
              <li v-if="isLocalUser()">
                <a
                  :href="feedUrl"
                  target="_blank"
                >
                  Atom feed
                </a>
              </li>
              <li v-if="isCurrentUser()">
                <button
                  title="Verify ethereum address"
                  @click="hideProfileMenu(); verifyEthereumAddress()"
                >
                  Verify ethereum address
                </button>
              </li>
              <li v-if="canManageSubscriptions()">
                <router-link
                  title="Manage subscriptions"
                  :to="{ name: 'profile-subscription', params: { profileId: profile.id }}"
                >
                  Manage subscriptions
                </router-link>
              </li>
              <li v-if="canHideReposts()">
                <button @click="onFollow(false, undefined)">Hide reposts</button>
              </li>
              <li v-if="canShowReposts()">
                <button @click="onFollow(true, undefined)">Show reposts</button>
              </li>
              <li v-if="canHideReplies()">
                <button @click="onFollow(undefined, false)">Hide replies</button>
              </li>
              <li v-if="canShowReplies()">
                <button @click="onFollow(undefined, true)">Show replies</button>
              </li>
            </menu>
          </div>
        </div>
        <div class="name-buttons-group">
          <div class="name-group">
            <div class="display-name">{{ profile.display_name || profile.username }}</div>
            <div class="actor-address">@{{ actorAddress }}</div>
          </div>
          <div class="buttons">
            <router-link v-if="isCurrentUser()" class="edit-profile btn" to="/settings">Edit profile</router-link>
            <button v-if="canFollow()" class="follow btn" @click="onFollow()">Follow</button>
            <button v-if="canUnfollow()" class="unfollow btn" @click="onUnfollow()">
              <template v-if="isFollowRequestPending()">Cancel follow request</template>
              <template v-else>Unfollow</template>
            </button>
            <template v-if="canSubscribe()">
              <router-link
                v-if="isLocalUser()"
                class="btn"
                title="Pay for subscription"
                :to="{ name: 'profile-subscription', params: { profileId: profile.id } }"
              >
                Subscribe
              </router-link>
              <a
                v-else-if="profile.subscription_page_url"
                class="btn"
                title="Pay for subscription"
                :href="profile.subscription_page_url"
                target="_blank"
                rel="noreferrer"
              >
                Subscribe
              </a>
            </template>
          </div>
        </div>
        <div class="bio" v-html="profile.note"></div>
        <div class="extra-fields" v-if="fields.length > 0">
          <div
            v-for="field in fields"
            class="field"
            :class="{'verified': field.verified_at}"
            :key="field.name"
          >
            <div class="name">{{ field.name }}</div>
            <div class="value" v-html="field.value"></div>
            <div class="verified-icon" v-if="field.verified_at">
              <img
                :src="require('@/assets/forkawesome/check.svg')"
                title="Verified"
              >
            </div>
          </div>
        </div>
        <div class="stats">
          <component
            class="stats-item"
            :is="isCurrentUser() ? 'router-link' : 'div'"
            :to="{ name: 'profile-tab', params: { profileId: profile.id, tabName: 'posts' }}"
          >
            <span class="value">{{ profile.statuses_count }}</span>
            <span class="label">posts</span>
          </component>
          <component
            class="stats-item"
            :is="isCurrentUser() ? 'router-link' : 'div'"
            :to="{ name: 'profile-tab', params: { profileId: profile.id, tabName: 'followers' }}">
            <span class="value">{{ profile.followers_count }}</span>
            <span class="label">followers</span>
          </component>
          <component
            class="stats-item"
            :is="isCurrentUser() ? 'router-link' : 'div'"
            :to="{ name: 'profile-tab', params: { profileId: profile.id, tabName: 'following' }}"
          >
            <span class="value">{{ profile.following_count }}</span>
            <span class="label">following</span>
          </component>
        </div>
      </div>
      <div class="tab-bar">
        <template v-if="tabName === 'posts' || tabName === 'posts-with-replies'">
          <router-link
            :class="{ active: tabName === 'posts' }"
            :to="{ name: 'profile-tab', params: { profileId: profile.id, tabName: 'posts' }}"
          >
            Posts
          </router-link>
          <router-link
            :class="{ active: tabName === 'posts-with-replies' }"
            :to="{ name: 'profile-tab', params: { profileId: profile.id, tabName: 'posts-with-replies' }}"
          >
            Posts with replies
          </router-link>
        </template>
        <span v-else-if="tabName === 'followers'" class="active">Followers</span>
        <span v-else-if="tabName === 'following'" class="active">Following</span>
      </div>
      <post-list
        v-if="tabName === 'posts' || tabName === 'posts-with-replies'"
        :posts="posts"
        @load-next-page="loadNextPage"
      ></post-list>
      <template v-if="tabName === 'followers' || tabName === 'following'">
        <profile-list-item
          v-for="profile in followList"
          :profile="profile"
          :key="profile.id"
        ></profile-list-item>
        <button
          v-if="followListNextPageUrl"
          class="btn secondary next-btn"
          @click="loadFollowListNextPage()"
        >
          Show more profiles
        </button>
      </template>
    </template>
  </sidebar-layout>
</template>

<script setup lang="ts">
import { onMounted } from "vue"
import { $, $ref, $computed } from "vue/macros"
import { useRoute } from "vue-router"

import { Post, getProfileTimeline } from "@/api/posts"
import {
  follow,
  unfollow,
  Relationship,
  getRelationship,
  getFollowers,
  getFollowing,
} from "@/api/relationships"
import {
  createIdentityProof,
  getIdentityClaim,
  getProfile,
  getVerifiedEthereumAddress,
  Profile,
  ProfileField,
} from "@/api/users"
import Avatar from "@/components/Avatar.vue"
import PostList from "@/components/PostList.vue"
import ProfileListItem from "@/components/ProfileListItem.vue"
import SidebarLayout from "@/components/SidebarLayout.vue"
import { BACKEND_URL } from "@/constants"
import { useInstanceInfo } from "@/store/instance"
import { useCurrentUser } from "@/store/user"
import { getWallet, getWalletSignature } from "@/utils/ethereum"

const route = useRoute()
const {
  authToken,
  currentUser,
  ensureAuthToken,
  setCurrentUser,
} = $(useCurrentUser())
const { instance, getActorAddress } = $(useInstanceInfo())

let profile = $ref<Profile | null>(null)
let relationship = $ref<Relationship | null>(null)

let profileMenuVisible = $ref(false)

let tabName = $ref("posts")
let posts = $ref<Post[]>([])
let followList = $ref<Profile[]>([])
let followListNextPageUrl = $ref<string | null>(null)

onMounted(async () => {
  profile = await getProfile(
    authToken,
    route.params.profileId as string,
  )
  if (currentUser && !isCurrentUser()) {
    relationship = await getRelationship(
      ensureAuthToken(),
      profile.id,
    )
  }
  tabName = route.params.tabName as string || "posts"
  if (tabName === "posts") {
    posts = await getProfileTimeline(
      authToken,
      profile.id,
      true,
    )
  } else if (tabName === "posts-with-replies") {
    posts = await getProfileTimeline(
      authToken,
      profile.id,
      false,
    )
  } else if (tabName === "followers" && isCurrentUser()) {
    const page = await getFollowers(
      ensureAuthToken(),
      profile.id,
    )
    followList = page.profiles
    followListNextPageUrl = page.nextPageUrl
  } else if (tabName === "following" && isCurrentUser()) {
    const page = await getFollowing(
      ensureAuthToken(),
      profile.id,
    )
    followList = page.profiles
    followListNextPageUrl = page.nextPageUrl
  }
})

const actorAddress = $computed<string>(() => {
  if (!profile) {
    return ""
  }
  return getActorAddress(profile)
})

const fields = $computed<ProfileField[]>(() => {
  if (!profile) {
    return []
  }
  return profile.identity_proofs.concat(profile.fields)
})

function isCurrentUser(): boolean {
  if (!currentUser || !profile) {
    return false
  }
  return currentUser.id === profile.id
}

function isFollowedBy(): boolean {
  if (!relationship) {
    return false
  }
  return relationship.followed_by
}

function isSubscriptionValid(): boolean {
  if (!relationship) {
    return false
  }
  return relationship.subscription_to
}

function isSubscriber(): boolean {
  if (!relationship) {
    return false
  }
  return relationship.subscription_from
}

function canFollow(): boolean {
  if (!relationship) {
    return false
  }
  return !relationship.following && !relationship.requested
}

function canUnfollow(): boolean {
  if (!relationship) {
    return false
  }
  return (relationship.following || relationship.requested)
}

function isFollowRequestPending(): boolean {
  if (!relationship) {
    return false
  }
  return relationship.requested
}

function canHideReposts(): boolean {
  if (!relationship) {
    return false
  }
  return (relationship.following || relationship.requested) && relationship.showing_reblogs
}

function canShowReposts(): boolean {
  if (!relationship) {
    return false
  }
  return (relationship.following || relationship.requested) && !relationship.showing_reblogs
}

function canHideReplies(): boolean {
  if (!relationship) {
    return false
  }
  return (relationship.following || relationship.requested) && relationship.showing_replies
}

function canShowReplies(): boolean {
  if (!relationship) {
    return false
  }
  return (relationship.following || relationship.requested) && !relationship.showing_replies
}

async function onFollow(showReposts?: boolean, showReplies?: boolean) {
  if (!currentUser || !profile || !relationship) {
    return
  }
  relationship = await follow(
    ensureAuthToken(),
    profile.id,
    showReposts ?? relationship.showing_reblogs,
    showReplies ?? relationship.showing_replies,
  )
}

async function onUnfollow() {
  if (!currentUser || !profile) {
    return
  }
  relationship = await unfollow(
    ensureAuthToken(),
    profile.id,
  )
}

function toggleProfileMenu() {
  profileMenuVisible = !profileMenuVisible
}

function hideProfileMenu() {
  profileMenuVisible = false
}

function isLocalUser(): boolean {
  if (!profile) {
    return false
  }
  return profile.username === profile.acct
}

const feedUrl = $computed<string>(() => {
  if (!profile || !isLocalUser()) {
    return ""
  }
  return `${BACKEND_URL}/feeds/${profile.username}`
})

async function verifyEthereumAddress(): Promise<void> {
  if (!profile || !isCurrentUser()) {
    return
  }
  if (!confirm("This action will link your wallet address to your profile. Continue?")) {
    return
  }
  const signer = await getWallet()
  if (!signer) {
    return
  }
  const authToken = ensureAuthToken()
  const message = await getIdentityClaim(authToken)
  const signature = await getWalletSignature(signer, message)
  const user = await createIdentityProof(authToken, signature)
  setCurrentUser(user)
  profile.identity_proofs = user.identity_proofs
}

function canManageSubscriptions(): boolean {
  // Only users with verified address can configure subscription
  return (
    Boolean(instance?.blockchain_contract_address) &&
    Boolean(instance?.blockchain_features?.subscription) &&
    Boolean(currentUser?.wallet_address) &&
    isCurrentUser()
  )
}

function canSubscribe(): boolean {
  return (
    Boolean(instance?.blockchain_contract_address) &&
    Boolean(instance?.blockchain_features?.subscription) &&
    profile !== null &&
    getVerifiedEthereumAddress(profile) !== null &&
    profile.subscription_page_url !== null &&
    !isCurrentUser()
  )
}

async function loadNextPage(maxId: string) {
  if (!profile) {
    return
  }
  const nextPage = await getProfileTimeline(
    authToken,
    profile.id,
    tabName !== "posts-with-replies",
    maxId,
  )
  posts.push(...nextPage)
}

async function loadFollowListNextPage() {
  if (!profile || !followListNextPageUrl) {
    return
  }
  let loadFollowList
  if (tabName === "followers") {
    loadFollowList = getFollowers
  } else if (tabName === "following") {
    loadFollowList = getFollowing
  } else {
    throw new Error("wrong tab")
  }
  const page = await loadFollowList(
    ensureAuthToken(),
    profile.id,
    followListNextPageUrl,
  )
  followList.push(...page.profiles)
  followListNextPageUrl = page.nextPageUrl
}
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/mixins";
@import "../styles/theme";

$avatar-size: 170px;

.profile-block {
  @include block-btn;

  background-color: $block-background-color;
  border-radius: $block-border-radius;
  margin-bottom: $block-outer-padding;

  .profile-header {
    background-color: $text-color;
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

.avatar-menu-group {
  display: flex;
  flex-direction: row;
  gap: $block-inner-padding;
  padding: $block-inner-padding;

  .avatar-group {
    align-items: flex-start;
    display: flex;
    flex-direction: row;
    flex-grow: 1;
    flex-wrap: wrap;
    gap: $block-inner-padding / 2 $block-inner-padding;
  }

  .avatar {
    height: $avatar-size;
    margin-right: auto;
    margin-top: -($avatar-size / 2 + $block-inner-padding);
    min-width: $avatar-size;
    padding: 7px;
    width: $avatar-size;
  }

  .badges {
    display: flex;
    flex-wrap: wrap;
    gap: $block-inner-padding / 2 $block-inner-padding;
  }

  .badge {
    border: 1px solid $btn-background-color;
    border-radius: $btn-border-radius;
    font-size: 14px;
    line-height: 30px;
    padding: 0 7px;
    white-space: nowrap;
  }

  .dropdown-menu-wrapper {
    @include block-dropdown-menu;

    /* stylelint-disable-next-line selector-max-compound-selectors */
    button img {
      height: 32px;
      min-width: 20px;
      object-fit: none;
      width: 20px;
    }

    .dropdown-menu {
      right: 0;
    }
  }
}

.name-buttons-group {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: $block-inner-padding;
  padding: 0 $block-inner-padding $block-inner-padding;

  .name-group {
    flex-grow: 1;
    font-size: 16px;
    line-height: 1.3;
    overflow-x: hidden;

    .display-name {
      font-weight: bold;
    }

    .actor-address {
      color: $secondary-text-color;
      overflow-x: hidden;
      text-overflow: ellipsis;
      user-select: all;
    }
  }

  .buttons {
    display: flex;
    gap: $block-inner-padding;
  }
}

.bio {
  padding: 0 $block-inner-padding $block-inner-padding;
  white-space: pre-line;
  word-wrap: break-word;

  :deep(a) {
    @include block-link;
  }
}

.extra-fields {
  border-bottom: 1px solid $separator-color;
  margin-bottom: $block-inner-padding;

  .field {
    border-top: 1px solid $separator-color;
    display: flex;
    gap: $block-inner-padding / 2;
    padding: $block-inner-padding / 2 $block-inner-padding;

    .name {
      font-weight: bold;
      min-width: 120px;
      width: 120px;
    }

    .value {
      flex-grow: 1;
      overflow-x: hidden;
      text-overflow: ellipsis;
    }

    &.verified .value {
      font-weight: bold;
    }

    /* stylelint-disable-next-line selector-max-compound-selectors */
    .verified-icon img {
      filter: $text-colorizer;
      height: 1em;
      min-width: 1em;
      width: 1em;
    }
  }
}

.stats {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  font-weight: bold;
  gap: $block-inner-padding 30px;
  padding: 0 $block-inner-padding $block-inner-padding;
  text-align: center;

  .stats-item {
    display: flex;
    gap: 5px;

    .value {
      font-size: 18px;
    }

    .label {
      align-self: flex-end;
      color: $secondary-text-color;
    }
  }
}

.tab-bar {
  align-items: center;
  display: flex;
  margin-bottom: $block-outer-padding;

  a,
  span {
    border-radius: $block-border-radius;
    padding: $block-inner-padding / 2;
    text-align: center;
    width: 100%;

    &.active {
      background-color: $block-background-color;
      font-weight: bold;
    }
  }
}

/* profile-list-item */
.profile {
  margin-bottom: $block-outer-padding;
}
</style>
