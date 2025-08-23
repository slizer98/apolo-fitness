<template>
  <section class="rounded-2xl bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 shadow-xl p-4">
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-lg font-medium">Entradas del día</h2>
      <span class="text-xs text-gray-400">{{ fechaLabel }}</span>
    </div>

    <div v-if="loading" class="grid gap-2">
      <div class="animate-pulse h-8 bg-gray-800/60 rounded" v-for="i in 6" :key="i"></div>
    </div>

    <div v-else>
      <table class="w-full text-sm">
        <thead class="text-gray-400">
          <tr>
            <th class="text-left font-normal pb-2">Hora</th>
            <th class="text-left font-normal pb-2">Cliente</th>
            <th class="text-left font-normal pb-2">Sucursal</th>
            <th class="text-left font-normal pb-2">Tipo</th>
            <th class="text-left font-normal pb-2">Puerta</th>
            <th class="text-left font-normal pb-2">Temp</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="a in accesos" :key="a.id" class="border-t border-gray-800/80 hover:bg-gray-900/40">
            <td class="py-2">{{ formatHora(a.fecha) }}</td>
            <td class="py-2">{{ a.cliente_nombre || a.cliente || '—' }}</td>
            <td class="py-2 text-gray-300">{{ a.sucursal_nombre || a.sucursal || '—' }}</td>
            <td class="py-2 text-gray-300">{{ a.tipo_acceso || '—' }}</td>
            <td class="py-2 text-gray-300">{{ a.puerta || '—' }}</td>
            <td class="py-2 text-gray-300">{{ a.temperatura ?? '—' }}</td>
          </tr>
          <tr v-if="!accesos.length">
            <td colspan="6" class="py-6 text-center text-gray-400">Sin accesos registrados hoy</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/api/services'

const loading = ref(true)
const accesos = ref([])

const hoy = new Date()
const yyyy = hoy.getFullYear()
const mm = String(hoy.getMonth()+1).padStart(2, '0')
const dd = String(hoy.getDate()).padStart(2, '0')
const fechaISO = `${yyyy}-${mm}-${dd}`

const fechaLabel = computed(() => new Date(fechaISO).toLocaleDateString('es-MX'))

onMounted(fetchAccesos)

async function fetchAccesos() {
  loading.value = true
  try {
    // Si tu API acepta ?fecha=YYYY-MM-DD úsalo; si no, usa ordering por -fecha con page_size
    const params = { fecha: fechaISO, ordering: '-fecha', page_size: 12 }
    const { data } = await api.accesos.list(params)
    accesos.value = data?.results || data || []
  } catch {
    accesos.value = []
  } finally {
    loading.value = false
  }
}

function formatHora(dt) {
  try {
    const d = new Date(dt)
    return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
  } catch { return '—' }
}
</script>
