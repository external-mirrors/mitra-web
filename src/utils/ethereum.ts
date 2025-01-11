import { createWalletClient, custom, Account, WalletClient } from "viem"

import { generateRandomString } from "./crypto"

export function hasEthereumWallet(): boolean {
  return Boolean((window as any).ethereum)
}

export async function getWallet(): Promise<WalletClient | null> {
  const provider = (window as any).ethereum
  let account
  try {
    const accounts = await provider.request({ method: "eth_requestAccounts" })
    if (accounts.length === 0) {
      throw new Error("empty account list")
    }
    account = accounts[0]
  } catch (error) {
    console.log("metamask error:", error)
    // Access denied
    return null
  }
  const wallet = createWalletClient({
    account,
    transport: custom(provider),
  })
  return wallet
}

// EIP-191 signature
export async function getWalletSignature(
  wallet: WalletClient,
  message: string,
): Promise<string | null> {
  let signature
  try {
    signature = await wallet.signMessage({ account: wallet.account as Account, message })
  } catch (error: any) {
    if (error.name === "UserRejectedRequestError") {
      // User rejected the request
      return null
    }
    throw error
  }
  return signature
}

interface SignedMessage {
  message: string,
  signature: string,
}

// https://eips.ethereum.org/EIPS/eip-4361
export async function createEip4361_SignedMessage(
  wallet: WalletClient,
  domain: string,
  statement: string,
): Promise<SignedMessage | null> {
  const [address] = await wallet.getAddresses()
  const uri = window.location.origin
  const nonce = generateRandomString(16)
  const issuedAt = new Date().toISOString()
  const message = `${domain} wants you to sign in with your Ethereum account:
${address}

${statement}

URI: ${uri}
Version: 1
Chain ID: 1
Nonce: ${nonce}
Issued At: ${issuedAt}`

  const signature = await getWalletSignature(wallet, message)
  if (!signature) {
    return null
  }
  return { message, signature }
}
