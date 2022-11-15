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
    </template>
  </sidebar-layout>
</template>

<script setup lang="ts">
import { $, $ref } from "vue/macros"

import { changePassword } from "@/api/users"
import SidebarLayout from "@/components/SidebarLayout.vue"
import { useCurrentUser } from "@/store/user"

const { ensureAuthToken, setCurrentUser } = $(useCurrentUser())
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
</style>
