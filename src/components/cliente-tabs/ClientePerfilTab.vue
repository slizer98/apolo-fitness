<template>
  <div class="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5">
    <!-- Columna izquierda -->
    <div class="space-y-5">
      <!-- Perfil -->
      <div class="card">
        <div class="card-head">Perfil</div>
        <div class="p-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div class="field">
            <span class="label">EDAD</span>
            <span class="value">{{ edad || '—' }}</span>
          </div>

          <div class="field">
            <span class="label">SEXO</span>
            <span class="value">{{ resumen?.sexo || '—' }}</span>
          </div>

          <div class="field">
            <span class="label">EMAIL</span>
            <span class="value">{{ email || '—' }}</span>
          </div>

          <div class="field">
            <span class="label">TELÉFONO</span>
            <span class="value">{{ telefono || '—' }}</span>
          </div>

          <div class="field">
            <span class="label">INICIO DE MEMBRESIA</span>
            <span class="value">{{ f(resumen?.inscripcion) }}</span>
          </div>

          <div class="field">
            <span class="label">CONTACTO DE EMERGENCIA</span>
            <span class="value">{{ emergencia || '—' }}</span>
          </div>

          <div class="sm:col-span-2 field">
            <span class="label">DIRECCIÓN</span>
            <span class="value">{{ direccion || '—' }}</span>
          </div>
        </div>
      </div>

      <!-- Historial de pagos -->
      <div class="card">
        <div class="card-head flex items-center justify-between">
          <div>Historial de pagos</div>
          <button class="btn-light" @click="exportar" title="Exportar">Exportar</button>
        </div>

        <div class="p-5">
          <div v-if="loadingPagos" class="text-sm text-gray-600">Cargando…</div>

          <template v-else>
            <div v-if="!pagos.length" class="text-sm text-gray-600">Sin pagos registrados.</div>

            <div v-else class="overflow-auto rounded-xl border border-gray-200 max-h-[360px]">
              <table class="min-w-full text-sm">
                <thead class="bg-gray-50 text-gray-500">
                  <tr>
                    <th class="th">Fecha</th>
                    <th class="th">Concepto</th>
                    <th class="th">Monto</th>
                    <th class="th">Método</th>
                    <th class="th">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="p in pagos" :key="p.id" class="border-t">
                    <td class="td">{{ f(p.fecha) }}</td>
                    <td class="td">{{ p.concepto || '—' }}</td>
                    <td class="td font-semibold">{{ money(p.total) }}</td>
                    <td class="td">{{ p.metodo || '—' }}</td>
                    <td class="td">
                      <span
                        class="inline-flex px-2 py-0.5 rounded-full text-xs border"
                        :class="p.estado==='en_tiempo' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' :
                                p.estado==='atrasado' ? 'border-rose-200 bg-rose-50 text-rose-700' :
                                'border-gray-200 bg-gray-50 text-gray-700'"
                      >
                        {{ estadoTexto(p.estado) }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Columna derecha -->
    <aside class="space-y-5">
      <!-- Plan y progreso -->
      <div class="card">
        <div class="card-head">Plan y progreso</div>
        <div class="p-5">
          <div class="text-sm text-gray-700">
            <div class="font-medium">{{ resumen?.plan_actual || '—' }}</div>
            <div class="text-gray-500">
              <template v-if="resumen?.fecha_vencimiento">
                Vigente hasta {{ f(resumen.fecha_vencimiento) }}
              </template>
              <template v-else>—</template>
            </div>
          </div>

          <div class="mt-3">
            <div class="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div class="h-full bg-[#1a5eff]" :style="{ width: progreso + '%' }"></div>
            </div>
            <div class="mt-1 text-xs text-gray-500">{{ progreso }}% del ciclo</div>
          </div>

          <div class="mt-4 grid grid-cols-3 gap-3">
            <div class="kpi">
              <div class="kpi-top">{{ money(totalPagado) }}</div>
              <div class="kpi-sub">Total pagado</div>
            </div>
            <div class="kpi">
              <div class="kpi-top">{{ asistencias }}</div>
              <div class="kpi-sub">Asistencias</div>
            </div>
            <div class="kpi">
              <div class="kpi-top">{{ antiguedad }}</div>
              <div class="kpi-sub">Meses</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actividad reciente -->
      <div class="card">
        <div class="card-head">Actividad reciente</div>
        <div class="p-5 space-y-2">
          <div v-if="loadingActividad" class="text-sm text-gray-600">Cargando…</div>
          <template v-else>
            <div v-for="a in actividad" :key="a.id" class="row">
              <div class="row-l">{{ a.titulo }}</div>
              <div class="row-r">{{ a.fecha }}</div>
            </div>
            <div v-if="!actividad.length" class="text-sm text-gray-600">Sin actividad reciente.</div>
          </template>
        </div>
      </div>

      <!-- Notas del staff (placeholder para tu flujo) -->
      <div class="card">
        <div class="card-head flex items-center justify-between">
          <div>Notas del staff</div>
          <button class="btn-light">Añadir</button>
        </div>
        <div class="p-5 text-sm text-gray-600">—</div>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import api from '@/api/services'
import { useWorkspaceStore } from '@/stores/workspace'

const props = defineProps({
  clienteId: { type: Number, required: true },
  resumen:   { type: Object, default: null }   // viene del padre (resumen endpoint)
})

const ws = useWorkspaceStore()

/* Derivados Perfil */
const email    = computed(() => props.resumen?.contacto?.email || props.resumen?.email || '')
const telefono = computed(() => props.resumen?.contacto?.telefono || props.resumen?.contacto?.celular || '')
const direccion = computed(() => props.resumen?.direccion || '')
const emergencia = computed(() => props.resumen?.contacto_emergencia || '')
const edad = computed(() => {
  const dob = props.resumen?.fecha_nacimiento
  if (!dob) return ''
  try {
    const d = new Date(dob); const today = new Date()
    let a = today.getFullYear() - d.getFullYear()
    const m = today.getMonth() - d.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) a--
    return `${a} años`
  } catch { return '' }
})

function f (v) { try { return v ? new Date(v).toLocaleDateString('es-MX',{day:'2-digit',month:'short',year:'numeric'}) : '—' } catch { return v || '—' } }
function money (n) { return Number(n||0).toLocaleString('es-MX',{ style:'currency', currency:'MXN'}) }

/* Plan y progreso */
const progreso = computed(() => {
  const ini = props.resumen?.fecha_alta
  const fin = props.resumen?.fecha_vencimiento
  if (!ini || !fin) return 0
  try {
    const i = new Date(ini).getTime()
    const e = new Date(fin).getTime()
    const t = Date.now()
    if (e <= i) return 0
    const pct = Math.round(((t - i) / (e - i)) * 100)
    return Math.min(100, Math.max(0, pct))
  } catch { return 0 }
})
const antiguedad = computed(() => {
  const ini = props.resumen?.inscripcion
  if (!ini) return 0
  try {
    const d0 = new Date(ini)
    const now = new Date()
    return (now.getFullYear() - d0.getFullYear()) * 12 + (now.getMonth() - d0.getMonth())
  } catch { return 0 }
})

/* Pagos (ventas del cliente) */
const pagos = ref([])
const totalPagado = computed(() => pagos.value.reduce((a,b)=>a + Number(b.total||0), 0))
const loadingPagos = ref(false)
async function loadPagos () {
  loadingPagos.value = true
  try {
    const { data } = await api.ventas.ventas.list({ empresa: ws.empresaId, cliente: props.clienteId, ordering: '-fecha', page_size: 20, item_tipo: 'PLAN', })
    const arr = data?.results || data || []
    pagos.value = arr.map(v => ({
      id: v.id,
      fecha: v.fecha || v.created_at,
      total: v.total ?? v.importe ?? 0,
      metodo: v.metodo || v.metodo_pago || '',
      estado: v.estado || '',      // 'en_tiempo' | 'atrasado' | …
      concepto: v.concepto || v.observaciones || 'Mensualidad'
    }))
  } finally { loadingPagos.value = false }
}
function estadoTexto (s) {
  const v = String(s||'').toLowerCase()
  if (v.includes('tiempo')) return 'En tiempo'
  if (v.includes('atras'))  return 'Atrasado'
  if (v) return v
  return '—'
}
function exportar(){ /* hook para exportar */ }

/* Actividad reciente (accesos del cliente) */
const actividad = ref([])
const loadingActividad = ref(false)
async function loadActividad(){
  loadingActividad.value = true
  try {
    const desde = new Date(); desde.setDate(desde.getDate() - 30)
    const { data } = await api.accesos.list({
      empresa: ws.empresaId,
      cliente: props.clienteId,
      fecha_after: desde.toISOString(),
      page_size: 10,
      ordering: '-fecha'
    })
    const arr = data?.results || data || []
    actividad.value = arr.map(a => ({
      id: a.id,
      titulo: a.tipo || 'Check-in',
      fecha: a.fecha ? new Date(a.fecha).toLocaleString('es-MX',{ day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—'
    }))
  } finally { loadingActividad.value = false }
}

watch(() => props.clienteId, () => { loadPagos(); loadActividad() }, { immediate: true })
onMounted(() => { if (props.clienteId) { loadPagos(); loadActividad() } })
</script>

<style scoped>
.card{ @apply rounded-2xl bg-white border border-gray-200 shadow-sm; }
.card-head{ @apply px-5 py-4 border-b border-gray-200 font-semibold; }

.field .label{ @apply block text-xs text-gray-500 mb-1; }
.field .value{ @apply text-gray-900; }

.th{ @apply text-left text-[12px] font-medium px-3 py-2; }
.td{ @apply px-3 py-2; }

.kpi{ @apply text-center rounded-xl border border-gray-200 bg-gray-50 py-3; }
.kpi-top{ @apply text-base font-semibold; }
.kpi-sub{ @apply text-[11px] text-gray-500; }

.row{ @apply grid grid-cols-2 gap-3 text-sm; }
.row-l{ @apply text-gray-700; }
.row-r{ @apply text-gray-500 text-right; }

.btn-light{ @apply px-3 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-sm; }
</style>
