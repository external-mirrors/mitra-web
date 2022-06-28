import { BACKEND_URL } from "@/constants"
import { http } from "./common"

interface ContractFeatures {
  minter: boolean;
  subscription: boolean;
}

interface ChainInfo {
  chain_name: string;
  public_api_url: string;
  currency_name: string;
  currency_symbol: string;
  currency_decimals: string;
}

export interface InstanceInfo {
  uri: string;
  title: string;
  short_description: string;
  description: string;
  registrations: boolean;
  login_message: string;
  post_character_limit: number;
  blockchain_id: string | null;
  blockchain_explorer_url: string | null;
  blockchain_contract_address: string | null;
  blockchain_features: ContractFeatures | null;
  blockchain_info: ChainInfo | null;
  ipfs_gateway_url: string | null;
}

export async function getInstanceInfo(): Promise<InstanceInfo> {
  const url = `${BACKEND_URL}/api/v1/instance`
  const response = await http(url)
  const data = await response.json()
  return data
}
