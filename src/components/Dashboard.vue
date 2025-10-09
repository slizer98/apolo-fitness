<!-- src/views/Dashboard.vue -->
<template>
  <div class="min-h-screen bg-[#f5f7fb] text-[#1a1a1a] flex flex-col">
    <main class="flex-1">
      <div class="mx-auto w-full max-w-[1200px] px-5 py-6">
        <!-- KPIs -->
        <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="card-kpi">
            <div class="kpi-title">Ingresos del día</div>
            <div class="kpi-row">
              <div class="kpi-value">{{ loading.kpis ? '—' : money(kpis.ingresosHoy) }}</div>
              <span class="chip chip--ok">{{ kpis.ingresosDelta }}</span>
            </div>
          </div>

          <div class="card-kpi">
            <div class="kpi-title">Miembros activos</div>
            <div class="kpi-row">
              <div class="kpi-value">{{ loading.kpis ? '—' : kpis.miembrosActivos }}</div>
              <span class="chip chip--ok">{{ kpis.miembrosDelta }}</span>
            </div>
          </div>

          <div class="card-kpi">
            <div class="kpi-title">Visitas del día</div>
            <div class="kpi-row">
              <div class="kpi-value">{{ loading.kpis ? '—' : kpis.visitasHoy }}</div>
              <span class="chip chip--ok">{{ kpis.visitasDelta }}</span>
            </div>
          </div>

          <div class="card-kpi">
            <div class="kpi-title">Ocupaciones de clases</div>
            <div class="kpi-row">
              <div class="kpi-value">{{ loading.kpis ? '—' : (kpis.ocupacion + '%') }}</div>
              <span class="chip chip--warn">{{ kpis.ocupacionDelta }}</span>
            </div>
          </div>
        </section>

        <!-- Gráficas + Clases -->
        <section class="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
          <!-- Columna izquierda -->
          <div class="lg:col-span-2 space-y-5">
            <div class="card">
              <div class="card-head">
                <h3 class="card-title">Ingresos – Últimos 30 días</h3>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2">
                <!-- Gráfico línea -->
                <div class="p-4 sm:p-5">
                  <div class="h-52 rounded-lg border border-[#e6e9ef] bg-white relative overflow-hidden">
                    <svg viewBox="0 0 300 140" class="absolute inset-0 w-full h-full">
                      <line x1="30" y1="10" x2="30" y2="130" stroke="#e6e9ef" stroke-width="1" />
                      <line x1="30" y1="130" x2="290" y2="130" stroke="#e6e9ef" stroke-width="1" />
                      <!-- área -->
                      <polyline :points="areaPath" fill="url(#areaFill)" stroke="none"/>
                      <!-- línea -->
                      <polyline :points="linePoints" fill="none" stroke="#3b82f6" stroke-width="2" />
                      <defs>
                        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%"  stop-color="#93c5fd" stop-opacity="0.55"/>
                          <stop offset="100%" stop-color="#93c5fd" stop-opacity="0"/>
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>

                <!-- Donut -->
                <div class="p-4 sm:p-5 flex flex-col items-center justify-center">
                  <h4 class="text-sm font-semibold mb-2">Plan</h4>
                  <div class="relative h-44 w-44">
                    <svg viewBox="0 0 100 100" class="h-full w-full">
                      <circle cx="50" cy="50" r="35" stroke="#eef2f7" stroke-width="18" fill="none"/>
                      <!-- azul oscuro -->
                      <circle
                        cx="50" cy="50" r="35"
                        transform="rotate(-90 50 50)"
                        :stroke-dasharray="`${donut.a} ${donut.C - donut.a}`"
                        :stroke-dashoffset="0"
                        stroke="#1d4ed8"
                        stroke-width="18" fill="none"/>
                      <!-- azul medio -->
                      <circle
                        cx="50" cy="50" r="35"
                        transform="rotate(-90 50 50)"
                        :stroke-dasharray="`${donut.b} ${donut.C - donut.b}`"
                        :stroke-dashoffset="-donut.a"
                        stroke="#2563eb"
                        stroke-width="18" fill="none"/>
                      <!-- azul claro -->
                      <circle
                        cx="50" cy="50" r="35"
                        transform="rotate(-90 50 50)"
                        :stroke-dasharray="`${donut.c} ${donut.C - donut.c}`"
                        :stroke-dashoffset="-(donut.a + donut.b)"
                        stroke="#60a5fa"
                        stroke-width="18" fill="none"/>
                    </svg>
                    <div class="absolute inset-0 flex items-center justify-center">
                      <span class="text-xl font-semibold">{{ kpis.miembrosActivos }}</span>
                    </div>
                  </div>
                  <div class="mt-2 text-xs text-[#445] flex items-center gap-3">
                    <span class="legend" style="--c:#1d4ed8">Estandar</span>
                    <span class="legend" style="--c:#2563eb">Plus</span>
                    <span class="legend" style="--c:#60a5fa">Premium</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Próximos cobros / Equipos -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div class="card">
                <div class="card-head">
                  <h3 class="card-title">Próximos cobros</h3>
                  <button class="icon-btn">≡</button>
                </div>
                <div class="p-4 sm:p-5 space-y-4">
                  <div v-for="c in proximosCobros" :key="c.id" class="flex items-center justify-between">
                    <div>
                      <div class="font-medium">{{ c.nombre }}</div>
                      <div class="text-xs text-[#667]">{{ fmtFecha(c.fecha) }} ({{ c.tipo }})</div>
                    </div>
                    <button class="btn-ghost" @click="cobrar(c)">Cobrar</button>
                  </div>
                </div>
              </div>

              <div class="card">
                <div class="card-head">
                  <h3 class="card-title">Equipos</h3>
                </div>
                <div class="p-4 sm:p-5 space-y-3">
                  <div v-for="e in equipos" :key="e.id" class="flex items-center justify-between">
                    <div>
                      <div class="font-medium">{{ e.nombre }}</div>
                      <div class="text-xs text-[#667]">{{ e.estadoTexto }}</div>
                    </div>
                    <div class="flex items-center gap-2">
                      <span
                        v-for="b in e.badges"
                        :key="b.text"
                        class="text-[11px] px-2 py-1 rounded-md text-white"
                        :style="{ background: b.color }"
                      >
                        {{ b.text }}
                      </span>
                      <button class="btn-ghost">Ver</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Columna derecha: Clases -->
          <div class="card">
            <div class="card-head">
              <h3 class="card-title">Clases de hoy</h3>
              <button class="icon-btn"><i class="fa-solid fa-grip-lines"></i></button>
            </div>
            <div class="p-4 sm:p-5 space-y-4">
              <div v-for="clase in clasesHoy" :key="clase.id" class="rounded-2xl border border-[#e6e9ef] bg-white p-4">
                <div class="text-[12px] text-[#667] mb-1">{{ clase.hora }} — {{ clase.sede }}</div>
                <div class="font-semibold mb-1">{{ clase.nombre }}</div>
                <div class="text-[12px] text-[#667] mb-2">{{ clase.instructor }}</div>

                <div class="flex items-center justify-between text-[12px] mb-1">
                  <span :class="{'text-emerald-600': clase.delta>0, 'text-rose-600': clase.delta<0, 'text-[#667]': clase.delta===0}">
                    {{ clase.delta>0 ? ('+'+clase.delta) : (clase.delta<0 ? clase.delta : '0') }}
                  </span>
                  <span class="text-[#667]">({{ clase.inscritos }}/{{ clase.cupo }})</span>
                </div>

                <div class="h-2 rounded-full bg-[#eef2f7] overflow-hidden">
                  <div
                    class="h-full rounded-full"
                    :style="{ width: Math.min(100, Math.round((clase.inscritos / clase.cupo) * 100)) + '%', background: '#f59e0b' }"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Link con color del tema -->
        <div class="mt-5 text-right">
          <RouterLink :to="{ name: 'ClientesLista' }" class="link-theme">Ver todos los clientes</RouterLink>
        </div>
      </div>
    </main>

    <!-- FAB (+) con primario -->
    <button
      class="fab"
      :style="{ backgroundColor: primary }"
      @click="modalCliente = true"
      title="Nuevo miembro"
    >
      <i class="fa-solid fa-plus"></i>
    </button>

    <!-- FAB secundario: abre buscador de clientes -->
    <button class="fab fab--secondary" title="Buscar cliente" @click="openBuscarModal">
      <i class="fa-regular fa-clipboard"></i>
    </button>

    <!-- Modal crear cliente -->
    <ClienteCrearModal
      v-if="modalCliente"
      v-model:open="modalCliente"
      @close="modalCliente=false"
      @cancel="modalCliente=false"
      @created="onClienteCreado"
      @saved="onClienteCreado"
    />

    <!-- Modal Buscar Cliente -->
    <div v-if="modalBuscar" class="fixed inset-0 z-50">
      <div class="absolute inset-0 bg-black/30" @click="closeBuscarModal"></div>
      <div class="absolute right-6 bottom-24 sm:bottom-28 w-[92vw] max-w-md">
        <div class="rounded-2xl bg-white border border-[#e6e9ef] shadow-xl overflow-hidden">
          <div class="px-4 py-3 border-b border-[#e6e9ef] flex items-center gap-2">
            <i class="fa fa-magnifying-glass text-[#667]"></i>
            <input
              v-model="buscarInput"
              type="text"
              placeholder="Buscar cliente por nombre o email…"
              class="flex-1 outline-none text-[14px] placeholder-[#99a] py-1.5"
              autofocus
            />
            <button class="icon-btn" @click="closeBuscarModal">✕</button>
          </div>

          <div class="max-h-72 overflow-auto">
            <div v-if="loading.buscar" class="p-3 space-y-2">
              <div class="h-4 bg-[#eef2f7] rounded animate-pulse"></div>
              <div class="h-4 bg-[#eef2f7] rounded animate-pulse w-2/3"></div>
              <div class="h-4 bg-[#eef2f7] rounded animate-pulse w-1/2"></div>
            </div>

            <template v-else>
              <button
                v-for="c in resultados"
                :key="c.id"
                class="w-full text-left px-4 py-2 hover:bg-[#f5f7fa] flex items-center justify-between"
                @click="selectCliente(c)"
              >
                <div class="min-w-0">
                  <div class="font-medium truncate">{{ c.nombre }} {{ c.apellidos }}</div>
                  <div class="text-[12px] text-[#667] truncate">{{ c.email || '—' }}</div>
                </div>
                <span class="text-[11px] px-2 py-1 rounded-md border border-[#e6e9ef] bg-[#fafbfe] text-[#445]">
                  Ver
                </span>
              </button>
              <div v-if="!resultados.length" class="px-4 py-8 text-center text-[13px] text-[#667]">
                Sin resultados
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Slide-over Card Resumen Cliente -->
    <transition
      enter-active-class="transition transform duration-200"
      enter-from-class="opacity-0 translate-x-3"
      enter-to-class="opacity-100 translate-x-0"
      leave-active-class="transition transform duration-150"
      leave-from-class="opacity-100 translate-x-0"
      leave-to-class="opacity-0 translate-x-3"
    >
      <aside
        v-if="panelClienteOpen"
        class="fixed top-0 right-0 h-full w-[420px] bg-white border-l border-[#e6e9ef] shadow-2xl z-40"
      >
        <div class="px-5 py-4 border-b border-[#e6e9ef] flex items-center justify-between">
          <div>
            <div class="font-semibold leading-tight truncate max-w-[300px]">
              {{ (resumen && (resumen.nombre + ' ' + (resumen.apellidos||''))) || 'Cliente' }}
            </div>
            <div class="text-[12px] text-[#667]">
              #{{ resumen?.id }} · {{ resumen?.sucursal_nombre || 'Sin sucursal' }}
            </div>
          </div>
          <button class="icon-btn" @click="closePanelCliente">✕</button>
        </div>

        <div class="p-4 overflow-auto h-[calc(100%-64px)] space-y-3">
          <!-- Loader skeleton -->
          <template v-if="loading.resumen">
            <div class="h-4 bg-[#eef2f7] rounded animate-pulse w-2/3"></div>
            <div class="h-4 bg-[#eef2f7] rounded animate-pulse w-1/2"></div>
            <div class="h-24 bg-[#eef2f7] rounded animate-pulse"></div>
            <div class="h-4 bg-[#eef2f7] rounded animate-pulse w-1/3"></div>
            <div class="h-24 bg-[#eef2f7] rounded animate-pulse"></div>
          </template>

          <template v-else>
            <!-- Estado — Plan -->
            <div class="rounded-xl border border-[#e6e9ef] bg-white p-3">
              <div class="text-sm text-[#445] mb-1">Estado</div>
              <div class="flex items-center gap-2">
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border"
                  :class="badgeClass(resumen?.plan_estado || (resumen?.is_active ? 'activo' : 'inactivo'))"
                >
                  {{ resumen?.plan_estado || (resumen?.is_active ? 'activo' : 'inactivo') }}
                </span>
                <span class="text-sm text-[#222]">—</span>
                <span class="text-sm text-[#222]">{{ resumen?.plan_actual || 'Sin plan' }}</span>
              </div>
            </div>

            <!-- Contacto -->
            <div class="rounded-xl border border-[#e6e9ef] bg-white p-3">
              <div class="text-sm text-[#445] mb-1">Contacto</div>
              <div class="grid grid-cols-1 gap-1 text-sm">
                <div class="text-[#222]">
                  <span class="text-[#667]">Email:</span> {{ resumen?.contacto?.email || resumen?.email || '—' }}
                </div>
                <div class="text-[#222]">
                  <span class="text-[#667]">Celular:</span> {{ resumen?.contacto?.celular || '—' }}
                </div>
                <div class="text-[#222]">
                  <span class="text-[#667]">Teléfono:</span> {{ resumen?.contacto?.telefono || '—' }}
                </div>
              </div>
            </div>

            <!-- Fiscal -->
            <div class="rounded-xl border border-[#e6e9ef] bg-white p-3">
              <div class="text-sm text-[#445] mb-1">Datos fiscales</div>
              <div class="grid grid-cols-1 gap-1 text-sm">
                <div class="text-[#222]">
                  <span class="text-[#667]">RFC:</span> {{ resumen?.fiscal?.rfc || '—' }}
                </div>
                <div class="text-[#222]">
                  <span class="text-[#667]">Razón social:</span> {{ resumen?.fiscal?.razon_social || '—' }}
                </div>
              </div>
            </div>

            <!-- Fechas -->
            <div class="rounded-xl border border-[#e6e9ef] bg-white p-3">
              <div class="text-sm text-[#445] mb-1">Fechas</div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div class="text-[#222]">
                  <span class="text-[#667]">Inscripción:</span> {{ formatDate(resumen?.inscripcion) }}
                </div>
                <div class="text-[#222]">
                  <span class="text-[#667]">Próximo cobro:</span> {{ formatDate(resumen?.proximo_cobro) }}
                </div>
                <div class="text-[#222]">
                  <span class="text-[#667]">Último pago:</span> {{ formatDate(resumen?.ultimo_pago) }}
                </div>
              </div>
            </div>
          </template>
        </div>
      </aside>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useWorkspaceStore } from '@/stores/workspace'
