<template>
  <div class="p-4 space-y-4">
    <!-- Filtros -->
    <div class="rounded-2xl bg-white border border-gray-200 p-4 flex flex-wrap gap-3 items-end">
      <div>
        <label class="block text-xs text-gray-600 mb-1">Rango</label>
        <input type="date" v-model="f.desde" class="input" />
        <span class="mx-2 text-gray-400">—</span>
        <input type="date" v-model="f.hasta" class="input" />
      </div>
      <div>
        <label class="block text-xs text-gray-600 mb-1">Sucursal</label>
        <select v-model="f.sucursal" class="input">
          <option value="">Todas</option>
          <option v-for="s in sucursales" :key="s.id" :value="s.id">{{ s.nombre }}</option>
        </select>
      </div>
      <div>
        <label class="block text-xs text-gray-600 mb-1">Plan (vigentes en rango)</label>
        <select v-model="f.plan" class="input">
          <option value="">Todos</option>
          <option v-for="p in planesVigentes" :key="p.id" :value="p.id">{{ p.nombre }}</option>
        </select>
      </div>
      <div>
        <label class="block text-xs text-gray-600 mb-1">Método de pago</label>
        <select v-model="f.metodo" class="input">
          <option value="">Todos</option>
          <option value="efectivo">Efectivo</option>
          <option value="tarjeta">Tarjeta</option>
          <option value="transferencia">Transferencia</option>
          <option value="mixto">Mixto</option>
        </select>
      </div>
      <button class="ml-auto btn-primary" @click="loadAll">Actualizar</button>
    </div>

    <!-- Tabs -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="t in tabs" :key="t.key"
        class="px-3 py-2 rounded-lg text-sm border"
        :class="tab===t.key ? 'bg-gray-100 border-gray-300 text-gray-900' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'"
        @click="tab=t.key"
      >
        {{ t.label }}
      </button>
    </div>

    <!-- DASHBOARD -->
    <template v-if="tab==='dashboard'">
      <!-- KPIs -->
      <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="kpi">
          <div class="kpi-title">Ingresos (periodo)</div>
          <div class="kpi-value">{{ money(kpis.ingresos) }}</div>
          <div class="kpi-sub">Tickets: {{ kpis.tickets }}</div>
        </div>
        <div class="kpi">
          <div class="kpi-title">Ticket promedio</div>
          <div class="kpi-value">{{ money(kpis.avgTicket) }}</div>
          <div class="kpi-sub">Ventas: {{ kpis.ventas }}</div>
        </div>
        <div class="kpi">
          <div class="kpi-title">Clientes nuevos</div>
          <div class="kpi-value">{{ kpis.clientesNuevos }}</div>
          <div class="kpi-sub">En el periodo</div>
        </div>
        <div class="kpi">
          <div class="kpi-title">Visitas (accesos)</div>
          <div class="kpi-value">{{ kpis.visitas }}</div>
          <div class="kpi-sub">Pico: {{ kpis.picoHorario }}</div>
        </div>
      </section>

      <!-- Gráficas -->
      <section class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div class="card lg:col-span-2">
          <div class="card-head">Ingresos por día</div>
          <v-chart :option="chartIngresos" class="h-64" autoresize />
        </div>
        <div class="card">
          <div class="card-head">Ingresos por método de pago</div>
          <v-chart :option="chartMetodoPago" class="h-64" autoresize />
        </div>

        <div class="card">
          <div class="card-head">Altas por plan</div>
          <v-chart :option="chartAltasPlan" class="h-64" autoresize />
        </div>
        <div class="card lg:col-span-2">
          <div class="card-head">Accesos: día x hora</div>
          <v-chart :option="chartHeatAccesos" class="h-64" autoresize />
        </div>
      </section>
    </template>

    <!-- TABLAS -->
    <template v-if="tab==='tablas'">
      <section class="rounded-2xl bg-white border border-gray-200 p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-base font-semibold text-gray-800">Ventas</h3>
          <button class="btn" @click="exportCsv(ventasRows, ['fecha','importe','metodo_pago','items'], 'ventas.csv')">
            Exportar CSV
          </button>
        </div>
        <TableBasic :rows="ventasRows" :columns="ventasCols" :initialPageSize="10" variant="light" />
      </section>

      <section class="rounded-2xl bg-white border border-gray-200 p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-base font-semibold text-gray-800">Clientes</h3>
        </div>
        <TableBasic :rows="clientesRows" :columns="clientesCols" :initialPageSize="10" variant="light" />
      </section>

      <section class="rounded-2xl bg-white border border-gray-200 p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-base font-semibold text-gray-800">Inventario (movimientos)</h3>
        </div>
        <TableBasic :rows="invRows" :columns="invCols" :initialPageSize="10" variant="light" />
      </section>

      <section class="rounded-2xl bg-white border border-gray-200 p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-base font-semibold text-gray-800">Egresos</h3>
        </div>
        <TableBasic :rows="egresosRows" :columns="egresosCols" :initialPageSize="10" variant="light" />
      </section>
    </template>

    <!-- AUDITORÍA -->
    <template v-if="tab==='auditoria'">
      <section class="rounded-2xl bg-white border border-gray-200 p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-base font-semibold text-gray-800">Auditoría (creados / actualizados)</h3>
          <button class="btn" @click="exportCsv(auditRows, ['modelo','id','accion','usuario','sucursal','fecha','detalle'], 'auditoria.csv')">
            Exportar CSV
          </button>
        </div>
        <TableBasic :rows="auditRows" :columns="auditCols" :initialPageSize="10" variant="light" />
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useWorkspaceStore } from '@/stores/workspace'
import api from '@/api/services'
import TableBasic from '@/components/TableBasic.vue'

