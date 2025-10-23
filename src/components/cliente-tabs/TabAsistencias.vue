<template>
  <div class="rounded-2xl border border-[#e6e9ef] bg-white">
    <div class="px-4 sm:px-5 py-4 border-b border-[#e6e9ef] flex items-center justify-between">
      <h3 class="font-semibold">Historial de asistencias</h3>
      <button class="h-9 px-3 rounded-xl border border-[#e6e9ef] hover:bg-[#f5f7fa] text-[14px]">Exportar</button>
    </div>

    <div class="p-4 sm:p-5">
      <div class="mb-3 flex items-center gap-2 rounded-xl border border-[#e6e9ef] px-3 py-2 bg-[#fafbfe]">
        <i class="fa fa-magnifying-glass text-[#667]"></i>
        <input v-model="q" type="text" placeholder="Buscar registro" class="flex-1 outline-none bg-transparent text-[14px]">
      </div>

      <div class="overflow-x-auto rounded-xl border border-[#e6e9ef]">
        <table class="min-w-full text-[14px]">
          <thead class="bg-[#f5f7fb] text-[#445]">
            <tr>
              <th class="px-4 py-2 text-left">Fecha</th>
              <th class="px-4 py-2 text-left">Sede</th>
              <th class="px-4 py-2 text-left">Área</th>
              <th class="px-4 py-2 text-left">Check-in</th>
              <th class="px-4 py-2 text-left">Check-out</th>
              <th class="px-4 py-2 text-left">Duración</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading" v-for="i in 5" :key="'skeleton-a-'+i" class="odd:bg-white even:bg-[#fafbfe]">
              <td class="px-4 py-3" colspan="6"><div class="h-4 bg-[#eef2f7] rounded animate-pulse" /></td>
            </tr>

            <tr v-for="r in filtered" :key="r.id" class="odd:bg-white even:bg-[#fafbfe]">
              <td class="px-4 py-3">{{ fmtFecha(r.fecha) }}</td>
              <td class="px-4 py-3">{{ r.sede || '—' }}</td>
              <td class="px-4 py-3">{{ r.area || '—' }}</td>
              <td class="px-4 py-3">{{ r.hora_in || 'N.D.' }}</td>
              <td class="px-4 py-3">{{ r.hora_out || 'N.D.' }}</td>
              <td class="px-4 py-3">{{ r.duracion || 'N.D.' }}</td>
            </tr>

            <tr v-if="!loading && !filtered.length">
              <td colspan="6" class="px-4 py-8 text-center text-[#667]">No hay datos aún.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="text-right text-[12px] text-[#667] mt-2">« 1 2 3 4 … 99 »</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/api/services'
import { useWorkspaceStore } from '@/stores/workspace'

const props = defineProps({
  clienteId: { type: [String, Number], required: true }
})

const ws = useWorkspaceStore()
const loading = ref(true)
const q = ref('')
const rows = ref([])

const filtered = computed(() => {
  const s = (q.value || '').toLowerCase().trim()
  if (!s) return rows.value
  return rows.value.filter(r =>
    (r.sede || '').toLowerCase().includes(s) ||
    (r.area || '').toLowerCase().includes(s)
  )
})

function fmtFecha(iso){ try{ return new Date(iso).toLocaleDateString('es-MX', { day:'2-digit', month:'short', year:'numeric'}) } catch { return iso || '—' } }

async function load(){
  loading.value = true
  try{
    await ws.ensureEmpresaSet()
    // Cuando tengas datos reales de accesos, descomenta esto:
    // const { data } = await api.accesos.list({ cliente: props.clienteId, page_size: 200, ordering: '-fecha' })
    // rows.value = (data?.results || data || []).map(a => ({
    //   id: a.id,
    //   fecha: a.fecha,
    //   sede: a.sucursal_nombre || '—',
    //   area: a.area || 'Peso libre',
    //   hora_in: a.hora_entrada || null,
    //   hora_out: a.hora_salida || null,
    //   duracion: a.duracion || null
    // }))
    rows.value = [] // placeholder sin romper UI
  } finally { loading.value = false }
}

onMounted(load)
</script>
