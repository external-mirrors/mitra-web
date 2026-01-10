import { ref } from "vue"

import {
  createOauthApp,
  getAccessToken,
  AuthenticationMethod,
  LoginForm,
} from "@/api/oauth"
import {
  hasAdminPermissions,
  getCurrentUser,
  User,
} from "@/api/users"

const OAUTH_CLIENT_ID_KEY = "oauth_client_id"
const OAUTH_CLIENT_SECRET_KEY = "oauth_client_secret"
const AUTH_TOKEN_STORAGE_KEY = "auth_token"
const AUTH_TOKEN_INVALID = "access token is invalid"

const currentUser = ref<User | null>(null)
const isAuthChecked = ref(false)
const authToken = ref<string | null>(null)

export function useCurrentUser() {
  function ensureCurrentUser(): User {
    if (currentUser.value === null) {
      throw new Error("user must be authenticated")
    }
    return currentUser.value
  }

  function setCurrentUser(user: User | null) {
    currentUser.value = user
  }

  function ensureAuthToken(): string {
    if (authToken.value === null) {
      throw new Error("user must be authenticated")
    }
    return authToken.value
  }

  function setAuthToken(token: string) {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
    authToken.value = token
  }

  function clearAuthToken() {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
    authToken.value = null
  }

  async function isAuthenticated(): Promise<boolean> {
    if (!isAuthChecked.value) {
      const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
      if (token) {
        authToken.value = token
        try {
          currentUser.value = await getCurrentUser(token)
        } catch (error: any) {
          // Failed to get current user, removing invalid token
          if (isTokenValidationError(error)) {
            onInvalidAuthToken()
          }
        }
      }
      isAuthChecked.value = true
    }
    return currentUser.value !== null
  }

  async function startSession(
    loginType: AuthenticationMethod,
    loginData: LoginForm,
  ): Promise<string> {
    let clientId = localStorage.getItem(OAUTH_CLIENT_ID_KEY)
    let clientSecret = localStorage.getItem(OAUTH_CLIENT_SECRET_KEY)
    if (!clientId || !clientSecret) {
      const oauthApp = await createOauthApp()
      clientId = oauthApp.client_id
      clientSecret = oauthApp.client_secret
      localStorage.setItem(OAUTH_CLIENT_ID_KEY, clientId)
      localStorage.setItem(OAUTH_CLIENT_SECRET_KEY, clientSecret)
    }
    loginData.client_id = clientId
    loginData.client_secret = clientSecret
    let token
    try {
      token = await getAccessToken(loginType, loginData)
    } catch (error: any) {
      if (error.message === "invalid client credentials") {
        localStorage.removeItem(OAUTH_CLIENT_ID_KEY)
        localStorage.removeItem(OAUTH_CLIENT_SECRET_KEY)
      }
      throw error
    }
    setAuthToken(token)
    return token
  }

  function endSession() {
    setCurrentUser(null)
    clearAuthToken()
    // Remove other local data, but keep OAauth client credentials
    const clientId = localStorage.getItem(OAUTH_CLIENT_ID_KEY)
    const clientSecret = localStorage.getItem(OAUTH_CLIENT_SECRET_KEY)
    localStorage.clear()
    if (clientId && clientSecret) {
      localStorage.setItem(OAUTH_CLIENT_ID_KEY, clientId)
      localStorage.setItem(OAUTH_CLIENT_SECRET_KEY, clientSecret)
    }
  }

  function isTokenValidationError(error: any): boolean {
    return error.message === AUTH_TOKEN_INVALID
  }

  function onInvalidAuthToken() {
    setCurrentUser(null)
    clearAuthToken()
  }

  function isAdmin(): boolean {
    if (currentUser.value === null) {
      return false
    }
    return hasAdminPermissions(currentUser.value)
  }

  return {
    currentUser,
    ensureCurrentUser,
    setCurrentUser,
    authToken,
    ensureAuthToken,
    setAuthToken,
    isAuthenticated,
    startSession,
    endSession,
    isTokenValidationError,
    onInvalidAuthToken,
    isAdmin,
  }
}
