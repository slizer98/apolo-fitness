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
              <span class="chip chip--ok">+2.5%</span>
            </div>
          </div>
          <div class="card-kpi">
            <div class="kpi-title">Miembros activos</div>
            <div class="kpi-row">
              <div class="kpi-value">{{ loading.kpis ? '—' : formatMiles(kpis.miembrosActivos) }}</div>
              <span class="chip chip--ok">+2.0%</span>
            </div>
          </div>
          <div class="card-kpi">
            <div class="kpi-title">Visitas del día</div>
            <div class="kpi-row">
              <div class="kpi-value">{{ loading.kpis ? '—' : formatMiles(kpis.visitasHoy) }}</div>
              <span class="chip chip--ok">+4.7%</span>
            </div>
          </div>
          <div class="card-kpi">
            <div class="kpi-title">Ocupaciones de clases</div>
            <div class="kpi-row">
              <div class="kpi-value">{{ loading.kpis ? '—' : (kpis.ocupacion + '%') }}</div>
              <span class="chip chip--warn">-1.2%</span>
            </div>
          </div>
        </section>

        <!-- Gráficas + Clases -->
        <section class="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
          <!-- Columna izquierda -->
          <div class="lg:col-span-2 space-y-5">
            <!-- Ingresos / Plan -->
            <div class="card overflow-hidden">
              <div class="grid grid-cols-1 md:grid-cols-2">
                <!-- Línea -->
                <div class="p-4 sm:p-5">
                  <VChart :option="lineOption" autoresize class="h-56" />
                </div>
                <!-- Dona -->
                <div class="p-4 sm:p-5">
                  <VChart :option="pieOption" autoresize class="h-56" />
                </div>
              </div>
            </div>

            <!-- Próximos cobros / Equipos -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <!-- Próximos cobros -->
              <div class="card">
                <div class="card-head">
                  <h3 class="card-title">Próximos cobros</h3>
                  <button class="icon-btn" @click="loadCobros" title="Actualizar">⟳</button>
                </div>

                <div class="p-4 sm:p-5 space-y-4 max-h-64 overflow-auto" v-if="!loading.cobros">
                  <div v-for="c in proximosCobros" :key="c.id" class="flex items-center justify-between">
                    <div class="min-w-0">
                      <div class="font-medium truncate max-w-[260px]">{{ c.nombre }}</div>
                      <div class="text-xs text-[#667]">{{ fmtFecha(c.fecha) }}<span v-if="c.tipo"> ({{ c.tipo }})</span></div>
                    </div>
                    <button class="btn-ghost" @click="cobrar(c)">Cobrar</button>
                  </div>
                  <div v-if="!proximosCobros.length" class="text-[13px] text-[#667]">Sin cobros próximos</div>
                </div>
                <div v-else class="p-4 text-[#667] text-sm">Cargando…</div>
              </div>

              <!-- Equipos (único hardcodeado) con filtros -->
              <div class="card">
                <div class="card-head">
                  <h3 class="card-title">Equipos</h3>
                  <div class="flex gap-2">
                    <button
                      v-for="f in filtrosEquipos"
                      :key="f.key"
                      @click="toggleFiltroEquipo(f.key)"
                      class="text-[11px] px-2 py-1 rounded-md text-white"
                      :style="{ background: eqFilter === f.key ? f.color : '#a3a3a3' }"
                    >
                      {{ f.text }}
                    </button>
                  </div>
                </div>
                <div class="p-4 sm:p-5 space-y-3">
                  <div v-for="e in equiposFiltrados" :key="e.id" class="flex items-center justify-between">
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
                  <div v-if="!equiposFiltrados.length" class="text-[13px] text-[#667]">Sin equipos</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Columna derecha: Clases (disciplinas) -->
          <div class="card">
            <div class="card-head">
              <h3 class="card-title">Clases</h3>
              <button class="icon-btn" @click="loadClases">≡</button>
            </div>
            <div class="p-4 sm:p-5 space-y-4" v-if="!loading.clases">
              <div
                v-for="clase in clases"
                :key="clase.id"
                class="rounded-2xl border border-[#e6e9ef] bg-white p-4"
              >
                <div class="text-[12px] text-[#667] mb-1">
                  {{ clase.hora_inicio }}–{{ clase.hora_fin }} — {{ clase.sede || 'Gimnasio' }}
                </div>
                <div class="font-semibold mb-1">{{ clase.nombre }}</div>
                <div class="text-[12px] text-[#667] mb-2">{{ clase.instructor || '—' }}</div>

                <div v-if="clase.cupo && clase.inscritos != null" class="flex items-center justify-between text-[12px] mb-1">
                  <span :class="{'text-emerald-600': clase.delta>0, 'text-rose-600': clase.delta<0, 'text-[#667]': clase.delta===0}">
                    {{ clase.delta>0 ? ('+'+clase.delta) : (clase.delta<0 ? clase.delta : '0') }}
                  </span>
                  <span class="text-[#667]">({{ formatMiles(clase.inscritos) }}/{{ formatMiles(clase.cupo) }})</span>
                </div>

                <div v-if="clase.cupo && clase.inscritos != null" class="h-2 rounded-full bg-[#eef2f7] overflow-hidden">
                  <div
                    class="h-full rounded-full"
                    :style="{ width: Math.min(100, Math.round((clase.inscritos / Math.max(1, clase.cupo)) * 100)) + '%', background: clase.colorBarra }"
                  />
                </div>
              </div>
              <div v-if="!clases.length" class="text-[13px] text-[#667]">No hay clases para mostrar.</div>
            </div>
            <div v-else class="p-4 text-[#667] text-sm">Cargando…</div>
          </div>
        </section>

        <!-- Link -->
        <div class="mt-5 text-right">
          <RouterLink :to="{ name: 'ClientesLista' }" class="link-theme">Ver todos los clientes</RouterLink>
        </div>
      </div>
    </main>

    <!-- FABs -->
    <button class="fab" :style="{ backgroundColor: primary }" @click="modalCliente = true" title="Nuevo miembro">
      <i class="fa-solid fa-plus"></i>
    </button>
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
              placeholder="Buscar cliente por nombre, email, RFC o CURP…"
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
                <span class="text-[11px] px-2 py-1 rounded-md border border-[#e6e9ef] bg-[#fafbfe] text-[#445]">Ver</span>
              </button>
              <div v-if="!resultados.length" class="px-4 py-8 text-center text-[13px] text-[#667]">
                Sin resultados
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Slide-over Cliente usando tu ClientSummaryCard -->
    <transition
      enter-active-class="transition transform duration-200"
      enter-from-class="opacity-0 translate-x-3"
      enter-to-class="opacity-100 translate-x-0"
      leave-active-class="transition transform duration-150"
      leave-from-class="opacity-100 translate-x-0"
      leave-to-class="opacity-0 translate-x-3"
    >
      <aside v-if="panelClienteOpen" class="fixed top-0 right-0 h-full w-[420px] bg-white border-l border-[#e6e9ef] shadow-2xl z-40">
        <div class="px-4 py-3 border-b border-[#e6e9ef] flex items-center justify-between">
          <div class="font-semibold truncate max-w-[300px]">
            {{ (resumen && (resumen.nombre + ' ' + (resumen.apellidos||''))) || 'Cliente' }}
          </div>
          <button class="icon-btn" @click="closePanelCliente" title="Cerrar">✕</button>
        </div>
        <div class="p-4 overflow-auto h-[calc(100%-52px)]">
          <ClientSummaryCard
            v-if="resumen"
            :cliente="resumen"
            @ver="verEditar"
            @contacto="() => {}"
            @fiscales="() => {}"
            @cobrar="() => cobrar({ id: resumen.id, nombre: (resumen.nombre||'') + ' ' + (resumen.apellidos||'') })"
            @renovar="() => {}"
          />
        </div>
      </aside>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useWorkspaceStore } from '@/stores/workspace'
