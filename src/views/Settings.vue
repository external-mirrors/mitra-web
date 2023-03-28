<template>
  <sidebar-layout>
    <template #content>
      <h1>Settings</h1>
      <section>
        <h2>Profile</h2>
        <router-link
          class="edit-profile btn"
          :to="{ name: 'settings-profile' }"
        >
          Edit profile
        </router-link>
      </section>
      <section>
        <h2>Change password</h2>
        <form @submit.prevent="onChangePassword()">
          <div class="input-group">
            <label for="new-password">New password</label>
            <input id="new-password" type="password" v-model="newPassword">
          </div>
          <div class="input-group">
            <label for="new-password-confirmation">New password (confirmation)</label>
            <input id="new-password-confirmation" type="password" v-model="newPasswordConfirmation">
          </div>
          <button
            type="submit"
            class="btn"
            :disabled="!canChangePassword()"
          >
            Save
          </button>
          <div class="password-form-message" v-if="passwordFormMessage">
            {{ passwordFormMessage }}
          </div>
        </form>
      </section>
      <section>
        <h2>Export</h2>
        <table class="export">
          <tr>
            <td>Follows</td>
            <td>{{ currentUser.following_count }}</td>
            <td>
              <a @click="onExportFollows()">download</a>
            </td>
          </tr>
          <tr>
            <td>Followers</td>
            <td>{{ currentUser.followers_count }}</td>
            <td>
              <a @click="onExportFollowers()">download</a>
            </td>
          </tr>
        </table>
      </section>
      <section>
        <h2>Experiments</h2>
        <details class="experiments">
          <summary>This section contains experimental features. Use at your own risk.</summary>
          <div class="experiments-wrapper">
            <router-link class="btn" :to="{ name: 'import-follows' }">
              Import follows
            </router-link>
            <router-link class="btn" :to="{ name: 'move-followers' }">
              Move followers
            </router-link>
          </div>
        </details>
      </section>
    </template>
  </sidebar-layout>
</template>

<script setup lang="ts">
import { $, $ref } from "vue/macros"

import { changePassword, exportFollowers, exportFollows } from "@/api/settings"
import SidebarLayout from "@/components/SidebarLayout.vue"
import { useCurrentUser } from "@/store/user"

const { currentUser, ensureAuthToken, setCurrentUser } = $(useCurrentUser())
let newPassword = $ref("")
let newPasswordConfirmation = $ref("")
let passwordFormMessage = $ref<string | null>(null)

function canChangePassword(): boolean {
  return newPassword && newPassword === newPasswordConfirmation
}

async function onChangePassword() {
  const authToken = ensureAuthToken()
  const user = await changePassword(authToken, newPassword)
  setCurrentUser(user)
  newPassword = ""
  newPasswordConfirmation = ""
  passwordFormMessage = "Password changed"
}

async function onExportFollows() {
  const authToken = ensureAuthToken()
  await exportFollows(authToken)
}

async function onExportFollowers() {
  const authToken = ensureAuthToken()
  await exportFollowers(authToken)
}
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/mixins";
@import "../styles/theme";

section {
  margin-bottom: 3 * $block-outer-padding;
}

form {
  @include content-form;
}

.password-form-message {
  margin-top: $block-outer-padding;
}

.export {
  td {
    font-weight: bold;
    padding: 0 $block-inner-padding $block-inner-padding 0;

    &:last-child {
      font-weight: normal;
    }
  }

  a {
    color: var(--block-link-color);
  }
}

.experiments {
  summary {
    margin-bottom: $block-outer-padding;
  }

  .experiments-wrapper {
    align-items: flex-start;
    display: flex;
    flex-direction: column;
    gap: $block-outer-padding;
  }
}
</style>
