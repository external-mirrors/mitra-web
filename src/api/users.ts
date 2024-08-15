import { BACKEND_URL } from "@/constants"
import { handleResponse, http, PAGE_SIZE } from "./common"
import { CustomEmoji } from "./emojis"
import { Visibility } from "./posts"
import { AuthenticationMethod } from "./oauth"

export interface ProfileField {
  name: string;
  value: string;
  verified_at: string | null;
  is_legacy_proof: boolean,
}

export interface ProfilePaymentOption {
  type: string,
  name?: string,
  href?: string,
  chain_id?: string,
  price?: number,
  amount_min?: number,
  object_id?: string,
}

interface Source {
  note: string | null;
  fields: ProfileField[];
  privacy: Visibility,
  language: string,
}

export interface Role {
  id: number,
  name: string,
  permissions_names: string[],
}

export enum Permissions {
  CreatePost = "create_post",
  DeleteAnyProfile = "delete_any_profile",
  ManageSubscriptionOptions = "manage_subscription_options",
}

export interface Profile {
  id: string;
  username: string;
  acct: string;
  actor_id: string,
  url: string;
  display_name: string | null;
  note: string | null;
  avatar: string | null;
  header: string | null;
  locked: boolean;
  mention_policy: "none" | "only_known" | "only_contacts",
  bot: boolean,
  is_group: boolean,
  identity_proofs: ProfileField[];
  payment_options: ProfilePaymentOption[];
  fields: ProfileField[];
  emojis: CustomEmoji[],

  followers_count: number;
  following_count: number;
  subscribers_count: number;
  statuses_count: number;
}

export function defaultProfile(fields: Partial<Profile> = {}): Profile {
  return {
    id: "",
    username: "",
    acct: "",
    actor_id: "",
    url: "",
    display_name: "",
    note: null,
    avatar: null,
    header: null,
    locked: false,
    mention_policy: "none",
    bot: false,
    is_group: false,
    identity_proofs: [],
    payment_options: [],
    fields: [],
    emojis: [],
    followers_count: 0,
    following_count: 0,
    subscribers_count: 0,
    statuses_count: 0,
    ...fields,
  }
}

export interface Mention {
  id: string;
  username: string;
  acct: string;
  url: string;
}

export type ClientConfigValue = string | boolean

export interface User extends Profile {
  source: Source;
  role: Role,
  authentication_methods: AuthenticationMethod[];
  client_config: { [clientName: string]: { [property: string]: ClientConfigValue } },
}

export function hasAdminPermissions(user: User): boolean {
  return user.role.permissions_names.includes(Permissions.DeleteAnyProfile)
}

export function isRemoteProfile(profile: Profile | Mention): boolean {
  return profile.username !== profile.acct
}

export function isProfileImageEmpty(url: string): boolean {
  return url.endsWith("/api/v1/accounts/identicon")
}

/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
export interface ProfileWrapper extends Profile {}
/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
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

  isLocal(): boolean {
    return !isRemoteProfile(this)
  }

}

interface UserCreateForm {
  username: string;
  password: string | null;
  message: string | null;
  signature: string | null;
  invite_code: string | null;
}

export async function createUser(
  loginType: AuthenticationMethod,
  userData: UserCreateForm,
): Promise<User> {
  const url = `${BACKEND_URL}/api/v1/accounts`
  const response = await http(url, {
    method: "POST",
    json: {
      authentication_method: loginType,
      ...userData,
    },
  })
  const data = await handleResponse(response, 201)
  return data
}

export async function getCurrentUser(authToken: string): Promise<User> {
  const url = `${BACKEND_URL}/api/v1/accounts/verify_credentials`
  const response = await http(url, { authToken })
  const data = await handleResponse(response)
  return data
}

export async function lookupProfile(
  authToken: string | null,
  acct: string,
): Promise<Profile> {
  const url = `${BACKEND_URL}/api/v1/accounts/lookup`
  const response = await http(url, { authToken, queryParams: { acct } })
  const data = await handleResponse(response)
  return data
}

export async function getProfile(
  authToken: string | null,
  profileId: string,
): Promise<Profile> {
  const url = `${BACKEND_URL}/api/v1/accounts/${profileId}`
  const response = await http(url, { authToken })
  const data = await handleResponse(response)
  return data
}

export async function getProfiles(
  authToken: string,
  offset?: number,
): Promise<Profile[]> {
  const url = `${BACKEND_URL}/api/v1/directory`
  const queryParams = {
    order: "active",
    offset,
    limit: PAGE_SIZE,
  }
  const response = await http(url, { queryParams, authToken })
  const data = await handleResponse(response)
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
  bot: boolean,
  locked: boolean,
  mention_policy: "none" | "only_known" | "only_contacts",
  fields_attributes: ProfileFieldAttrs[];
}

export interface ProfileSourceUpdateData {
  source: {
    privacy?: Visibility,
    language?: string,
  },
}

export async function updateProfile(
  authToken: string,
  profileData: ProfileUpdateData | ProfileSourceUpdateData,
): Promise<User> {
  const url = `${BACKEND_URL}/api/v1/accounts/update_credentials`
  const response = await http(url, {
    method: "PATCH",
    json: profileData,
    authToken,
  })
  const data = await handleResponse(response)
  return data
}

export interface IdentityClaim {
  did: string,
  claim: string,
  created_at: string,
}

export async function getIdentityClaim(
  authToken: string,
  proofType: "ethereum" | "minisign" | "minisign-unhashed",
  signer: string,
): Promise<IdentityClaim> {
  const url = `${BACKEND_URL}/api/v1/accounts/identity_claim`
  const queryParams = { proof_type: proofType, signer }
  const response = await http(url, { authToken, queryParams })
  const data = await handleResponse(response)
  return data
}

export async function createIdentityProof(
  authToken: string,
  proofType: "ethereum" | "minisign" | "minisign-unhashed",
  did: string,
  signature: string,
  createdAt: string,
): Promise<User> {
  const url = `${BACKEND_URL}/api/v1/accounts/identity_proof`
  const response = await http(url, {
    method: "POST",
    json: {
      proof_type: proofType,
      did: did,
      signature: signature.replace(/^0x/, ""),
      created_at: createdAt,
    },
    authToken,
  })
  const data = await handleResponse(response)
  return data
}

export async function deleteIdentityProof(
  authToken: string,
  did: string,
): Promise<User> {
  const url = `${BACKEND_URL}/api/v1/accounts/identity_proof`
  const response = await http(url, {
    method: "DELETE",
    json: { did: did },
    authToken,
  })
  const data = await handleResponse(response)
  return data
}

export interface Aliases {
  declared: Profile[],
  declared_all: { id: string, account: Profile | null }[],
  verified: Profile[],
}

export async function getAliases(profileId: string): Promise<Aliases> {
  const url = `${BACKEND_URL}/api/v1/accounts/${profileId}/aliases/all`
  const response = await http(url)
  const data = await handleResponse(response)
  return data
}

export async function loadRemotePosts(
  authToken: string,
  accountId: string,
  collection: string,
): Promise<void> {
  const url = `${BACKEND_URL}/api/v1/accounts/${accountId}/load_activities`
  const response = await http(url, {
    method: "POST",
    authToken,
    json: { collection },
  })
  await handleResponse(response, 204)
}
