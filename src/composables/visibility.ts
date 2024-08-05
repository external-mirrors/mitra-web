import { useI18n } from "vue-i18n"

import { Visibility } from "@/api/posts"

export function useVisibility() {
  const { t } = useI18n({ useScope: "global" })

  const VISIBILITY_MAP = {
    [Visibility.Public]: t("post.visibility_public"),
    [Visibility.Followers]: t("post.visibility_followers"),
    [Visibility.Subscribers]: t("post.visibility_subscribers"),
    [Visibility.Direct]: t("post.visibility_direct"),
  }

  return {
    VISIBILITY_MAP,
  }
}
