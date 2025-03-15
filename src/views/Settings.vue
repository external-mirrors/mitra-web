<template>
  <sidebar-layout v-if="currentUser">
    <template #content>
      <h1>{{ $t('settings.settings') }}</h1>
      <section>
        <h2>{{ $t('settings.profile') }}</h2>
        <router-link
          class="edit-profile btn"
          :to="{ name: 'settings-profile' }"
        >
          {{ $t('settings.edit_profile') }}
        </router-link>
      </section>
      <section v-if="canManageSubscriptions()">
        <h2>{{ $t('navigation.subscriptions') }}</h2>
        <router-link class="btn" :to="{ name: 'subscriptions-settings' }">
          {{ $t('subscriptions.manage_subscriptions') }}
        </router-link>
      </section>
      <section>
        <h2>{{ $t('settings.appearance') }}</h2>
        <div class="appearance-checkbox">
          <input
            type="checkbox"
            id="dark-mode"
            :checked="darkModeEnabled"
            @change="onToggleDarkMode()"
            :disabled="isLoading"
          >
          <label for="dark-mode">{{ $t('settings.enable_dark_mode') }}</label>
        </div>
        <div class="appearance-checkbox">
          <input
            type="checkbox"
            id="content-warnings"
            :checked="contentWarningsEnabled"
            @change="onToggleContentWarnings()"
            :disabled="isLoading"
          >
          <label for="content-warnings">{{ $t('settings.enable_content_warnings') }}</label>
        </div>
        <div class="appearance-checkbox">
          <input
            type="checkbox"
            id="ctrl-enter"
            :checked="ctrlEnterEnabled"
            @change="onToggleCtrlEnter()"
            :disabled="isLoading"
          >
          <label for="ctrl-enter">{{ $t('settings.enable_ctrl_enter') }}</label>
        </div>
        <form class="appearance-form">
          <label for="locale">{{ $t('settings.language') }}</label>
          <select
            id="locale"
            :value="locale"
            @change="onChangeLocale"
            :disabled="isLoading"
          >
            <option
              v-for="(localeName, code) in LOCALE_MAP"
              :key="code"
              :value="code"
            >{{ localeName }}</option>
          </select>
        </form>
        <form class="appearance-form">
          <label for="default-visibility">{{ $t('settings.default_post_visibility') }}</label>
          <select
            id="default-visibility"
            :value="defaultVisibility"
            @change="onChangeDefaultVisibility"
            :disabled="isLoading"
          >
            <option
              v-for="visibility in DEFAULT_VISIBILITY_OPTIONS"
              :key="visibility"
              :value="visibility"
            >{{ VISIBILITY_MAP[visibility].name }}</option>
          </select>
        </form>
      </section>
      <section>
        <h2>{{ $t('settings.authentication') }}</h2>
        <div class="authentication-methods">
          {{ $t('settings.enabled_authentication_methods') }}
          <span v-for="(method, index) in currentUser.authentication_methods" :key="method">
            <template v-if="method === 'password'">{{ $t('settings.authentication_method_password') }}</template>
            <template v-else-if="method === 'eip4361'">EIP-4361</template>
            <template v-else-if="method === 'caip122_monero'">CAIP-122 (Monero)</template>
            <template v-if="index !== currentUser.authentication_methods.length - 1">, </template>
          </span>
        </div>
        <h3>{{ $t('settings.change_password') }}</h3>
        <form @submit.prevent="onChangePassword()">
          <div class="input-group">
            <label for="new-password">{{ $t('settings.new_password') }}</label>
            <input id="new-password" type="password" v-model="newPassword">
          </div>
          <div class="input-group">
            <label for="new-password-confirmation">{{ $t('settings.new_password_confirmation') }}</label>
            <input id="new-password-confirmation" type="password" v-model="newPasswordConfirmation">
          </div>
          <button
            type="submit"
            class="btn"
            :disabled="!canChangePassword()"
          >
            {{ $t('settings.password_save') }}
          </button>
          <div class="password-form-message" v-if="passwordFormMessage">
            {{ passwordFormMessage }}
          </div>
        </form>
      </section>
      <section>
        <h2>{{ $t('settings.export') }}</h2>
        <table class="export">
          <tr>
            <td>{{ $t("settings.follows") }}</td>
            <td>{{ currentUser.following_count }}</td>
            <td>
              <a @click="onExportFollows()">{{ $t('settings.download') }}</a>
            </td>
          </tr>
          <tr>
            <td>{{ $t('settings.followers') }}</td>
            <td>{{ currentUser.followers_count }}</td>
            <td>
              <a @click="onExportFollowers()">{{ $t('settings.download') }}</a>
            </td>
          </tr>
        </table>
      </section>
      <section>
        <h2>{{ $t('settings.import') }}</h2>
        <router-link class="btn" :to="{ name: 'import-follows' }">
          {{ $t('settings.import_follows') }}
        </router-link>
      </section>
      <section>
        <h2>{{ $t('settings.migrate_account') }}</h2>
        <section class="btn-group">
          <router-link class="btn" :to="{ name: 'settings-aliases' }">
            {{ $t('settings.manage_identities') }}
          </router-link>
          <router-link class="btn" :to="{ name: 'move-followers' }">
            {{ $t('settings.move_followers') }}
          </router-link>
        </section>
      </section>
      <section>
        <h2>{{ $t('settings.delete_account') }}</h2>
        <button
          class="btn"
          @click="onDeleteAccount()"
        >
          {{ $t('settings.delete_account') }}
        </button>
      </section>
      <section>
        <h2>{{ $t('settings.experiments') }}</h2>
        <details class="experiments">
          <summary>{{ $t('settings.experiments_summary') }}</summary>
          <router-link class="btn" :to="{ name: 'import-followers' }">
            Import followers
          </router-link>
        </details>
      </section>
    </template>
  </sidebar-layout>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import { useI18n } from "vue-i18n"
