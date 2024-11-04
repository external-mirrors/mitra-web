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
        // TODO: Followers by default
        return [
          Visibility.Direct,
          Visibility.Followers,
        ]
      } else {
        return [Visibility.Direct]
      }
    case Visibility.Subscribers:
      return [Visibility.Direct]
    case Visibility.Direct:
      return [Visibility.Direct]
  }
}

export function useVisibility() {
  const { t } = useI18n({ useScope: "global" })

  const VISIBILITY_MAP = {
    [Visibility.Public]: t("post.visibility_public"),
    [Visibility.Followers]: t("post.visibility_followers"),
    [Visibility.Subscribers]: t("post.visibility_subscribers"),
    [Visibility.Direct]: t("post.visibility_direct"),
  }

  return {
    getVisibilityOptions,
    VISIBILITY_MAP,
  }
}
