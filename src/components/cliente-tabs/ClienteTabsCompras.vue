<template>
  <div class="rounded-2xl bg-white border border-gray-200 shadow-sm">
    <div class="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
      <h3 class="font-semibold">Historial de compras (productos)</h3>
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
          placeholder="Buscar compra (producto, método)…"
        />
      </div>
    </div>

    <!-- Tabla -->
    <div class="overflow-x-auto">
      <table class="min-w-full text-sm">
        <thead>
          <tr class="bg-gray-100 text-gray-700">
            <th class="text-left px-4 py-2">Fecha</th>
            <th class="text-left px-4 py-2">Producto</th>
            <th class="text-left px-4 py-2">Cantidad</th>
            <th class="text-left px-4 py-2">P. unitario</th>
            <th class="text-left px-4 py-2">Importe</th>
            <th class="text-left px-4 py-2">Método</th>
          </tr>
        </thead>

        <!-- Skeleton -->
        <tbody v-if="loading">
          <tr v-for="i in 8" :key="'sk'+i" class="odd:bg-white even:bg-gray-50">
            <td class="px-4 py-3"><div class="h-4 w-28 bg-gray-200 rounded animate-pulse"></div></td>
            <td class="px-4 py-3"><div class="h-4 w-56 bg-gray-200 rounded animate-pulse"></div></td>
            <td class="px-4 py-3"><div class="h-4 w-12 bg-gray-200 rounded animate-pulse"></div></td>
            <td class="px-4 py-3"><div class="h-4 w-20 bg-gray-200 rounded animate-pulse"></div></td>
            <td class="px-4 py-3"><div class="h-4 w-20 bg-gray-200 rounded animate-pulse"></div></td>
            <td class="px-4 py-3"><div class="h-4 w-24 bg-gray-200 rounded animate-pulse"></div></td>
          </tr>
        </tbody>

        <!-- Datos -->
        <tbody v-else>
          <tr
            v-for="r in filteredRows"
            :key="r.rowKey"
            class="odd:bg-white even:bg-gray-50 border-t border-gray-100"
          >
            <td class="px-4 py-3">{{ d(r.fecha) }}</td>
            <td class="px-4 py-3">
              <div class="font-medium">{{ r.producto }}</div>
              <div v-if="r.sku" class="text-[11px] text-gray-500">SKU: {{ r.sku }}</div>
            </td>
            <td class="px-4 py-3">{{ r.cantidad }}</td>
            <td class="px-4 py-3">{{ money(r.p_unit) }}</td>
            <td class="px-4 py-3">{{ money(r.importe) }}</td>
            <td class="px-4 py-3">{{ r.metodo }}</td>
          </tr>

          <tr v-if="!filteredRows.length">
            <td colspan="6" class="px-4 py-8 text-center text-gray-500">Sin resultados</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginación (por ventas, como en Pagos) -->
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

/** Estado */
const loading = ref(true)
const ventasPage = ref([]) // ventas crudas de la página actual
const rows = ref([])       // filas por PRODUCTO (flatten)
const page = ref(1)
const pageSize = 10
const count = ref(null)    // count de ventas (para paginar como Pagos)
const q = ref('')

/** Computados de paginación (idénticos a Pagos) */
const hasMore = computed(() => {
  if (count.value === null) return ventasPage.value.length === pageSize
  return page.value * pageSize < count.value
})
const totalPages = computed(() => count.value ? Math.max(1, Math.ceil(count.value / pageSize)) : 1)

/** Carga */
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
      // X-Empresa-Id por interceptor
    })
    const list = data?.results || data || []
    count.value = data?.count ?? null
    ventasPage.value = list

    // Aplana SOLO detalles de PRODUCTO
    rows.value = ventasPage.value.flatMap(v => {
      const pagos = v.pagos || []
      const metodo = !pagos.length
        ? '—'
        : (pagos.length > 1 ? 'Mixto'
           : capitalize((pagos[0].forma_pago || '').replace('_', ' ')))

      const dets = (v.detalles || []).filter(d =>
        (d.item_tipo || '').toUpperCase() === 'PRODUCTO' ||
        !!d.producto || !!d.producto_id || !!d.producto_nombre
      )

      return dets.map((d, idx) => {
        const cantidad = Number(d.cantidad ?? d.qty ?? 1) || 1
        const pUnit = num(
          d.precio_unitario ?? d.precio ?? (Number(d.importe || d.total || d.subtotal || 0) / cantidad)
        )
        const importe = num(
          d.importe ?? d.total ?? d.subtotal ?? (pUnit * cantidad)
        )

        return {
          rowKey: `${v.id}-${idx}`,   // clave única por línea
          venta_id: v.id,
          fecha: v.fecha,
          producto: d.producto_nombre || d.descripcion || 'Producto',
          sku: d.sku || d.clave || '',
          cantidad,
          p_unit: pUnit,
          importe,
          metodo,
        }
      })
    })
  } finally {
    loading.value = false
  }
}

/** Filtro local (producto o método) */
const filteredRows = computed(() => {
  const term = q.value.trim().toLowerCase()
  if (!term) return rows.value
  return rows.value.filter(r =>
    (r.producto || '').toLowerCase().includes(term) ||
    (r.metodo || '').toLowerCase().includes(term) ||
    (r.sku || '').toLowerCase().includes(term)
  )
})

/** Navegación */
function next () { if (hasMore.value) { page.value++; fetchPage() } }
function prev () { if (page.value > 1) { page.value--; fetchPage() } }

/** Utils */
function d (iso) {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleDateString('es-MX', { day:'2-digit', month:'short', year:'numeric' }) }
  catch { return iso }
}
function money (n) { return Number(n || 0).toLocaleString('es-MX', { style:'currency', currency:'MXN' }) }
function num (n) { const x = Number(n); return isFinite(x) ? x : 0 }
function capitalize (s) { s = String(s||'').trim(); return s ? s[0].toUpperCase() + s.slice(1) : s }

/** Export CSV (sobre lo filtrado visible) */
function exportCsv () {
  const header = ['Fecha','Producto','Cantidad','P. unitario','Importe','Método']
  const rowsCsv = filteredRows.value.map(r => [
    d(r.fecha),
    r.producto,
    r.cantidad,
    num(r.p_unit).toFixed(2),
    num(r.importe).toFixed(2),
    r.metodo,
  ])
  const csv = [header, ...rowsCsv]
    .map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `compras_productos_cliente_${props.clienteId}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}
</script>