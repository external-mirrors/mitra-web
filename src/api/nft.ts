import { Contract, Signer } from "ethers"
import { TransactionResponse } from "@ethersproject/abstract-provider"

import { BACKEND_URL } from "@/constants"
import { http } from "./common"
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
  const data = await response.json()
  if (response.status !== 200) {
    throw new Error(data.message)
  } else {
    return data
  }
}

interface Signature {
  v: number;
  r: string;
  s: string;
}

export async function getSignature(
  authToken: string,
  postId: string,
): Promise<Signature> {
  const url = `${BACKEND_URL}/api/v1/statuses/${postId}/signature`
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

export async function getContractAbi(contractName: string): Promise<any> {
  // TODO: take artifact URL from instance config
  const url = `${BACKEND_URL}/contracts/${contractName}.json`
  const response = await http(url, {
    method: "GET",
  })
  const data = await response.json()
  return data.abi
}

export interface TokenMetadata {
  name: string;
  description: string;
  image: string;
  external_url: string;
}

export async function mintToken(
  contractName: string,
  contractAddress: string,
  ownerAddress: string,
  tokenUri: string,
  serverSignature: Signature,
  signer: Signer,
): Promise<TransactionResponse> {
  const Minter = await getContractAbi(contractName)
  const minter = new Contract(contractAddress, Minter, signer)
  const transaction = await minter.mint(
    ownerAddress,
    tokenUri,
    serverSignature.v,
    "0x" + serverSignature.r,
    "0x" + serverSignature.s,
  )
  return transaction
}

export async function getTokenMetadata(url: string): Promise<TokenMetadata> {
  const response = await http(url, {
    method: "GET",
    credentials: "omit",
  })
  return await response.json()
}
