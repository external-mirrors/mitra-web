<template>
  <dialog
    ref="dialogElement"
    @close="closeDialog()"
  >
    <form method="dialog">
      <slot></slot>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue"

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (event: "close"): void,
}>()

const dialogElement = ref<HTMLDialogElement>()

function showDialog() {
  dialogElement.value?.showModal()
}

function closeDialog() {
  dialogElement.value?.close()
  emit("close")
}

watch(props, () => {
  if (props.open) {
    showDialog()
  } else {
    closeDialog()
  }
})
</script>

<style scoped lang="scss">
@import "../styles/layout";

dialog {
  background-color: var(--background-color);
  border: 1px solid var(--separator-color);
  border-radius: $block-border-radius;
  box-shadow: $menu-shadow-size var(--shadow-color);
  color: var(--text-color);
  text-align: center;

  &::backdrop {
    background: rgba(0, 0, 0, 0.33);
  }

  form {
    display: flex;
    flex-direction: column;
    gap: $block-inner-padding;
  }
}
</style>
