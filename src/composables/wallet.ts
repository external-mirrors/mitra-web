import { ref } from "vue"

import { useInstanceInfo } from "@/store/instance"
import {
  getWallet,
  getWeb3Provider,
  parseCAIP2_chainId,
} from "@/utils/ethereum"

const walletAddress = ref<string | null>(null)
const walletError = ref<string | null>(null)

function disconnectWallet(callback: () => void) {
  callback()
  walletAddress.value = null
  walletError.value = null
}

async function connectWallet(
  onDisconnect: () => void,
): Promise<void> {
  const { instance } = useInstanceInfo()
  if (!instance.value?.blockchain_id) {
    throw new Error("blockchain integration disabled")
  }
  let web3Provider
  try {
    web3Provider = getWeb3Provider()
  } catch (error) {
    walletError.value = "wallet not found"
    return
  }
  const signer = await getWallet(web3Provider)
  if (!signer) {
    walletError.value = "wallet not connected"
    return
  }
  walletAddress.value = await signer.getAddress()
  const walletProvider = web3Provider.provider as any
  walletProvider.on("chainChanged", (chainId: string) => {
    disconnectWallet(onDisconnect)
  })
  walletProvider.on("accountsChanged", () => {
    disconnectWallet(onDisconnect)
  })
  walletProvider.on("disconnect", () => {
    disconnectWallet(onDisconnect)
  })

  const instanceChainId = parseCAIP2_chainId(instance.value.blockchain_id)
  const walletChainId = await web3Provider.send("eth_chainId", [])
  if (walletChainId !== instanceChainId) {
    walletError.value = "incorrect network"
  }
}

export function useWallet() {
  return {
    connectWallet,
    walletAddress,
    walletError,
  }
}