import { useUiConfigStore } from '@/stores/uiConfig'
import ClienteCrearModal from '@/views/clientes/modals/ClienteCrearModal.vue'
import api from '@/api/services'
import http from '@/api/http'

const auth = useAuthStore()
const ws = useWorkspaceStore()
const ui = useUiConfigStore()

/* === Tema solo para acentos y fondos de UI === */
const theme = computed(() => {
  const t = (ui?.theme && 'value' in ui.theme) ? (ui.theme?.value || {}) : (ui.theme || {})
  return {
    primary:  t.primary  || '#1a5eff',
    secondary:t.secondary|| '#4ae364',
  }
})
const primary = computed(() => theme.value.primary)

/* ===== Estado ===== */
const modalCliente = ref(false)
const loading = ref({ kpis: true, buscar: false, resumen: false })
const kpis = ref({
  ingresosHoy: 1250, ingresosDelta: '+2.5%',
  miembrosActivos: 950, miembrosDelta: '+2.0%',
  visitasHoy: 103, visitasDelta: '+4.7%',
  ocupacion: 75, ocupacionDelta: '-1.2%',
})
const proximosCobros = ref([
  { id: 1, nombre: 'Guillermo Cisneros (00012)', fecha: addDays(3), tipo: 'Prepago' },
  { id: 2, nombre: 'Luis Ang Alcaraz (00012)',   fecha: addDays(5), tipo: 'Domiciliado' },
  { id: 3, nombre: 'Sergio Espinosa (00012)',    fecha: addDays(6), tipo: 'Prepago' },
])
const equipos = ref([
  { id: 1, nombre: 'Cinta de correr (#0012)', estadoTexto: 'En mantenimiento', badges: [{text:'En piso', color:'#10b981'}, {text:'Mantenimiento', color:'#f59e0b'}] },
  { id: 2, nombre: 'Bicicleta estática (#0007)', estadoTexto: 'Dañado', badges: [{text:'Dañado', color:'#ef4444'}] },
  { id: 3, nombre: 'Máquina de remo (#0102)', estadoTexto: 'En piso', badges: [{text:'En piso', color:'#10b981'}] },
])
const clasesHoy = ref([
  { id: 1, hora: '06:00 AM', sede: 'Gimnasio León',  nombre: 'Spin', instructor: 'Juan Pérez', delta: +2, inscritos: 12, cupo: 15 },
  { id: 2, hora: '11:00 AM', sede: 'Gimnasio León 2',nombre: 'Yoga', instructor: 'Juan Pérez', delta: +1, inscritos: 5,  cupo: 15 },
  { id: 3, hora: '08:00 PM', sede: 'Gimnasio León',  nombre: 'Entrenamiento Funcional', instructor: 'Juan Pérez', delta: +2, inscritos: 10, cupo: 15 },
])

