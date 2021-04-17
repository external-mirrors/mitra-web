<template>
  <div id="main" v-if="profile">
    <div class="content posts">
      <div class="profile">
        <div class="profile-header">
          <img v-if="profile.header" :src="profile.header">
        </div>
        <div class="profile-info">
          <avatar :profile="profile"></avatar>
          <div class="name-group">
            <div class="display-name">{{ profile.display_name || profile.username }}</div>
            <div class="account-uri">@{{ profile.acct }}</div>
          </div>
          <div class="buttons">
            <router-link v-if="isCurrentUser()" class="edit-profile btn" to="/settings">Edit profile</router-link>
            <a v-if="canFollow()" class="follow btn" @click="follow()">Follow</a>
            <a v-if="canUnfollow()" class="unfollow btn" @click="unfollow()">
              <template v-if="isFollowRequestPending()">Cancel follow request</template>
              <template v-else>Unfollow</template>
            </a>
          </div>
        </div>
        <div class="bio" v-html="profile.note"></div>
        <div class="extra-fields" v-if="profile.fields.length > 0">
          <dl v-for="field in profile.fields" :key="field.name">
            <dt>{{ field.name }}</dt>
            <dd v-html="field.value"></dd>
          </dl>
        </div>
        <dl class="stats">
          <dt>{{ profile.statuses_count }}</dt><dd>posts</dd>
          <dt>{{ profile.following_count }}</dt><dd>following</dd>
          <dt>{{ profile.followers_count }}</dt><dd>followers</dd>
        </dl>
      </div>
      <post-or-repost v-for="post in posts" :post="post" :key="post.id"></post-or-repost>
    </div>
    <sidebar></sidebar>
  </div>
</template>

<script lang="ts">
import { Options, Vue, setup } from "vue-class-component"

import { Profile, getProfile } from "@/api/users"
import { Post, getPostsByAuthor } from "@/api/posts"
import {
  follow,
  unfollow,
  Relationship,
  getRelationship,
} from "@/api/relationships"
import Avatar from "@/components/Avatar.vue"
import PostOrRepost from "@/components/PostOrRepost.vue"
import Sidebar from "@/components/Sidebar.vue"
import { useCurrentUser } from "@/store/user"

@Options({
  components: {
    Avatar,
    PostOrRepost,
    Sidebar,
  },
})
export default class ProfileView extends Vue {

  private store = setup(() => {
    const { currentUser, authToken, ensureAuthToken } = useCurrentUser()
    return { currentUser, authToken, ensureAuthToken }
  })

  profile: Profile | null = null
  relationship: Relationship | null = null
  posts: Post[] = []

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
    this.posts = await getPostsByAuthor(
      this.store.authToken,
      this.profile.id,
    )
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

}
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/mixins";
@import "../styles/theme";

$avatar-size: 170px;

.profile {
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

    .account-uri {
      color: $secondary-text-color;
      overflow-x: hidden;
      text-overflow: ellipsis;
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
  font-weight: bold;
  padding: 0 $block-inner-padding $block-inner-padding;
  text-align: center;

  dt {
    font-size: 18px;
  }

  dd {
    align-self: flex-end;
    color: $secondary-text-color;
    margin-left: 5px;
    margin-right: 30px;
  }
}

.action {
  @include post-action;
}

:deep(.post) {
  margin-bottom: $block-outer-padding;
}
</style>
