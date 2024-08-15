<template>
  <sidebar-layout>
    <template #content>
      <h1 class="content-header">
        {{ $t('admin.users.users') }}
      </h1>
      <table v-if="!isLoading" class="user-list">
        <thead>
          <tr>
            <th>{{ $t('admin.users.username') }}</th>
            <th>{{ $t('admin.users.account_type') }}</th>
            <th>{{ $t('admin.users.role') }}</th>
            <th>{{ $t('admin.users.last_login') }}</th>
            <th>{{ $t('admin.users.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="user in userList"
            :key="user.id"
          >
            <td>
              <router-link :to="getActorLocation('profile', user.account)">
                {{ user.account.username }}
              </router-link>
            </td>
            <td>{{ user.account_type }}</td>
            <td>{{ user.role?.name || '-' }}</td>
            <td>
              <timestamp
                v-if="user.last_login_at"
                :date="user.last_login_at"
              >
              </timestamp>
              <template v-else>-</template>
            </td>
            <td>
              <button
                class="icon"
                :title="$t('admin.users.delete_user')"
                @click="onDeleteUser(user.account)"
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

import {
  AdminUserInfo,
  adminDeleteProfile,
  adminGetUserList,
} from "@/api/admin"
import { Profile } from "@/api/users"
import IconDelete from "@/assets/feather/trash.svg?component"
import Loader from "@/components/Loader.vue"
import SidebarLayout from "@/components/SidebarLayout.vue"
import Timestamp from "@/components/Timestamp.vue"
import { useActorHandle } from "@/composables/handle"
import { useTitle } from "@/composables/title"
import { useCurrentUser } from "@/composables/user"

const { t } = useI18n({ useScope: "global" })
const { getActorLocation } = useActorHandle()
const { ensureAuthToken } = useCurrentUser()
const { setPageTitle } = useTitle()

const userList = ref<AdminUserInfo[]>([])
const isLoading = ref(false)

async function onDeleteUser(profile: Profile) {
  if (confirm(t("admin.users.confirm_delete_user", { address: profile.acct }))) {
    const authToken = ensureAuthToken()
    await adminDeleteProfile(authToken, profile.id)
    const userIndex = userList.value.findIndex((user) => user.id === profile.id)
    userList.value.splice(userIndex, 1)
  }
}

onMounted(async () => {
  setPageTitle(t("admin.users.users"))
  isLoading.value = true
  userList.value = await adminGetUserList(ensureAuthToken())
  isLoading.value = false
})
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/mixins";

.content-header {
  @include content-list-header;

  font-size: inherit;
}

.user-list {
  @include block-icon;
  @include content-table;

  td:last-child {
    text-align: right;
  }
}

.loader {
  margin: $block-outer-padding auto;
}
</style>
