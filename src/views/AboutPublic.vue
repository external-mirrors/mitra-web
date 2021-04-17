<template>
  <div class="about-page">
    <div class="about" v-if="instance">
      <router-link class="back" to="/" title="Back">
        <img :src="require('@/assets/feather/arrow-left.svg')">
      </router-link>
      <h1>{{ instance.title }}</h1>
      <div class="description static-text" v-html="renderMarkdown(instance.description)"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, setup } from "vue-class-component"

import { InstanceInfo } from "@/api/instance"
import { useInstanceInfo } from "@/store/instance"
import { renderMarkdown } from "@/utils/markdown"

export default class AboutPublicPage extends Vue {

  private store = setup(() => {
    const { instance } = useInstanceInfo()
    return { instance }
  })

  get instance(): InstanceInfo | null {
    return this.store.instance
  }

  renderMarkdown(description: string): string {
    return renderMarkdown(description)
  }

}
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/theme";

.about-page {
  align-items: flex-start;
  display: flex;
  flex-direction: row;
  gap: $content-gap;
  margin: 0 auto;
  max-width: $wide-content-width + $content-gap + $wide-sidebar-width;
  padding-top: 20vh;
}

.about {
  max-width: $wide-content-width;
  min-width: 0;
}

.back {
  position: absolute;
  top: $body-padding;

  img {
    filter: $btn-text-colorizer;
    width: 40px;
  }
}

h1 {
  font-size: 90px;
  font-weight: bold;
  margin: 0 0 20px;
  text-transform: uppercase;
  word-wrap: break-word;
}

.description {
  font-size: 24px;
  line-height: 1.75;
}

@media screen and (max-width: $screen-breakpoint-small) {
  .about-page {
    padding-top: $content-gap;
  }
}
</style>
