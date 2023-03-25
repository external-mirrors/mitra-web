import { ref } from "vue"

import { User, getCurrentUser, revokeAccessToken } from "@/api/users"

const AUTH_TOKEN_STORAGE_KEY = "auth_token"

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
          currentUser.value = null
          clearAuthToken()
        }
      }
      isAuthChecked.value = true
    }
    return currentUser.value !== null
  }

  async function endUserSession() {
    await revokeAccessToken(ensureAuthToken())
    setCurrentUser(null)
    clearAuthToken()
    // Also remove other local data
    localStorage.clear()
  }

  function onInvalidAuthToken() {
    setCurrentUser(null)
    clearAuthToken()
  }

  return {
    currentUser,
    ensureCurrentUser,
    setCurrentUser,
    authToken,
    ensureAuthToken,
    setAuthToken,
    isAuthenticated,
    endUserSession,
    onInvalidAuthToken,
  }
}
