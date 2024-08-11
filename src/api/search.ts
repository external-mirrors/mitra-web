import { BACKEND_URL } from "@/constants"

import { handleResponse, http } from "./common"
import { Post, Tag } from "./posts"
import { Profile } from "./users"

interface SearchResults {
  accounts: Profile[];
  statuses: Post[];
  hashtags: Tag[];
}

export async function getSearchResults(
  authToken: string,
  query: string,
  offset?: number,
): Promise<SearchResults> {
  const url = `${BACKEND_URL}/api/v2/search`
  const response = await http(url, {
    method: "GET",
    queryParams: { q: query, offset },
    authToken,
  })
  const data = await handleResponse(response)
  return data
}

export async function searchProfilesByAcct(
  authToken: string | null,
  acct: string,
  resolve: boolean = false,
  limit = 40,
): Promise<Profile[]> {
  const url = `${BACKEND_URL}/api/v1/accounts/search`
  const response = await http(url, {
    method: "GET",
    queryParams: { q: acct, resolve, limit },
    authToken,
  })
  const data = await handleResponse(response)
  return data
}
