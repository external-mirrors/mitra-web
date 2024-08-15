<template>
  <sidebar-layout>
    <template #content>
      <h1>
        {{ $t('admin.administration') }}
      </h1>
      <div class="page-list">
        <router-link
            class="page"
            :to="{ name: 'admin-users' }"
          >
          <span class="icon">
            <icon-users></icon-users>
          </span>
          <span class="page-name">
            {{ $t('admin.users.users') }}
          </span>
          <span class="icon">
             <icon-arrow-right></icon-arrow-right>
          </span>
        </router-link>
      </div>
    </template>
  </sidebar-layout>
</template>

<script setup lang="ts">
import { onMounted } from "vue"
import { useI18n } from "vue-i18n"

import IconArrowRight from "@/assets/feather/arrow-right.svg?component"
import IconUsers from "@/assets/feather/users.svg?component"
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
@import "../styles/mixins";
@import "../styles/theme";

.page-list {
  display: flex;
  flex-direction: column;
  gap: $block-outer-padding;
}

.page {
  @include content-link-icon;

  align-items: center;
  background-color: var(--block-background-color);
  border-radius: $block-border-radius;
  display: flex;
  gap: $block-inner-padding;
  padding: $block-inner-padding;

  .page-name {
    flex-grow: 1;
  }
}
</style>
