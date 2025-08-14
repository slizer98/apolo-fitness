<template>
  <div class="rounded-2xl bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 shadow-xl p-4">
    <div class="flex items-center justify-between">
      <h3 class="text-sm text-gray-300">{{ title }}</h3>
      <i :class="['fa', icon, 'opacity-70']"></i>
    </div>
    <div class="mt-3 text-2xl font-semibold">{{ loading ? '…' : value }}</div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: { type: String, required: true },
  value: { type: [String, Number], default: 0 },
  loading: { type: Boolean, default: false },
  icon: { type: String, default: 'fa-circle-info' }, // Font Awesome class (sin el 'fa-' inicial de estilo sólido/regular)
})
</script>
