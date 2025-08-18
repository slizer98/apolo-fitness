<template>
  <Modal :open="ui.confirmState.open" :title="ui.confirmState.title" @close="onCancel">
    <p class="text-gray-300 leading-6">{{ ui.confirmState.message }}</p>
    <template #footer>
      <div class="flex items-center justify-end gap-2">
        <button class="px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/60 hover:bg-gray-700"
                @click="onCancel">
          {{ ui.confirmState.cancelText }}
        </button>
        <button :class="[
                  'px-4 py-2 rounded-lg text-black font-medium',
                  ui.confirmState.variant==='danger'
                    ? 'bg-red-500 hover:bg-red-400'
                    : 'bg-apolo-primary hover:bg-apolo-secondary'
                ]"
                @click="onConfirm">
          {{ ui.confirmState.confirmText }}
        </button>
      </div>
    </template>
  </Modal>
</template>

<script setup>
import { useUiStore } from '@/stores/ui'
import Modal from './Modal.vue'

const ui = useUiStore()
function onCancel(){ ui.resolveConfirm(false) }
function onConfirm(){ ui.resolveConfirm(true) }
</script>
