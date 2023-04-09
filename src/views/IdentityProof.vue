<template>
  <sidebar-layout>
    <template #content>
      <h1>Link minisign key</h1>
      <form class="identity-proof">
        <input
          type="text"
          id="key"
          placeholder="Public key (minisign -G)"
          v-model="key"
        >
        <code v-if="identityClaim" class="message">
          {{ identityClaim }}
        </code>
        <input
          type="text"
          id="signature"
          placeholder="Signature (minisign -Sm data.txt)"
          v-model="signature"
          v-if="did"
        >
        <button
          type="submit"
          class="btn"
          :disabled="!canSubmit()"
          @click.prevent="submit()"
        >
          Submit
        </button>
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

function canSubmit(): boolean {
  return (did === null && key.length > 0) || (did !== null && signature.length > 0)
}

async function submit() {
  if (currentUser === null) {
    return
  }
  const authToken = ensureAuthToken()
  if (did === null && key.length > 0) {
    const data = await getIdentityClaim(authToken, "minisign", key)
    did = data.did
    identityClaim = data.claim
  } else if (did !== null && signature.length > 0) {
    await createIdentityProof(
      authToken,
      did,
      signature,
    )
    router.push({ name: "profile-by-acct", params: { acct: currentUser.acct } })
  }
}
</script>

<style scoped lang="scss">
@import "../styles/layout";

.identity-proof {
  display: flex;
  flex-direction: column;
  gap: $block-inner-padding;
}

.message {
  word-wrap: break-word;
}
</style>
