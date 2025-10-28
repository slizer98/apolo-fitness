<template>
  <div class="rounded-2xl bg-white border border-gray-200 shadow-sm">
    <!-- Encabezado -->
    <div class="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
      <h3 class="font-semibold">Historial de asistencias</h3>
      <button
        class="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm"
        @click="exportCsv"
      >
        Exportar
      </button>
    </div>

    <!-- Buscador + filtros -->
    <div class="px-4 py-3 border-b border-gray-100">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <div class="relative flex-1">
          <i class="fa fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input
            v-model="q"
            type="text"
            class="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 placeholder-gray-400"
            placeholder="Buscar por sede o área…"
            @keyup.enter="applyFilters"
          />
        </div>
        <div class="flex items-center gap-2">
          <input
            v-model="range.start"
            type="date"
            class="px-2 py-2 rounded-lg border border-gray-300 text-sm"
            :max="range.end || undefined"
          />
          <span class="text-gray-500 text-sm">a</span>
          <input
            v-model="range.end"
            type="date"
            class="px-2 py-2 rounded-lg border border-gray-300 text-sm"
            :min="range.start || undefined"
          />
          <button
            class="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm"
            @click="applyFilters"
          >
            Filtrar
          </button>
          <button
            class="px-3 py-2 rounded-lg border border-transparent hover:bg-gray-50 text-sm text-gray-600"
            @click="clearFilters"
          >
            Limpiar
          </button>
        </div>
      </div>
    </div>

    <!-- Tabla -->
    <div class="overflow-x-auto">
      <table class="min-w-full text-sm">
        <thead>
          <tr class="bg-gray-100 text-gray-700">
            <th class="text-left px-4 py-2">Fecha</th>
            <th class="text-left px-4 py-2">Sede</th>
            <th class="text-left px-4 py-2">Área</th>
            <th class="text-left px-4 py-2">Check-in</th>
            <th class="text-left px-4 py-2">Check-out</th>
            <th class="text-left px-4 py-2">Duración</th>
          </tr>
        </thead>

        <!-- Skeleton -->
        <tbody v-if="loading">
          <tr v-for="i in 8" :key="'sk'+i" class="odd:bg-white even:bg-gray-50">
            <td class="px-4 py-3"><div class="h-4 w-28 bg-gray-200 rounded animate-pulse"></div></td>
            <td class="px-4 py-3"><div class="h-4 w-56 bg-gray-200 rounded animate-pulse"></div></td>
            <td class="px-4 py-3"><div class="h-4 w-20 bg-gray-200 rounded animate-pulse"></div></td>
            <td class="px-4 py-3"><div class="h-4 w-20 bg-gray-200 rounded animate-pulse"></div></td>
            <td class="px-4 py-3"><div class="h-4 w-20 bg-gray-200 rounded animate-pulse"></div></td>
            <td class="px-4 py-3"><div class="h-4 w-24 bg-gray-200 rounded animate-pulse"></div></td>
          </tr>
        </tbody>

        <!-- Datos -->
        <tbody v-else>
          <tr
            v-for="r in pagedRows"
            :key="r.id"
            class="odd:bg-white even:bg-gray-50 border-t border-gray-100"
          >
            <td class="px-4 py-3">{{ r.fecha_fmt }}</td>
            <td class="px-4 py-3">{{ r.sede_fmt }}</td>
            <td class="px-4 py-3">{{ r.area_fmt }}</td>
            <td class="px-4 py-3">{{ r.in_fmt }}</td>
            <td class="px-4 py-3">{{ r.out_fmt }}</td>
            <td class="px-4 py-3">{{ r.dur_fmt }}</td>
          </tr>

          <tr v-if="!pagedRows.length">
            <td colspan="6" class="px-4 py-8 text-center text-gray-500">Sin resultados</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginación -->
    <div class="px-4 py-3 flex items-center justify-between border-t border-gray-100">
      <div class="text-xs text-gray-500">
        Página {{ page }} de {{ totalPages }}
      </div>
      <div class="flex items-center gap-2">
        <button
          class="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm disabled:opacity-50"
          :disabled="page<=1 || loading"
          @click="prev"
        >
          « Anterior
        </button>
        <button
          class="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm disabled:opacity-50"
          :disabled="page>=totalPages || loading"
          @click="next"
        >
          Siguiente »
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import api from '@/api/services'
import { useWorkspaceStore } from '@/stores/workspace'

