import { RouteLocationRaw } from "vue-router"

import { BACKEND_URL } from "@/constants"
import { createDidFromEthereumAddress } from "@/utils/did"
import { PAGE_SIZE, http } from "./common"

export const EXTRA_FIELD_COUNT_MAX = 10

export interface ProfileField {
  name: string;
  value: string;
  verified_at: string | null;
}

export interface ProfilePaymentOption {
  type: string,
  name?: string,
  href?: string,
  price?: number,
}

interface Source {
  note: string | null;
  fields: ProfileField[];
}

interface Role {
  id: number,
  name: string,
  permissions: string[],
}

export enum Permissions {
  CreatePost = "create_post",
  ManageSubscriptionOptions = "manage_subscription_options",
}

export interface Profile {
  id: string;
  username: string;
  acct: string;
  url: string;
  display_name: string | null;
  note: string | null;
  avatar: string | null;
  header: string | null;
  locked: boolean;
  identity_proofs: ProfileField[];
  payment_options: ProfilePaymentOption[];
  fields: ProfileField[];

  followers_count: number;
  following_count: number;
  subscribers_count: number;
  statuses_count: number;
}

export function defaultProfile(): Profile {
  return {
    id: "",
    username: "",
    acct: "",
    url: "",
    display_name: "You",
    note: null,
    avatar: null,
    header: null,
    locked: false,
    identity_proofs: [],
    payment_options: [],
    fields: [],
    followers_count: 0,
    following_count: 0,
    subscribers_count: 0,
    statuses_count: 0,
  }
}

export interface User extends Profile {
  source: Source;
  role: Role,
}

export interface ProfileWrapper extends Profile {}
export class ProfileWrapper {

  constructor(source: Profile) {
    Object.assign(this, source)
  }

  getDisplayName(): string {
    let cleanDisplayName
    if (this.display_name) {
      // Replace control characters
      cleanDisplayName = this.display_name.replace(/\p{C}/gu, "")
    } else {
      cleanDisplayName = this.display_name
    }
    return cleanDisplayName || this.username
  }

  getVerifiedEthereumAddress(): string | null {
    for (const field of this.identity_proofs) {
      if (field.name === "$ETH") {
        return field.value
      }
    }
    return null
  }

  getSubscriptionPageLocation(): string | RouteLocationRaw | null {
    for (const option of this.payment_options) {
      if (
        option.type === "link" &&
        (option.name === "EthereumSubscription" || option.name === "MoneroSubscription") &&
        option.href
      ) {
        return option.href
      } else if (
        option.type === "ethereum-subscription" ||
        option.type === "monero-subscription"
      ) {
        return {
          name: "profile-subscription",
          params: { profileId: this.id },
        }
      }
    }
    return null
  }

}

interface UserCreateForm {
  username: string;
  password: string | null;
  message: string | null;
  signature: string | null;
  invite_code: string | null;
}

export async function createUser(userData: UserCreateForm): Promise<User> {
  const url = `${BACKEND_URL}/api/v1/accounts`
  const response = await http(url, {
    method: "POST",
    json: userData,
  })
  const data = await response.json()
  if (response.status !== 201) {
    throw new Error(data.error_description)
  } else {
    return data
  }
}

interface LoginForm {
  username: string | null;
  password: string | null;
  message: string | null;
  signature: string | null;
}

export async function getAccessToken(
  loginType: "password" | "eip4361",
  loginData: LoginForm,
): Promise<string> {
  const url = `${BACKEND_URL}/oauth/token`
  const tokenRequestData = {
    grant_type: loginType,
    ...loginData,
  }
  const response = await http(url, {
    method: "POST",
    json: tokenRequestData,
  })
  const data = await response.json()
  if (response.status !== 200) {
    throw new Error(data.error_description)
  } else {
    return data.access_token
  }
}

export async function revokeAccessToken(
  authToken: string,
): Promise<void> {
  const url = `${BACKEND_URL}/oauth/revoke`
  const response = await http(url, {
    method: "POST",
    authToken,
    json: { token: authToken },
  })
  if (response.status !== 200) {
    const data = await response.json()
    throw new Error(data.error_description)
  }
}

