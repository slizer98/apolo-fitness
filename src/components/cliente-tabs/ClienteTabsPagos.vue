<template>
  <div class="rounded-2xl bg-white border border-gray-200 shadow-sm">
    <div class="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
      <h3 class="font-semibold">Historial de pagos</h3>
      <button
        class="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm"
        @click="exportCsv"
      >
        Exportar
      </button>
    </div>

    <!-- Buscador -->
    <div class="px-4 py-3 border-b border-gray-100">
      <div class="relative">
        <i class="fa fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
        <input
          v-model="q"
          type="text"
          class="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 placeholder-gray-400"
          placeholder="Buscar pago (concepto, método)…"
        />
      </div>
    </div>

    <!-- Tabla -->
    <div class="overflow-x-auto">
      <table class="min-w-full text-sm">
        <thead>
          <tr class="bg-gray-100 text-gray-700">
            <th class="text-left px-4 py-2">Fecha</th>
            <th class="text-left px-4 py-2">Concepto</th>
            <th class="text-left px-4 py-2">Monto</th>
            <th class="text-left px-4 py-2">Método</th>
            <th class="text-left px-4 py-2">Estado</th>
          </tr>
        </thead>
        <tbody v-if="loading">
          <tr v-for="i in 8" :key="'sk'+i" class="odd:bg-white even:bg-gray-50">
            <td class="px-4 py-3"><div class="h-4 w-28 bg-gray-200 rounded animate-pulse"></div></td>
            <td class="px-4 py-3"><div class="h-4 w-56 bg-gray-200 rounded animate-pulse"></div></td>
            <td class="px-4 py-3"><div class="h-4 w-20 bg-gray-200 rounded animate-pulse"></div></td>
            <td class="px-4 py-3"><div class="h-4 w-20 bg-gray-200 rounded animate-pulse"></div></td>
            <td class="px-4 py-3"><div class="h-4 w-24 bg-gray-200 rounded animate-pulse"></div></td>
          </tr>
        </tbody>

        <tbody v-else>
          <tr
            v-for="v in filteredRows"
            :key="v.id"
            class="odd:bg-white even:bg-gray-50 border-t border-gray-100"
          >
            <td class="px-4 py-3">{{ d(v.fecha) }}</td>
            <td class="px-4 py-3">{{ v.concepto }}</td>
            <td class="px-4 py-3">{{ money(v.total) }}</td>
            <td class="px-4 py-3">{{ v.metodo }}</td>
            <td class="px-4 py-3">
              <span
                class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border"
                :class="v.saldo <= 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'"
              >
                <i class="fa-solid" :class="v.saldo <= 0 ? 'fa-circle-check' : 'fa-triangle-exclamation'"></i>
                {{ v.saldo <= 0 ? 'En tiempo' : 'Atrasado' }}
              </span>
            </td>
          </tr>

          <tr v-if="!filteredRows.length">
            <td colspan="5" class="px-4 py-8 text-center text-gray-500">Sin resultados</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginación -->
    <div class="px-4 py-3 flex items-center justify-between border-t border-gray-100">
      <div class="text-xs text-gray-500">
        Página {{ page }} <span v-if="count !== null">de {{ totalPages }}</span>
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
          :disabled="!hasMore || loading"
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

const props = defineProps({
  clienteId: { type: [String, Number], required: true },
})

/* Estado */
const loading = ref(true)
const rows = ref([])
const page = ref(1)
const pageSize = 10
const count = ref(null)
const q = ref('')

/* Computados */
const hasMore = computed(() => {
  if (count.value === null) return rows.value.length === pageSize
  return page.value * pageSize < count.value
})
const totalPages = computed(() => count.value ? Math.max(1, Math.ceil(count.value / pageSize)) : 1)

/* Filtro local por búsqueda */
const filteredRows = computed(() => {
  const term = q.value.trim().toLowerCase()
  if (!term) return rows.value
  return rows.value.filter(v =>
    (v.concepto || '').toLowerCase().includes(term) ||
    (v.metodo || '').toLowerCase().includes(term)
  )
})

/* Carga */
onMounted(fetchPage)
watch(() => props.clienteId, () => { page.value = 1; fetchPage() })

async function fetchPage () {
  if (!props.clienteId) return
  loading.value = true
  try {
    const { data } = await api.ventas.ventas.list({
      cliente: props.clienteId,
      ordering: '-fecha',
      page: page.value,
      page_size: pageSize,
      // empresa viene por header X-Empresa-Id desde tu interceptor
    })
    const list = data?.results || data || []
    count.value = data?.count ?? null

    rows.value = list.map(v => {
      // método
      const pagos = v.pagos || []
      const metodo = !pagos.length
        ? '—'
        : (pagos.length > 1 ? 'Mixto'
           : capitalize((pagos[0].forma_pago || '').replace('_', ' ')))

      // concepto visible (prioriza plan)
      let concepto = 'Pago'
      const dets = v.detalles || []
      if (dets.length) {
        const d0 = dets[0]
        concepto = d0.descripcion ||
          d0.plan_nombre ||
          (d0.item_tipo === 'PLAN' ? 'Plan' : (d0.producto_nombre || 'Producto'))
      }

      // monto / saldo
      const total = Number(v.total ?? v.importe ?? 0)
      const pagado = Number(v.total_pagado ?? 0)
      const saldo = Number((total - pagado).toFixed(2))

      return {
        id: v.id,
        fecha: v.fecha,
        concepto,
        metodo,
        total,
        saldo,
      }
    })
  } finally {
    loading.value = false
  }
}

function next () { if (hasMore.value) { page.value++; fetchPage() } }
function prev () { if (page.value > 1) { page.value--; fetchPage() } }

/* Utils */
function d (iso) {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleDateString('es-MX', { day:'2-digit', month:'short', year:'numeric' }) }
  catch { return iso }
}
function money (n) { return Number(n || 0).toLocaleString('es-MX', { style:'currency', currency:'MXN' }) }
function capitalize (s) { s = String(s||'').trim(); return s ? s[0].toUpperCase() + s.slice(1) : s }

/* Export CSV (con lo filtrado en pantalla) */
function exportCsv () {
  const header = ['Fecha','Concepto','Monto','Método','Estado']
  const rowsCsv = filteredRows.value.map(v => [
    d(v.fecha),
    v.concepto,
    Number(v.total||0).toFixed(2),
    v.metodo,
    (v.saldo <= 0 ? 'En tiempo' : 'Atrasado')
  ])
  const csv = [header, ...rowsCsv].map(r => r.map(cell => `"${String(cell).replace(/"/g,'""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `pagos_cliente_${props.clienteId}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}
</script>
