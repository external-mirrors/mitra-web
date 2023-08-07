import { Signer } from "ethers"
import { TransactionResponse } from "@ethersproject/abstract-provider"

import { BACKEND_URL } from "@/constants"
import { EthereumSignature } from "@/utils/ethereum"
import { handleResponse, http } from "./common"
import { getContract, Contracts } from "./contracts"
import { Post } from "./posts"

export async function makePermanent(
  authToken: string,
  postId: string,
): Promise<Post> {
  const url = `${BACKEND_URL}/api/v1/statuses/${postId}/make_permanent`
  const response = await http(url, {
    method: "POST",
    authToken,
  })
  const data = await handleResponse(response)
  return data
}

export async function getMintingAuthorization(
  authToken: string,
  postId: string,
): Promise<EthereumSignature> {
  const url = `${BACKEND_URL}/api/v1/statuses/${postId}/signature`
  const response = await http(url, {
    method: "GET",
    authToken,
  })
  const data = await handleResponse(response)
  return data
}

export interface TokenMetadata {
  name: string;
  description: string;
  image: string;
  external_url: string;
}

export async function mintToken(
  contractAddress: string,
  signer: Signer,
  ownerAddress: string,
  tokenUri: string,
  serverSignature: EthereumSignature,
): Promise<TransactionResponse> {
  const adapter = await getContract(Contracts.Minter, contractAddress, signer)
  const transaction = await adapter.mint(
    ownerAddress,
    tokenUri,
    serverSignature.v,
    "0x" + serverSignature.r,
    "0x" + serverSignature.s,
  )
  return transaction
}

export async function onTokenMinted(
  authToken: string,
  postId: string,
  transactionId: string,
): Promise<Post> {
  const url = `${BACKEND_URL}/api/v1/statuses/${postId}/token_minted`
  const response = await http(url, {
    method: "POST",
    json: { transaction_id: transactionId.replace(/0x/, "") },
    authToken,
  })
  const data = await handleResponse(response)
  return data
}

export async function getTokenMetadata(url: string): Promise<TokenMetadata> {
  const response = await http(url, {
    method: "GET",
    credentials: "omit",
  })
  const data = await handleResponse(response)
  return data
}
