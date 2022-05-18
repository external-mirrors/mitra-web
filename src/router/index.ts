import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router"

import AboutPage from "@/views/About.vue"
import AboutPublicPage from "@/views/AboutPublic.vue"
import HomeTimeline from "@/views/HomeTimeline.vue"
import LandingPage from "../views/LandingPage.vue"
import NotificationList from "../views/NotificationList.vue"
import ProfileDirectory from "../views/ProfileDirectory.vue"
import ProfileView from "@/views/Profile.vue"
import ProfileForm from "@/views/ProfileForm.vue"
import PostDetail from "@/views/PostDetail.vue"
import PostOverlay from "@/views/PostOverlay.vue"
import PublicTimeline from "@/views/PublicTimeline.vue"
import TagTimeline from "@/views/TagTimeline.vue"
import SearchResultList from "@/views/SearchResultList.vue"
import SubscriptionView from "@/views/Subscription.vue"

import { useCurrentUser } from "@/store/user"

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
    path: "/about-public",
    name: "about-public",
    component: AboutPublicPage,
    meta: { onlyGuest: true },
  },
  {
    path: "/about",
    name: "about",
    component: AboutPage,
    meta: { onlyAuthenticated: true },
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
    path: "/profile/:profileId/:tabName",
    name: "profile-tab",
    component: ProfileView,
    meta: { onlyAuthenticated: true },
  },
  {
    path: "/profile/:profileId/subscription",
    name: "profile-subscription",
    component: SubscriptionView,
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
    component: ProfileForm,
    meta: { onlyAuthenticated: true },
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