import { useUiConfigStore } from '@/stores/uiConfig'
import ClienteCrearModal from '@/views/clientes/modals/ClienteCrearModal.vue'
import ClientSummaryCard from '@/components/ClientSummaryCard.vue'
import api from '@/api/services'
import http from '@/api/http'

/* ====== echarts ====== */
import { use } from 'echarts/core'
import VChart from 'vue-echarts'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, PieChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent } from 'echarts/components'
use([CanvasRenderer, LineChart, PieChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent])

const router = useRouter()
const auth = useAuthStore()
const ws = useWorkspaceStore()
const ui = useUiConfigStore()

/* === Tema === */
const theme = computed(() => {
  const t = (ui?.theme && 'value' in ui.theme) ? (ui.theme?.value || {}) : (ui.theme || {})
  return { primary: t.primary || '#1a5eff', secondary: t.secondary || '#4ae364' }
})
const primary = computed(() => theme.value.primary)

/* ===== Estado ===== */
const modalCliente = ref(false)
const loading = ref({ kpis: true, ingresos: true, cobros: false, clases: true, buscar: false, resumen: false })

const kpis = ref({ ingresosHoy: 0, ingresosDelta: 0, miembrosActivos: 0, miembrosDelta: 0, visitasHoy: 0, visitasDelta: 0, ocupacion: 0, ocupacionDelta: 0 })
const proximosCobros = ref([])
const clases = ref([])

