import { useI18n } from "vue-i18n"

import { Post, Visibility } from "@/api/posts"
import { User } from "@/api/users"

function getVisibilityOptions(author: User, inReplyTo: Post | null): Visibility[] {
  if (inReplyTo === null) {
    return [
      Visibility.Public,
      Visibility.Followers,
      Visibility.Subscribers,
      Visibility.Direct,
    ]
  }
  switch (inReplyTo.visibility) {
    case Visibility.Public:
      return [
        Visibility.Public,
        Visibility.Followers,
        Visibility.Subscribers,
        Visibility.Direct,
      ]
    case Visibility.Followers:
      if (author.id === inReplyTo.account.id) {
        return [
          Visibility.Followers,
          Visibility.Direct,
        ]
      } else {
        // TODO: conversation by default
        return [
          Visibility.Direct,
          Visibility.Conversation,
        ]
      }
    case Visibility.Subscribers:
      return [Visibility.Direct]
    case Visibility.Conversation:
      return [Visibility.Direct]
    case Visibility.Direct:
      return [Visibility.Direct]
  }
}

export function useVisibility() {
  const { t } = useI18n({ useScope: "global" })

  const VISIBILITY_MAP: { [name in Visibility]: { name: string, description: string } } = {
    [Visibility.Public]: {
      name: t("post.visibility.public"),
      description: t("post.visibility_description.visible_to_everyone"),
    },
    [Visibility.Followers]: {
      name: t("post.visibility.followers"),
      description: t("post.visibility_description.visible_to_followers"),
    },
    [Visibility.Subscribers]: {
      name: t("post.visibility.subscribers"),
      description: t("post.visibility_description.visible_to_premium_subscribers"),
    },
    [Visibility.Conversation]: {
      name: t("post.visibility.conversation"),
      description: t("post.visibility_description.visible_to_people_chosen_by_conversation_owner"),
    },
    [Visibility.Direct]: {
      name: t("post.visibility.direct"),
      description: t("post.visibility_description.visible_to_mentioned_users"),
    },
  }

  return {
    getVisibilityOptions,
    VISIBILITY_MAP,
  }
}
