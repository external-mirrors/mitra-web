import { BACKEND_URL } from "@/constants"
import { http } from "./common"

export interface InstanceInfo {
  uri: string;
  title: string;
  short_description: string;
  description: string;
  registrations: boolean;
  login_message: string;
  blockchain_explorer_url: string | null;
  blockchain_contract_name: string | null;
  blockchain_contract_address: string | null;
  ipfs_gateway_url: string | null;
}

export async function getInstanceInfo(): Promise<InstanceInfo> {
  const url = `${BACKEND_URL}/api/v1/instance`
  const response = await http(url)
  const data = await response.json()
  return data
}
