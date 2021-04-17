<template>
  <div id="main">
    <div class="content posts">
      <post
        v-for="(post, index) in thread"
        :key="post.id"
        :post="post"
        :highlighted="isHighlighted(post)"
        :in-thread="true"
        @highlight="onPostHighlight($event)"
        @navigate-to="onPostNavigate($event)"
        @comment-created="onCommentCreated(index, $event)"
      ></post>
    </div>
    <sidebar></sidebar>
  </div>
</template>

<script lang="ts">
import { Options, Vue, setup } from "vue-class-component"

import { Post, getPostContext } from "@/api/posts"
import Avatar from "@/components/Avatar.vue"
import PostComponent from "@/components/Post.vue"
import Sidebar from "@/components/Sidebar.vue"
import { useCurrentUser } from "@/store/user"

@Options({
  components: {
    Avatar,
    Post: PostComponent,
    Sidebar,
  },
})
export default class PostDetail extends Vue {

  private store = setup(() => {
    const { authToken } = useCurrentUser()
    return { authToken }
  })

  private loader!: Promise<Post[]>
  private selectedId: string | null = null
  private highlightedId: string | null = null

  thread: Post[] = []

  created() {
    this.selectedId = this.$route.params.postId as string
    this.loader = getPostContext(this.store.authToken, this.selectedId)
  }

  async mounted() {
    this.thread = await this.loader
    this.$nextTick(() => {
      // TODO: scrolls to wrong position if posts above it have images
      this.scrollTo(this.selectedId as string)
    })
  }

  private scrollTo(postId: string, options: any = {}) {
    const containerOffset = this.$el.offsetTop // sticky header height or top margin
    const postElem = this.$el.querySelector(`div[data-post-id="${postId}"]`)
    window.scroll({
      top: (postElem.offsetTop - containerOffset),
      left: 0,
      ...options,
    })
    if (this.selectedId === postId) {
      return
    }
    // Update postId in page URL
    history.pushState(
      {},
      "",
      location.pathname.replace(this.selectedId as string, postId),
    )
    this.selectedId = postId
  }

  isHighlighted(post: Post): boolean {
    if (this.thread.length === 1) {
      return false
    }
    return post.id === this.selectedId || post.id === this.highlightedId
  }

  onPostHighlight(postId: string | null) {
    this.highlightedId = postId
  }

  onPostNavigate(postId: string) {
    this.scrollTo(postId, { behavior: "smooth" })
  }

  onCommentCreated(index: number, post: Post) {
    // Insert comment after parent post
    this.thread.splice(index + 1, 0, post)
  }

}

</script>

<style scoped lang="scss">
@import "../styles/layout";

.post {
  margin: 0 0 $block-outer-padding;
}
</style>
