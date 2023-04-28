<template>
  <div class="crypto-address">
    <input type="text" :value="address" readonly>
    <button class="copy-btn" title="Copy address" @click="copyAddress()">
      <img src="@/assets/forkawesome/files-o.svg">
    </button>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable-next-line no-undef */
const props = defineProps<{
  address: string,
}>()

function copyAddress() {
  navigator.clipboard.writeText(props.address)
}
</script>

<style scoped lang="scss">
@import "../styles/layout";

.crypto-address {
  background-color: var(--widget-background-color);
  border-radius: 10px;
  display: flex;

  input {
    background-color: inherit;
    border: none;
    border-radius: 10px 0 0 10px;
    color: var(--text-color);
    font-family: monospace;
    font-size: 12px;
    line-height: 20px;
    max-width: 200px;
    padding: 0 7px;
    width: 100%;
  }

  .copy-btn {
    border-radius: 0 10px 10px 0;
    height: $icon-size;
    min-width: $icon-size;
    padding: 3px 7px 3px 0;
    width: $icon-size;

    img {
      filter: var(--link-colorizer);
      height: 100%;
      object-fit: contain;
      width: 100%;
    }

    &:hover img {
      filter: var(--link-hover-colorizer);
    }
  }
}
</style>
