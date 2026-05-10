import { BACKEND_URL } from "@/constants"
import { handleResponse, http } from "./common"
import { AuthenticationMethod } from "./oauth"
import { Profile } from "./users"

interface Features {
  subscriptions: boolean;
}

export interface MoneroChainMetadata {
  description: string | null,
  payment_amount_min: number,
}

export interface BlockchainInfo {
  chain_id: string;
  chain_metadata: { [prop: string]: any } | null;
  features: Features;
}

export interface InstanceInfo {
  domain: string,
  title: string;
  description: string,
  extended_description: string,
  version: string;
  registrations: {
    enabled: boolean,
  },
  configuration: {
    accounts: {
      max_profile_fields: number,
    },
    statuses: {
      max_characters: number,
      max_media_attachments: number,
    },
    media_attachments: {
      supported_mime_types: string[],
    },
    timelines_access: {
      live_feeds: {
        local: string,
        remote: string,
      },
    },
  },
  contact: {
    account: Profile | null,
  },
  authentication_methods: AuthenticationMethod[],
  login_message: string;
  like_emoji?: string,
  blockchains: BlockchainInfo[];
  ipfs_gateway_url: string | null;
}

export async function getInstanceInfo(): Promise<InstanceInfo> {
  const url = `${BACKEND_URL}/api/v2/instance`
  const response = await http(url)
  const data = await handleResponse(response)
  return data
}
