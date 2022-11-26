import {
  getUnsignedMove,
  getUnsignedUpdate,
  sendSignedActivity,
} from "@/api/users"
import { useCurrentUser } from "@/store/user"
import { getWallet, getWalletSignature } from "@/utils/ethereum"

async function signMoveActivity(fromActorId: string, followersCsv: string) {
  const { ensureAuthToken } = useCurrentUser()
  const signer = await getWallet()
  if (!signer) {
    return
  }
  const walletAddress = await signer.getAddress()
  const authToken = ensureAuthToken()
  const { params, message } = await getUnsignedMove(
    authToken,
    fromActorId,
    followersCsv,
  )
  const signature = await getWalletSignature(signer, message)
  await sendSignedActivity(
    authToken,
    params,
    walletAddress,
    signature,
  )
}

async function signUpdateActivity(): Promise<void> {
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
  const { params, message } = await getUnsignedUpdate(authToken)
  const signature = await getWalletSignature(signer, message)
  await sendSignedActivity(
    authToken,
    params,
    walletAddress,
    signature,
  )
}

export function useSignedActivity() {
  return {
    signMoveActivity,
    signUpdateActivity,
  }
}
