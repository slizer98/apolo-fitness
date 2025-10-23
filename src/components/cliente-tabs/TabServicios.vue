<template>
  <div class="rounded-2xl border border-[#e6e9ef] bg-white">
    <div class="px-4 sm:px-5 py-4 border-b border-[#e6e9ef] flex items-center justify-between">
      <h3 class="font-semibold">Historial de servicios</h3>
      <button class="h-9 px-3 rounded-xl border border-[#e6e9ef] hover:bg-[#f5f7fa] text-[14px]">Exportar</button>
    </div>

    <div class="p-4 sm:p-5">
      <!-- Buscador -->
      <div class="mb-3 flex items-center gap-2 rounded-xl border border-[#e6e9ef] px-3 py-2 bg-[#fafbfe]">
        <i class="fa fa-magnifying-glass text-[#667]"></i>
        <input v-model="q" type="text" placeholder="Buscar registro" class="flex-1 outline-none bg-transparent text-[14px]">
      </div>

      <!-- Tabla -->
      <div class="overflow-x-auto rounded-xl border border-[#e6e9ef]">
        <table class="min-w-full text-[14px]">
          <thead class="bg-[#f5f7fb] text-[#445]">
            <tr>
              <th class="px-4 py-2 text-left">Servicio</th>
              <th class="px-4 py-2 text-left">Descripción</th>
              <th class="px-4 py-2 text-left">Inicio</th>
              <th class="px-4 py-2 text-left">Fin</th>
              <th class="px-4 py-2 text-left">Estatus</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading" v-for="i in 5" :key="'skeleton-'+i" class="odd:bg-white even:bg-[#fafbfe]">
              <td class="px-4 py-3" colspan="5">
                <div class="h-4 bg-[#eef2f7] rounded animate-pulse"></div>
              </td>
            </tr>

            <tr v-for="row in filtered" :key="row.id" class="odd:bg-white even:bg-[#fafbfe]">
              <td class="px-4 py-3 font-medium text-[#1a1a1a]">{{ row.servicio }}</td>
              <td class="px-4 py-3 text-[#556]">{{ row.descripcion || '—' }}</td>
              <td class="px-4 py-3">{{ fmt(row.inicio) }}</td>
              <td class="px-4 py-3">{{ fmt(row.fin) }}</td>
              <td class="px-4 py-3">
                <span
                  class="text-[12px] px-2 py-1 rounded-md border"
                  :class="row.estatus === 'Activo'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : (row.estatus === 'Vencido'
                        ? 'border-rose-200 bg-rose-50 text-rose-700'
                        : 'border-[#e6e9ef] bg-[#fafbfe] text-[#445]')">
                  {{ row.estatus }}
                </span>
              </td>
            </tr>

            <tr v-if="!loading && !filtered.length">
              <td colspan="5" class="px-4 py-8 text-center text-[#667]">Sin servicios para mostrar.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- paginación dummy -->
      <div class="text-right text-[12px] text-[#667] mt-2">« 1 2 3 4 … 99 »</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
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
    (r.servicio || '').toLowerCase().includes(s) ||
    (r.descripcion || '').toLowerCase().includes(s)
  )
})

function fmt(d){
  if(!d) return '—'
  try { return new Date(d).toLocaleDateString('es-MX') } catch { return d }
}

async function loadServiciosCliente(){
  loading.value = true
  try {
    // 1) Última alta del cliente → plan_id + vigencia
    const altasRes = await api.altasPlan.list({
      cliente: props.clienteId,
      ordering: '-fecha_alta',
      page_size: 1
    })
    const alta = (altasRes.data?.results || altasRes.data || [])[0] || null

    if (!alta?.plan) { rows.value = []; return }

    // 2) Servicios del plan (endpoint exige ?plan=ID)
    const servRes = await api.planesServicios.list({ plan: alta.plan, page_size: 500 })
    const list = servRes.data?.results || servRes.data || []

    const hoy = new Date()
    const fin = alta.fecha_vencimiento ? new Date(alta.fecha_vencimiento) : null

    rows.value = list.map(ps => {
      const s = ps.servicio_nombre || ps.servicio?.nombre || ps?.servicio_nome || ps?.servicio || 'Servicio'
      // estatus en función de la vigencia del alta:
      let estatus = 'Activo'
      if (fin && hoy > fin) estatus = 'Vencido'
      if (ps?.is_active === false) estatus = 'Cancelado'

      return {
        id: ps.id,
        servicio: s,
        descripcion: ps.servicio_descripcion || ps?.servicio?.descripcion || '',
        inicio: alta.fecha_alta || null,
        fin: alta.fecha_vencimiento || null,
        estatus
      }
    })
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await ws.ensureEmpresaSet()
  await loadServiciosCliente()
})

watch(() => props.clienteId, () => loadServiciosCliente())
</script>
