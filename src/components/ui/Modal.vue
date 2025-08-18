<template>
  <transition name="fade">
    <div v-if="open" class="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="$emit('close')"></div>
      <div class="relative w-full max-w-lg rounded-2xl border border-gray-800 bg-gray-950 shadow-2xl">
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <h3 class="text-white text-lg font-medium">{{ title }}</h3>
          <button class="text-gray-400 hover:text-white" @click="$emit('close')">✕</button>
        </div>
        <div class="p-4 text-gray-200">
          <slot />
        </div>
        <div v-if="$slots.footer" class="px-4 py-3 border-t border-gray-800 bg-black/40 rounded-b-2xl">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '' },
})
defineEmits(['close'])
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
