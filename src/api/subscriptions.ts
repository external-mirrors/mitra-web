import { BigNumber, FixedNumber, Signer } from "ethers"
import { TransactionResponse } from "@ethersproject/abstract-provider"

import { BACKEND_URL } from "@/constants"
import { ethereumAddressMatch, EthereumSignature } from "@/utils/ethereum"
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

export interface Subscription {
  recipientAddress: string;
  tokenAddress: string;
  tokenSymbol: string;
  price: FixedNumber;
  senderAddress: string | null;
  senderBalance: FixedNumber | null;
}

const SECONDS_IN_MONTH = 3600 * 24 * 30

export async function getSubscriptionInfo(
  contractAddress: string,
  signer: Signer,
  recipientAddress: string,
): Promise<Subscription | null> {
  const adapter = await getContract(Contracts.Adapter, contractAddress, signer)
  const result = await adapter.isSubscriptionConfigured(recipientAddress)
  if (result === true) {
    const tokenAddress = await adapter.subscriptionToken()
    const token = await getContract(Contracts.ERC20, tokenAddress, signer)
    const tokenSymbol = await token.symbol()
    const tokenDecimals = await token.decimals()
    const priceInt = await adapter.getSubscriptionPrice(recipientAddress)
    const pricePerMonth = priceInt.mul(SECONDS_IN_MONTH)
    const price = FixedNumber.fromValue(pricePerMonth, tokenDecimals).round(2)
    const signerAddress = await signer.getAddress()
    let senderAddress = null
    let senderBalance = null
    if (!ethereumAddressMatch(signerAddress, recipientAddress)) {
      senderAddress = signerAddress
      const [senderBalanceInt] = await adapter.getSubscriptionState(senderAddress, recipientAddress)
      senderBalance = FixedNumber.fromValue(senderBalanceInt, tokenDecimals).round(2)
    }
    return {
      recipientAddress,
      tokenAddress,
      tokenSymbol,
      price,
      senderAddress,
      senderBalance,
    }
  } else {
    return null
  }
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
  const amount = subscriptionPrice.mul(SECONDS_IN_MONTH)
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
