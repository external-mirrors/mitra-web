import { BACKEND_URL } from "@/constants"

import { handleResponse, http } from "./common"

interface PollOption {
    title: string,
    votes_count: number,
}

export interface Poll {
    id: string,
    expires_at: string,
    expired: boolean,
    multiple: boolean,
    votes_count: number,
    options: PollOption[],

    voted: boolean | null,
    own_votes: number[] | null,
}

export async function vote(
  authToken: string,
  postId: string,
  choices: number[],
): Promise<Poll> {
  const url = `${BACKEND_URL}/api/v1/polls/${postId}/votes`
  const response = await http(url, {
    method: "POST",
    json: { "choices[]": choices },
    authToken,
  })
  const data = await handleResponse(response)
  return data
}
