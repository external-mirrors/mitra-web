<template>
  <div id="main" v-if="profile">
    <div class="content posts">
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
              <li v-if="canConfigureSubscription()">
                <router-link
                  title="Set up subscription"
                  :to="{ name: 'profile-subscription', params: { profileId: profile.id }}"
                >
                  Set up subscription
                </router-link>
              </li>
              <li v-if="canSubscribe()">
                <router-link
                  title="Pay for subscription"
                  :to="{ name: 'profile-subscription', params: { profileId: profile.id }}"
                >
                  Pay for subscription
                </router-link>
              </li>
              <li v-if="canHideReposts()">
                <button @click="follow(false, undefined)">Hide reposts</button>
              </li>
              <li v-if="canShowReposts()">
                <button @click="follow(true, undefined)">Show reposts</button>
              </li>
              <li v-if="canHideReplies()">
                <button @click="follow(undefined, false)">Hide replies</button>
              </li>
              <li v-if="canShowReplies()">
                <button @click="follow(undefined, true)">Show replies</button>
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
            <button v-if="canFollow()" class="follow btn" @click="follow()">Follow</button>
            <button v-if="canUnfollow()" class="unfollow btn" @click="unfollow()">
              <template v-if="isFollowRequestPending()">Cancel follow request</template>
              <template v-else>Unfollow</template>
            </button>
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
      <post-list
        v-if="tabName === 'posts'"
        :posts="posts"
        @load-next-page="loadNextPage"
      ></post-list>
      <template v-if="tabName === 'followers' || tabName === 'following'">
        <profile-list-item
          v-for="profile in followList"
          :profile="profile"
          :key="profile.id"
        ></profile-list-item>
      </template>
    </div>
    <sidebar></sidebar>
  </div>
</template>

<script lang="ts">
import { Options, Vue, setup } from "vue-class-component"

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
import Sidebar from "@/components/Sidebar.vue"
import { BACKEND_URL } from "@/constants"
import { useInstanceInfo } from "@/store/instance"
import { useCurrentUser } from "@/store/user"
import { getWallet, getWalletSignature } from "@/utils/ethereum"

@Options({
  components: {
    Avatar,
    PostList,
    ProfileListItem,
    Sidebar,
  },
})
export default class ProfileView extends Vue {

  private store = setup(() => {
    const { currentUser, authToken, ensureAuthToken } = useCurrentUser()
    const { instance, getActorAddress } = useInstanceInfo()
    return { currentUser, authToken, ensureAuthToken, instance, getActorAddress }
  })

  profile: Profile | null = null
  relationship: Relationship | null = null

  walletConnected = false
  subscriptionConfigured: boolean | null = null

  profileMenuVisible = false

  tabName = "posts"
  posts: Post[] = []
  followList: Profile[] = []

  async created() {
    this.profile = await getProfile(
      this.store.authToken,
      this.$route.params.profileId as string,
    )
    if (this.store.currentUser && !this.isCurrentUser()) {
      this.relationship = await getRelationship(
        this.store.ensureAuthToken(),
        this.profile.id,
      )
    }
    this.tabName = this.$route.params.tabName as string || "posts"
    if (this.tabName === "posts") {
      this.posts = await getProfileTimeline(
        this.store.authToken,
        this.profile.id,
      )
    } else if (this.tabName === "followers" && this.isCurrentUser()) {
      this.followList = await getFollowers(
        this.store.ensureAuthToken(),
        this.profile.id,
      )
    } else if (this.tabName === "following" && this.isCurrentUser()) {
      this.followList = await getFollowing(
        this.store.ensureAuthToken(),
        this.profile.id,
      )
    }
  }

  get actorAddress(): string {
    if (!this.profile) {
      return ""
    }
    return this.store.getActorAddress(this.profile)
  }

  get fields(): ProfileField[] {
    if (!this.profile) {
      return []
    }
    return this.profile.identity_proofs.concat(this.profile.fields)
  }

