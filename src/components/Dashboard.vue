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
              <div class="kpi-value">{{ loading.kpis ? '—' : kpis.miembrosActivos }}</div>
              <span class="chip chip--ok">+2.0%</span>
            </div>
          </div>

          <div class="card-kpi">
            <div class="kpi-title">Visitas del día</div>
            <div class="kpi-row">
              <div class="kpi-value">{{ loading.kpis ? '—' : kpis.visitasHoy }}</div>
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
                <button class="icon-btn" @click="refreshIngresos" title="Actualizar">⟳</button>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2">
                <!-- Gráfico línea -->
                <div class="p-4 sm:p-5">
                  <div class="h-56 rounded-2xl border border-[#e6e9ef] bg-white relative overflow-hidden grid place-items-center">
                    <div v-if="loading.ingresos" class="text-[#667] text-sm">Cargando…</div>
                    <svg v-else viewBox="0 0 340 180" class="absolute inset-0 w-full h-full">
                      <!-- ejes -->
                      <line x1="40" y1="20" x2="40" y2="160" stroke="#e6e9ef" stroke-width="1" />
                      <line x1="40" y1="160" x2="320" y2="160" stroke="#e6e9ef" stroke-width="1" />
                      <!-- área -->
                      <polyline :points="areaPoints" fill="url(#areaFill)" stroke="none"/>
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
                  <div class="mt-2 text-[12px] text-[#667]">
                    Total 30d: <strong class="text-[#222]">{{ money(sumSerie(ingresosSerie)) }}</strong>
                  </div>
                </div>

                <!-- Donut (hardcodeado por ahora) -->
                <div class="p-4 sm:p-5 flex flex-col items-center justify-center">
                  <h4 class="text-sm font-semibold mb-2">Plan</h4>
                  <div class="relative h-48 w-48">
                    <svg viewBox="0 0 100 100" class="h-full w-full">
                      <circle cx="50" cy="50" r="35" stroke="#eef2f7" stroke-width="18" fill="none"/>
                      <!-- 3 segmentos -->
                      <circle cx="50" cy="50" r="35" transform="rotate(-90 50 50)"
                              :stroke-dasharray="`${donut.a} ${donut.C - donut.a}`"
                              stroke="#1d4ed8" stroke-width="18" fill="none"/>
                      <circle cx="50" cy="50" r="35" transform="rotate(-90 50 50)"
                              :stroke-dasharray="`${donut.b} ${donut.C - donut.b}`"
                              :stroke-dashoffset="-donut.a"
                              stroke="#2563eb" stroke-width="18" fill="none"/>
                      <circle cx="50" cy="50" r="35" transform="rotate(-90 50 50)"
                              :stroke-dasharray="`${donut.c} ${donut.C - donut.c}`"
                              :stroke-dashoffset="-(donut.a + donut.b)"
                              stroke="#60a5fa" stroke-width="18" fill="none"/>
                    </svg>
                    <div class="absolute inset-0 flex items-center justify-center">
                      <span class="text-xl font-semibold">{{ kpis.miembrosActivos || 0 }}</span>
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

            <!-- Próximos cobros + Equipos (equipos hardcodeado) -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
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

              <div class="card">
                <div class="card-head">
                  <h3 class="card-title">Equipos</h3>
                  <div class="flex items-center gap-2">
                    <span class="badge bg-emerald-500">En piso</span>
                    <span class="badge bg-amber-500">Mantenimiento</span>
                    <span class="badge bg-rose-500">Dañado</span>
                  </div>
                </div>
                <div class="p-4 sm:p-5 space-y-3">
                  <div v-for="e in equipos" :key="e.id" class="flex items-center justify-between">
                    <div>
                      <div class="font-medium">{{ e.nombre }}</div>
                      <div class="text-xs text-[#667]">{{ e.estadoTexto }}</div>
                    </div>
                    <div class="flex items-center gap-2">
                      <span v-for="b in e.badges" :key="b.text" class="text-[11px] px-2 py-1 rounded-md text-white" :style="{ background: b.color }">
                        {{ b.text }}
                      </span>
                      <button class="btn-ghost">Ver</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Columna derecha: Clases (todas las disciplinas, sin filtro de día) -->
          <div class="card">
            <div class="card-head">
              <h3 class="card-title">Clases de hoy</h3>
              <button class="icon-btn" @click="loadClasesHoy"><i class="fa-solid fa-grip-lines"></i></button>
            </div>
            <div class="p-4 sm:p-5 space-y-4" v-if="!loading.clases">
              <div v-for="clase in clasesHoy" :key="clase.id" class="rounded-2xl border border-[#e6e9ef] bg-white p-4">
                <div class="text-[12px] text-[#667] mb-1">{{ clase.hora || '—' }} — {{ clase.sede }}</div>
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
                    :style="{ width: Math.min(100, Math.round((clase.inscritos / Math.max(1, clase.cupo)) * 100)) + '%', background: clase.colorBarra }"
                  />
                </div>
              </div>
              <div v-if="!clasesHoy.length" class="text-[13px] text-[#667]">No hay clases para mostrar.</div>
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

    <!-- Slide-over Card Resumen Cliente -->
    <transition
      enter-active-class="transition transform duration-200"
      enter-from-class="opacity-0 translate-x-3"
      enter-to-class="opacity-100 translate-x-0"
      leave-active-class="transition transform duration-150"
      leave-from-class="opacity-100 translate-x-0"
      leave-to-class="opacity-0 translate-x-3"
    >
      <aside v-if="panelClienteOpen" class="fixed top-0 right-0 h-full w-[420px] bg-white border-l border-[#e6e9ef] shadow-2xl z-40">
        <div class="px-5 py-4 border-b border-[#e6e9ef] flex items-center justify-between">
          <div>
            <div class="font-semibold leading-tight truncate max-w-[300px]">
              {{ (resumen && (resumen.nombre + ' ' + (resumen.apellidos||''))) || 'Cliente' }}
            </div>
            <div class="text-[12px] text-[#667]">#{{ resumen?.id }} · {{ resumen?.sucursal_nombre || 'Sin sucursal' }}</div>
          </div>
          <button class="icon-btn" @click="closePanelCliente">✕</button>
        </div>

        <div class="p-4 overflow-auto h-[calc(100%-64px)] space-y-3">
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
                <div class="text-[#222]"><span class="text-[#667]">Inscripción:</span> {{ formatDate(resumen?.inscripcion) }}</div>
                <div class="text-[#222]"><span class="text-[#667]">Próximo cobro:</span> {{ formatDate(resumen?.proximo_cobro) }}</div>
                <div class="text-[#222]"><span class="text-[#667]">Último pago:</span> {{ formatDate(resumen?.ultimo_pago) }}</div>
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

