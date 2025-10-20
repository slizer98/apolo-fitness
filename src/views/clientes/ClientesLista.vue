<template>
  <div class="p-4">
    <!-- Encabezado -->
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-semibold text-gray-800">Miembros</h1>
      <button
        @click="openCrear()"
        class="bg-apolo-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
      >
        + Nuevo miembro
      </button>
    </div>

    <!-- KPI Cards -->
    <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      <div class="rounded-2xl bg-white border border-gray-200 px-4 py-3">
        <div class="text-[13px] text-gray-500 mb-1">Activos</div>
        <div class="flex items-center justify-between">
          <div class="text-3xl font-semibold">{{ kpi.activos }}</div>
          <span class="text-xs px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
            {{ kpi.activosPct }}
          </span>
        </div>
      </div>
      <div class="rounded-2xl bg-white border border-gray-200 px-4 py-3">
        <div class="text-[13px] text-gray-500 mb-1">En mora</div>
        <div class="flex items-center justify-between">
          <div class="text-3xl font-semibold">{{ kpi.mora }}</div>
          <span class="text-xs px-2 py-1 rounded-md bg-red-50 text-red-700 border border-red-200">
            {{ kpi.moraPct }}
          </span>
        </div>
      </div>
      <div class="rounded-2xl bg-white border border-gray-200 px-4 py-3">
        <div class="text-[13px] text-gray-500 mb-1">Nuevos este mes</div>
        <div class="flex items-center justify-between">
          <div class="text-3xl font-semibold">{{ kpi.nuevosMes }}</div>
          <span class="text-xs px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
            +{{ kpi.nuevosDelta }}
          </span>
        </div>
      </div>
      <div class="rounded-2xl bg-white border border-gray-200 px-4 py-3">
        <div class="text-[13px] text-gray-500 mb-1">Suspendido</div>
        <div class="flex items-center justify-between">
          <div class="text-3xl font-semibold">{{ kpi.suspendidos }}</div>
          <span class="text-xs px-2 py-1 rounded-md bg-red-50 text-red-700 border border-red-200">
            {{ kpi.suspendidosPct }}
          </span>
        </div>
      </div>
    </section>

    <!-- Card principal -->
    <div class="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
      <!-- Filtros (Plan/Sucursal) -->
      <div class="px-4 py-3 border-b border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <label class="block text-xs text-gray-500 mb-1">Plan</label>
          <select v-model="fPlan" class="w-full pr-8 py-2 rounded-lg border border-gray-300">
            <option value="">Todos</option>
            <option v-for="p in planesOpciones" :key="p" :value="p">{{ p }}</option>
          </select>
        </div>

        <div>
          <label class="block text-xs text-gray-500 mb-1">Sucursal</label>
          <select v-model="fSede" class="w-full pr-8 py-2 rounded-lg border border-gray-300">
            <option value="">Todas</option>
            <option v-for="s in sucursalesOpciones" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>

        <div class="md:col-span-2 flex items-end justify-end">
          <button
            v-if="fPlan || fSede"
            @click="clearFacetFilters"
            class="text-sm text-gray-600 hover:underline"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      <!-- Grid tabla + panel -->
      <div class="grid" :class="expandedId ? 'grid-cols-[1fr_360px]' : 'grid-cols-1'">
        <!-- Tabla -->
        <div class="overflow-hidden">
          <div class="max-h-[560px] overflow-y-auto p-3">
            <template v-if="loading">
              <table class="min-w-full text-sm">
                <tbody>
                  <tr v-for="i in 8" :key="'sk-'+i" class="border-b border-gray-100">
                    <td class="px-3 py-3"><div class="h-4 w-48 rounded bg-gray-100"></div></td>
                    <td class="px-3 py-3"><div class="h-4 w-40 rounded bg-gray-100"></div></td>
                    <td class="px-3 py-3"><div class="h-4 w-32 rounded bg-gray-100"></div></td>
                    <td class="px-3 py-3"><div class="h-6 w-24 rounded-full bg-gray-100"></div></td>
                    <td class="px-3 py-3"><div class="h-4 w-28 rounded bg-gray-100"></div></td>
                    <td class="px-3 py-3 text-right"><div class="h-8 w-16 ml-auto rounded bg-gray-100"></div></td>
                  </tr>
                </tbody>
              </table>
            </template>

            <template v-else>
              <TableBasic
                :rows="facetRows"
                :columns="columns"
                :initial-page-size="10"
              />
            </template>
          </div>
        </div>

        <!-- Panel lateral con ClientSummaryCard -->
        <aside v-if="expandedId" class="border-l border-gray-200 bg-white">
          <div class="max-h-[560px] overflow-y-auto p-4">
            <template v-if="detalleLoading">
              <div class="animate-pulse">
                <div class="h-6 w-40 bg-gray-200 rounded mb-3"></div>
                <div class="rounded-xl border border-gray-200 p-4">
                  <div class="mx-auto mb-3 h-20 w-20 rounded-full bg-gray-200"></div>
                  <div class="h-4 w-20 bg-gray-200 rounded mx-auto mb-4"></div>
                  <div class="space-y-3">
                    <div class="h-4 w-full bg-gray-200 rounded"></div>
                    <div class="h-4 w-5/6 bg-gray-200 rounded"></div>
                    <div class="h-4 w-3/4 bg-gray-200 rounded"></div>
                    <div class="h-4 w-2/3 bg-gray-200 rounded"></div>
                  </div>
                  <div class="mt-4 flex gap-2">
                    <div class="h-9 w-24 bg-gray-200 rounded"></div>
                    <div class="h-9 w-28 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </template>

            <template v-else-if="detalle">
              <div class="mb-3 flex justify-between">
                <h3 class="text-base font-semibold text-gray-800">
                  {{ detalle.nombre }} {{ detalle.apellidos }}
                </h3>
                <button
                  class="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-100"
                  title="Ocultar"
                  @click="hidePanel"
                >
                  <i class="fa-solid fa-angles-right text-gray-700"></i>
                </button>
              </div>

              <ClientSummaryCard
                :cliente="detalle"
                @cobrar="openAlta(detalle)"
                @renovar="goClienteDatos(detalle.id)"
                @ver="goClienteDatos(detalle.id)"
                @contacto="openContacto(detalle)"
                @fiscales="openFiscales(detalle)"
              />
            </template>
          </div>
        </aside>
      </div>
    </div>

    <!-- Modales -->
    <ClienteCrearModal v-if="showCrear" @close="closeCrear" @saved="onAnySaved" />
    <DatosFiscalesModal
      v-if="showFiscales"
      :cliente-id="currentCliente?.id"
      :cliente-nombre="fullName(currentCliente)"
      @close="closeFiscales"
      @saved="onAnySaved"
    />
    <DatoContactoModal
      v-if="showContacto"
      :cliente-id="currentCliente?.id"
      :cliente-nombre="fullName(currentCliente)"
      @close="closeContacto"
      @saved="onAnySaved"
    />
    <ClienteSucursalModal
      v-if="showSucursal"
      :cliente-id="currentCliente?.id"
      :cliente-nombre="fullName(currentCliente)"
      @close="closeSucursal"
      @saved="onAnySaved"
    />
    <AsignarMembresiaModal
      v-if="showAlta"
      :show="showAlta"
      :cliente="currentCliente"
      @close="closeAlta"
      @saved="onAltaSaved"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, h } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import api from '@/api/services'
