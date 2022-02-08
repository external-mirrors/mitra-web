import { Signer } from "ethers"
import { TransactionResponse } from "@ethersproject/abstract-provider"

import { BACKEND_URL } from "@/constants"
import { EthereumSignature } from "@/utils/ethereum"
import { http } from "./common"
import { Contracts, getContract } from "./contracts"

export async function getSubscriptionAuthorization(
  authToken: string,
): Promise<EthereumSignature> {
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
  serverSignature: EthereumSignature,
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

export async function makeSubscriptionPayment(
  contractAddress: string,
  signer: Signer,
  recipientAddress: string,
): Promise<TransactionResponse> {
  const adapter = await getContract(Contracts.Adapter, contractAddress, signer)
  const subscriptionAddress = await adapter.subscription()
  const subscription = await getContract(Contracts.Subscription, subscriptionAddress, signer)
  const tokenAddress = await adapter.subscriptionToken()
  const token = await getContract(Contracts.ERC20, tokenAddress, signer)
  const subscriptionPrice = await adapter.getSubscriptionPrice(recipientAddress)
  const duration = 3600 * 24 * 31 // 1 month
  const amount = subscriptionPrice.mul(duration)
  const allowance = await token.allowance(
    signer.getAddress(),
    subscription.address,
  )
  if (allowance.lt(amount)) {
    const approved = await token.approve(subscription.address, amount)
    // Wait for confirmation
    await approved.wait()
  }
  const transaction = await subscription.send(
    recipientAddress,
    amount,
  )
  return transaction
}
