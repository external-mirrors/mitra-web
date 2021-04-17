<template>
  <div id="main">
    <div class="content posts">
      <post-editor @post-created="insertPost"></post-editor>
      <post-or-repost v-for="post in posts" :post="post" :key="post.id"></post-or-repost>
    </div>
    <sidebar></sidebar>
  </div>
</template>

<script lang="ts">
import { Options, Vue, setup } from "vue-class-component"

import { Post, getPosts } from "@/api/posts"
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
    this.posts = await getPosts(authToken)
  }

  insertPost(post: Post) {
    this.posts = [post, ...this.posts]
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
