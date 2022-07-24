import { BigNumber, FixedNumber, Signer } from "ethers"
import { TransactionResponse } from "@ethersproject/abstract-provider"
import { DateTime } from "luxon"

import { BACKEND_URL } from "@/constants"
import { ethereumAddressMatch, EthereumSignature } from "@/utils/ethereum"
import { floatToBigNumber, roundBigNumber } from "@/utils/numbers"
import { http } from "./common"
import { Contracts, getContract } from "./contracts"
import { User } from "./users"

const SECONDS_IN_DAY = 3600 * 24
const SECONDS_IN_MONTH = SECONDS_IN_DAY * 30

export interface SubscriptionToken {
  address: string;
  symbol: string;
  decimals: number;
}

export async function getSubscriptionToken(
  contractAddress: string,
  signer: Signer,
): Promise<SubscriptionToken> {
  const adapter = await getContract(Contracts.SubscriptionAdapter, contractAddress, signer)
  const tokenAddress = await adapter.subscriptionToken()
  const token = await getContract(Contracts.ERC20, tokenAddress, signer)
  return {
    address: tokenAddress,
    symbol: await token.symbol(),
    decimals: await token.decimals(),
  }
}

export function getPricePerSec(
  pricePerMonth: number,
  tokenDecimals: number,
): BigNumber {
  const pricePerMonthInt = floatToBigNumber(pricePerMonth, tokenDecimals)
  return pricePerMonthInt.div(SECONDS_IN_MONTH)
}

export async function getSubscriptionAuthorization(
  authToken: string,
  pricePerSec: BigNumber,
): Promise<EthereumSignature> {
  const url = `${BACKEND_URL}/api/v1/accounts/authorize_subscription`
  const response = await http(url, {
    method: "GET",
    authToken,
    queryParams: { price: pricePerSec.toString() },
  })
  const data = await response.json()
  if (response.status !== 200) {
    throw new Error(data.message)
  } else {
    return data
  }
}

export async function configureSubscriptions(
  contractAddress: string,
  signer: Signer,
  recipientAddress: string,
  pricePerSec: BigNumber,
  serverSignature: EthereumSignature,
): Promise<TransactionResponse> {
  const adapter = await getContract(Contracts.SubscriptionAdapter, contractAddress, signer)
  const transaction = await adapter.configureSubscription(
    recipientAddress,
    pricePerSec,
    serverSignature.v,
    "0x" + serverSignature.r,
    "0x" + serverSignature.s,
  )
  return transaction
}

export async function onSubscriptionsEnabled(
  authToken: string,
): Promise<User> {
  const url = `${BACKEND_URL}/api/v1/accounts/subscriptions_enabled`
  const response = await http(url, {
    method: "POST",
    authToken,
  })
  const data = await response.json()
  if (response.status !== 200) {
    throw new Error(data.message)
  } else {
    return data
  }
}

export class Subscription {

  recipientAddress: string;
  tokenAddress: string;
  tokenSymbol: string;
  private tokenDecimals: number;
  private price: BigNumber; // per second

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
    this.price = price
  }

  // Convert raw token amount to FixedNumber
  formatAmount(value: BigNumber): FixedNumber {
    return FixedNumber.fromValue(value, this.tokenDecimals)
  }

  get pricePerMonthInt(): BigNumber {
    return roundBigNumber(this.price.mul(SECONDS_IN_MONTH), 4)
  }

  get pricePerMonth(): FixedNumber {
    return this.formatAmount(this.pricePerMonthInt)
  }

  getExpirationDate(balance: BigNumber): DateTime {
    const seconds = balance.div(this.price).toNumber()
    const now = DateTime.now()
    return now.plus({ seconds })
  }

}

export async function getSubscriptionInfo(
  contractAddress: string,
  signer: Signer,
  recipientAddress: string,
): Promise<Subscription | null> {
  const adapter = await getContract(Contracts.SubscriptionAdapter, contractAddress, signer)
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
  senderBalance: BigNumber;
  recipientBalance: BigNumber;
}

export async function getSubscriptionState(
  contractAddress: string,
  signer: Signer,
  senderAddress: string,
  recipientAddress: string,
): Promise<SubscriptionState> {
  const adapter = await getContract(Contracts.SubscriptionAdapter, contractAddress, signer)
  const [senderBalance, recipientBalance] = await adapter.getSubscriptionState(
    senderAddress,
    recipientAddress,
  )
  return { senderBalance, recipientBalance }
}

export async function getTokenBalance(
  signer: Signer,
  tokenAddress: string,
): Promise<BigNumber> {
  const token = await getContract(Contracts.ERC20, tokenAddress, signer)
  const balance = await token.balanceOf(signer.getAddress())
  return balance
}

export async function makeSubscriptionPayment(
  contractAddress: string,
  signer: Signer,
  recipientAddress: string,
  amount: BigNumber,
): Promise<TransactionResponse> {
  const adapter = await getContract(Contracts.SubscriptionAdapter, contractAddress, signer)
  const subscriptionAddress = await adapter.subscription()
  const subscription = await getContract(Contracts.Subscription, subscriptionAddress, signer)
  const tokenAddress = await adapter.subscriptionToken()
  const token = await getContract(Contracts.ERC20, tokenAddress, signer)
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
  const adapter = await getContract(Contracts.SubscriptionAdapter, contractAddress, signer)
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
  const adapter = await getContract(Contracts.SubscriptionAdapter, contractAddress, signer)
  const subscriptionAddress = await adapter.subscription()
  const subscription = await getContract(Contracts.Subscription, subscriptionAddress, signer)
  const transaction = await subscription.withdrawReceived(senderAddress)
  return transaction
}
