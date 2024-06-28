<template>
  <div
    class="qr-wrapper"
    v-if="qrSvg"
    v-html="qrSvg"
    :title="url"
  ></div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import QRCode from "qrcode"

const props = defineProps<{
  url: string,
}>()

const qrSvg = ref<string | null>(null)

onMounted(async () => {
  qrSvg.value = await QRCode.toString(props.url, { type: "svg" })
})
</script>

<style scoped lang="scss">
:deep(svg) {
  width: 100%;
}
</style>
