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
            <div class="card">
              <div class="card-head">
                <h3 class="card-title">Ingresos – Últimos 30 días</h3>
                <button class="icon-btn" @click="loadIngresos" title="Actualizar">⟳</button>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2">
                <!-- Línea -->
                <div class="p-4 sm:p-5">
                  <div class="h-56 rounded-2xl border border-[#e6e9ef] bg-white overflow-hidden">
                    <VChart :option="lineOption" autoresize class="h-56" />
                  </div>
                  <div class="mt-2 text-[12px] text-[#667]">
                    Total 30d: <strong class="text-[#222]">{{ money(total30d) }}</strong>
                  </div>
                </div>

                <!-- Dona -->
                <div class="p-4 sm:p-5">
                  <div class="h-56 rounded-2xl border border-[#e6e9ef] bg-white overflow-hidden grid place-items-center p-2">
                    <VChart :option="pieOption" autoresize class="h-48 w-full" />
                  </div>
                  <div class="mt-2 text-xs text-[#445] flex items-center gap-3 justify-center">
                    <span class="legend" style="--c:#1d4ed8">Estandar</span>
                    <span class="legend" style="--c:#2563eb">Plus</span>
                    <span class="legend" style="--c:#60a5fa">Premium</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Próximos cobros / Equipos -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <!-- Próximos cobros -->
              <div class="card">
                <div class="card-head">
                  <h3 class="card-title">Próximos cobros</h3>
                  <button class="icon-btn" @click="loadCobros">≡</button>
                </div>
                <div class="p-4 sm:p-5 space-y-4" v-if="!loading.cobros">
                  <div v-for="c in proximosCobros" :key="c.id" class="flex items-center justify-between">
                    <div>
                      <div class="font-medium">{{ c.nombre }}</div>
                      <div class="text-xs text-[#667]">{{ fmtFecha(c.fecha) }} <span v-if="c.tipo">({{ c.tipo }})</span></div>
                    </div>
                    <button class="btn-ghost" @click="cobrar(c)">Cobrar</button>
                  </div>
                  <div v-if="!proximosCobros.length" class="text-[13px] text-[#667]">Sin cobros próximos</div>
                </div>
                <div v-else class="p-4 text-[#667] text-sm">Cargando…</div>
              </div>

              <!-- Equipos (hardcode) -->
              <div class="card">
                <div class="card-head">
                  <h3 class="card-title">Equipos</h3>
                </div>
                <div class="p-4 sm:p-5 space-y-3">
                  <div
                    v-for="e in equipos"
                    :key="e.id"
                    class="flex items-center justify-between"
                  >
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
                  <div v-if="!equipos.length" class="text-[13px] text-[#667]">Sin equipos</div>
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

                <div class="flex items-center justify-between text-[12px] mb-1">
                  <span :class="{'text-emerald-600': clase.delta>0, 'text-rose-600': clase.delta<0, 'text-[#667]': clase.delta===0}">
                    {{ clase.delta>0 ? ('+'+clase.delta) : (clase.delta<0 ? clase.delta : '0') }}
                  </span>
                  <span class="text-[#667]">({{ formatMiles(clase.inscritos) }}/{{ formatMiles(clase.cupo) }})</span>
                </div>

                <div class="h-2 rounded-full bg-[#eef2f7] overflow-hidden">
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

        <!-- Link con color del tema -->
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

    <!-- Slide-over Cliente (card) -->
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
          <div class="rounded-2xl border border-[#e6e9ef] bg-white p-4">
            <!-- Top: avatar + chips -->
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3">
                <div class="h-14 w-14 rounded-full bg-[#f1f3f9] grid place-items-center">
                  <i class="fa-regular fa-user text-[#9aa3b2] text-xl"></i>
                </div>
                <div class="leading-tight">
                  <div class="font-semibold text-[15px] max-w-[240px] truncate">
                    {{ (resumen?.nombre || '') + ' ' + (resumen?.apellidos || '') }}
                  </div>
                  <div class="mt-2">
                    <span
                      class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border"
                      :class="badgeClass(resumen?.plan_estado || (resumen?.is_active ? 'activo' : 'inactivo'))"
                    >
                      <i class="fa-solid fa-circle-check text-[12px]"></i>
                      {{ resumen?.plan_estado || (resumen?.is_active ? 'Activo' : 'Inactivo') }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- <button class="h-8 w-8 rounded-full border border-[#e6e9ef] hover:bg-[#f5f7fa]" @click="verEditar">
                <i class="fa-solid fa-angles-right text-[#445]"></i>
              </button> -->
            </div>

            <!-- Pill plan y sucursal -->
            <div class="mt-3">
              <div v-if="resumen?.plan_actual" class="inline-flex items-center px-3 py-1 rounded-full bg-[#f1f4ff] text-[#2741d9] text-[12px] border border-[#dfe6ff]">
                Plan: {{ resumen.plan_actual }}
              </div>
              <div class="text-[13px] text-[#667] mt-2">
                {{ resumen?.sucursal_nombre || '—' }}
              </div>
            </div>

            <!-- Campos -->
            <div class="mt-4 space-y-2">
              <div v-if="resumen?.email" class="rowi">
                <span>Email</span>
                <span class="text-[#111] font-medium truncate">{{ resumen.email }}</span>
              </div>

              <div v-if="resumen?.fiscal?.rfc" class="rowi">
                <span>RFC</span>
                <span class="text-[#111] font-medium">{{ resumen.fiscal.rfc }}</span>
              </div>

              <div class="rowi">
                <span>Próximo cobro</span>
                <span class="text-[#111] font-medium">{{ formatDate(resumen?.proximo_cobro) }}</span>
              </div>

              <div class="rowi">
                <span>Fecha límite</span>
                <span class="text-[#111] font-medium">{{ formatDate(resumen?.fecha_limite) }}</span>
              </div>

              <div class="rowi">
                <span>Alta</span>
                <span class="text-[#111] font-medium">{{ formatDate(resumen?.fecha_alta) }}</span>
              </div>

              <div class="rowi">
                <span>Costo inscripción</span>
                <span class="text-[#111] font-medium">{{ resumen?.costo_inscripcion!=null ? money(resumen.costo_inscripcion) : '—' }}</span>
              </div>
            </div>

            <!-- Botones -->
            <div class="mt-4 flex items-center gap-2">
              <button
                class="px-4 py-2 rounded-xl text-white"
                style="background:#b86a34"
                @click="cobrar({ id: resumen?.id, nombre: (resumen?.nombre||'') + ' ' + (resumen?.apellidos||'') })"
              >
                Cobrar
              </button>
              <button class="px-4 py-2 rounded-xl bg-white border border-[#e6e9ef] hover:bg-[#f5f7fa]" @click="verEditar">
                Ver / Editar
              </button>
            </div>
          </div>
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
import api from '@/api/services'
import http from '@/api/http'

/* ====== echarts ====== */
import { use } from 'echarts/core'
import VChart from 'vue-echarts'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, PieChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent, DatasetComponent } from 'echarts/components'
use([CanvasRenderer, LineChart, PieChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent, DatasetComponent])

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
const equipos = ref([
  {
    id: 1,
    nombre: 'Cinta de correr (#0012)',
    estadoTexto: 'En mantenimiento',
    badges: [
      { text: 'En piso',        color: '#10b981' },
      { text: 'Mantenimiento',  color: '#f59e0b' },
    ],
  },
  {
    id: 2,
    nombre: 'Bicicleta estática (#0007)',
    estadoTexto: 'Dañado',
    badges: [
      { text: 'Dañado', color: '#ef4444' },
    ],
  },
  {
    id: 3,
    nombre: 'Máquina de remo (#0102)',
    estadoTexto: 'En piso',
    badges: [
      { text: 'En piso', color: '#10b981' },
    ],
  },
])