const props = defineProps({
  clienteId: { type: [String, Number], required: true },
})

/* Estado */
const ws = useWorkspaceStore()
const loading = ref(true)
const raw = ref([])     // respuesta cruda de /accesos/resumen/
const rows = ref([])    // decorada y lista para pintar
const q = ref('')
const range = ref({ start: '', end: '' })

/* Paginación (client-side, porque /resumen/ no pagina) */
const page = ref(1)
const pageSize = 10

/* Carga */
onMounted(fetchData)
watch(() => props.clienteId, () => { page.value = 1; fetchData() })

async function fetchData () {
  if (!props.clienteId) return
  loading.value = true
  try {
    await ws.ensureEmpresaSet()
    const params = {
      cliente: props.clienteId,
      empresa: ws.empresa?.id,
      // start / end se aplican en applyFilters()
    }
    if (range.value.start) params.start = range.value.start
    if (range.value.end)   params.end   = range.value.end

    const { data } = await api.accesos.resumen(params)
    // data = [{ id, fecha, sucursal_nombre, area, hora_in, hora_out, duracion }]
    const list = Array.isArray(data) ? data : (data?.results || [])
    raw.value = list
    decorate()
  } finally {
    loading.value = false
  }
}

/* Normalizamos/“decoramos” para que siempre haya strings listos a pintar */
function decorate () {
  const arr = (raw.value || []).map(r => {
    return {
      ...r,
      fecha_fmt: d(r.fecha),
      sede_fmt:  r.sucursal_nombre || '—',
      area_fmt:  r.area || '—',
      in_fmt:    r.hora_in  ? t(r.hora_in)  : 'N.D.',
      out_fmt:   r.hora_out ? t(r.hora_out) : 'N.D.',
      dur_fmt:   r.duracion || 'N.D.',
    }
  })
  rows.value = arr
  page.value = 1
}

/* Filtro local */
const filteredRows = computed(() => {
  const term = q.value.trim().toLowerCase()
  if (!term) return rows.value
  return rows.value.filter(r =>
    r.sede_fmt.toLowerCase().includes(term) ||
    r.area_fmt.toLowerCase().includes(term)
  )
})

/* Slice para paginación client-side */
const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredRows.value.length / pageSize))
)
const pagedRows = computed(() => {
  const start = (page.value - 1) * pageSize
  return filteredRows.value.slice(start, start + pageSize)
})
function next(){ if (page.value < totalPages.value) page.value++ }
function prev(){ if (page.value > 1) page.value-- }

/* Acciones filtros */
function applyFilters(){ fetchData() }
function clearFilters(){
  q.value = ''
  range.value = { start: '', end: '' }
  fetchData()
}

/* Utils de formato */
function d (iso) {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleDateString('es-MX', { day:'2-digit', month:'short', year:'numeric' }) }
  catch { return iso }
}
function t (val) {
  try {
    if (typeof val === 'string' && /^\d{2}:\d{2}/.test(val)) return val.slice(0,5)
    const d = new Date(`1970-01-01T${val}Z`)
    return d.toLocaleTimeString('es-MX', { hour:'2-digit', minute:'2-digit' })
  } catch { return val || '—' }
}

/* Export CSV de lo que está visible (filtros aplicados) */
function exportCsv () {
  const header = ['Fecha','Sede','Área','Check-in','Check-out','Duración']
  const body = filteredRows.value.map(r => [
    r.fecha_fmt, r.sede_fmt, r.area_fmt, r.in_fmt, r.out_fmt, r.dur_fmt
  ])
  const csv = [header, ...body]
    .map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `historial_asistencias_${props.clienteId}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}
</script>
