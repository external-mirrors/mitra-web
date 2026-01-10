import { computed, ref, watch } from "vue"

import { useInstanceInfo } from "@/composables/instance"
import { useNotifications } from "@/composables/notifications"

const TITLE_FALLBACK = "Mitra"

const { getUnreadNotificationCount } = useNotifications()

const title = ref<string>(TITLE_FALLBACK)

const fullTitle = computed(() => {
  const count = getUnreadNotificationCount() // reactive
  const prefix = count > 0 ? `(${count})` : ""
  return `${prefix} ${title.value}`
})

watch(fullTitle, (value) => {
  // Safe: https://stackoverflow.com/a/61435099
  document.title = value
}, { immediate: true })

export function useTitle() {
  function setPageTitle(pageTitle?: string) {
    const { instance } = useInstanceInfo()
    const instanceTitle = instance.value?.title || TITLE_FALLBACK
    if (pageTitle) {
      title.value = `${pageTitle} | ${instanceTitle}`
    } else {
      title.value = instanceTitle
    }
  }

  return {
    setPageTitle,
  }
}