/* === Tema === */
const theme = computed(() => {
  const t = (ui?.theme && 'value' in ui.theme) ? (ui.theme?.value || {}) : (ui.theme || {})
  return { primary: t.primary || '#1a5eff', secondary: t.secondary || '#4ae364' }
})
const primary = computed(() => theme.value.primary)

/* ===== Estado ===== */
const modalCliente = ref(false)
const loading = ref({ kpis: true, ingresos: true, cobros: false, clases: true, buscar: false, resumen: false })

const kpis = ref({
  ingresosHoy: 0, ingresosDelta: 0,
  miembrosActivos: 0, miembrosDelta: 0,
  visitasHoy: 0, visitasDelta: 0,
  ocupacion: 0, ocupacionDelta: 0
})

const proximosCobros = ref([])
const clasesHoy = ref([])

/* Equipos (HARD-CODED para igualar maqueta) */
const equipos = ref([
  { id: 1, nombre: 'Cinta de correr (#0012)', estadoTexto: 'En mantenimiento', badges: [{text:'En piso', color:'#10b981'}, {text:'Mantenimiento', color:'#f59e0b'}] },
  { id: 2, nombre: 'Bicicleta estática (#0007)', estadoTexto: 'Dañado', badges: [{text:'Dañado', color:'#ef4444'}] },
  { id: 3, nombre: 'Máquina de remo (#0102)', estadoTexto: 'En piso', badges: [{text:'En piso', color:'#10b981'}] },
])

/* Donut (HARD-CODED: 60/25/15) */
const donut = computed(() => {
  const C = 2 * Math.PI * 35
  const a = 0.60 * C
  const b = 0.25 * C
  const c = 0.15 * C
  return { a, b, c, C }
})

/* Serie ingresos (últimos 30 días) */
const ingresosSerie = ref([]) // números por día

