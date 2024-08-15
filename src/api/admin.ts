import { BACKEND_URL } from "@/constants"
import { handleResponse, http } from "./common"
import { Profile, Role } from "./users"

export interface AdminUserInfo {
  id: string,
  role: Role,
  account: Profile,
  account_type: string,
  last_login_at: string | null,
}

export async function adminGetUserList(
  authToken: string,
): Promise<AdminUserInfo[]> {
  const url = `${BACKEND_URL}/api/v2/admin/accounts`
  const response = await http(url, {
    method: "GET",
    authToken,
  })
  const data = await handleResponse(response)
  return data
}

export async function adminDeletePost(
  authToken: string,
  postId: string,
): Promise<void> {
  const url = `${BACKEND_URL}/api/v1/admin/posts/${postId}`
  const response = await http(url, {
    method: "DELETE",
    authToken,
  })
  await handleResponse(response, 204)
}

export async function adminDeleteProfile(
  authToken: string,
  profileId: string,
): Promise<void> {
  const url = `${BACKEND_URL}/api/v1/admin/accounts/${profileId}`
  const response = await http(url, {
    method: "DELETE",
    authToken,
  })
  await handleResponse(response, 204)
}