/* Equipos + filtros (único hardcode) */
const filtrosEquipos = [
  { key: 'piso',  text: 'En piso',        color: '#10b981' },
  { key: 'manto', text: 'Mantenimiento',  color: '#f59e0b' },
  { key: 'da',    text: 'Dañado',         color: '#ef4444' },
]
const eqFilter = ref('piso')
const equipos = ref([
  { id: 1, nombre: 'Cinta de correr (#0012)',   estadoTexto: 'En mantenimiento', tags:['manto','piso'], badges:[{text:'En piso', color:'#10b981'},{text:'Mantenimiento', color:'#f59e0b'}] },
  { id: 2, nombre: 'Bicicleta estática (#0007)', estadoTexto: 'Dañado',         tags:['da'],           badges:[{text:'Dañado', color:'#ef4444'}] },
  { id: 3, nombre: 'Máquina de remo (#0102)',    estadoTexto: 'En piso',        tags:['piso'],        badges:[{text:'En piso', color:'#10b981'}] },
  { id: 4, nombre: 'Prensa de piernas (#0110)',  estadoTexto: 'En piso',        tags:['piso'],        badges:[{text:'En piso', color:'#10b981'}] },
])
const equiposFiltrados = computed(() => equipos.value.filter(e => e.tags.includes(eqFilter.value)))
function toggleFiltroEquipo(key){ eqFilter.value = key }

/* === Serie ingresos === */
const ingresosFechas = ref([])
const ingresosSerie = ref([])

/* ====== OPTIONS ECHARTS ====== */
const lineOption = computed(() => ({
  title: { text: 'Ingresos – Últimos 30 días', left: 'left', top: 6, textStyle: { fontSize: 14, fontWeight: 600 } },
  grid: { left: 28, right: 12, top: 38, bottom: 22 },
  tooltip: { trigger: 'axis', valueFormatter: v => money(v) },
  xAxis: {
    type: 'category',
    data: ingresosFechas.value.map(d => new Date(d).toLocaleDateString('es-MX', { day:'2-digit', month:'short' })),
    boundaryGap: false,
    axisLabel: { fontSize: 11 }
  },
  yAxis: {
    type: 'value',
    axisLabel: { formatter: (v) => formatMiles(v), fontSize: 11 },
    splitLine: { lineStyle: { color: '#eef2f7' } }
  },
  series: [{
    type: 'line',
    smooth: true,
    symbol: 'none',
    lineStyle: { width: 2 },
    areaStyle: {
      opacity: 0.35,
      color: { type:'linear', x:0, y:0, x2:0, y2:1, colorStops:[{offset:0,color:'#60a5fa'},{offset:1,color:'#ffffff'}] }
    },
    data: ingresosSerie.value
  }]
}))

