import { BACKEND_URL } from "@/constants"
import { http } from "./common"

interface Features {
  minter: boolean;
  subscriptions: boolean;
}

interface ChainMetadata {
  chain_name: string;
  currency_name: string;
  currency_symbol: string;
  currency_decimals: number;
  public_api_url: string;
  explorer_url: string | null;
}

interface BlockchainInfo {
  chain_id: string;
  chain_metadata: ChainMetadata | null;
  contract_address: string | null;
  features: Features;
}

export interface InstanceInfo {
  uri: string;
  title: string;
  short_description: string;
  description: string;
  registrations: boolean;
  login_message: string;
  post_character_limit: number;
  blockchains: BlockchainInfo[];
  ipfs_gateway_url: string | null;
}

export async function getInstanceInfo(): Promise<InstanceInfo> {
  const url = `${BACKEND_URL}/api/v1/instance`
  const response = await http(url)
  const data = await response.json()
  return data
}
