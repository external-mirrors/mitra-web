<template>
  <div id="main" v-if="profile">
    <div class="content posts">
      <div class="profile-block">
        <div class="profile-header">
          <img v-if="profile.header" :src="profile.header">
        </div>
        <div class="profile-info">
          <avatar :profile="profile"></avatar>
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
        <div class="extra-fields" v-if="profile.fields.length > 0">
          <dl v-for="field in profile.fields" :key="field.name">
            <dt>{{ field.name }}</dt>
            <dd v-html="field.value"></dd>
          </dl>
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

import { Profile, getProfile } from "@/api/users"
import { Post, getProfileTimeline } from "@/api/posts"
import {
  follow,
  unfollow,
  Relationship,
  getRelationship,
  getFollowers,
  getFollowing,
} from "@/api/relationships"
import Avatar from "@/components/Avatar.vue"
import PostList from "@/components/PostList.vue"
import ProfileListItem from "@/components/ProfileListItem.vue"
import Sidebar from "@/components/Sidebar.vue"
import { useInstanceInfo } from "@/store/instance"
import { useCurrentUser } from "@/store/user"

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
    const { getActorAddress } = useInstanceInfo()
    return { currentUser, authToken, ensureAuthToken, getActorAddress }
  })

  profile: Profile | null = null
  relationship: Relationship | null = null
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

  isCurrentUser(): boolean {
    if (!this.store.currentUser || !this.profile) {
      return false
    }
    return this.store.currentUser.id === this.profile.id
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

  async follow() {
    if (!this.store.currentUser || !this.profile) {
      return
    }
    this.relationship = await follow(
      this.store.ensureAuthToken(),
      this.profile.id,
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

.profile-info {
  @include block-btn;

  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: $block-inner-padding;
  padding: $block-inner-padding;

  .avatar {
    height: $avatar-size;
    margin-top: -($avatar-size / 2 + $block-inner-padding);
    min-width: $avatar-size;
    padding: 7px;
    width: $avatar-size;
  }

  .name-group {
    flex-grow: 1;
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
}

.bio {
  padding: 0 $block-inner-padding $block-inner-padding;
  white-space: pre-line;
}

.extra-fields {
  border-bottom: 1px solid $separator-color;
  margin-bottom: $block-inner-padding;

  dl {
    display: flex;

    dt,
    dd {
      border-top: 1px solid $separator-color;
      padding: $block-inner-padding / 2 $block-inner-padding;
    }

    dt {
      font-weight: bold;
      min-width: 120px;
      width: 120px;
    }

    dd {
      flex-grow: 1;
      overflow-x: hidden;
      text-overflow: ellipsis;
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
