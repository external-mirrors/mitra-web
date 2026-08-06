<template>
  <sidebar-layout>
    <template #content>
      <h1>{{ $t('settings.active_sessions') }}</h1>
      <table
        v-if="!isLoading"
        class="sessions"
      >
        <thead>
          <tr>
            <th>{{ $t('sessions.application') }}</th>
            <th>{{ $t('sessions.logged_in') }}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="session in sessions"
            :key="session.id"
          >
            <td>
              {{ getSessionName(session) }}
              <span
                v-if="session.is_current"
                class="current-session"
              >
                {{ $t('sessions.current') }}
              </span>
            </td>
            <td>{{ formatDateTime(session.created_at) }}</td>
            <td>
              <button
                @click="terminate(session)"
                :title="$t('sessions.terminate_session')"
              >
                <icon-delete></icon-delete>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <loader v-if="isLoading"></loader>
    </template>
  </sidebar-layout>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import { useI18n } from "vue-i18n"
import { useRouter } from "vue-router"

import {
  getSessions,
  terminateSession,
  Session,
} from "@/api/settings"
import IconDelete from "@/assets/feather/x.svg?component"
import Loader from "@/components/Loader.vue"
import SidebarLayout from "@/components/SidebarLayout.vue"
import { useDateTime } from "@/composables/date-time"
import { useTitle } from "@/composables/title"
import { useCurrentUser } from "@/composables/user"

const { t } = useI18n({ useScope: "global" })
const router = useRouter()
const { endSession, ensureAuthToken } = useCurrentUser()
const { formatDateTime } = useDateTime()
const { setPageTitle } = useTitle()

const sessions = ref<Session[]>([])
const isLoading = ref(false)

function getSessionName(session: Session): string {
  return session.client_name || t("sessions.unknown")
}

async function terminate(session: Session) {
  if (confirm(t("sessions.do_you_want_to_terminate_session", { name: getSessionName(session) }))) {
    const authToken = ensureAuthToken()
    await terminateSession(authToken, session.id)
    sessions.value = sessions.value.filter(item => item.id !== session.id)
    if (session.is_current) {
      endSession()
      router.push({ name: "landing-page" })
    }
  }
}

onMounted(async () => {
  isLoading.value = true
  setPageTitle(t("settings.active_sessions"))
  const authToken = ensureAuthToken()
  sessions.value = await getSessions(authToken)
  isLoading.value = false
})
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/mixins";
@import "../styles/theme";

.sessions {
  @include content-table;

  th, td {
    &:first-child {
      width: 40%;
    }

    &:last-child {
      text-align: right;
    }
  }
}

.current-session {
  background-color: var(--widget-background-color);
  border-radius: $btn-border-radius;
  padding: 0 $widget-padding;
  word-break: normal;
}

.loader {
  margin: $block-outer-padding auto;
}
</style>
