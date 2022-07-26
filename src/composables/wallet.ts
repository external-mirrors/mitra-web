import { Signer } from "ethers"
import { ref } from "vue"

import { useInstanceInfo } from "@/store/instance"
import {
  getWallet,
  getWeb3Provider,
  parseCAIP2_ChainId,
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

  const instanceChainId = parseCAIP2_ChainId(instance.value.blockchain_id)
  try {
    // https://eips.ethereum.org/EIPS/eip-3326
    await provider.send(
      "wallet_switchEthereumChain",
      [{ chainId: instanceChainId }],
    )
  } catch (switchError: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902 && instance.value.blockchain_info) {
      const { blockchain_explorer_url, blockchain_info } = instance.value
      // https://eips.ethereum.org/EIPS/eip-3085
      const ethereumChainParams = {
        chainId: instanceChainId,
        chainName: blockchain_info.chain_name,
        rpcUrls: [blockchain_info.public_api_url],
        blockExplorerUrls: blockchain_explorer_url ? [blockchain_explorer_url] : [],
        nativeCurrency: {
          name: blockchain_info.currency_name,
          symbol: blockchain_info.currency_symbol,
          decimals: parseInt(blockchain_info.currency_decimals),
        },
      }
      try {
        await provider.send(
          "wallet_addEthereumChain",
          [ethereumChainParams],
        )
      } catch (addError) {
        walletError.value = "Incorrect network"
        return
      }
    } else {
      walletError.value = "Incorrect network"
      return
    }
  }

  const signer = await getWallet(provider)
  if (!signer) {
    walletError.value = "Wallet not connected"
    return
  }
  // Connected
  walletAddress.value = await signer.getAddress()
  walletError.value = null

  const walletProvider = provider.provider as any
  walletProvider.on("chainChanged", (chainId: string) => {
    if (chainId !== instanceChainId) {
      disconnectWallet()
    }
  })
  walletProvider.on("accountsChanged", () => {
    disconnectWallet()
  })
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
