import { ref } from "vue"

import { User, getCurrentUser } from "@/api/users"

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

  function setAuthToken(token: string | null) {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
    } else {
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
    }
    authToken.value = token
  }

  async function isAuthenticated(): Promise<boolean> {
    if (!isAuthChecked.value) {
      const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
      if (token) {
        authToken.value = token
        currentUser.value = await getCurrentUser(token)
        if (currentUser.value === null) {
          // Failed to get current user, removing invalid token
          setAuthToken(null)
        }
      }
      isAuthChecked.value = true
    }
    return currentUser.value !== null
  }

  return {
    currentUser,
    ensureCurrentUser,
    setCurrentUser,
    authToken,
    ensureAuthToken,
    setAuthToken,
    isAuthenticated,
  }
}