/* === Serie ingresos === */
const ingresosFechas = ref([])
const ingresosSerie = ref([])
const total30d = computed(() => ingresosSerie.value.reduce((a,b)=>a+(Number(b)||0),0))

/* ====== OPTIONS ECHARTS ====== */
const lineOption = computed(() => ({
  grid: { left: 28, right: 12, top: 10, bottom: 22 },
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
  series: [{ type: 'line', smooth: true, areaStyle: {}, data: ingresosSerie.value }]
}))
const pieOption = computed(() => ({
  tooltip: { trigger: 'item', valueFormatter: v => formatMiles(v) },
  legend: { bottom: 0, itemWidth: 10, itemHeight: 10, textStyle: { fontSize: 12 } },
  series: [{
    name: 'Plan', type: 'pie', radius: ['55%','80%'],
    label: { show: false }, emphasis: { label: { show: true, fontSize: 14, formatter: '{b}: {d}%' } },
    data: [{ value:60, name:'Estandar' }, { value:25, name:'Plus' }, { value:15, name:'Premium' }]
  }]
}))

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

    let ocupacion = 75
    try {
      const { data: horarios } = await api.horariosDisciplinas.list({ page_size: 500 })
      const items = horarios?.results || horarios || []
      if (items.length) {
        const ratios = items.map(h => Math.min(1, (Number(h.inscritos)||0) / Math.max(1, Number(h.cupo)||1)))
        const avg = ratios.length ? (ratios.reduce((a,b)=>a+b,0)/ratios.length) : 0
        ocupacion = Math.round(avg * 100)
      }
    } catch {}

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
    if (!valores.some(v => v > 0)) {
      valores.splice(0, valores.length, ...[900,0,800,600,500,650,300,650,0,600,450,700,200,100,50,900,850,0,950,700,800,900,0,950,800,600,950,880,420,500])
    }
    ingresosFechas.value = fechas
    ingresosSerie.value = valores
  } finally { loading.value.ingresos = false }
}