import { use } from 'echarts/core'
import VChart from 'vue-echarts'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart, PieChart, HeatmapChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, VisualMapComponent, TitleComponent, DatasetComponent, ToolboxComponent } from 'echarts/components'
use([CanvasRenderer, LineChart, BarChart, PieChart, HeatmapChart, GridComponent, TooltipComponent, LegendComponent, VisualMapComponent, TitleComponent, DatasetComponent, ToolboxComponent])

const ws = useWorkspaceStore()
const tabs = [
  { key:'dashboard', label:'Dashboard' },
  { key:'tablas', label:'Tablas' },
  { key:'auditoria', label:'Auditoría' },
]
const tab = ref('dashboard')

/* Filtros */
const f = ref({ desde:'', hasta:'', sucursal:'', plan:'', metodo:'' })

/* Catálogos */
const planes = ref([])
const sucursales = ref([])

/* Planes vigentes en rango (para el select) */
const planesVigentes = computed(() => {
  if (!planes.value.length) return []
  // Si no hay rango, considera “vigentes al día de hoy”
  const from = f.value.desde ? new Date(f.value.desde) : new Date()
  const to = f.value.hasta ? new Date(f.value.hasta) : new Date()
  return planes.value.filter(p => {
    const desde = p.desde ? new Date(p.desde) : null
    const hasta = p.hasta ? new Date(p.hasta) : null
    // vigente si solapa con el rango [from, to]
    const empiezaAntesDeFin = !desde || desde <= to
    const terminaDespuesDeInicio = !hasta || hasta >= from
    return empiezaAntesDeFin && terminaDespuesDeInicio
  }).sort((a,b)=> String(a.nombre||'').localeCompare(String(b.nombre||'')))
})

/* KPIs */
const kpis = ref({ ingresos:0, ventas:0, tickets:0, avgTicket:0, clientesNuevos:0, visitas:0, picoHorario:'—' })

/* Tablas */
const ventasRows = ref([])
const clientesRows = ref([])
const invRows = ref([])
const egresosRows = ref([])

/* Auditoría */
const auditRows = ref([])

/* Columnas */
const ventasCols = [
  { accessorKey:'fecha', header:'Fecha' },
  { accessorKey:'importe', header:'Importe', cell: ({getValue}) => money(getValue()) },
  { accessorKey:'metodo_pago', header:'Método' },
  { accessorKey:'items', header:'# Items' },
]
const clientesCols = [
  { accessorKey:'nombre', header:'Cliente' },
  { accessorKey:'email', header:'Correo' },
  { accessorKey:'sucursal', header:'Sucursal' },
  { accessorKey:'plan', header:'Plan' },
  { accessorKey:'alta', header:'Alta' },
]
const invCols = [
  { accessorKey:'fecha', header:'Fecha' },
  { accessorKey:'producto', header:'Producto' },
  { accessorKey:'almacen', header:'Almacén' },
  { accessorKey:'tipo', header:'Tipo' },
  { accessorKey:'cantidad', header:'Cantidad' },
]
const egresosCols = [
  { accessorKey:'fecha', header:'Fecha' },
  { accessorKey:'concepto', header:'Concepto' },
  { accessorKey:'proveedor', header:'Proveedor' },
  { accessorKey:'categoria', header:'Categoría' },
  { accessorKey:'total', header:'Total', cell: ({getValue}) => money(getValue()) },
]
const auditCols = [
  { accessorKey:'modelo', header:'Modelo' },
  { accessorKey:'id', header:'ID' },
  { accessorKey:'accion', header:'Acción' },
  { accessorKey:'usuario', header:'Usuario' },
  { accessorKey:'sucursal', header:'Sucursal' },
  { accessorKey:'fecha', header:'Fecha' },
  { accessorKey:'detalle', header:'Detalle' },
]

