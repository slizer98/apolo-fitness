<template>
  <div class="fixed bottom-4 right-4 z-[70] space-y-2 w-[min(92vw,360px)]">
    <transition-group name="toast">
      <div v-for="t in ui.toasts" :key="t.id"
           class="rounded-xl border p-3 shadow-lg flex items-start gap-3"
           :class="wrpClass(t)">
        <div class="shrink-0 mt-0.5">
          <span v-if="t.type==='success'">✅</span>
          <span v-else-if="t.type==='error'">❌</span>
          <span v-else-if="t.type==='warning'">⚠️</span>
          <span v-else>ℹ️</span>
        </div>
        <div class="flex-1">
          <div class="font-medium">{{ t.title }}</div>
          <p v-if="t.message" class="text-sm opacity-90">{{ t.message }}</p>
        </div>
        <button class="text-white/70 hover:text-white" @click="ui.removeToast(t.id)">✕</button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { useUiStore } from '@/stores/ui'
const ui = useUiStore()
function wrpClass(t){
  if(t.type==='success') return 'bg-green-600/20 border-green-600/40 text-green-100'
  if(t.type==='error')   return 'bg-red-600/20 border-red-600/40 text-red-100'
  if(t.type==='warning') return 'bg-yellow-600/20 border-yellow-600/40 text-yellow-100'
  return 'bg-gray-700/30 border-gray-600/40 text-gray-100'
}
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all .18s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(6px); }
</style>
