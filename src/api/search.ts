import { BACKEND_URL } from "@/constants"

import { http } from "./common"
import { Post } from "./posts"
import { Profile } from "./users"

interface SearchResults {
  accounts: Profile[];
  statuses: Post[];
}

export async function getSearchResults(
  authToken: string,
  query: string,
): Promise<SearchResults> {
  const url = `${BACKEND_URL}/api/v2/search`
  const response = await http(url, {
    method: "GET",
    queryParams: { q: query },
    authToken,
  })
  const data = await response.json()
  if (response.status !== 200) {
    throw new Error(data.message)
  }
  return data
}
