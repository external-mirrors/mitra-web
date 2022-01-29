import { Signer } from "ethers"
import { Web3Provider } from "@ethersproject/providers"

export function getProvider(): Web3Provider | null {
  const provider = (window as any).ethereum
  return new Web3Provider(provider)
}

export async function getSigner(): Promise<Signer | null> {
  const provider = getProvider()
  if (!provider) {
    return null
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

export interface Signature {
  v: number;
  r: string;
  s: string;
}
