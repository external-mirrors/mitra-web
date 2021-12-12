<template>
  <div id="main">
    <div class="content posts">
      <post-editor @post-created="insertPost"></post-editor>
      <post-or-repost
        v-for="post in posts"
        :post="post"
        :key="post.id"
        @post-deleted="onPostDeleted($event)"
      ></post-or-repost>
      <button
        v-if="isPageFull()"
        class="btn"
        @click="loadNextPage()"
      >
        Show more posts
      </button>
    </div>
    <sidebar></sidebar>
  </div>
</template>

<script lang="ts">
import { Options, Vue, setup } from "vue-class-component"

import { PAGE_SIZE } from "@/api/common"
import { Post, getHomeTimeline } from "@/api/posts"
import Avatar from "@/components/Avatar.vue"
import PostOrRepost from "@/components/PostOrRepost.vue"
import PostEditor from "@/components/PostEditor.vue"
import Sidebar from "@/components/Sidebar.vue"
import { useCurrentUser } from "@/store/user"

@Options({
  components: {
    Avatar,
    PostOrRepost,
    PostEditor,
    Sidebar,
  },
})
export default class PostList extends Vue {

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

  onPostDeleted(postId: string) {
    const postIndex = this.posts.findIndex((post) => post.id === postId)
    this.posts.splice(postIndex, 1)
  }

  isPageFull(): boolean {
    return this.posts.length >= PAGE_SIZE
  }

  async loadNextPage() {
    if (this.posts.length > 0) {
      const authToken = this.store.ensureAuthToken()
      const posts = await getHomeTimeline(
        authToken,
        this.posts[this.posts.length - 1].id,
      )
      this.posts.push(...posts)
    }
  }

}

</script>

<style scoped lang="scss">
@import "../styles/layout";

.post-form {
  margin-bottom: $block-outer-padding * 2;
}

:deep(.post) {
  margin-bottom: $block-outer-padding;
}
</style>
