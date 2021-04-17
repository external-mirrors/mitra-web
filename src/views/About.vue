<template>
  <div id="main">
    <div class="content about" v-if="instance">
      <h1>{{ instance.title }}</h1>
      <div class="description static-text" v-html="renderMarkdown(instance.description)"></div>
    </div>
    <sidebar></sidebar>
  </div>
</template>

<script lang="ts">
import { Options, Vue, setup } from "vue-class-component"

import { InstanceInfo } from "@/api/instance"
import Sidebar from "@/components/Sidebar.vue"
import { useInstanceInfo } from "@/store/instance"
import { renderMarkdown } from "@/utils/markdown"

@Options({
  components: {
    Sidebar,
  },
})
export default class AboutPage extends Vue {

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

.description {
  font-size: 18px;
  font-weight: lighter;
  line-height: 2;
}
</style>
