import { ref } from "vue"

import { getNotificationMarker, updateNotificationMarker } from "@/api/markers"
import { Notification, getNotifications } from "@/api/notifications"
import { useClientConfig } from "@/composables/client-config"
import { useCurrentUser } from "@/composables/user"

const NOTIFICATION_REFRESH_PERIOD = 30 * 1000

const notifications = ref<Notification[]>([])
const lastReadId = ref<string | null>(null)

const notificationMonitor = ref<ReturnType<typeof setInterval> | null>(null)
const notificationMonitorLoading = ref(false)

export function useNotifications() {
  const { notificationPollingEnabled } = useClientConfig()
  const { authToken } = useCurrentUser()

  function startNotificationMonitor() {
    if (notificationMonitor.value) {
      throw Error("notification monitor is already running")
    }
    notificationMonitor.value = setInterval(async () => {
      if (
        authToken.value !== null
        && notificationPollingEnabled.value
        && !notificationMonitorLoading.value
      ) {
        // Track loading state to avoid making multiple requests at once
        notificationMonitorLoading.value = true
        try {
          await loadNotifications(authToken.value)
        } catch (error: any) {
          console.warn(error)
        }
        notificationMonitorLoading.value = false
      }
    }, NOTIFICATION_REFRESH_PERIOD)
  }

  function stopNotificationMonitor() {
    if (notificationMonitor.value) {
      clearInterval(notificationMonitor.value)
    }
  }

  async function loadNotifications(authToken: string): Promise<void> {
    const items = await getNotifications(authToken)
    const marker = await getNotificationMarker(authToken)
    // Don't update reactive object until marker is loaded
    notifications.value = items
    if (marker) {
      lastReadId.value = marker.last_read_id
    }
  }

  function getUnreadNotificationCount(): number {
    let unreadCount = 0
    if (lastReadId.value) {
      for (const notification of notifications.value) {
        if (parseInt(notification.id) <= parseInt(lastReadId.value)) {
          break
        }
        unreadCount += 1
      }
    } else {
      unreadCount = notifications.value.length
    }
    return unreadCount
  }

  async function updateUnreadNotificationCount(authToken: string) {
    const firstNotification = notifications.value[0]
    if (
      firstNotification &&
      firstNotification.id !== lastReadId.value
    ) {
      await updateNotificationMarker(
        authToken,
        firstNotification.id,
      )
      lastReadId.value = firstNotification.id
    }
  }

  return {
    startNotificationMonitor,
    stopNotificationMonitor,
    notifications,
    loadNotifications,
    getUnreadNotificationCount,
    updateUnreadNotificationCount,
  }
}