  isCurrentUser(): boolean {
    if (!this.store.currentUser || !this.profile) {
      return false
    }
    return this.store.currentUser.id === this.profile.id
  }

  isFollowedBy(): boolean {
    if (!this.relationship) {
      return false
    }
    return this.relationship.followed_by
  }

  isSubscriptionValid(): boolean {
    if (!this.relationship) {
      return false
    }
    return this.relationship.subscription_to
  }

  isSubscriber(): boolean {
    if (!this.relationship) {
      return false
    }
    return this.relationship.subscription_from
  }

  canFollow(): boolean {
    if (!this.relationship) {
      return false
    }
    return !this.relationship.following && !this.relationship.requested
  }

  canUnfollow(): boolean {
    if (!this.relationship) {
      return false
    }
    return (this.relationship.following || this.relationship.requested)
  }

  isFollowRequestPending(): boolean {
    if (!this.relationship) {
      return false
    }
    return this.relationship.requested
  }

  canHideReposts(): boolean {
    if (!this.relationship) {
      return false
    }
    return (this.relationship.following || this.relationship.requested) && this.relationship.showing_reblogs
  }

  canShowReposts(): boolean {
    if (!this.relationship) {
      return false
    }
    return (this.relationship.following || this.relationship.requested) && !this.relationship.showing_reblogs
  }

  canHideReplies(): boolean {
    if (!this.relationship) {
      return false
    }
    return (this.relationship.following || this.relationship.requested) && this.relationship.showing_replies
  }

  canShowReplies(): boolean {
    if (!this.relationship) {
      return false
    }
    return (this.relationship.following || this.relationship.requested) && !this.relationship.showing_replies
  }

  async follow(showReposts?: boolean, showReplies?: boolean) {
    if (!this.store.currentUser || !this.profile || !this.relationship) {
      return
    }
    this.relationship = await follow(
      this.store.ensureAuthToken(),
      this.profile.id,
      showReposts ?? this.relationship.showing_reblogs,
      showReplies ?? this.relationship.showing_replies,
    )
  }

  async unfollow() {
    if (!this.store.currentUser || !this.profile) {
      return
    }
    this.relationship = await unfollow(
      this.store.ensureAuthToken(),
      this.profile.id,
    )
  }

  toggleProfileMenu() {
    this.profileMenuVisible = !this.profileMenuVisible
  }

  hideProfileMenu() {
    this.profileMenuVisible = false
  }

  isLocalUser(): boolean {
    if (!this.profile) {
      return false
    }
    return this.profile.username === this.profile.acct
  }

  get feedUrl(): string {
    if (!this.profile || !this.isLocalUser()) {
      return ""
    }
    return `${BACKEND_URL}/feeds/${this.profile.username}`
  }

  async verifyEthereumAddress(): Promise<void> {
    if (!this.profile || !this.isCurrentUser()) {
      return
    }
    const signer = await getWallet()
    if (!signer) {
      return
    }
    const authToken = this.store.ensureAuthToken()
    const message = await getIdentityClaim(authToken)
    const signature = await getWalletSignature(signer, message)
    const profile = await createIdentityProof(authToken, signature)
    this.profile.identity_proofs = profile.identity_proofs
  }

  canConfigureSubscription(): boolean {
    // Only users with verified address can configure subscription
    return (
      Boolean(this.store.instance?.blockchain_contract_address) &&
      Boolean(this.store.currentUser?.wallet_address) &&
      this.isCurrentUser()
    )
  }

  canSubscribe(): boolean {
    return (
      Boolean(this.store.instance?.blockchain_contract_address) &&
      this.profile !== null &&
      getVerifiedEthereumAddress(this.profile) !== null &&
      !this.isCurrentUser()
    )
  }

  async loadNextPage(maxId: string) {
    if (!this.profile) {
      return
    }
    const posts = await getProfileTimeline(this.store.authToken, this.profile.id, maxId)
    this.posts.push(...posts)
  }

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

.profile {
  margin-bottom: $block-outer-padding;
}
</style>