/* Serie ingresos (mock) */
const ingresosSerie = ref(Array.from({ length: 30 }, (_, i) => 100 + Math.sin(i/3)*80 + (i%7)*20))
const planMix = ref({ estandar: 60, plus: 25, premium: 15 })
const linePoints = computed(() => {
  const max = Math.max(...ingresosSerie.value, 1)
  return ingresosSerie.value.map((v, i) => {
    const x = 30 + (i / (ingresosSerie.value.length - 1)) * (290 - 30)
    const y = 130 - (v / max) * 110
    return `${x},${y}`
  }).join(' ')
})
const areaPath = computed(() => `${linePoints.value} 290,130 30,130`)

/* Donut */
const donut = computed(() => {
  const C = 2 * Math.PI * 35
  const total = Math.max(1, planMix.value.estandar + planMix.value.plus + planMix.value.premium)
  const a = (planMix.value.estandar / total) * C
  const b = (planMix.value.plus / total) * C
  const c = (planMix.value.premium / total) * C
  return { a, b, c, C }
})

onMounted(async () => {
  if (!auth.isAuthenticated) return
  await ws.ensureEmpresaSet()
  if (!ui.loaded) await ui.loadForActiveCompany()
})

/* ===== Modal Buscar Cliente ===== */
const modalBuscar = ref(false)
const buscarInput = ref('')
const resultados = ref([])
let tDebounce = null

