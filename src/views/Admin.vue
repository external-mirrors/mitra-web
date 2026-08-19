<template>
  <sidebar-layout>
    <template #content>
      <h1>
        {{ $t('admin.administration') }}
      </h1>
      <div class="page-list">
        <link-block
          :to="{ name: 'admin-users' }"
          :title="$t('admin.users.users')"
        >
          <template #icon>
            <icon-users></icon-users>
          </template>
        </link-block>
      </div>
    </template>
  </sidebar-layout>
</template>

<script setup lang="ts">
import { onMounted } from "vue"
import { useI18n } from "vue-i18n"

import IconUsers from "@/assets/feather/users.svg?component"
import LinkBlock from "@/components/LinkBlock.vue"
import SidebarLayout from "@/components/SidebarLayout.vue"
import { useTitle } from "@/composables/title"

const { t } = useI18n({ useScope: "global" })
const { setPageTitle } = useTitle()

onMounted(async () => {
  setPageTitle(t("admin.administration"))
})
</script>

<style scoped lang="scss">
@import "../styles/layout";

.page-list {
  display: flex;
  flex-direction: column;
  gap: $block-outer-padding;
}
</style>
