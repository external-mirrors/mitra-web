import { RouteLocationRaw } from "vue-router"

import { BACKEND_URL } from "@/constants"
import { createDidFromEthereumAddress } from "@/utils/did"
import { PAGE_SIZE, http } from "./common"

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

export interface Profile {
  id: string;
  username: string;
  acct: string;
  url: string;
  display_name: string | null;
  note: string | null;
  avatar: string | null;
  header: string | null;
  identity_proofs: ProfileField[];
  payment_options: ProfilePaymentOption[];
  fields: ProfileField[];

  followers_count: number;
  following_count: number;
  subscribers_count: number;
  statuses_count: number;
}

export function guest() {
  return {
    id: "",
    username: "",
    acct: "",
    url: "",
    display_name: "You",
    note: null,
    avatar: null,
    header: null,
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
}

export interface ProfileWrapper extends Profile {}
export class ProfileWrapper {

  constructor(source: Profile) {
    Object.assign(this, source)
  }

  getDisplayName(): string {
    return this.display_name || this.username
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
    throw new Error(data.message)
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
    throw new Error(data.message)
  } else {
    return data.access_token
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

export async function getProfile(
  authToken: string | null,
  profileId: string,
): Promise<Profile> {
  const url = `${BACKEND_URL}/api/v1/accounts/${profileId}`
  const response = await http(url, { authToken })
  const data = await response.json()
  if (response.status !== 200) {
    throw new Error(data.message)
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

export interface ProfileFieldAttrs {
  name: string;
  value: string;
  value_source: string;
}

export interface ProfileUpdateData {
  display_name: string | null;
  note: string | null;
  note_source: string | null;
  avatar: string | null;
  header: string | null;
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
  const profileOrError = await response.json()
  if (response.status !== 200) {
    throw new Error(profileOrError.message)
  } else {
    return profileOrError
  }
}

interface UnsignedActivity {
  internal_activity_id: string,
  activity: string,
}

export async function getUnsignedUpdate(
  authToken: string,
): Promise<UnsignedActivity> {
  const url = `${BACKEND_URL}/api/v1/accounts/signed_update`
  const response = await http(url, { authToken })
  const data = await response.json()
  return data
}

export async function sendSignedUpdate(
  authToken: string,
  internalActivityId: string,
  walletAddress: string,
  signature: string,
): Promise<void> {
  const url = `${BACKEND_URL}/api/v1/accounts/signed_update`
  const response = await http(url, {
    method: "POST",
    json: {
      internal_activity_id: internalActivityId,
      signer: createDidFromEthereumAddress(walletAddress),
      signature: signature.replace(/0x/, ""),
    },
    authToken,
  })
  const data = await response.json()
  if (response.status !== 200) {
    throw new Error(data.message)
  } else {
    return data
  }
}

export async function getIdentityClaim(
  authToken: string,
  walletAddress: string,
): Promise<string> {
  const url = `${BACKEND_URL}/api/v1/accounts/identity_proof`
  const queryParams = { did: createDidFromEthereumAddress(walletAddress) }
  const response = await http(url, { authToken, queryParams })
  const data = await response.json()
  return data.claim
}

export async function createIdentityProof(
  authToken: string,
  walletAddress: string,
  signature: string,
): Promise<User> {
  const url = `${BACKEND_URL}/api/v1/accounts/identity_proof`
  const response = await http(url, {
    method: "POST",
    json: {
      did: createDidFromEthereumAddress(walletAddress),
      signature: signature.replace(/0x/, ""),
    },
    authToken,
  })
  const data = await response.json()
  if (response.status !== 200) {
    throw new Error(data.message)
  } else {
    return data
  }
}
