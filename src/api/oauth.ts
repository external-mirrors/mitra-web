import { APP_NAME, APP_VERSION, BACKEND_URL } from "@/constants"

import { handleResponse, http } from "./common"

interface OauthApp {
  client_id: string,
  client_secret: string,
}

export async function createOauthApp(): Promise<OauthApp> {
  const url = `${BACKEND_URL}/api/v1/apps`
  const response = await http(url, {
    method: "POST",
    json: {
      client_name: `${APP_NAME} v${APP_VERSION}`,
      redirect_uris: "urn:ietf:wg:oauth:2.0:oob",
      scopes: "read write",
      website: null,
    },
  })
  const data = await handleResponse(response)
  return data
}

export enum AuthenticationMethod {
  Password = "password",
  Eip4361 = "eip4361",
  Caip122Monero = "caip122_monero",
}

export interface LoginForm {
  client_id?: string,
  client_secret?: string,
  username: string | null;
  password: string | null;
  message: string | null;
  signature: string | null;
}

export async function getAccessToken(
  loginType: AuthenticationMethod,
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
  const data = await handleResponse(response)
  return data.access_token
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
  await handleResponse(response)
}
