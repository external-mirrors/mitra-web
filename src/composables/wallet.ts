import { Signer } from "ethers"
import { ref } from "vue"

import { useInstanceInfo } from "@/store/instance"
import {
  getWallet,
  getWeb3Provider,
  parseCAIP2_chainId,
} from "@/utils/ethereum"

const walletAddress = ref<string | null>(null)
const walletError = ref<string | null>(null)

function disconnectWallet() {
  walletAddress.value = null
  walletError.value = null
}

async function connectWallet(): Promise<void> {
  const { instance } = useInstanceInfo()
  if (!instance.value?.blockchain_id) {
    throw new Error("blockchain integration disabled")
  }
  let provider
  try {
    provider = getWeb3Provider()
  } catch (error) {
    walletError.value = "Wallet not found"
    return
  }
  const signer = await getWallet(provider)
  if (!signer) {
    walletError.value = "Wallet not connected"
    return
  }
  walletAddress.value = await signer.getAddress()

  const walletProvider = provider.provider as any
  walletProvider.on("chainChanged", (chainId: string) => {
    disconnectWallet()
  })
  walletProvider.on("accountsChanged", () => {
    disconnectWallet()
  })
  walletProvider.on("disconnect", () => {
    disconnectWallet()
  })

  const instanceChainId = parseCAIP2_chainId(instance.value.blockchain_id)
  const walletChainId = await provider.send("eth_chainId", [])
  if (walletChainId !== instanceChainId) {
    walletError.value = "Incorrect network"
  }
}

// Can't use reactive signer object because it doesn't work with ethers.js
function getSigner(): Signer {
  const provider = getWeb3Provider()
  return provider.getSigner()
}

export function useWallet() {
  return {
    connectWallet,
    walletAddress,
    walletError,
    getSigner,
  }
}
