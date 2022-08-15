import { BACKEND_URL } from "@/constants"

import { createDidFromEthereumAddress } from "@/utils/did"
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

export async function searchProfileByEthereumAddress(
  walletAddress: string,
): Promise<Profile[]> {
  const url = `${BACKEND_URL}/api/v1/accounts/search_did`
  const response = await http(url, {
    method: "GET",
    queryParams: { did: createDidFromEthereumAddress(walletAddress) },
  })
  const data = await response.json()
  if (response.status !== 200) {
    throw new Error(data.message)
  }
  return data
}
