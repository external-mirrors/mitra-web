<template>
  <div class="avatar">
    <img :src="avatarUrl">
  </div>
</template>

<script lang="ts">
import { Vue } from "vue-class-component"
import { Prop } from "vue-property-decorator"
import makeBlockie from "ethereum-blockies-base64"

import { Profile } from "@/api/users"

export default class Avatar extends Vue {

  @Prop()
  profile!: Profile

  get avatarUrl(): string {
    if (this.profile.avatar) {
      return this.profile.avatar
    } else {
      return makeBlockie(this.profile.acct)
    }
  }

}
</script>

<style scoped lang="scss">
@import "../styles/theme";

.avatar {
  background-color: $block-background-color;
  border-radius: 50%;
  box-sizing: border-box;

  img {
    border-radius: inherit;
    height: 100%;
    object-fit: cover;
    width: 100%;
  }
}
</style>
