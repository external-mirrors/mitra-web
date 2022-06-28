import { Contract, Signer } from "ethers"

import { BACKEND_URL } from "@/constants"
import { http } from "./common"

export enum Contracts {
  Minter = "IMinter",
  SubscriptionAdapter = "ISubscriptionAdapter",
  Subscription = "ISubscription",
  ERC20 = "IERC20Metadata",
}

async function getContractAbi(contractName: string): Promise<any> {
  const url = `${BACKEND_URL}/contracts/${contractName}.json`
  const response = await http(url, {
    method: "GET",
  })
  const data = await response.json()
  return data.abi
}

export async function getContract(
  contractName: string,
  contractAddress: string,
  signer: Signer,
): Promise<Contract> {
  const Abi = await getContractAbi(contractName)
  const contract = new Contract(contractAddress, Abi, signer)
  return contract
}
