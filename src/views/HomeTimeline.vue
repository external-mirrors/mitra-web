<template>
  <div id="main">
    <div class="content posts">
      <post-editor @post-created="insertPost"></post-editor>
      <post-list :posts="posts" @load-next-page="loadNextPage"></post-list>
    </div>
    <sidebar></sidebar>
  </div>
</template>

<script lang="ts">
import { Options, Vue, setup } from "vue-class-component"

import { Post, getHomeTimeline } from "@/api/posts"
import Avatar from "@/components/Avatar.vue"
import PostEditor from "@/components/PostEditor.vue"
import PostList from "@/components/PostList.vue"
import Sidebar from "@/components/Sidebar.vue"
import { useCurrentUser } from "@/store/user"

@Options({
  components: {
    Avatar,
    PostEditor,
    PostList,
    Sidebar,
  },
})
export default class HomeTimeline extends Vue {

  private store = setup(() => {
    const { ensureAuthToken } = useCurrentUser()
    return { ensureAuthToken }
  })

  posts: Post[] = []

  async created() {
    const authToken = this.store.ensureAuthToken()
    this.posts = await getHomeTimeline(authToken)
  }

  insertPost(post: Post) {
    this.posts = [post, ...this.posts]
  }

  async loadNextPage(maxId: string) {
    const authToken = this.store.ensureAuthToken()
    const posts = await getHomeTimeline(authToken, maxId)
    this.posts.push(...posts)
  }

}
</script>

<style scoped lang="scss">
@import "../styles/layout";

.post-form {
  margin-bottom: $block-outer-padding * 2;
}
</style>
