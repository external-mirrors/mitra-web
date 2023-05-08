import { RouteLocationRaw } from "vue-router"

import { Profile } from "@/api/users"

interface SubscriptionOption {
  type: "ethereum" | "monero",
  location: string | RouteLocationRaw,
}

export function useSubscribe() {
  function getSubscriptionOption(profile: Profile): SubscriptionOption | null {
    for (const option of profile.payment_options) {
      if (
        option.type === "link" &&
        (option.name === "EthereumSubscription" || option.name === "MoneroSubscription") &&
        option.href
      ) {
        return {
          type: option.name === "EthereumSubscription" ? "ethereum" : "monero",
          location: option.href,
        }
      } else if (
        option.type === "ethereum-subscription" ||
        option.type === "monero-subscription"
      ) {
        return {
          type: option.type === "ethereum-subscription" ? "ethereum" : "monero",
          location: {
            name: "profile-by-acct-subscription",
            params: { acct: profile.acct },
          },
        }
      }
    }
    return null
  }

  return {
    getSubscriptionOption,
  }
}
