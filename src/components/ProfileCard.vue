<template>
  <div class="profile">
    <div class="profile-header">
      <img v-if="profile.header" :src="profile.header">
    </div>
    <div class="profile-info">
      <div class="avatar-row">
        <avatar :profile="profile"></avatar>
        <div class="name-group">
          <div class="display-name">{{ profile.display_name || profile.username }}</div>
          <div class="account-uri">{{ getAcct() }}</div>
        </div>
      </div>
      <div class="bio" v-html="profile.note"></div>
      <div v-if="!compact" class="bottom-row">
        <div class="post-count">
          <div class="value">{{ profile.statuses_count }}</div>
          <div class="name">posts</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue, setup } from "vue-class-component"
import { Prop } from "vue-property-decorator"

import { Profile } from "@/api/users"
import Avatar from "@/components/Avatar.vue"
import { useInstanceInfo } from "@/store/instance"

@Options({
  components: {
    Avatar,
  },
})
export default class ProfileCard extends Vue {

  @Prop()
  profile!: Profile

  @Prop()
  compact = false

  private store = setup(() => {
    const { instance } = useInstanceInfo()
    return { instance }
  })

  getAcct(): string {
    if (this.profile.acct.includes("@")) {
      // Remote account
      return `@${this.profile.acct}`
    }
    if (!this.store.instance) {
      return `@${this.profile.username}`
    }
    return `@${this.profile.username}@${this.store.instance.uri}`
  }

}
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/theme";

$avatar-size: 90px;
$profile-padding: $block-inner-padding / 2;

.profile {
  background-color: $block-background-color;
  border-radius: $block-border-radius;

  .profile-header {
    background-color: $text-color;
    border-radius: $block-border-radius $block-border-radius 0 0;
    height: 100px;

    img {
      border-radius: inherit;
      height: 100%;
      object-fit: cover;
      width: 100%;
    }
  }
}

.profile-info {
  padding: $profile-padding;
}

.avatar-row {
  display: flex;
  flex-direction: row;
  margin-bottom: $profile-padding;

  .avatar {
    height: $avatar-size;
    margin-right: $profile-padding;
    margin-top: -($profile-padding + $avatar-size / 3);
    min-width: $avatar-size;
    padding: 4px;
    width: $avatar-size;
  }

  .name-group {
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
  height: 1.2em;
  overflow: hidden;
  white-space: nowrap;

  :deep(p) {
    margin: 0;
    overflow-x: hidden;
    text-overflow: ellipsis;
  }
}

.bottom-row {
  display: flex;
  flex-direction: row;
  margin-top: $profile-padding;

  .post-count {
    display: flex;
    flex-direction: row;
    font-weight: bold;

    .value {
      font-weight: bold;
    }

    .name {
      color: $secondary-text-color;
      margin-left: 0.3em;
    }
  }
}
</style>
