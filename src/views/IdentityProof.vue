<template>
  <sidebar-layout>
    <template #content>
      <h1>Link minisign key</h1>
      <form class="identity-proof">
        <textarea
          type="text"
          id="key"
          placeholder="Public key (minisign -R -p minisign.pub)"
          v-model="key"
        ></textarea>
        <button
          v-if="did === null"
          type="button"
          class="btn"
          :disabled="!canGetClaim()"
          @click.prevent="getClaim()"
        >
          Generate message
        </button>
        <code v-if="identityClaim" class="message">
          {{ identityClaim }}
        </code>
        <textarea
          type="text"
          id="signature"
          placeholder="Signature (minisign -S -m message.json -x message.json.sig)"
          v-model="signature"
          v-if="did"
        ></textarea>
        <button
          v-if="did !== null"
          type="submit"
          class="btn"
          :disabled="!canSubmit()"
          @click.prevent="submit()"
        >
          Submit
        </button>
        <div class="error-message" v-if="errorMessage">{{ errorMessage }}</div>
      </form>
    </template>
  </sidebar-layout>
</template>

<script setup lang="ts">
import { $, $ref } from "vue/macros"
import { useRouter } from "vue-router"

import { createIdentityProof, getIdentityClaim } from "@/api/users"
import SidebarLayout from "@/components/SidebarLayout.vue"
import { useCurrentUser } from "@/composables/user"

const router = useRouter()
const { ensureAuthToken, currentUser } = $(useCurrentUser())

const key = $ref("")
const signature = $ref("")
let did = $ref<string | null>(null)
let identityClaim = $ref<string | null>(null)
let errorMessage = $ref<string | null>(null)

function canGetClaim(): boolean {
  return did === null && key.length > 0
}

async function getClaim() {
  if (currentUser === null || did !== null) {
    return
  }
  const authToken = ensureAuthToken()
  let data
  try {
    data = await getIdentityClaim(authToken, "minisign", key)
  } catch (error: any) {
    errorMessage = error.message
    return
  }
  console.log(data)
  errorMessage = null
  did = data.did
  identityClaim = data.claim
}

function canSubmit(): boolean {
  return did !== null && signature.length > 0
}

async function submit() {
  if (currentUser === null || did === null) {
    return
  }
  const authToken = ensureAuthToken()
  try {
    await createIdentityProof(
      authToken,
      did,
      signature,
    )
  } catch (error: any) {
    errorMessage = error.message
    return
  }
  errorMessage = null
  router.push({ name: "profile-by-acct", params: { acct: currentUser.acct } })
}
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/mixins";
@import "../styles/theme";

.identity-proof {
  @include content-form;
}

.message {
  width: 100%;
  word-wrap: break-word;
}
</style>
