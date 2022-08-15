import { BACKEND_URL } from "@/constants"
import { PAGE_SIZE, http } from "./common"

export interface ProfileField {
  name: string;
  value: string;
  verified_at: string | null;
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
  fields: ProfileField[];

  followers_count: number;
  following_count: number;
  statuses_count: number;

  subscription_page_url: string | null;
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

export async function getIdentityClaim(authToken: string): Promise<string> {
  const url = `${BACKEND_URL}/api/v1/accounts/identity_proof`
  const response = await http(url, { authToken })
  const data = await response.json()
  return data.claim
}

export async function createIdentityProof(
  authToken: string,
  signature: string,
): Promise<User> {
  const url = `${BACKEND_URL}/api/v1/accounts/identity_proof`
  const response = await http(url, {
    method: "POST",
    json: { signature: signature.replace(/0x/, "") },
    authToken,
  })
  const data = await response.json()
  if (response.status !== 200) {
    throw new Error(data.message)
  } else {
    return data
  }
}
