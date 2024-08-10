import { BrowserProvider, Signer } from "ethers"

import { generateRandomString } from "./crypto"

export function hasEthereumWallet(): boolean {
  return Boolean((window as any).ethereum)
}

export async function getWallet(): Promise<Signer | null> {
  let provider
  try {
    provider = new BrowserProvider((window as any).ethereum)
  } catch (error) {
    console.log("metamask error:", error)
    return null
  }
  try {
    await provider.send("eth_requestAccounts", [])
  } catch (error) {
    console.log("metamask error:", error)
    // Access denied
    return null
  }
  const wallet = provider.getSigner()
  return wallet
}

// EIP-191 signature
export async function getWalletSignature(
  wallet: Signer,
  message: string,
): Promise<string | null> {
  let signature
  try {
    signature = await wallet.signMessage(message)
  } catch (error: any) {
    if (error.code === "ACTION_REJECTED") {
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
  wallet: Signer,
  domain: string,
  statement: string,
): Promise<SignedMessage | null> {
  const address = await wallet.getAddress()
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
