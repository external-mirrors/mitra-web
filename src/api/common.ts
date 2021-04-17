import { ENV } from "@/constants"

// Wrapped in object for easy stubbing in tests
export const fetcher = {
  async fetch(url: string, params: RequestInit): Promise<Response> {
    return await window.fetch(url, params)
  },
}

interface RequestInfo extends RequestInit {
  authToken?: string | null;
  json?: any;
  queryParams?: { [name: string]: string };
}

export async function http(
  url: string | URL,
  requestInfo?: RequestInfo,
): Promise<Response> {
  const defaults: RequestInit = {}
  if (ENV === "development") {
    // Development mode
    defaults.credentials = "include"
  } else {
    defaults.credentials = "same-origin"
  }

  let params: RequestInit
  if (!requestInfo) {
    params = { ...defaults }
  } else {
    const { authToken, json, queryParams, ...requestParams } = { ...requestInfo }
    if (authToken) {
      requestParams.headers = {
        ...requestParams.headers,
        Authorization: `Bearer ${authToken}`,
      }
    }
    if (json) {
      requestParams.body = JSON.stringify(json)
      requestParams.headers = {
        ...requestParams.headers,
        "Content-Type": "application/json",
      }
    }
    if (queryParams) {
      if (!(url instanceof URL)) {
        // Convert URL string to URL object
        url = new URL(url, window.location.origin)
      }
      url.search = new URLSearchParams(queryParams).toString()
    }
    params = { ...defaults, ...requestParams }
  }

  const response = await fetcher.fetch(url as string, params)
  return response
}
