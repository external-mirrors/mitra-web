import { ref } from "vue"

import { getNotificationMarker } from "@/api/markers"
import { Notification, getNotifications } from "@/api/notifications"

const notifications = ref<Notification[]>([])
const lastReadId = ref<string | null>(null)

export function useNotifications() {

  async function loadNotifications(authToken: string): Promise<void> {
    const notifications_ = await getNotifications(authToken)
    const marker = await getNotificationMarker(authToken)
    // Don't update reactive object until marker is loaded
    notifications.value = notifications_
    if (marker) {
      lastReadId.value = marker.last_read_id
    }
  }

  function getUnreadNotificationCount(): number {
    let unreadCount = 0
    if (lastReadId.value) {
      for (const notification of notifications.value) {
        if (notification.id === lastReadId.value) {
          break
        }
        unreadCount += 1
      }
    } else {
      unreadCount = notifications.value.length
    }
    return unreadCount
  }

  return {
    notifications,
    loadNotifications,
    getUnreadNotificationCount,
  }
}
