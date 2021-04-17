<template>
  <div class="crypto-address">
    <input :value="address" readonly>
    <button class="copy-btn" title="Copy address" @click="copyAddress()">
      <img :src="require('@/assets/forkawesome/files-o.svg')">
    </button>
  </div>
</template>

<script lang="ts">
import { Vue } from "vue-class-component"
import { Prop } from "vue-property-decorator"

export default class CryptoAddress extends Vue {

  @Prop()
  address!: string

  copyAddress() {
    navigator.clipboard.writeText(this.address)
  }

}
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/theme";

.crypto-address {
  background-color: #eee;
  border-radius: 10px;
  display: flex;

  input {
    background-color: inherit;
    border: none;
    border-radius: 10px 0 0 10px;
    color: $text-color;
    font-family: monospace;
    font-size: 12px;
    line-height: 20px;
    max-width: 200px;
    padding: 0 7px;
    width: 100%;
  }

  .copy-btn {
    border: none;
    border-radius: 0 10px 10px 0;
    cursor: pointer;
    height: $icon-size;
    min-width: $icon-size;
    padding: 3px 7px 3px 0;
    width: $icon-size;

    img {
      filter: $link-colorizer;
      height: 100%;
    }

    &:hover img {
      filter: $link-hover-colorizer;
    }
  }
}
</style>