/* Charts */
const chartIngresos = ref({})
const chartMetodoPago = ref({})
const chartAltasPlan = ref({})
const chartHeatAccesos = ref({})

/* Utils */
function money(n){ return Number(n||0).toLocaleString('es-MX',{style:'currency',currency:'MXN'}) }
function inRange(dateIso, desde, hasta){
  if (!dateIso) return false
  const t = new Date(dateIso).getTime()
  const from = desde ? new Date(desde).getTime() : -Infinity
  const to = hasta ? (new Date(hasta).getTime() + 86_400_000) : Infinity
  return t >= from && t < to
}
function exportCsv(rows, headers, filename){
  const csv = [headers.join(','), ...rows.map(r => headers.map(h => (r[h] ?? '')).join(','))].join('\n')
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'})
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

/* Loads */
async function loadCatalogos(){
  await ws.ensureEmpresaSet()
  const [p, s] = await Promise.all([
    api.planes.list({ page_size: 1000, ordering:'nombre' }),
    api.sucursales.list({ page_size: 1000, ordering:'nombre' }),
  ])
  planes.value = (p.data.results || p.data || [])
  sucursales.value = (s.data.results || s.data || [])
}

async function loadAll(){
  await ws.ensureEmpresaSet()
  const empresa = ws.empresaId
  const paramsBase = {
    empresa,
    fecha_after: f.value.desde || undefined,
    fecha_before: f.value.hasta || undefined,
    sucursal: f.value.sucursal || undefined,
    plan: f.value.plan || undefined,
    metodo_pago: f.value.metodo || undefined,
  }

  // 1) Ventas
  const vv = await api.ventas?.ventas?.list?.(paramsBase) || { data: [] }
  const ventas = vv.data.results || vv.data || []
  const ventasFiltradas = ventas.filter(v => {
    // filtros adicionales por si el backend no filtra todo:
    const okMet = f.value.metodo ? v.metodo_pago === f.value.metodo : true
    return okMet && inRange(v.fecha, f.value.desde, f.value.hasta)
  })
  ventasRows.value = ventasFiltradas.map(v => ({
    fecha: v.fecha ? new Date(v.fecha).toLocaleString('es-MX') : '—',
    importe: v.importe,
    metodo_pago: v.metodo_pago || '—',
    items: v.items ?? (Array.isArray(v.detalles) ? v.detalles.length : 0),
  }))
  const total = ventasFiltradas.reduce((a,b)=>a+Number(b.importe||0),0)
  kpis.value.ingresos = total
  kpis.value.ventas = ventasFiltradas.length
  kpis.value.tickets = ventasFiltradas.length
  kpis.value.avgTicket = ventasFiltradas.length ? total/ventasFiltradas.length : 0

  // 2) Clientes
  const cc = await api.clientes.list({ page_size: 1000, ordering:'-id' })
  const clientes = (cc.data.results || cc.data || [])
  const enPeriodo = clientes.filter(c => inRange(c.created_at || c.fecha_alta, f.value.desde, f.value.hasta))
  kpis.value.clientesNuevos = enPeriodo.length
  clientesRows.value = clientes.map(c => ({
    nombre: `${c.nombre||''} ${c.apellidos||''}`.trim(),
    email: c.email || '—',
    sucursal: c.sucursal_nombre || '—',
    plan: c.plan_actual || '—',
    alta: c.created_at ? new Date(c.created_at).toLocaleDateString('es-MX') : '—',
  }))

  // 3) Accesos
  const aa = await api.accesos?.list?.(paramsBase) || { data: [] }
  const accesos = (aa.data.results || aa.data || [])
  const accPeriodo = accesos.filter(a => inRange(a.fecha, f.value.desde, f.value.hasta))
  kpis.value.visitas = accPeriodo.length
  const horas = {}
  accPeriodo.forEach(a => { const h = new Date(a.fecha).getHours(); horas[h] = (horas[h]||0)+1 })
  const pico = Object.entries(horas).sort((a,b)=>b[1]-a[1])[0]
  kpis.value.picoHorario = pico ? `${pico[0]}:00` : '—'

  // 4) Inventario (movimientos)
  const mm = await api.inventario?.movimientos?.list?.(paramsBase) || { data: [] }
  const movimientos = (mm.data.results || mm.data || [])
  const movPeriodo = movimientos.filter(m => inRange(m.fecha, f.value.desde, f.value.hasta))
  invRows.value = movPeriodo.map(m => ({
    fecha: m.fecha ? new Date(m.fecha).toLocaleString('es-MX') : '—',
    producto: m.producto_nombre || m.producto || '',
    almacen: m.almacen_nombre || m.almacen || '',
    tipo: m.tipo || m.tipo_movimiento,
    cantidad: m.cantidad,
  }))

  // 5) Egresos
  const ee = await api.finanzas?.egresos?.list?.(paramsBase) || { data: [] }
  const egresos = (ee.data.results || ee.data || [])
  const egPeriodo = egresos.filter(e => inRange(e.fecha, f.value.desde, f.value.hasta))
  egresosRows.value = egPeriodo.map(e => ({
    fecha: e.fecha ? new Date(e.fecha).toLocaleDateString('es-MX') : '—',
    concepto: e.concepto,
    proveedor: e.proveedor_nombre || (e.proveedor || '—'),
    categoria: e.categoria_nombre || (e.categoria || '—'),
    total: e.total,
  }))

  // 6) Altas plan (para gráfica y auditoría)
  const ap = await api.altasPlan?.list?.(paramsBase) || { data: [] }
  const altas = (ap.data.results || ap.data || []).filter(a => inRange(a.fecha_alta || a.created_at, f.value.desde, f.value.hasta))

  // ====== GRÁFICAS ======
  // Ingresos por día
  const byDay = {}
  ventasFiltradas.forEach(v=>{
    const d = new Date(v.fecha)
    const key = d.toISOString().slice(0,10)
    byDay[key] = (byDay[key]||0) + Number(v.importe||0)
  })
  const days = Object.keys(byDay).sort()
  chartIngresos.value = {
    tooltip:{ trigger:'axis' },
    grid:{ left:24, right:16, top:16, bottom:24 },
    xAxis:{ type:'category', data: days },
    yAxis:{ type:'value' },
    series:[{ type:'line', data: days.map(d=>byDay[d]), smooth:true, areaStyle:{} }],
    toolbox:{ feature:{ saveAsImage:{} } }
  }

  // Método de pago
  const byPay = {}
  ventasFiltradas.forEach(v => { const k = v.metodo_pago || '—'; byPay[k] = (byPay[k]||0) + Number(v.importe||0) })
  chartMetodoPago.value = {
    tooltip:{ trigger:'item', formatter:'{b}: {c} ({d}%)' },
    series:[{ type:'pie', radius:['40%','70%'], data:Object.entries(byPay).map(([k,v])=>({name:k,value:v})) }],
    toolbox:{ feature:{ saveAsImage:{} } }
  }

  // Altas por plan
  const byPlan = {}
  altas.forEach(a=>{
    const n = a.plan_nombre || a.plan || ''
    byPlan[n] = (byPlan[n]||0) + 1
  })
  const planNames = Object.keys(byPlan)
  chartAltasPlan.value = {
    grid:{ left:24, right:16, top:16, bottom:24 },
    tooltip:{ trigger:'axis' },
    xAxis:{ type:'category', data: planNames },
    yAxis:{ type:'value' },
    series:[{ type:'bar', data: planNames.map(n=>byPlan[n]) }],
    toolbox:{ feature:{ saveAsImage:{} } }
  }

  // Heatmap accesos
  const matrix = {}
  accPeriodo.forEach(a=>{
    const d = new Date(a.fecha)
    const k = `${d.getDay()}-${d.getHours()}`
    matrix[k] = (matrix[k]||0) + 1
  })
  const dataHM = Object.entries(matrix).map(([k,v])=>{
    const [dy,hr] = k.split('-').map(Number)
    return [hr, dy, v]
  })
  chartHeatAccesos.value = {
    tooltip:{},
    grid:{ left:40, right:16, top:16, bottom:24 },
    xAxis:{ type:'category', data: Array.from({length:24},(_,i)=>`${i}:00`) },
    yAxis:{ type:'category', data: ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'] },
    visualMap:{ min:0, max: Math.max(...dataHM.map(d=>d[2]), 10), orient:'horizontal', left:'center', bottom:0 },
    series:[{ type:'heatmap', data: dataHM }],
    toolbox:{ feature:{ saveAsImage:{} } }
  }

  // ====== AUDITORÍA ======
  const aud = []

  // helper auditoría
  const pushAudit = (modelo, id, created_at, updated_at, usuario, sucursal, detalleObj={}) => {
    if (created_at) {
      aud.push({
        modelo, id, accion: 'creado',
        usuario: usuario || '—',
        sucursal: sucursal || '—',
        fecha: new Date(created_at).toLocaleString('es-MX'),
        detalle: JSON.stringify(detalleObj).slice(0,140)
      })
    }
    if (updated_at && updated_at !== created_at) {
      aud.push({
        modelo, id, accion: 'actualizado',
        usuario: usuario || '—',
        sucursal: sucursal || '—',
        fecha: new Date(updated_at).toLocaleString('es-MX'),
        detalle: JSON.stringify(detalleObj).slice(0,140)
      })
    }
  }

  ventas.forEach(v => {
    if (!inRange(v.created_at, f.value.desde, f.value.hasta) && !inRange(v.updated_at, f.value.desde, f.value.hasta)) return
    pushAudit('Venta', v.id, v.created_at, v.updated_at, v.usuario_nombre, v.sucursal_nombre, {importe:v.importe, metodo:v.metodo_pago})
  })
  clientes.forEach(c => {
    if (!inRange(c.created_at, f.value.desde, f.value.hasta) && !inRange(c.updated_at, f.value.desde, f.value.hasta)) return
    pushAudit('Cliente', c.id, c.created_at, c.updated_at, c.updated_by_nombre, c.sucursal_nombre, {nombre:`${c.nombre} ${c.apellidos}`})
  })
  altas.forEach(a => {
    pushAudit('AltaPlan', a.id, a.created_at || a.fecha_alta, a.updated_at, a.usuario_nombre, a.sucursal_nombre, {plan:a.plan_nombre})
  })

  // planes
  planes.value.forEach(p => {
    if (!inRange(p.created_at, f.value.desde, f.value.hasta) && !inRange(p.updated_at, f.value.desde, f.value.hasta)) return
    pushAudit('Plan', p.id, p.created_at, p.updated_at, p.updated_by_nombre, null, {nombre:p.nombre})
  })

  // precios (si existe endpoint)
  try {
    const pr = await api.planes?.precios?.list?.({ plan: f.value.plan || undefined, page_size: 1000 })
    const precios = (pr?.data?.results || pr?.data || [])
    precios.forEach(pp=>{
      if (!inRange(pp.created_at, f.value.desde, f.value.hasta) && !inRange(pp.updated_at, f.value.desde, f.value.hasta)) return
      pushAudit('PrecioPlan', pp.id, pp.created_at, pp.updated_at, pp.updated_by_nombre, null, {tipo:pp.tipo, precio:pp.precio})
    })
  } catch {}

  // accesos
  accPeriodo.forEach(a=>{
    pushAudit('Acceso', a.id, a.created_at || a.fecha, a.updated_at, a.usuario_nombre, a.sucursal_nombre, {cliente:a.cliente_nombre})
  })

  // inventario
  movPeriodo.forEach(m=>{
    pushAudit('MovimientoProducto', m.id, m.created_at || m.fecha, m.updated_at, m.usuario_nombre, m.almacen_nombre, {producto:m.producto_nombre, tipo:m.tipo})
  })

  // egresos
  egPeriodo.forEach(e=>{
    pushAudit('Egreso', e.id, e.created_at || e.fecha, e.updated_at, e.usuario_nombre, e.sucursal_nombre, {concepto:e.concepto,total:e.total})
  })

  // ordena desc por fecha
  auditRows.value = aud.sort((a,b) => new Date(b.fecha) - new Date(a.fecha))
}

onMounted(async ()=>{
  await loadCatalogos()
  await loadAll()
})

/* registro global de componente charts (alias no reactivo) */
const vChart = VChart
</script>

<style scoped>
.input{ @apply bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-apolo-primary/30; }
.btn{ @apply px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 hover:bg-gray-50; }
.btn-primary{ @apply px-3 py-2 rounded-lg bg-apolo-primary text-white hover:opacity-90; }
.card{ @apply rounded-2xl bg-white border border-gray-200 p-4; }
.card-head{ @apply mb-2 text-sm font-semibold text-gray-800; }
.kpi{ @apply rounded-2xl bg-white border border-gray-200 p-4; }
.kpi-title{ @apply text-xs text-gray-500; }
.kpi-value{ @apply text-2xl font-semibold text-gray-900; }
.kpi-sub{ @apply text-xs text-gray-500; }
</style>