import { useRouter } from "vue-router"

import { Visibility } from "@/api/posts"
import {
  changePassword,
  deleteAccount,
  exportFollowers,
  exportFollows,
} from "@/api/settings"
import { Permissions } from "@/api/users"
import SidebarLayout from "@/components/SidebarLayout.vue"
import { useClientConfig, ConfigKey } from "@/composables/client-config"
import { useInstanceInfo } from "@/composables/instance"
import { useLocales, LOCALE_MAP } from "@/composables/locales"
import { useTheme } from "@/composables/theme"
import { useTitle } from "@/composables/title"
import { useVisibility } from "@/composables/visibility"
import { useCurrentUser } from "@/composables/user"

const DEFAULT_VISIBILITY_OPTIONS = [
  Visibility.Public,
  Visibility.Followers,
  Visibility.Subscribers,
]

const { locale, t } = useI18n({ useScope: "global" })
const router = useRouter()
const {
  contentWarningsEnabled,
  ctrlEnterEnabled,
  defaultVisibility,
  setClientConfigKey,
} = useClientConfig()
const {
  currentUser,
  endSession,
  ensureAuthToken,
  setCurrentUser,
} = useCurrentUser()
const { getBlockchainInfo } = useInstanceInfo()
const { changePreferredLocale } = useLocales()
const { darkModeEnabled, toggleDarkMode } = useTheme()
const { setPageTitle } = useTitle()
const { VISIBILITY_MAP } = useVisibility()

const newPassword = ref("")
const newPasswordConfirmation = ref("")
const passwordFormMessage = ref<string | null>(null)
const isLoading = ref(false)

function canManageSubscriptions(): boolean {
  const blockchain = getBlockchainInfo()
  const isSubscriptionsFeatureEnabled = Boolean(blockchain?.features.subscriptions)
  return (
    isSubscriptionsFeatureEnabled &&
    currentUser.value !== null &&
    currentUser.value.role.permissions.includes(Permissions.ManageSubscriptionOptions)
  )
}

async function onToggleDarkMode() {
  isLoading.value = true
  await toggleDarkMode()
  isLoading.value = false
}

async function onToggleContentWarnings() {
  isLoading.value = true
  await setClientConfigKey(
    ConfigKey.ContentWarningsEnabled,
    !contentWarningsEnabled.value,
  )
  isLoading.value = false
}

async function onToggleCtrlEnter() {
  isLoading.value = true
  await setClientConfigKey(
    ConfigKey.CtrlEnterEnabled,
    !ctrlEnterEnabled.value,
  )
  isLoading.value = false
}

async function onChangeLocale(event: Event) {
  isLoading.value = true
  const newLocale = (event.target as HTMLInputElement).value
  await changePreferredLocale(newLocale)
  isLoading.value = false
}

async function onChangeDefaultVisibility(event: Event) {
  isLoading.value = true
  const visibility = (event.target as HTMLInputElement).value
  await setClientConfigKey(
    ConfigKey.DefaultVisibility,
    visibility,
  )
  isLoading.value = false
}

function canChangePassword(): boolean {
  return Boolean(newPassword.value) && newPassword.value === newPasswordConfirmation.value
}

async function onChangePassword() {
  const authToken = ensureAuthToken()
  const user = await changePassword(authToken, newPassword.value)
  setCurrentUser(user)
  newPassword.value = ""
  newPasswordConfirmation.value = ""
  passwordFormMessage.value = t("settings.password_changed")
}

async function onDeleteAccount() {
  const authToken = ensureAuthToken()
  if (confirm(t("settings.delete_account_confirm"))) {
    await deleteAccount(authToken)
    endSession()
    router.push({ name: "landing-page" })
  }
}

async function onExportFollows() {
  const authToken = ensureAuthToken()
  await exportFollows(authToken)
}

async function onExportFollowers() {
  const authToken = ensureAuthToken()
  await exportFollowers(authToken)
}

onMounted(() => {
  setPageTitle(t("navigation.settings"))
})
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

.appearance-checkbox,
.appearance-form {
  margin-top: $block-outer-padding;
}

.authentication-methods {
  margin-bottom: $block-inner-padding;
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

.btn-group {
  align-items: flex-start;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: $block-outer-padding;
}

.experiments {
  summary {
    margin-bottom: $block-outer-padding;
  }
}
</style>
