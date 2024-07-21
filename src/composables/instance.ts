import { ref } from "vue"

import {
  BlockchainInfo,
  InstanceInfo,
  MoneroChainMetadata,
  getInstanceInfo,
} from "@/api/instance"
import { isMoneroChain } from "@/utils/cryptocurrencies"

const instance = ref<InstanceInfo | null>(null)

export function useInstanceInfo() {

  async function loadInstanceInfo(): Promise<void> {
    if (instance.value === null) {
      instance.value = await getInstanceInfo()
    }
  }

  function getBlockchainInfo(): BlockchainInfo | null {
    return instance.value?.blockchains[0] || null
  }

  function getMoneroChainMetadata(
    blockchain: BlockchainInfo,
  ): MoneroChainMetadata | null {
    if (!isMoneroChain(blockchain.chain_id)) {
      throw new Error("invalid chain type")
    }
    if (blockchain.chain_metadata) {
      return blockchain.chain_metadata as MoneroChainMetadata
    } else {
      return null
    }
  }

  return {
    instance,
    loadInstanceInfo,
    getBlockchainInfo,
    getMoneroChainMetadata,
  }
}
