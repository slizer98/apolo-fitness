<template>
  <!-- Fondo y color vienen del layout/CSS global; aquí no forzamos bg/text -->
  <div class="min-h-screen flex flex-col">
    <main class="flex-1">
      <div class="mx-auto w-full max-w-[1200px] px-5 py-6">
        <!-- KPIs -->
        <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="card-kpi">
            <div class="kpi-title" :style="{ color: subtext }">Ingresos del día</div>
            <div class="kpi-row">
              <div class="kpi-value" :style="{ color: theme.text }">{{ loading.kpis ? '—' : money(kpis.ingresosHoy) }}</div>
              <span class="chip chip--ok">+2.5%</span>
            </div>
          </div>
          <div class="card-kpi">
            <div class="kpi-title" :style="{ color: subtext }">Miembros activos</div>
            <div class="kpi-row">
              <div class="kpi-value" :style="{ color: theme.text }">{{ loading.kpis ? '—' : formatMiles(kpis.miembrosActivos) }}</div>
              <span class="chip chip--ok">+2.0%</span>
            </div>
          </div>
          <div class="card-kpi">
            <div class="kpi-title" :style="{ color: subtext }">Visitas del día</div>
            <div class="kpi-row">
              <div class="kpi-value" :style="{ color: theme.text }">{{ loading.kpis ? '—' : formatMiles(kpis.visitasHoy) }}</div>
              <span class="chip chip--ok">+4.7%</span>
            </div>
          </div>
          <div class="card-kpi">
            <div class="kpi-title" :style="{ color: subtext }">Ocupaciones de clases</div>
            <div class="kpi-row">
              <div class="kpi-value" :style="{ color: theme.text }">{{ loading.kpis ? '—' : (kpis.ocupacion + '%') }}</div>
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
                  <h3 class="card-title" :style="{ color: theme.text }">Próximos cobros</h3>
                  <button class="icon-btn" @click="loadCobros" title="Actualizar" :style="iconBtnStyle">⟳</button>
                </div>

                <div class="p-4 sm:p-5 space-y-4 max-h-64 overflow-auto" v-if="!loading.cobros">
                  <div v-for="c in proximosCobros" :key="c.id" class="flex items-center justify-between">
                    <div class="min-w-0">
                      <div class="font-medium truncate max-w-[260px]" :style="{ color: theme.text }">{{ c.nombre }}</div>
                      <div class="text-xs truncate" :style="{ color: subtext }">{{ fmtFecha(c.fecha) }}<span v-if="c.tipo"> ({{ c.tipo }})</span></div>
                    </div>
                    <button class="btn-ghost">Cobrar</button>
                  </div>
                  <div v-if="!proximosCobros.length" class="text-[13px]" :style="{ color: subtext }">Sin cobros próximos</div>
                </div>
                <div v-else class="p-4 text-sm" :style="{ color: subtext }">Cargando…</div>
              </div>

              <!-- Equipos (hardcode) con filtros -->
              <div class="card">
                <div class="card-head">
                  <h3 class="card-title" :style="{ color: theme.text }">Equipos</h3>
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
                      <div class="font-medium" :style="{ color: theme.text }">{{ e.nombre }}</div>
                      <div class="text-xs" :style="{ color: subtext }">{{ e.estadoTexto }}</div>
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
                  <div v-if="!equiposFiltrados.length" class="text-[13px]" :style="{ color: subtext }">Sin equipos</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Columna derecha: Clases (disciplinas) -->
          <div class="card">
            <div class="card-head">
              <h3 class="card-title" :style="{ color: theme.text }">Clases</h3>
              <button class="icon-btn" @click="loadClases" title="Recargar" :style="iconBtnStyle">≡</button>
            </div>
            <div class="p-4 sm:p-5 space-y-4" v-if="!loading.clases">
              <div
                v-for="clase in clases"
                :key="clase.id"
                class="rounded-2xl border p-4"
                :style="{ background: theme.cardBg, color: theme.cardText, borderColor }"
              >
                <div class="text-[12px] mb-1" :style="{ color: subtext }">
                  {{ clase.hora_inicio }}–{{ clase.hora_fin }} — {{ clase.sede || 'Gimnasio' }}
                </div>
                <div class="font-semibold mb-1" :style="{ color: theme.text }">{{ clase.nombre }}</div>
                <div class="text-[12px] mb-2" :style="{ color: subtext }">{{ clase.instructor || '—' }}</div>

                <div v-if="clase.cupo && clase.inscritos != null" class="flex items-center justify-between text-[12px] mb-1">
                  <span :style="{ color: clase.delta>0 ? '#059669' : (clase.delta<0 ? '#e11d48' : subtext) }">
                    {{ clase.delta>0 ? ('+'+clase.delta) : (clase.delta<0 ? clase.delta : '0') }}
                  </span>
                  <span :style="{ color: subtext }">({{ formatMiles(clase.inscritos) }}/{{ formatMiles(clase.cupo) }})</span>
                </div>

                <div v-if="clase.cupo && clase.inscritos != null" class="h-2 rounded-full overflow-hidden" :style="{ background: trackBg }">
                  <div
                    class="h-full rounded-full"
                    :style="{ width: Math.min(100, Math.round((clase.inscritos / Math.max(1, clase.cupo)) * 100)) + '%', background: clase.colorBarra }"
                  />
                </div>
              </div>
              <div v-if="!clases.length" class="text-[13px]" :style="{ color: subtext }">No hay clases para mostrar.</div>
            </div>
            <div v-else class="p-4 text-sm" :style="{ color: subtext }">Cargando…</div>
          </div>
        </section>

        <!-- Link -->
        <div class="mt-5 text-right">
          <RouterLink :to="{ name: 'ClientesLista' }" class="link-theme">Ver todos los clientes</RouterLink>
        </div>
      </div>
    </main>

    <!-- FABs -->
    <button class="fab" :style="{ backgroundColor: primary, color: contrastOnPrimary }" @click="modalCliente = true" title="Nuevo miembro">
      <i class="fa-solid fa-plus"></i>
    </button>
    <button class="fab fab--secondary" title="Buscar cliente" @click="openBuscarModal" :style="fabSecondaryStyle">
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
        <div class="rounded-2xl border shadow-xl overflow-hidden" :style="{ background: theme.cardBg, color: theme.cardText, borderColor }">
          <div class="px-4 py-3 border-b flex items-center gap-2" :style="{ borderColor }">
            <i class="fa fa-magnifying-glass" :style="{ color: subtext }"></i>
            <input
              v-model="buscarInput"
              type="text"
              placeholder="Buscar cliente por nombre, email, RFC o CURP…"
              class="flex-1 outline-none text-[14px]"
              :style="{ color: theme.cardText, '::placeholder': { color: subtext } }"
              autofocus
            />
            <button class="icon-btn" @click="closeBuscarModal" :style="iconBtnStyle">✕</button>
          </div>

          <div class="max-h-72 overflow-auto">
            <div v-if="loading.buscar" class="p-3 space-y-2">
              <div class="h-4 rounded animate-pulse" :style="{ background: skeletonBg }"></div>
              <div class="h-4 rounded animate-pulse w-2/3" :style="{ background: skeletonBg }"></div>
              <div class="h-4 rounded animate-pulse w-1/2" :style="{ background: skeletonBg }"></div>
            </div>

            <template v-else>
              <button
                v-for="c in resultados"
                :key="c.id"
                class="w-full text-left px-4 py-2 flex items-center justify-between"
                :style="rowHoverStyle"
                @click="selectCliente(c)"
              >
                <div class="min-w-0">
                  <div class="font-medium truncate" :style="{ color: theme.cardText }">{{ c.nombre }} {{ c.apellidos }}</div>
                  <div class="text-[12px] truncate" :style="{ color: subtext }">{{ c.email || '—' }}</div>
                </div>
                <span class="text-[11px] px-2 py-1 rounded-md border" :style="{ borderColor, background: chipBg, color: chipText }">Ver</span>
              </button>
              <div v-if="!resultados.length" class="px-4 py-8 text-center text-[13px]" :style="{ color: subtext }">
                Sin resultados
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Slide-over Cliente -->
    <transition
      enter-active-class="transition transform duration-200"
      enter-from-class="opacity-0 translate-x-3"
      enter-to-class="opacity-100 translate-x-0"
      leave-active-class="transition transform duration-150"
      leave-from-class="opacity-100 translate-x-0"
      leave-to-class="opacity-0 translate-x-3"
    >
      <aside v-if="panelClienteOpen" class="fixed top-0 right-0 h-full w-[420px] shadow-2xl z-40 border-l" :style="{ background: theme.cardBg, color: theme.cardText, borderColor }">
        <div class="px-4 py-3 border-b flex items-center justify-between" :style="{ borderColor }">
          <div class="font-semibold truncate max-w-[300px]" :style="{ color: theme.cardText }">
            {{ (resumen && (resumen.nombre + ' ' + (resumen.apellidos||''))) || 'Cliente' }}
          </div>
          <button class="icon-btn" @click="closePanelCliente" title="Cerrar" :style="iconBtnStyle">✕</button>
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
  const t = ui.theme?.value || ui.theme || {}
  return {
    primary:   t.primary   || '#1a5eff',
    secondary: t.secondary || '#4ae364',
    text:      t.text      || '#0f172a',
    cardBg:    t.cardBg    || '#ffffff',
    cardText:  t.cardText  || '#0f172a',
    subtext:   t.subtext   || null, 
  }
})
const primary = computed(() => theme.value.primary)

