import { createApp } from "vue"

import VueClickAway from "vue3-click-away"
import { createHead } from "@vueuse/head"

import App from "./App.vue"
import router from "./router"

const app = createApp(App)
const head = createHead()

app.use(VueClickAway)
app.use(head)

app.use(router).mount("#app")
