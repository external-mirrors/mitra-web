import { Signer } from "ethers"
import { TransactionResponse } from "@ethersproject/abstract-provider"

import { BACKEND_URL } from "@/constants"
import { Signature } from "@/utils/ethereum"
import { http } from "./common"
import { Contracts, getContract } from "./contracts"

export async function getSubscriptionAuthorization(
  authToken: string,
): Promise<Signature> {
  const url = `${BACKEND_URL}/api/v1/accounts/authorize_subscription`
  const response = await http(url, {
    method: "GET",
    authToken,
  })
  const data = await response.json()
  if (response.status !== 200) {
    throw new Error(data.message)
  } else {
    return data
  }
}

export async function configureSubscription(
  contractAddress: string,
  signer: Signer,
  recipientAddress: string,
  serverSignature: Signature,
): Promise<TransactionResponse> {
  const adapter = await getContract(Contracts.Adapter, contractAddress, signer)
  const transaction = await adapter.configureSubscription(
    recipientAddress,
    serverSignature.v,
    "0x" + serverSignature.r,
    "0x" + serverSignature.s,
  )
  return transaction
}

export async function isSubscriptionConfigured(
  contractAddress: string,
  signer: Signer,
  recipientAddress: string,
): Promise<boolean> {
  const adapter = await getContract(Contracts.Adapter, contractAddress, signer)
  const result = await adapter.isSubscriptionConfigured(recipientAddress)
  return result
}
