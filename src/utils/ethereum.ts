import { Signer } from "ethers"
import { Web3Provider } from "@ethersproject/providers"

import { generateRandomString } from "./crypto"

export function hasEthereumWallet(): boolean {
  return Boolean((window as any).ethereum)
}

export function getWeb3Provider(): Web3Provider {
  const provider = (window as any).ethereum
  return new Web3Provider(provider)
}

export async function getWallet(
  provider?: Web3Provider,
): Promise<Signer | null> {
  if (!provider) {
    try {
      provider = getWeb3Provider()
    } catch (error) {
      return null
    }
  }
  try {
    await provider.send("eth_requestAccounts", [])
  } catch (error) {
    console.log("metamask error:", error)
    // Access denied
    return null
  }
  const signer = provider.getSigner()
  return signer
}

// EIP-191 signature
export async function getWalletSignature(
  signer: Signer,
  message: string,
): Promise<string> {
  const signature = await signer.signMessage(message)
  return signature
}

// https://eips.ethereum.org/EIPS/eip-4361
export async function createEip4361_SignedMessage(
  signer: Signer,
  domain: string,
  statement: string,
): Promise<{ message: string, signature: string }> {
  const address = await signer.getAddress()
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

  const signature = await signer.signMessage(message)
  return { message, signature }
}
