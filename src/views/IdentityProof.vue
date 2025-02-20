<template>
  <sidebar-layout>
    <template #content>
      <h1>Link minisign key</h1>
      <form class="identity-proof">
        <template v-if="identityClaim === null">
          <h2>Step 1: Public key</h2>
          <code v-if="identityClaim === null">
            $ minisign -R -f -p minisign.pub
            <br>
            $ cat minisign.pub
          </code>
          <textarea
            type="text"
            id="key"
            placeholder="Paste public key"
            v-model="key"
          ></textarea>
          <button
            type="button"
            class="btn"
            :disabled="!canGetClaim()"
            @click.prevent="getClaim()"
          >
            Generate message
          </button>
        </template>
        <template v-else>
          <h2>Step 2: Signature</h2>
          <code>
            $ printf '{{ identityClaim.claim }}' | xxd -r -p > message
            <br>
            $ minisign -S -l -m message -x message.sig
            <br>
            $ cat message.sig
          </code>
          <textarea
            type="text"
            id="signature"
            placeholder="Paste signature"
            v-model="signature"
          ></textarea>
          <button
            type="submit"
            class="btn"
            :disabled="!canSubmit()"
            @click.prevent="submit()"
          >
            Submit
          </button>
        </template>
        <div class="error-message" v-if="errorMessage">{{ errorMessage }}</div>
      </form>
    </template>
  </sidebar-layout>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import { useI18n } from "vue-i18n"
import { useRouter } from "vue-router"

import {
  createIdentityProof,
  getIdentityClaim,
  IdentityClaim,
} from "@/api/users"
import SidebarLayout from "@/components/SidebarLayout.vue"
import { useActorHandle } from "@/composables/handle"
import { useTitle } from "@/composables/title"
import { useCurrentUser } from "@/composables/user"

const PROOF_TYPE = "minisign-unhashed"

const { t } = useI18n({ useScope: "global" })
const router = useRouter()
const { getActorLocation } = useActorHandle()
const { ensureAuthToken, currentUser } = useCurrentUser()
const { setPageTitle } = useTitle()

const key = ref("")
const signature = ref("")
const identityClaim = ref<IdentityClaim | null>(null)
const errorMessage = ref<string | null>(null)

function canGetClaim(): boolean {
  return identityClaim.value === null && key.value.length > 0
}

async function getClaim() {
  if (currentUser.value === null || identityClaim.value !== null) {
    return
  }
  const authToken = ensureAuthToken()
  let data
  try {
    data = await getIdentityClaim(authToken, PROOF_TYPE, key.value)
  } catch (error: any) {
    errorMessage.value = error.message
    return
  }
  errorMessage.value = null
  identityClaim.value = data
}

function canSubmit(): boolean {
  return identityClaim.value !== null && signature.value.length > 0
}

async function submit() {
  if (currentUser.value === null || identityClaim.value === null) {
    return
  }
  const authToken = ensureAuthToken()
  try {
    await createIdentityProof(
      authToken,
      PROOF_TYPE,
      identityClaim.value.did,
      signature.value,
      identityClaim.value.created_at,
    )
  } catch (error: any) {
    errorMessage.value = error.message
    return
  }
  errorMessage.value = null
  router.push(getActorLocation("profile", currentUser.value))
}

onMounted(() => {
  setPageTitle(t("profile.link_minisign_key"))
})
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/mixins";
@import "../styles/theme";

.identity-proof {
  @include content-form;

  h2 {
    margin: 0;
  }
}

code {
  background-color: var(--widget-background-color);
  border-radius: $btn-border-radius;
  box-sizing: border-box;
  display: block;
  padding: $input-padding;
  width: 100%;
  word-wrap: break-word;
}
</style>
