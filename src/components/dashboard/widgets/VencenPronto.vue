<template>
  <section>
    <div class="rounded-2xl bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 shadow-xl p-4">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-lg font-medium">Membresías por vencer</h2>
        <span class="text-xs text-gray-400">Próximos 7 días</span>
      </div>
      <div v-if="loading" class="grid gap-2">
        <div v-for="i in 5" :key="i" class="animate-pulse h-8 bg-gray-800/60 rounded"></div>
      </div>
      <div v-else>
        <table class="w-full text-sm">
          <thead class="text-gray-400">
            <tr>
              <th class="text-left font-normal pb-2">Cliente</th>
              <th class="text-left font-normal pb-2">Plan</th>
              <th class="text-left font-normal pb-2">Vence</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in rows" :key="r.id" class="border-t border-gray-800/80 hover:bg-gray-900/40">
              <td class="py-2">{{ r.cliente }}</td>
              <td class="py-2 text-gray-300">{{ r.plan }}</td>
              <td class="py-2 text-gray-300">{{ r.vence }}</td>
            </tr>
            <tr v-if="!rows.length">
              <td colspan="3" class="py-6 text-center text-gray-400">Sin vencimientos próximos</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
// TODO: cuando tengas endpoint real de membresías/altas, consumirlo aquí
const loading = ref(true)
const rows = ref([])

onMounted(async () => {
  loading.value = false
  rows.value = [] // de momento vacío
})
</script>