const pieOption = computed(() => ({
  title: { text: 'Plan', left: 'center', top: 6, textStyle: { fontSize: 14, fontWeight: 600 } },
  tooltip: { trigger: 'item', valueFormatter: v => formatMiles(v) },
  legend: { top: 6, right: 10, orient: 'horizontal', itemWidth: 10, itemHeight: 10, textStyle: { fontSize: 12 } },
  series: [{
    name: 'Plan',
    type: 'pie',
    radius: ['55%','80%'],
    center: ['50%','58%'],
    label: { show: false },
    emphasis: { label: { show: true, fontSize: 14, formatter: '{b}: {d}%' } },
    data: planesDona.value
  }]
}))

/* Dona real por plan (cuenta de altas por plan en 30 días) */
const planesDona = ref([])

/* ==== Carga de datos ==== */
async function loadKpis() {
  loading.value.kpis = true
  try {
    const empresa = ws.empresaId
    const hoy = new Date(); hoy.setHours(0,0,0,0)
    const manana = new Date(hoy); manana.setDate(manana.getDate() + 1)

    const { data: ventasHoy } = await api.ventas.ventas.list({
      empresa, fecha_after: hoy.toISOString(), fecha_before: manana.toISOString(), page_size: 1000
    })
    const arrVentasHoy = ventasHoy?.results || ventasHoy || []
    const ingresosHoy = arrVentasHoy.reduce((acc, v) => acc + Number(v.total ?? v.importe ?? 0), 0)

    const { data: clientesData } = await api.clientes.list({ is_active: true, page_size: 1 })
    const miembrosActivos =
      clientesData?.count ??
      (clientesData?.results?.length ?? (Array.isArray(clientesData) ? clientesData.length : 0))

    let visitasHoy = 0
    try {
      const { data: acc } = await api.accesos.list({
        fecha_after: hoy.toISOString(), fecha_before: manana.toISOString(), page_size: 1
      })
      visitasHoy = acc?.count ?? (acc?.results?.length ?? 0)
    } catch {}

    let ocupacion
    try {
      const { data: horarios } = await api.horariosDisciplinas.list({ page_size: 200 })
      const items = horarios?.results || horarios || []
      if (items.length && items[0].inscritos != null && items[0].cupo != null) {
        const ratios = items.map(h => Math.min(1, (Number(h.inscritos)||0) / Math.max(1, Number(h.cupo)||1)))
        const avg = ratios.length ? (ratios.reduce((a,b)=>a+b,0)/ratios.length) : 0
        ocupacion = Math.round(avg * 100)
      } else {
        ocupacion = 75
      }
    } catch { ocupacion = 75 }

    kpis.value = { ingresosHoy, ingresosDelta: 0, miembrosActivos, miembrosDelta: 0, visitasHoy, visitasDelta: 0, ocupacion, ocupacionDelta: 0 }
  } finally { loading.value.kpis = false }
}

