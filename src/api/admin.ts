import { BACKEND_URL } from "@/constants"
import { handleResponse, http } from "./common"

export async function adminDeletePost(
  authToken: string,
  postId: string,
): Promise<void> {
  const url = `${BACKEND_URL}/api/v1/admin/posts/${postId}`
  const response = await http(url, {
    method: "DELETE",
    authToken,
  })
  await handleResponse(response, 204)
}
