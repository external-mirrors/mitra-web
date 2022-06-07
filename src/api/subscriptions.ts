import { BigNumber, FixedNumber, Signer } from "ethers"
import { TransactionResponse } from "@ethersproject/abstract-provider"
import { DateTime } from "luxon"

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

const SECONDS_IN_DAY = 3600 * 24
const SECONDS_IN_MONTH = SECONDS_IN_DAY * 30

export class Subscription {

  recipientAddress: string;
  tokenAddress: string;
  tokenSymbol: string;
  private tokenDecimals: number;
  private _price: BigNumber; // per second

  constructor(
    recipientAddress: string,
    tokenAddress: string,
    tokenSymbol: string,
    tokenDecimals: number,
    price: BigNumber,
  ) {
    this.recipientAddress = recipientAddress
    this.tokenAddress = tokenAddress
    this.tokenSymbol = tokenSymbol
    this.tokenDecimals = tokenDecimals
    this._price = price
  }

  get price(): FixedNumber {
    const pricePerMonth = this._price.mul(SECONDS_IN_MONTH)
    return FixedNumber.fromValue(pricePerMonth, this.tokenDecimals).round(2)
  }

  getExpirationDate(balance: FixedNumber): DateTime {
    const price = FixedNumber.fromValue(this._price, this.tokenDecimals)
    const seconds = balance.divUnsafe(price).toUnsafeFloat()
    const now = DateTime.now()
    return now.plus({ seconds })
  }

}

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
    const price = await adapter.getSubscriptionPrice(recipientAddress)
    return new Subscription(
      recipientAddress,
      tokenAddress,
      tokenSymbol,
      tokenDecimals,
      price,
    )
  } else {
    return null
  }
}

export interface SubscriptionState {
  senderAddress: string;
  senderBalance: FixedNumber;
  recipientBalance: FixedNumber;
}

export async function getSubscriptionState(
  contractAddress: string,
  signer: Signer,
  senderAddress: string,
  recipientAddress: string,
): Promise<SubscriptionState> {
  const adapter = await getContract(Contracts.Adapter, contractAddress, signer)
  const tokenAddress = await adapter.subscriptionToken()
  const token = await getContract(Contracts.ERC20, tokenAddress, signer)
  const tokenDecimals = await token.decimals()
  const [senderBalanceInt, recipientBalanceInt] = await adapter.getSubscriptionState(senderAddress, recipientAddress)
  const senderBalance = FixedNumber.fromValue(senderBalanceInt, tokenDecimals)
  const recipientBalance = FixedNumber.fromValue(recipientBalanceInt, tokenDecimals)
  return { senderAddress, senderBalance, recipientBalance }
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

export async function cancelSubscription(
  contractAddress: string,
  signer: Signer,
  recipientAddress: string,
): Promise<TransactionResponse> {
  const adapter = await getContract(Contracts.Adapter, contractAddress, signer)
  const subscriptionAddress = await adapter.subscription()
  const subscription = await getContract(Contracts.Subscription, subscriptionAddress, signer)
  const transaction = await subscription.cancel(recipientAddress)
  return transaction
}

export async function withdrawReceived(
  contractAddress: string,
  signer: Signer,
  senderAddress: string,
): Promise<TransactionResponse> {
  const adapter = await getContract(Contracts.Adapter, contractAddress, signer)
  const subscriptionAddress = await adapter.subscription()
  const subscription = await getContract(Contracts.Subscription, subscriptionAddress, signer)
  const transaction = await subscription.withdrawReceived(senderAddress)
  return transaction
}
