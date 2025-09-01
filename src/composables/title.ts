import { useInstanceInfo } from "@/composables/instance"

export function useTitle() {
  function setPageTitle(title?: string) {
    const { instance } = useInstanceInfo()
    const instanceTitle = instance.value?.title || "Mitra"
    if (title) {
      title = `${title} | ${instanceTitle}`
    } else {
      title = instanceTitle
    }
    // Safe: https://stackoverflow.com/a/61435099
    document.title = title
  }

  return {
    setPageTitle,
  }
}
