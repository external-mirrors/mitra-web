import { createIdentityProof, getIdentityClaim, User } from "@/api/users"
import { useCurrentUser } from "@/store/user"
import { getWallet, getWalletSignature } from "@/utils/ethereum"

async function verifyEthereumAddress(): Promise<User | null> {
  const { ensureAuthToken, setCurrentUser } = useCurrentUser()
  if (!confirm("This action will link your wallet address to your profile. Continue?")) {
    return null
  }
  const signer = await getWallet()
  if (!signer) {
    return null
  }
  const walletAddress = await signer.getAddress()
  const authToken = ensureAuthToken()
  const message = await getIdentityClaim(authToken, walletAddress)
  const signature = await getWalletSignature(signer, message)
  const user = await createIdentityProof(
    authToken,
    walletAddress,
    signature,
  )
  setCurrentUser(user)
  return user
}

export function useEthereumAddressVerification() {
  return { verifyEthereumAddress }
}