import TableBasic from '@/components/TableBasic.vue'
import ClientSummaryCard from '@/components/ClientSummaryCard.vue'

import ClienteCrearModal from '@/views/clientes/modals/ClienteCrearModal.vue'
import DatosFiscalesModal from '@/views/clientes/modals/DatosFiscalesModal.vue'
import DatoContactoModal from '@/views/clientes/modals/DatoContactoModal.vue'
import ClienteSucursalModal from '@/views/clientes/modals/ClienteSucursalModal.vue'
import AsignarMembresiaModal from '@/views/clientes/modals/AsignarMembresiaModal.vue'

const router = useRouter()

/* ---------- Estado ---------- */
const loading = ref(true)
const rows = ref([])

const fPlan = ref('')
const fSede = ref('')

const expandedId = ref(null)
const detalle = ref(null)
const detalleLoading = ref(false)

/* ---------- Carga ---------- */
onMounted(fetchAll)
async function fetchAll () {
  loading.value = true
  try {
    const { data } = await api.clientes.list({ ordering: '-id' })
    const list = Array.isArray(data) ? data : (data?.results || [])
    rows.value = list.map(r => ({
      id: r.id,
      nombre: r.nombre ?? '',
      apellidos: r.apellidos ?? '',
      email: r.email || '—',
      sucursal_nombre: r.sucursal_nombre || '—',
      is_active: !!r.is_active,
      fecha: r.fecha_alta || r.created_at,
      plan_nombre: r.plan_nombre || r.plan_actual || r?.alta?.plan_nombre || '',
      plan_actual: r.plan_actual || r.plan_nombre || '',
      __raw: r,
    }))
  } finally {
    loading.value = false
  }
}

/* ---------- Opciones de filtros ---------- */
const planesOpciones = computed(() =>
  [...new Set(rows.value.map(r => r.plan_nombre || r.plan_actual).filter(Boolean))].sort()
)
const sucursalesOpciones = computed(() =>
  [...new Set(rows.value.map(r => r.sucursal_nombre).filter(Boolean))].sort()
)

/* ---------- Filtrado ---------- */
const facetRows = computed(() => {
  return rows.value.filter(r => {
    const matchPlan = !fPlan.value || [r.plan_nombre, r.plan_actual].filter(Boolean).includes(fPlan.value)
    const matchSede = !fSede.value || r.sucursal_nombre === fSede.value
    return matchPlan && matchSede
  })
})
function clearFacetFilters () { fPlan.value = ''; fSede.value = '' }

