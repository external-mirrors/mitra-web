import { getUnsignedUpdate, sendSignedUpdate } from "@/api/users"
import { useCurrentUser } from "@/store/user"
import { getWallet, getWalletSignature } from "@/utils/ethereum"

async function signActivity(): Promise<void> {
  const { ensureAuthToken } = useCurrentUser()
  if (!confirm("This action will sign a message with your wallet and send it to your followers. Continue?")) {
    return
  }
  const signer = await getWallet()
  if (!signer) {
    return
  }
  const walletAddress = await signer.getAddress()
  const authToken = ensureAuthToken()
  const { internal_activity_id, activity } = await getUnsignedUpdate(authToken)
  const signature = await getWalletSignature(signer, activity)
  await sendSignedUpdate(
    authToken,
    internal_activity_id,
    walletAddress,
    signature,
  )
}

export function useSignedActivity() {
  return { signActivity }
}