/* Derivados (contrast, subtext, borders, hovers) */
function hexToRgb(hex) {
  const h = hex?.replace('#','')
  if (!h || (h.length!==6 && h.length!==3)) return { r:15,g:23,b:42 }
  const v = h.length===3 ? h.split('').map(x=>x+x).join('') : h
  const r = parseInt(v.slice(0,2),16), g = parseInt(v.slice(2,4),16), b = parseInt(v.slice(4,6),16)
  return { r,g,b }
}
function isDark(hex) {
  const {r,g,b} = hexToRgb(hex)
  const L = (0.2126*(r/255) + 0.7152*(g/255) + 0.0722*(b/255))
  return L < 0.6
}
const subtext = computed(() => theme.value.subtext || (isDark(theme.value.text) ? 'rgba(255,255,255,0.7)' : 'rgba(15,23,42,0.55)'))
const borderColor = computed(() => isDark(theme.value.text) ? 'rgba(255,255,255,0.18)' : 'rgba(15,23,42,0.08)')
const trackBg = computed(() => isDark(theme.value.text) ? 'rgba(255,255,255,0.12)' : '#eef2f7')
const skeletonBg = computed(() => isDark(theme.value.text) ? 'rgba(255,255,255,0.10)' : '#eef2f7')
const chipBg = computed(() => isDark(theme.value.text) ? 'rgba(255,255,255,0.08)' : '#fafbfe')
const chipText = computed(() => theme.value.cardText)
const rowHoverStyle = computed(() => ({
  background: 'transparent'
}))
const iconBtnStyle = computed(() => ({
  color: theme.value.cardText,
  borderColor: borderColor.value,
  background: 'transparent'
}))
const fabSecondaryStyle = computed(() => ({
  background: theme.value.cardBg,
  color: theme.value.cardText,
  border: `1px solid ${borderColor.value}`,
  boxShadow: '0 8px 24px rgba(0,0,0,.08)'
}))
const contrastOnPrimary = computed(() => (isDark(theme.value.primary) ? '#fff' : '#0f172a'))

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
  color: [theme.value.primary],
  title: { text: 'Ingresos – Últimos 30 días', left: 'left', top: 6, textStyle: { fontSize: 14, fontWeight: 600, color: theme.value.cardText } },
  grid: { left: 28, right: 12, top: 38, bottom: 22 },
  tooltip: { trigger: 'axis', valueFormatter: v => money(v) },
  xAxis: {
    type: 'category',
    data: ingresosFechas.value.map(d => new Date(d).toLocaleDateString('es-MX', { day:'2-digit', month:'short' })),
    boundaryGap: false,
    axisLabel: { fontSize: 11, color: subtext.value },
    axisLine: { lineStyle: { color: borderColor.value } },
    axisTick: { show: false }
  },
  yAxis: {
    type: 'value',
    axisLabel: { formatter: (v) => formatMiles(v), fontSize: 11, color: subtext.value },
    splitLine: { lineStyle: { color: borderColor.value } }
  },
  series: [{
    type: 'line',
    smooth: true,
    symbol: 'none',
    lineStyle: { width: 2, color: theme.value.primary },
    areaStyle: {
      opacity: 0.35,
      color: { type:'linear', x:0, y:0, x2:0, y2:1, colorStops:[{offset:0,color:theme.value.primary},{offset:1,color:theme.value.cardBg}] }
    },
    data: ingresosSerie.value
  }]
}))

