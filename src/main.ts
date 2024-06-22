import { createApp } from "vue"

import { createI18n } from "vue-i18n"
import VueClickAway from "vue3-click-away"

import App from "./App.vue"
import router from "./router"
import * as localeEn from "./locales/en.json"

const i18n = createI18n({
  legacy: false,
  locale: "en",
  fallbackLocale: "en",
  messages: { en: localeEn },
})

const app = createApp(App)

app.use(VueClickAway)
app.use(router)
app.use(i18n)
app.mount("#app")
