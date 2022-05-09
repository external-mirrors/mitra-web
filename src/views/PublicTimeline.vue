<template>
  <div id="main">
    <div class="content posts">
      <post-list :posts="posts" @load-next-page="loadNextPage"></post-list>
    </div>
    <sidebar></sidebar>
  </div>
</template>

<script lang="ts">
import { Options, Vue, setup } from "vue-class-component"

import { Post, getPublicTimeline } from "@/api/posts"
import PostList from "@/components/PostList.vue"
import Sidebar from "@/components/Sidebar.vue"
import { useCurrentUser } from "@/store/user"

@Options({
  components: {
    PostList,
    Sidebar,
  },
})
export default class PublicTimeline extends Vue {

  private store = setup(() => {
    const { ensureAuthToken } = useCurrentUser()
    return { ensureAuthToken }
  })

  posts: Post[] = []

  async created() {
    const authToken = this.store.ensureAuthToken()
    this.posts = await getPublicTimeline(authToken)
  }

  insertPost(post: Post) {
    this.posts = [post, ...this.posts]
  }

  async loadNextPage(maxId: string) {
    const authToken = this.store.ensureAuthToken()
    const posts = await getPublicTimeline(authToken, maxId)
    this.posts.push(...posts)
  }

}
</script>

<style scoped lang="scss">
</style>
