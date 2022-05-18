<template>
  <div id="main">
    <div class="content search-result-group">
      <loader v-if="isLoading"></loader>
      <div v-if="!isLoading" class="search-message">
        <template v-if="errorMessage">{{ errorMessage }}</template>
        <template v-else-if="profiles.length > 0">{{ profiles.length }} people</template>
        <template v-else-if="posts.length > 0">{{ posts.length }} posts</template>
        <template v-else>No results</template>
      </div>
      <div v-if="!isLoading" class="search-result-list">
        <div class="search-result" v-for="profile in profiles" :key="profile.id">
          <profile-list-item :profile="profile"></profile-list-item>
        </div>
        <post :post="post" v-for="post in posts" :key="post.id"></post>
      </div>
    </div>
    <sidebar></sidebar>
  </div>
</template>

<script lang="ts">
import { Options, Vue, setup } from "vue-class-component"
import { Post } from "@/api/posts"
import { getSearchResults } from "@/api/search"
import { Profile } from "@/api/users"
import Avatar from "@/components/Avatar.vue"
import Loader from "@/components/Loader.vue"
import PostComponent from "@/components/Post.vue"
import ProfileListItem from "@/components/ProfileListItem.vue"
import Sidebar from "@/components/Sidebar.vue"
import { useCurrentUser } from "@/store/user"

@Options({
  components: {
    Avatar,
    Loader,
    Post: PostComponent,
    ProfileListItem,
    Sidebar,
  },
})
export default class SearchResultList extends Vue {

  private store = setup(() => {
    const { ensureAuthToken } = useCurrentUser()
    return { ensureAuthToken }
  })

  searchQuery: string | null = null
  isLoading = false
  errorMessage = ""

  profiles: Profile[] = []
  posts: Post[] = []

  async created() {
    const searchQuery = this.$route.query?.q
    if (typeof searchQuery === "string") {
      this.isLoading = true
      this.searchQuery = searchQuery
      try {
        const results = await getSearchResults(
          this.store.ensureAuthToken(),
          this.searchQuery,
        )
        this.profiles = results.accounts
        this.posts = results.statuses
      } catch (error: any) {
        this.errorMessage = error.message
      }
      this.isLoading = false
    }
  }

}
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/theme";

.search-message,
.search-result-list {
  background-color: $block-background-color;
  border-radius: $block-border-radius;
  box-sizing: border-box;
}

.search-message {
  padding: $block-inner-padding;
}

.loader {
  margin: $block-outer-padding auto;
}

.search-result-list {
  margin-top: $block-outer-padding;
}

.search-result {
  border-bottom: 1px solid $separator-color;

  &:last-child {
    border-bottom: none;
  }
}
</style>
