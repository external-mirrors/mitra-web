<template>
  <sidebar-layout>
    <template #content>
      <h1>
        {{ $t('explore.explore') }}
      </h1>
      <div class="feed-list">
        <link-block
          :to="{ name: 'local' }"
          :title="$t('navigation.local')"
        >
          <template #icon>
            <icon-community></icon-community>
          </template>
        </link-block>
        <link-block
          v-if="canViewFederatedTimeline()"
          :to="{ name: 'known-network' }"
          :title="$t('navigation.federated')"
        >
          <template #icon>
            <icon-globe></icon-globe>
          </template>
        </link-block>
        <link-block
          :to="{ name: 'custom-feed-list' }"
          :title="$t('custom_feeds.custom_feeds')"
        >
          <template #icon>
            <icon-list></icon-list>
          </template>
        </link-block>
        <link-block
          :to="{ name: 'profile-directory' }"
          :title="$t('navigation.profile_directory')"
        >
          <template #icon>
            <icon-users></icon-users>
          </template>
        </link-block>
        <link-block
          :to="{ name: 'group-list', params: { tabName: 'following' } }"
          :title="$t('groups.groups')"
        >
          <template #icon>
            <icon-bubble></icon-bubble>
          </template>
        </link-block>
      </div>
    </template>
  </sidebar-layout>
</template>

<script setup lang="ts">
import { onMounted } from "vue"
import { useI18n } from "vue-i18n"

import IconCommunity from "@/assets/tabler/building-community.svg?component"
import IconGlobe from "@/assets/feather/globe.svg?component"
import IconList from "@/assets/feather/list.svg?component"
import IconUsers from "@/assets/feather/users.svg?component"
import IconBubble from "@/assets/tabler/chart-bubble.svg?component"
import LinkBlock from "@/components/LinkBlock.vue"
import SidebarLayout from "@/components/SidebarLayout.vue"
import { useGuards } from "@/composables/guards"
import { useTitle } from "@/composables/title"

const { t } = useI18n({ useScope: "global" })
const { canViewFederatedTimeline } = useGuards()
const { setPageTitle } = useTitle()

onMounted(async () => {
  setPageTitle(t("explore.explore"))
})
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/mixins";
@import "../styles/theme";

.feed-list {
  display: flex;
  flex-direction: column;
  gap: $block-outer-padding;

  &:not(:last-child) {
    margin-bottom: $block-outer-padding;
  }
}
</style>