export async function getCurrentUser(authToken: string): Promise<User | null> {
  const url = `${BACKEND_URL}/api/v1/accounts/verify_credentials`
  const response = await http(url, { authToken })
  if (response.status !== 200) {
    return null
  }
  const data = await response.json()
  return data
}

export async function lookupProfile(
  authToken: string | null,
  acct: string,
): Promise<Profile> {
  const url = `${BACKEND_URL}/api/v1/accounts/lookup`
  const response = await http(url, { authToken, queryParams: { acct } })
  const data = await response.json()
  if (response.status !== 200) {
    throw new Error(data.error_description)
  }
  return data
}

export async function getProfile(
  authToken: string | null,
  profileId: string,
): Promise<Profile> {
  const url = `${BACKEND_URL}/api/v1/accounts/${profileId}`
  const response = await http(url, { authToken })
  const data = await response.json()
  if (response.status !== 200) {
    throw new Error(data.error_description)
  }
  return data
}

export async function getProfiles(
  authToken: string,
  offset?: number,
): Promise<Profile[]> {
  const url = `${BACKEND_URL}/api/v1/directory`
  const queryParams = { offset, limit: PAGE_SIZE }
  const response = await http(url, { queryParams, authToken })
  const data = await response.json()
  return data
}

interface ProfileFieldAttrs {
  name: string;
  value: string;
}

export interface ProfileUpdateData {
  display_name: string | null;
  note: string | null;
  avatar: string | null;
  avatar_media_type: string | null;
  header: string | null;
  header_media_type: string | null;
  fields_attributes: ProfileFieldAttrs[];
}

export async function updateProfile(
  authToken: string,
  profileData: ProfileUpdateData,
): Promise<User> {
  const url = `${BACKEND_URL}/api/v1/accounts/update_credentials`
  const response = await http(url, {
    method: "PATCH",
    json: profileData,
    authToken,
  })
  const data = await response.json()
  if (response.status !== 200) {
    throw new Error(data.error_description)
  } else {
    return data
  }
}

interface ActivityParams {
  type: "update",
  [key: string]: any,
}

interface UnsignedActivity {
  params: ActivityParams,
  message: string,
}

export async function getUnsignedUpdate(
  authToken: string,
): Promise<UnsignedActivity> {
  const url = `${BACKEND_URL}/api/v1/accounts/signed_update`
  const response = await http(url, { authToken })
  const data = await response.json()
  return data
}

export async function sendSignedActivity(
  authToken: string,
  activityParams: ActivityParams,
  walletAddress: string,
  signature: string,
): Promise<void> {
  const url = `${BACKEND_URL}/api/v1/accounts/send_activity`
  const response = await http(url, {
    method: "POST",
    json: {
      params: activityParams,
      signer: createDidFromEthereumAddress(walletAddress),
      signature: signature.replace(/0x/, ""),
    },
    authToken,
  })
  const data = await response.json()
  if (response.status !== 200) {
    throw new Error(data.error_description)
  } else {
    return data
  }
}

export async function getIdentityClaim(
  authToken: string,
  proofType: "ethereum" | "minisign",
  signer: string,
): Promise<{ did: string, claim: string }> {
  const url = `${BACKEND_URL}/api/v1/accounts/identity_proof`
  const queryParams = { proof_type: proofType, signer }
  const response = await http(url, { authToken, queryParams })
  const data = await response.json()
  return data
}

export async function createIdentityProof(
  authToken: string,
  did: string,
  signature: string,
): Promise<User> {
  const url = `${BACKEND_URL}/api/v1/accounts/identity_proof`
  const response = await http(url, {
    method: "POST",
    json: {
      did: did,
      signature: signature.replace(/^0x/, ""),
    },
    authToken,
  })
  const data = await response.json()
  if (response.status !== 200) {
    throw new Error(data.error_description)
  } else {
    return data
  }
}

export async function getAliases(profileId: string): Promise<Profile[]> {
  const url = `${BACKEND_URL}/api/v1/accounts/${profileId}/aliases`
  const response = await http(url)
  const data = await response.json()
  if (response.status !== 200) {
    throw new Error(data.error_description)
  }
  return data
}