async function loadIngresos() {
  loading.value.ingresos = true
  try {
    const empresa = ws.empresaId
    const hoy = new Date(); hoy.setHours(0,0,0,0)
    const inicio = new Date(hoy); inicio.setDate(inicio.getDate() - 29)
    const fin = new Date(hoy); fin.setDate(fin.getDate() + 1)

    // ventas por día
    const { data } = await api.ventas.ventas.list({
      empresa, fecha_after: inicio.toISOString(), fecha_before: fin.toISOString(), page_size: 1000, ordering: 'fecha'
    })
    const rows = data?.results || data || []

    const map = new Map()
    for (const v of rows) {
      const d = (v.fecha || '').slice(0,10)
      map.set(d, (map.get(d) || 0) + Number(v.total ?? v.importe ?? 0))
    }

    const fechas = [], valores = []
    for (let i = 0; i < 30; i++) {
      const d = new Date(inicio); d.setDate(inicio.getDate() + i)
      const key = d.toISOString().slice(0,10)
      fechas.push(key)
      valores.push(Number(map.get(key) || 0))
    }
    ingresosFechas.value = fechas
    ingresosSerie.value = valores

    // dona por plan: contar altas de últimos 30 días por nombre de plan
    const { data: altasData } = await api.altasPlan.list({ fecha_after: inicio.toISOString(), fecha_before: fin.toISOString(), page_size: 1000 })
    const altas = altasData?.results || altasData || []
    const cuenta = new Map()
    for (const a of altas) {
      const nombre = a.plan_nombre || `Plan ${a.plan}`
      cuenta.set(nombre, (cuenta.get(nombre) || 0) + 1)
    }
    planesDona.value = Array.from(cuenta.entries()).map(([name, value]) => ({ name, value }))
  } finally { loading.value.ingresos = false }
}

async function loadCobros() {
  loading.value.cobros = true
  try {
    // ALTAS con fecha_limite_pago, y completamos nombre de cliente si falta
    const { data } = await api.altasPlan.list({ ordering: 'fecha_limite_pago', page_size: 50 })
    const arr = data?.results || data || []

    // reunir ids de cliente sin nombre
    const items = arr
      .filter(a => !!a.fecha_limite_pago)
      .map(a => ({
        id: a.id,
        clienteId: a.cliente,
        nombre: a.cliente_nombre || null,
        fecha: a.fecha_limite_pago,
        tipo: a.renovacion ? 'Renovación' : 'Prepago'
      }))
      
    // completar nombres faltantes con llamadas puntuales
    for (const it of items) {
      if (!it.nombre && it.clienteId) {
        try {
          const { data: cli } = await api.clientes.retrieve(it.clienteId)
          it.nombre = `${cli?.nombre || ''} ${cli?.apellidos || ''}`.trim() || `Cliente ${it.clienteId}`
        } catch {}
      }
    }
    console.log(proximosCobros.value)
    proximosCobros.value = items
      .filter(i => !!i.nombre && !!i.fecha)
      .sort((a,b) => (a.fecha > b.fecha ? 1 : -1))
      .slice(0, 20)
  } finally { loading.value.cobros = false }
}

/** Clases (disciplinas) */
async function loadClases(){
  loading.value.clases = true
  try{
    const [horRes, disRes] = await Promise.all([
      api.horariosDisciplinas.list({ page_size: 500, ordering: 'hora_inicio' }),
      api.disciplinas.list({ page_size: 500, ordering: 'nombre' })
    ])
    const horarios = horRes.data?.results || horRes.data || []
    const disciplinas = disRes.data?.results || disRes.data || []
    const mapDisc = new Map(disciplinas.map(d => [d.id, d]))

    const palette = ['#22c55e', '#ef4444', '#f59e0b']
    let i = 0
    clases.value = horarios.map(h => {
      const d = mapDisc.get(h.disciplina) || {}
      return {
        id: h.id,
        nombre: h.disciplina_nombre || d.nombre || 'Clase',
        instructor: d.instructor_nombre || '—',
        sede: d.empresa_nombre || 'Gimnasio',
        hora_inicio: h.hora_inicio,
        hora_fin: h.hora_fin,
        inscritos: (h.inscritos != null) ? Number(h.inscritos) : null,
        cupo: (d.limite_personas != null) ? Number(d.limite_personas) : null,
        delta: (i%3===0)? 2 : (i%3===1? 1 : -1),
        colorBarra: palette[i++ % palette.length],
      }
    })
  } finally { loading.value.clases = false }
}

onMounted(async () => {
  if (!auth.isAuthenticated) return
  await ws.ensureEmpresaSet()
  await Promise.all([loadKpis(), loadIngresos(), loadCobros(), loadClases()])
})

