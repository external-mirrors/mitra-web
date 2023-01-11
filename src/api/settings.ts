import { BACKEND_URL } from "@/constants"
import { http } from "./common"
import { User } from "./users"

export async function changePassword(
  authToken: string,
  newPassword: string,
): Promise<User> {
  const url = `${BACKEND_URL}/api/v1/settings/change_password`
  const response = await http(url, {
    method: "POST",
    json: { new_password: newPassword },
    authToken,
  })
  const data = await response.json()
  if (response.status !== 200) {
    throw new Error(data.message)
  } else {
    return data
  }
}

async function downloadBlob(blob: Blob) {
  const fileUrl = window.URL.createObjectURL(blob)
  window.location.assign(fileUrl)
}

export async function exportFollowers(
  authToken: string,
): Promise<void> {
  const url = `${BACKEND_URL}/api/v1/settings/export_followers`
  const response = await http(url, {
    method: "GET",
    authToken,
  })
  const blob = await response.blob()
  downloadBlob(blob)
}

export async function exportFollows(
  authToken: string,
): Promise<void> {
  const url = `${BACKEND_URL}/api/v1/settings/export_follows`
  const response = await http(url, {
    method: "GET",
    authToken,
  })
  const blob = await response.blob()
  downloadBlob(blob)
}

export async function importFollows(
  authToken: string,
  followsCsv: string,
): Promise<void> {
  const url = `${BACKEND_URL}/api/v1/settings/import_follows`
  const response = await http(url, {
    method: "POST",
    authToken,
    json: { follows_csv: followsCsv },
  })
  if (response.status !== 204) {
    const data = await response.json()
    throw new Error(data.message)
  }
}

export async function moveFollowers(
  authToken: string,
  fromActorId: string,
  followersCsv: string,
): Promise<User> {
  const url = `${BACKEND_URL}/api/v1/settings/move_followers`
  const response = await http(url, {
    method: "POST",
    authToken,
    json: { from_actor_id: fromActorId, followers_csv: followersCsv },
  })
  const data = await response.json()
  if (response.status !== 200) {
    throw new Error(data.message)
  } else {
    return data
  }
}
