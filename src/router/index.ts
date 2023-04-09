import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router"

import AboutPage from "@/views/About.vue"
import EthereumPage from "@/views/Ethereum.vue"
import HomeTimeline from "@/views/HomeTimeline.vue"
import IdentityProof from "@/views/IdentityProof.vue"
import ImportFollows from "@/views/ImportFollows.vue"
import LandingPage from "@/views/LandingPage.vue"
import MoveFollowers from "@/views/MoveFollowers.vue"
import NotificationList from "@/views/NotificationList.vue"
import ProfileAliases from "@/views/ProfileAliases.vue"
import ProfileDirectory from "@/views/ProfileDirectory.vue"
import ProfileView from "@/views/Profile.vue"
import ProfileForm from "@/views/ProfileForm.vue"
import PostDetail from "@/views/PostDetail.vue"
import PostOverlay from "@/views/PostOverlay.vue"
import PublicTimeline from "@/views/PublicTimeline.vue"
import SettingsPage from "@/views/Settings.vue"
import TagTimeline from "@/views/TagTimeline.vue"
import SearchResultList from "@/views/SearchResultList.vue"
import SubscriptionPage from "@/views/SubscriptionPage.vue"
import SubscriptionsSettings from "@/views/SubscriptionsSettings.vue"

import { Permissions } from "@/api/users"
import { useCurrentUser } from "@/composables/user"

async function authGuard(to: any) {
  const { isAuthenticated } = useCurrentUser()
  const isUserAuthenticated = await isAuthenticated()
  const onlyGuest = to.matched.some((record: RouteRecordRaw) => {
    return record.meta?.onlyGuest
  })
  const onlyAuthenticated = to.matched.some((record: RouteRecordRaw) => {
    return record.meta?.onlyAuthenticated
  })
  if (onlyGuest && isUserAuthenticated) {
    return { name: "home" }
  } else if (onlyAuthenticated && !isUserAuthenticated) {
    return { name: "landing-page" }
  }
}

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "landing-page",
    component: LandingPage,
    meta: { onlyGuest: true },
  },
  {
    path: "/about",
    name: "about",
    component: AboutPage,
    meta: { },
  },
  {
    path: "/ethereum",
    name: "ethereum",
    component: EthereumPage,
    meta: { onlyGuest: true },
  },
  {
    path: "/home",
    name: "home",
    component: HomeTimeline,
    meta: { onlyAuthenticated: true },
  },
  {
    path: "/local",
    name: "local",
    component: PublicTimeline,
    meta: { onlyAuthenticated: true },
  },
  {
    path: "/post/:postId",
    name: "post",
    component: PostDetail,
    meta: { },
  },
  {
    path: "/post-overlay/:postId",
    name: "post-overlay",
    component: PostOverlay,
    meta: { },
  },
  {
    path: "/tag/:tagName",
    name: "tag",
    component: TagTimeline,
    meta: { },
  },
  {
    path: "/notifications",
    name: "notifications",
    component: NotificationList,
    meta: { onlyAuthenticated: true },
  },
  {
    path: "/profile/:profileId",
    name: "profile",
    component: ProfileView,
    meta: { },
  },
  {
    path: "/@:acct(.*)",
    name: "profile-by-acct",
    component: ProfileView,
    meta: { },
  },
  {
    path: "/profile/:profileId/subscription",
    name: "profile-subscription",
    component: SubscriptionPage,
    meta: { },
  },
  {
    path: "/@:acct(.*)/subscription",
    name: "profile-by-acct-subscription",
    component: SubscriptionPage,
    meta: { },
  },
  {
    path: "/profile-directory",
    name: "profile-directory",
    component: ProfileDirectory,
    meta: { onlyAuthenticated: true },
  },
  {
    path: "/search",
    name: "search",
    component: SearchResultList,
    meta: { onlyAuthenticated: true },
  },
  {
    path: "/settings",
    name: "settings",
    component: SettingsPage,
    meta: { onlyAuthenticated: true },
  },
  {
    path: "/settings/profile",
    name: "settings-profile",
    component: ProfileForm,
    meta: { onlyAuthenticated: true },
  },
  {
    path: "/settings/aliases",
    name: "settings-aliases",
    component: ProfileAliases,
    meta: { onlyAuthenticated: true },
  },
  {
    path: "/settings/move-followers",
    name: "move-followers",
    component: MoveFollowers,
    meta: { onlyAuthenticated: true },
  },
  {
    path: "/settings/identity-proof",
    name: "identity-proof",
    component: IdentityProof,
    meta: { onlyAuthenticated: true },
  },
  {
    path: "/settings/import-follows",
    name: "import-follows",
    component: ImportFollows,
    meta: { onlyAuthenticated: true },
  },
  {
    path: "/subscriptions/settings",
    name: "subscriptions-settings",
    component: SubscriptionsSettings,
    meta: { onlyAuthenticated: true },
    beforeEnter: () => {
      const { ensureCurrentUser } = useCurrentUser()
      return ensureCurrentUser()
        .role.permissions
        .includes(Permissions.ManageSubscriptionOptions)
    },
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: { name: "home" },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(authGuard)

export default router
