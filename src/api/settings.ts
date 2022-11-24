import { BACKEND_URL } from "@/constants"
import { http } from "./common"

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