/* ==== Carga de datos del dashboard ==== */
async function loadKpis() {
  loading.value.kpis = true
  try {
    const empresa = ws.empresaId
    const hoy = new Date(); hoy.setHours(0,0,0,0)
    const manana = new Date(hoy); manana.setDate(manana.getDate() + 1)

    // Ingresos del día — ventas
    const { data: ventasHoy } = await api.ventas.ventas.list({
      empresa,
      fecha_after: hoy.toISOString(),
      fecha_before: manana.toISOString(),
      page_size: 1000
    })
    const arrVentasHoy = ventasHoy?.results || ventasHoy || []
    const ingresosHoy = arrVentasHoy.reduce((acc, v) => acc + Number(v.total ?? v.importe ?? 0), 0)

    // Miembros activos (si existe is_active)
    const { data: clientesData } = await api.clientes.list({ is_active: true, page_size: 1 })
    const miembrosActivos =
      clientesData?.count ??
      (clientesData?.results?.length ?? (Array.isArray(clientesData) ? clientesData.length : 0))

    // Visitas del día — accesos
    let visitasHoy = 0
    try {
      const { data: acc } = await api.accesos.list({
        fecha_after: hoy.toISOString(),
        fecha_before: manana.toISOString(),
        page_size: 1
      })
      visitasHoy = acc?.count ?? (acc?.results?.length ?? 0)
    } catch { /* sin accesos hoy */ }

    // Ocupación — todas las disciplinas del día (si no hay dato, 75 para igualar mock)
    let ocupacion = 75
    try {
      const { data: horarios } = await api.horariosDisciplinas.list({ page_size: 500 }) // SIN filtro de día
      const items = horarios?.results || horarios || []
      if (items.length) {
        const ratios = items.map(h => Math.min(1, (Number(h.inscritos)||0) / Math.max(1, Number(h.cupo)||1)))
        const avg = ratios.length ? (ratios.reduce((a,b)=>a+b,0)/ratios.length) : 0
        ocupacion = Math.round(avg * 100)
      }
    } catch { /* usar hardcode 75 */ }

    kpis.value = {
      ingresosHoy,
      ingresosDelta: 0, // delta mostrado ya está hardcodeado en el chip
      miembrosActivos,
      miembrosDelta: 0,
      visitasHoy,
      visitasDelta: 0,
      ocupacion,
      ocupacionDelta: 0
    }
  } finally {
    loading.value.kpis = false
  }
}

async function loadIngresos() {
  loading.value.ingresos = true
  try {
    const empresa = ws.empresaId
    const hoy = new Date(); hoy.setHours(0,0,0,0)
    const inicio = new Date(hoy); inicio.setDate(inicio.getDate() - 29)
    const fin = new Date(hoy); fin.setDate(fin.getDate() + 1)

    const { data } = await api.ventas.ventas.list({
      empresa,
      fecha_after: inicio.toISOString(),
      fecha_before: fin.toISOString(),
      page_size: 1000,
      ordering: 'fecha'
    })
    const rows = data?.results || data || []

    // Agrupar por día
    const map = new Map()
    for (const v of rows) {
      const d = (v.fecha || '').slice(0,10)
      const cur = map.get(d) || 0
      map.set(d, cur + Number(v.total ?? v.importe ?? 0))
    }

    // Completar 30 días
    const pts = []
    for (let i = 0; i < 30; i++) {
      const d = new Date(inicio); d.setDate(inicio.getDate() + i)
      const key = d.toISOString().slice(0,10)
      pts.push(Number(map.get(key) || 0))
    }
    // Si no hay datos, mock para que se vea bonito
    ingresosSerie.value = pts.some(v => v > 0)
      ? pts
      : [900, 0, 800, 600, 500, 650, 300, 650, 0, 600, 450, 700, 200, 100, 50, 900, 850, 0, 950, 700, 800, 900, 0, 950, 800, 600, 950, 880, 420, 500]
  } finally {
    loading.value.ingresos = false
  }
}
function refreshIngresos(){ loadIngresos() }

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
    // Si no viene nada, mock como en la imagen
    if (!proximosCobros.value.length) {
      proximosCobros.value = [
        { id: 1, nombre: 'Guillermo Cisneros (00012)', fecha: addDays(3), tipo: 'Prepago' },
        { id: 2, nombre: 'Luis Ang Alcaraz (00012)',   fecha: addDays(5), tipo: 'Domiciliado' },
        { id: 3, nombre: 'Sergio  Espinosa (00012)',   fecha: addDays(6), tipo: 'Prepago' },
      ]
    }
  } finally {
    loading.value.cobros = false
  }
}