/* ===== Modal Buscar Cliente ===== */
const modalBuscar = ref(false)
const buscarInput = ref('')
const resultados = ref([])
let tDebounce = null
function openBuscarModal() { modalBuscar.value = true; buscarInput.value = ''; resultados.value = [] }
function closeBuscarModal() { modalBuscar.value = false }
watch(buscarInput, (v) => { clearTimeout(tDebounce); tDebounce = setTimeout(() => { doSearch(v) }, 300) })
async function doSearch(q) {
  if (!q || !q.trim()) { resultados.value = []; return }
  loading.value.buscar = true
  try {
    // En el backend, haz que search incluya RFC/CURP
    const { data } = await api.clientes.list({ search: q.trim(), page_size: 10, ordering: '-id' })
    resultados.value = (data?.results || data || []).map(r => ({
      id: r.id, nombre: r.nombre ?? '', apellidos: r.apellidos ?? '', email: r.email || '—',
    }))
  } finally { loading.value.buscar = false }
}

/* ===== Panel Resumen Cliente ===== */
const panelClienteOpen = ref(false)
const resumen = ref(null)
function closePanelCliente() { panelClienteOpen.value = false; resumen.value = null }
async function selectCliente(c) { modalBuscar.value = false; await openResumen(c.id) }
async function openResumen(id) {
  panelClienteOpen.value = true
  loading.value.resumen = true
  try { const { data } = await http.get(`clientes/${id}/resumen/`); resumen.value = data || null }
  catch { resumen.value = null }
  finally { loading.value.resumen = false }
}
function verEditar(){
  const id = resumen.value?.id
  if(!id) return
  try { router.push({ name: 'ClientesLista', query: { sel: id } }) } catch {}
}

/* Helpers */
function money (n) { return Number(n||0).toLocaleString('es-MX',{ style:'currency', currency:'MXN', maximumFractionDigits:0 }) }
function formatMiles(n){ return Number(n||0).toLocaleString('es-MX') }
function fmtFecha (iso) { try { return new Date(iso).toLocaleDateString('es-MX',{day:'2-digit',month:'short',year:'numeric'}) } catch { return iso } }
function onClienteCreado () { modalCliente.value = false }
function cobrar (c) { console.log('Cobrar a:', c) }
</script>

<style scoped>
.card { @apply rounded-2xl bg-white border border-[#e6e9ef] shadow-sm; }
.card-head { @apply px-4 sm:px-5 py-4 border-b border-[#e6e9ef] flex items-center justify-between; }
.card-title { @apply font-semibold; }
.icon-btn { @apply h-8 w-8 rounded-lg border border-[#e6e9ef] grid place-items-center hover:bg-[#f5f7fa] text-[#445]; }

.card-kpi { @apply rounded-2xl bg-white border border-[#e6e9ef] shadow-sm px-4 py-3; }
.kpi-title { @apply text-[13px] text-[#556] mb-2; }
.kpi-row { @apply flex items-center justify-between; }
.kpi-value { @apply text-3xl font-semibold tracking-tight; }
.chip { @apply text-xs px-2 py-1 rounded-md; }
.chip--ok   { background: #e7f8ef; color: #0f8f57; }
.chip--warn { background: #fde8ea; color: #dc3545; }

.link-theme { color: v-bind(primary); }
.link-theme:hover { text-decoration: underline; }

.btn-ghost { @apply px-3 py-1.5 rounded-md text-[13px] border; border-color:#e6e9ef; background:#fafbfe; }
.btn-ghost:hover { background:#f0f3f9; }

.fab { position: fixed; right: 1.5rem; bottom: 6.5rem; height: 3.5rem; width: 3.5rem;
  border-radius: 9999px; color:#fff; display:flex; align-items:center; justify-content:center;
  box-shadow: 0 8px 24px rgba(0,0,0,.15); }
.fab--secondary { right: 1.5rem; bottom: 1.5rem; height:3.5rem; width:3.5rem; border-radius:9999px; color:#1a1a1a;
  background:#fff; border:1px solid #e6e9ef; box-shadow: 0 8px 24px rgba(0,0,0,.08); }
</style>