function openBuscarModal() {
  modalBuscar.value = true
  buscarInput.value = ''
  resultados.value = []
}
function closeBuscarModal() {
  modalBuscar.value = false
}

watch(buscarInput, (v) => {
  clearTimeout(tDebounce)
  tDebounce = setTimeout(() => {
    doSearch(v)
  }, 300)
})

async function doSearch(q) {
  if (!q || !q.trim()) { resultados.value = []; return }
  loading.value.buscar = true
  try {
    const { data } = await api.clientes.list({
      search: q.trim(),
      page_size: 10,
      ordering: '-id'
    })
    resultados.value = (data?.results || data || []).map(r => ({
      id: r.id,
      nombre: r.nombre ?? '',
      apellidos: r.apellidos ?? '',
      email: r.email || '—',
    }))
  } finally {
    loading.value.buscar = false
  }
}

/* ===== Panel Resumen Cliente ===== */
const panelClienteOpen = ref(false)
const resumen = ref(null)

function closePanelCliente() {
  panelClienteOpen.value = false
  resumen.value = null
}

async function selectCliente(c) {
  modalBuscar.value = false
  await openResumen(c.id)
}

async function openResumen(id) {
  panelClienteOpen.value = true
  loading.value.resumen = true
  try {
    const { data } = await http.get(`clientes/${id}/resumen/`)
    resumen.value = data || null
  } catch {
    resumen.value = null
  } finally {
    loading.value.resumen = false
  }
}