async function loadClasesHoy(){
  loading.value.clases = true
  try{
    // SIN filtro de fecha: trae todas las disciplinas/horarios
    const { data } = await api.horariosDisciplinas.list({ page_size: 200, ordering: 'hora' })
    const arr = data?.results || data || []
    const palette = ['#22c55e', '#ef4444', '#f59e0b']
    let i = 0
    clasesHoy.value = arr.map(x => ({
      id: x.id,
      hora: x.hora || x.inicio || '—',
      sede: x.sucursal_nombre || x.sede || '—',
      nombre: x.disciplina_nombre || x.nombre || 'Clase',
      instructor: x.instructor || '—',
      delta: Number(x.delta || ((i%3===0)? 2 : (i%3===1? 1 : -1))),
      inscritos: Number(x.inscritos || (8 + (i%7))),
      cupo: Number(x.cupo || x.capacidad || 15),
      colorBarra: palette[i++ % palette.length],
    }))
    // Si no hay nada, mock como la imagen
    if (!clasesHoy.value.length) {
      clasesHoy.value = [
        { id: 1, hora: '06:00 AM', sede: 'Gimnasio León',  nombre: 'Spin', instructor: 'Juan Pérez', delta: +2, inscritos: 12, cupo: 15, colorBarra:'#22c55e' },
        { id: 2, hora: '11:00 AM', sede: 'Gimnasio León 2',nombre: 'Yoga', instructor: 'Juan Pérez', delta: +1, inscritos: 5,  cupo: 15, colorBarra:'#ef4444' },
        { id: 3, hora: '08:00 PM', sede: 'Gimnasio León',  nombre: 'Entrenamiento Funcional', instructor: 'Juan Pérez', delta: +2, inscritos: 10, cupo: 15, colorBarra:'#f59e0b' },
      ]
    }
  } finally {
    loading.value.clases = false
  }
}

onMounted(async () => {
  if (!auth.isAuthenticated) return
  await ws.ensureEmpresaSet()
  await Promise.all([loadKpis(), loadIngresos(), loadCobros(), loadClasesHoy()])
})

/* ===== Modal Buscar Cliente ===== */
const modalBuscar = ref(false)
const buscarInput = ref('')
const resultados = ref([])
let tDebounce = null

function openBuscarModal() { modalBuscar.value = true; buscarInput.value = ''; resultados.value = [] }
function closeBuscarModal() { modalBuscar.value = false }

watch(buscarInput, (v) => {
  clearTimeout(tDebounce)
  tDebounce = setTimeout(() => { doSearch(v) }, 300)
})

async function doSearch(q) {
  if (!q || !q.trim()) { resultados.value = []; return }
  loading.value.buscar = true
  try {
    const { data } = await api.clientes.list({ search: q.trim(), page_size: 10, ordering: '-id' })
    resultados.value = (data?.results || data || []).map(r => ({
      id: r.id,
      nombre: r.nombre ?? '',
      apellidos: r.apellidos ?? '',
      email: r.email || '—',
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

/* Helpers */
function money (n) {
  const v = typeof n === 'string' ? Number(n) : n
  return typeof v === 'number' ? v.toLocaleString('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}) : n
}
function sumSerie(arr){ if(!Array.isArray(arr)) return 0; return arr.reduce((a,b)=>a+(isNaN(Number(b))?0:Number(b)),0) }
function addDays (d) { const dt = new Date(); dt.setDate(dt.getDate() + (d||0)); return dt.toISOString().slice(0,10) }
function fmtFecha (iso) { try { return new Date(iso).toLocaleDateString('es-MX',{day:'2-digit',month:'short',year:'numeric'}) } catch { return iso } }
function onClienteCreado () { modalCliente.value = false }
function formatDate (d) { if (!d) return '—'; try { return new Date(d).toLocaleDateString('es-MX') } catch { return d } }
function badgeClass (estado) {
  const v = String(estado || '').toLowerCase()
  if (v === 'activo')  return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  if (v === 'inactivo' || v === 'vencido') return 'border-rose-200 bg-rose-50 text-rose-700'
  return 'border-[#e6e9ef] bg-[#fafbfe] text-[#445]'
}

/* ===== Gráfico SVG ===== */
const linePoints = computed(() => {
  if(!ingresosSerie.value || ingresosSerie.value.length===0) return ''
  const values = ingresosSerie.value.map(v => Number(v)||0)
  const max = Math.max(...values, 1)
  const L = values.length
  return values.map((v, i) => {
    const x = 40 + (i / (L - 1)) * (320 - 40)
    const y = 160 - (v / max) * 120
    return `${x},${y}`
  }).join(' ')
})
const areaPoints = computed(() => linePoints.value ? `${linePoints.value} 320,160 40,160` : '')
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

/* Badges equipos */
.badge { @apply text-white text-[11px] px-2 py-0.5 rounded-md; }

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
