import { RouteLocationRaw } from "vue-router"

import { Profile, ProfilePaymentOption } from "@/api/users"
import { useActorHandle } from "@/composables/handle"
import { useInstanceInfo } from "@/composables/instance"
import { useCurrentUser } from "@/composables/user"

interface SubscriptionLink {
  type: "monero",
  location: string | RouteLocationRaw,
}

export function useSubscribe() {
  const { getActorLocation } = useActorHandle()
  const { getBlockchainInfo } = useInstanceInfo()
  const { currentUser } = useCurrentUser()

  function getSubscriptionLink(profile: Profile): SubscriptionLink | null {
    for (const option of profile.payment_options) {
      if (
        option.type === "link" &&
        option.name === "MoneroSubscription" &&
        option.href
      ) {
        // "MoneroSubscription" indicates a pre-FEP-0837 payment link
        return {
          type: "monero",
          location: option.href,
        }
      } else if (option.type === "monero-subscription") {
        const blockchain = getBlockchainInfo()
        if (!option.object_id && !blockchain?.features.subscriptions) {
          // Local subscription option, but subscription feature is disabled
          continue
        }
        let location
        if (currentUser.value === null && option.object_id) {
          // Remote profile / option, viewing as a guest
          location = option.object_id
        } else {
          location = getActorLocation("profile-subscription", profile)
        }
        return {
          type: "monero",
          location,
        }
      }
    }
    return null
  }

  function getSubscriptionProposal(
    profile: Profile,
  ): ProfilePaymentOption | null {
    // Use first option if there are many
    const option = profile.payment_options.find((option) => {
      return option.type === "monero-subscription"
    }) || null
    return option
  }

  return {
    getSubscriptionLink,
    getSubscriptionProposal,
  }
}