/* ---------- KPIs ---------- */
const kpi = computed(() => {
  const total = rows.value.length || 1
  let activos = 0, mora = 0, suspendidos = 0, nuevosMes = 0
  const now = new Date()
  const y = now.getFullYear(), m = now.getMonth()
  for (const r of rows.value) {
    if (r.is_active) activos++
    const estado = String(r.__raw?.plan_estado || '').toLowerCase()
    if (estado.includes('mora')) mora++
    if (!r.is_active) suspendidos++
    const created = new Date(r.fecha || r.__raw?.created_at)
    if (created.getFullYear() === y && created.getMonth() === m) nuevosMes++
  }
  return {
    activos, mora, suspendidos, nuevosMes,
    activosPct: Math.round((activos/total)*100) + '%',
    moraPct: Math.round((mora/total)*100) + '%',
    suspendidosPct: Math.round((suspendidos/total)*100) + '%',
    nuevosDelta: nuevosMes,
  }
})

/* ---------- Utils ---------- */
function fullName (c) { if (!c) return ''; return [c?.nombre, c?.apellidos].filter(Boolean).join(' ') }
function formatDate (d) { if (!d) return '—'; try { return new Date(d).toLocaleDateString('es-MX') } catch { return d || '—' } }
function goClienteDatos (id) { if (id) router.push({ name: 'ClienteDatos', params: { id } }) }

/* ---------- Panel ---------- */
async function toggleExpand (row) {
  if (expandedId.value === row.id) {
    expandedId.value = null
    detalle.value = null
    return
  }
  expandedId.value = row.id
  detalle.value = null
  detalleLoading.value = true
  try {
    const { data } = await api.clientes.resumen(row.id)
    detalle.value = { ...data, is_active: data?.is_active ?? row.is_active }
  } catch {
    detalle.value = {
      id: row.id,
      nombre: row.nombre, apellidos: row.apellidos,
      email: row.email,
      sucursal_nombre: row.sucursal_nombre,
      is_active: row.is_active,
    }
  } finally {
    setTimeout(() => { detalleLoading.value = false }, 250)
  }
}
function hidePanel () {
  expandedId.value = null
  detalle.value = null
}

/* ---------- Modales ---------- */
const showCrear = ref(false)
const showFiscales = ref(false)
const showContacto = ref(false)
const showSucursal = ref(false)
const showAlta = ref(false)
const currentCliente = ref(null)

function openCrear () { showCrear.value = true }
function closeCrear () { showCrear.value = false }

function openFiscales (c) { currentCliente.value = c; showFiscales.value = true }
function openContacto (c) { currentCliente.value = c; showContacto.value = true }
function openSucursal (c) { currentCliente.value = c; showSucursal.value = true }
function openAlta (c) { currentCliente.value = c; showAlta.value = true }
function closeAlta () { showAlta.value = false }
function closeFiscales () { showFiscales.value = false }
function closeContacto () { showContacto.value = false }
function closeSucursal () { showSucursal.value = false }

async function removeRow (c) {
  if (!confirm(`Eliminar cliente "${fullName(c)}"?`)) return
  try {
    await api.clientes.delete(c.id)
    rows.value = rows.value.filter(x => x.id !== c.id)
    if (expandedId.value === c.id) hidePanel()
  } catch (e) { console.error(e) }
}

async function onAnySaved () {
  showCrear.value = false
  showFiscales.value = false
  showContacto.value = false
  showSucursal.value = false
  await fetchAll()
}
async function onAltaSaved () { showAlta.value = false }

/* ---------- Columnas para TableBasic ---------- */
const columns = [
  // Nombre clickeable -> navega a ClienteDatos
  {
    accessorKey: 'nombre',
    header: 'Nombre',
    cell: ({ row }) => {
      const r = row.original
      return h(
        'button',
        {
          class: 'text-slate-500 hover:underline font-medium',
          title: 'Abrir ficha del cliente',
          onClick: (e) => { e.stopPropagation(); goClienteDatos(r.id) },
        },
        `${r.nombre} ${r.apellidos}`.trim()
      )
    },
  },
  { accessorKey: 'plan_nombre', header: 'Plan' },
  { accessorKey: 'sucursal_nombre', header: 'Sucursal' },
  {
    id: 'estado',
    header: 'Estado',
    enableSorting: false,
    cell: ({ row }) => {
      const active = !!row.original.is_active
      return h(
        'span',
        {
          class:
            'inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border ' +
            (active
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-red-50 text-red-700 border-red-200'),
        },
        [
          h('i', { class: `fa-solid ${active ? 'fa-circle-check' : 'fa-circle-xmark'}` }),
          active ? 'Activo' : 'Suspendido',
        ],
      )
    },
  },
  {
    accessorKey: 'fecha',
    header: 'Alta',
    cell: ({ getValue }) => h('span', {}, formatDate(getValue())),
    sortingFn: 'datetime',
  },
  // Acción: botón » para abrir el panel lateral (detalle rápido)
  {
    id: 'openPanel',
    header: () => h('span', { class: 'float-right' }, 'Detalle'),
    enableSorting: false,
    cell: ({ row }) => {
      const r = row.original
      return h(
        'div',
        { class: 'flex justify-end' },
        [
          h(
            'button',
            {
              class: 'px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-sm',
              title: 'Ver detalle',
              onClick: (e) => { e.stopPropagation(); toggleExpand(r) },
            },
            '»',
          )
        ]
      )
    },
  },
]
</script>