/* Helpers */
function money (n) { return typeof n === 'number' ? n.toLocaleString('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}) : n }
function addDays (d) { const dt = new Date(); dt.setDate(dt.getDate() + (d||0)); return dt.toISOString().slice(0,10) }
function fmtFecha (iso) { try { return new Date(iso).toLocaleDateString('es-MX',{day:'2-digit',month:'short',year:'numeric'}) } catch { return iso } }
function cobrar (c) { console.log('Cobrar a:', c) }
function onClienteCreado () { modalCliente.value = false }
function formatDate (d) { if (!d) return '—'; try { return new Date(d).toLocaleDateString('es-MX') } catch { return d } }
function badgeClass (estado) {
  const v = String(estado || '').toLowerCase()
  if (v === 'activo')  return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  if (v === 'inactivo' || v === 'vencido') return 'border-rose-200 bg-rose-50 text-rose-700'
  return 'border-[#e6e9ef] bg-[#fafbfe] text-[#445]'
}
</script>

<style scoped>
/* Cards */
.card { @apply rounded-2xl bg-white border border-[#e6e9ef] shadow-sm; }
.card-head { @apply px-4 sm:px-5 py-4 border-b border-[#e6e9ef] flex items-center justify-between; }
.card-title { @apply font-semibold; }
.icon-btn { @apply h-8 w-8 rounded-lg border border-[#e6e9ef] grid place-items-center hover:bg-[#f5f7fa] text-[#445]; }

/* KPI */
.card-kpi { @apply rounded-2xl bg-white border border-[#e6e9ef] shadow-sm px-4 py-3; }
.kpi-title { @apply text-[13px] text-[#556] mb-2; }
.kpi-row { @apply flex items-center justify-between; }
.kpi-value { @apply text-3xl font-semibold tracking-tight; }
.chip { @apply text-xs px-2 py-1 rounded-md; }
.chip--ok   { background: #e7f8ef; color: #0f8f57; }
.chip--warn { background: #fde8ea; color: #dc3545; }

/* Link con color de tema */
.link-theme { color: v-bind(primary); }
.link-theme:hover { text-decoration: underline; }

/* Botones fantasma */
.btn-ghost {
  @apply px-3 py-1.5 rounded-md text-[13px] border;
  border-color: #e6e9ef;
  background: #fafbfe;
}
.btn-ghost:hover { background: #f0f3f9; }

/* Leyenda donut */
.legend { display:inline-flex; align-items:center; gap:6px; color:#445; }
.legend::before{ content:''; width:8px; height:8px; border-radius:9999px; background: var(--c); display:inline-block; }

/* FABs */
.fab {
  position: fixed; right: 1.5rem; bottom: 6.5rem;
  height: 3.5rem; width: 3.5rem;
  border-radius: 9999px; color: #fff;
  display:flex; align-items:center; justify-content:center;
  box-shadow: 0 8px 24px rgba(0,0,0,.15);
}
.fab--secondary {
  right: 1.5rem; bottom: 1.5rem;
  height: 3.5rem; width: 3.5rem;
  border-radius: 9999px; color: #1a1a1a;
  background: #fff; border: 1px solid #e6e9ef;
  box-shadow: 0 8px 24px rgba(0,0,0,.08);
}
</style>