const pieOption = computed(() => ({
  color: [theme.value.primary, '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#f97316'],
  title: { text: 'Plan', left: 'center', top: 6, textStyle: { fontSize: 14, fontWeight: 600, color: theme.value.cardText } },
  tooltip: { trigger: 'item', valueFormatter: v => formatMiles(v) },
  legend: { top: 6, right: 10, orient: 'horizontal', itemWidth: 10, itemHeight: 10, textStyle: { fontSize: 12, color: subtext.value } },
  series: [{
    name: 'Plan',
    type: 'pie',
    radius: ['55%','80%'],
    center: ['50%','58%'],
    label: { show: false },
    emphasis: { label: { show: true, fontSize: 14, formatter: '{b}: {d}%', color: theme.value.cardText } },
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

    // dona por plan (altas en 30 días)
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
    const { data } = await api.altasPlan.list({ ordering: 'fecha_limite_pago', page_size: 50 })
    const arr = data?.results || data || []
    const items = arr
      .filter(a => !!a.fecha_limite_pago)
      .map(a => ({
        id: a.id,
        clienteId: a.cliente,
        nombre: a.cliente_nombre || null,
        fecha: a.fecha_limite_pago,
        tipo: a.renovacion ? 'Renovación' : 'Prepago'
      }))

    for (const it of items) {
      if (!it.nombre && it.clienteId) {
        try {
          const { data: cli } = await api.clientes.retrieve(it.clienteId)
          it.nombre = `${cli?.nombre || ''} ${cli?.apellidos || ''}`.trim() || `Cliente ${it.clienteId}`
        } catch {}
      }
    }
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
/* Cards base */
.card {
  @apply rounded-2xl border shadow-sm;
  background: v-bind('theme.cardBg');
  color: v-bind('theme.cardText');
  border-color: v-bind('borderColor');
}
.card-head {
  @apply px-4 sm:px-5 py-4 border-b flex items-center justify-between;
  border-color: v-bind('borderColor');
}
.card-title { @apply font-semibold; }

/* Icon buttons */
.icon-btn {
  @apply h-8 w-8 rounded-lg grid place-items-center;
  border: 1px solid;
}

/* KPI cards */
.card-kpi {
  @apply rounded-2xl border shadow-sm px-4 py-3;
  background: v-bind('theme.cardBg');
  color: v-bind('theme.cardText');
  border-color: v-bind('borderColor');
}
.kpi-title { @apply text-[13px] mb-2; }
.kpi-row { @apply flex items-center justify-between; }
.kpi-value { @apply text-3xl font-semibold tracking-tight; }

.chip { @apply text-xs px-2 py-1 rounded-md; }
.chip--ok   { background: #e7f8ef; color: #0f8f57; }
.chip--warn { background: #fde8ea; color: #dc3545; }

/* Links */
.link-theme { color: v-bind(primary); }
.link-theme:hover { text-decoration: underline; }

/* Ghost button inside lists/cards */
.btn-ghost {
  @apply px-3 py-1.5 rounded-md text-[13px] border;
  border-color: v-bind('borderColor');
  background: v-bind('chipBg');
  color: v-bind('theme.cardText');
}
.btn-ghost:hover { filter: brightness(0.97); }

/* FABs */
.fab {
  position: fixed; right: 1.5rem; bottom: 6.5rem; height: 3.5rem; width: 3.5rem;
  border-radius: 9999px; display:flex; align-items:center; justify-content:center;
  box-shadow: 0 8px 24px rgba(0,0,0,.15);
}
.fab--secondary {
  right: 1.5rem; bottom: 1.5rem; height:3.5rem; width:3.5rem; border-radius:9999px;
}
</style>