async function loadCobros(){
  loading.value.cobros = true
  try{
    const { data } = await api.clientes.list({ ordering: 'proximo_cobro', page_size: 10 })
    const arr = data?.results || data || []
    proximosCobros.value = arr
      .filter(r => !!r.proximo_cobro)
      .slice(0,6)
      .map(r => ({
        id: r.id,
        nombre: `${r.nombre||''} ${r.apellidos||''}`.trim() || `Cliente ${r.id}`,
        fecha: r.proximo_cobro,
        tipo: r.tipo_cobro || null
      }))
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
        sede: d.sucursal_nombre || 'Gimnasio',
        hora_inicio: h.hora_inicio,
        hora_fin: h.hora_fin,
        inscritos: Number(h.inscritos || 8 + (i%7)),
        cupo: Number(d.limite_personas || 15),
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
  try { router.push({ name: 'ClientesLista', query: { sel: id } }) } catch { /* noop */ }
}

/* Helpers */
function money (n) { return Number(n||0).toLocaleString('es-MX',{ style:'currency', currency:'MXN', maximumFractionDigits:0 }) }
function formatMiles(n){ return Number(n||0).toLocaleString('es-MX') }
function fmtFecha (iso) { try { return new Date(iso).toLocaleDateString('es-MX',{day:'2-digit',month:'short',year:'numeric'}) } catch { return iso } }
function onClienteCreado () { modalCliente.value = false }
function formatDate (d) { if (!d) return '—'; try { return new Date(d).toLocaleDateString('es-MX') } catch { return d } }
function cobrar (c) { console.log('Cobrar a:', c) }
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

/* Link */
.link-theme { color: v-bind(primary); }
.link-theme:hover { text-decoration: underline; }

/* Ghost */
.btn-ghost { @apply px-3 py-1.5 rounded-md text-[13px] border; border-color:#e6e9ef; background:#fafbfe; }
.btn-ghost:hover { background:#f0f3f9; }

/* Leyenda dona */
.legend { display:inline-flex; align-items:center; gap:6px; color:#445; }
.legend::before{ content:''; width:8px; height:8px; border-radius:9999px; background: var(--c); display:inline-block; }

/* Slide card rows */
.rowi { display:grid; grid-template-columns: 1fr 1fr; gap:12px; align-items:center; font-size:14px; }
.rowi > span:first-child { color:#667; }

/* FABs */
.fab { position: fixed; right: 1.5rem; bottom: 6.5rem; height: 3.5rem; width: 3.5rem;
  border-radius: 9999px; color:#fff; display:flex; align-items:center; justify-content:center;
  box-shadow: 0 8px 24px rgba(0,0,0,.15); }
.fab--secondary { right: 1.5rem; bottom: 1.5rem; height:3.5rem; width:3.5rem; border-radius:9999px; color:#1a1a1a;
  background:#fff; border:1px solid #e6e9ef; box-shadow: 0 8px 24px rgba(0,0,0,.08); }
</style>
