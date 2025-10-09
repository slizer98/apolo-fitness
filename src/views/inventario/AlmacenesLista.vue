<script setup>
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'
import { useWorkspaceStore } from '@/stores/workspace'
import api from '@/api/services'
import TableBasic from '@/components/TableBasic.vue'

/* ====== Workspace (empresa activa) ====== */
const ws = useWorkspaceStore()
const empresaId = computed(() => Number(ws.empresaId || 0))
const empresaReady = computed(() => !!empresaId.value)

/* ====== Estado base ====== */
const loading = ref(false)
const almacenes = ref([])
const almacenSel = ref('')            // string id; '' = todos
const q = ref('')
const categoria = ref('')
const productos = ref([])
const count = ref(0)

/* ====== KPIs ====== */
const kpiTotalAlmacenes = computed(() => (almacenes.value || []).length)
const kpiTotalProductos = computed(() => productos.value.length)
const kpiStockTotal = computed(() =>
  productos.value.reduce((acc, p) => acc + (getStock(p) || 0), 0)
)
const kpiSinStock = computed(() =>
  productos.value.filter(p => (getStock(p) || 0) <= 0).length
)

/* ====== Cache de stock ====== */
const stockCache = reactive(new Map()) // key = `${productId}:${almacenId || 'ALL'}` -> number
const stockKey = (id) => `${id}:${almacenSel.value || 'ALL'}`

function getStock(p) { return stockCache.get(stockKey(p.id)) }
async function fetchStock(productId) {
  const key = stockKey(productId)
  if (stockCache.has(key)) return stockCache.get(key)
  const params = { empresa: empresaId.value }
  if (almacenSel.value) params.almacen = almacenSel.value
  const { data } = await api.inventario.productos.stock(productId, params)
  const val = Number(data?.stock || 0)
  stockCache.set(key, val)
  return val
}
async function fetchStocksForCurrent () {
  const list = productos.value || []
  const chunk = 12
  for (let i = 0; i < list.length; i += chunk) {
    await Promise.all(list.slice(i, i + chunk).map(p => fetchStock(p.id)))
  }
}

/* ====== Carga ====== */
async function loadAlmacenes () {
  if (!empresaReady.value) { almacenes.value = []; return }
  const { data } = await api.inventario.almacenes.list({
    empresa: empresaId.value, page_size: 500, ordering: 'nombre'
  })
  almacenes.value = data?.results || data || []
}
async function loadProductos () {
  if (!empresaReady.value) return
  loading.value = true
  try {
    const params = {
      empresa: empresaId.value,
      search: q.value || undefined,
      categoria: categoria.value || undefined,
      page: 1, page_size: 500, ordering: 'nombre'
    }
    const { data } = await api.inventario.productos.list(params)
    productos.value = data?.results || data || []
    count.value = data?.count ?? productos.value.length
    await nextTick()
    stockCache.clear()
    await fetchStocksForCurrent()
  } finally {
    loading.value = false
  }
}

/* ====== Tabla ====== */
const columns = computed(() => ([
  { accessorKey: 'nombre', header: 'Producto', cell: ({ row }) => row.original.nombre, enableSorting: true },
  { accessorKey: 'categoria_nombre', header: 'Categoría', cell: ({ row }) => row.original.categoria_nombre || '—', enableSorting: true },
  { accessorKey: 'codigo_barras', header: 'Cód. barras', cell: ({ row }) => row.original.codigo_barras || '—', enableSorting: true },
  { accessorKey: 'precio', header: 'Precio', cell: ({ row }) => `$ ${Number(row.original.precio || 0).toFixed(2)}`, enableSorting: true },
  {
    accessorKey: 'stock',
    header: () => almacenSel.value ? 'Stock (almacén)' : 'Stock (total)',
    cell: ({ row }) => {
      const s = getStock(row.original)
      return s === undefined ? '…' : s
    },
    enableSorting: false
  },
]))

/* ====== Modal Movimiento (entrada/salida/transferencia) ====== */
const showMovModal = ref(false)
const mov = reactive({
  tipo: 'entrada',
  origen: '',
  destino: '',
  notas: '',
  lineas: [{ producto: null, nombre: '', cantidad: 1 }],
})
const movErrors = ref({})

function openMovModal(tipo='entrada'){
  mov.tipo = tipo
  mov.origen  = tipo !== 'entrada'      ? (almacenSel.value || '') : ''
  mov.destino = tipo !== 'salida'       ? (almacenSel.value || '') : ''
  mov.notas = ''
  mov.lineas = [{ producto: null, nombre: '', cantidad: 1 }]
  movErrors.value = {}
  showMovModal.value = true
}
function addLinea(){ mov.lineas.push({ producto:null, nombre:'', cantidad:1 }) }
function removeLinea(i){ mov.lineas.splice(i,1) }

const productosFiltrados = computed(() => {
  const term = (mov._search || '').toLowerCase()
  if (!term) return (productos.value || []).slice(0, 20)
  return (productos.value || [])
    .filter(p => (p.nombre || '').toLowerCase().includes(term) || (p.codigo_barras || '').includes(term))
    .slice(0, 20)
})
function setLineaProducto(i,p){ mov.lineas[i].producto = p.id; mov.lineas[i].nombre = p.nombre }

function validateMov () {
  const e = {}
  if (!mov.tipo) e.tipo = 'Requerido'
  if (mov.tipo !== 'entrada' && !mov.origen) e.origen = 'Selecciona almacén de origen'
  if (mov.tipo !== 'salida' && !mov.destino) e.destino = 'Selecciona almacén de destino'
  const lnErr = []
  mov.lineas.forEach((ln, idx) => {
    const le = {}
    if (!ln.producto) le.producto = 'Elige producto'
    if (!(Number(ln.cantidad) > 0)) le.cantidad = 'Cantidad > 0'
    if (Object.keys(le).length) lnErr[idx] = le
  })
  if (lnErr.length) e.lineas = lnErr
  movErrors.value = e
  return !Object.keys(e).length
}
async function saveMovimiento(){
  if (!empresaReady.value) return alert('Falta empresa')
  if (!validateMov()) return
  try{
    for (const ln of mov.lineas){
      const base = { empresa: empresaId.value, producto: ln.producto, cantidad: Number(ln.cantidad), notas: mov.notas || '' }
      if (mov.tipo === 'entrada'){
        await api.inventario.movimientos.create({ ...base, tipo:'entrada', destino: mov.destino })
      } else if (mov.tipo === 'salida'){
        await api.inventario.movimientos.create({ ...base, tipo:'salida', origen: mov.origen })
      } else {
        await api.inventario.movimientos.create({ ...base, tipo:'transferencia', origen: mov.origen, destino: mov.destino })
      }
    }
    showMovModal.value = false
    stockCache.clear()
    await fetchStocksForCurrent()
  }catch(e){
    const msg = e?.response?.data
    alert(msg?.detail || 'No se pudo guardar el movimiento')
  }
}

/* ====== Lifecycle ====== */
onMounted(async () => {
  await ws.ensureEmpresaSet()
  if (!empresaReady.value) return
  await loadAlmacenes()
  await loadProductos()
})
watch(() => ws.empresaKey, async () => {
  stockCache.clear(); almacenSel.value=''; q.value=''
  await loadAlmacenes(); await loadProductos()
})
watch([q, categoria], loadProductos)
watch(almacenSel, async () => { stockCache.clear(); await fetchStocksForCurrent() })
</script>

<template>
  <div class="p-4 space-y-4 lightWrap">
    <!-- Header & acciones -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-medium" :style="{color:'var(--ui-text)'}">Almacenes</h1>
      <div class="flex items-center gap-2">
        <button @click="openMovModal('entrada')" class="btn-primary">+ Entrada</button>
        <button @click="openMovModal('salida')" class="btn-ghost">Salida</button>
        <button @click="openMovModal('transferencia')" class="btn-ghost">Transferencia</button>
      </div>
    </div>

    <!-- KPIs -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <div class="kpi">
        <div class="kpi-title">Almacenes</div>
        <div class="kpi-value">{{ kpiTotalAlmacenes }}</div>
      </div>
      <div class="kpi">
        <div class="kpi-title">Productos</div>
        <div class="kpi-value">{{ kpiTotalProductos }}</div>
      </div>
      <div class="kpi">
        <div class="kpi-title">Stock {{ almacenSel ? '(almacén)' : '(total)' }}</div>
        <div class="kpi-value">{{ kpiStockTotal }}</div>
      </div>
      <div class="kpi">
        <div class="kpi-title">Sin stock</div>
        <div class="kpi-value">
          {{ kpiSinStock }}
          <span class="pill pill-negative ml-2" v-if="kpiSinStock>0">-</span>
        </div>
      </div>
    </div>

    <!-- Filtros + Tabla -->
    <div class="card">
      <div class="flex flex-col md:flex-row gap-3 items-stretch mb-3">
        <div class="flex-1">
          <input v-model="q" type="text" placeholder="Buscar producto…"
                 class="input"/>
        </div>
        <div class="flex items-center gap-2">
          <select v-model="almacenSel" class="select min-w-52">
            <option value="">Todos los almacenes</option>
            <option v-for="a in almacenes" :key="a.id" :value="String(a.id)">{{ a.nombre }}</option>
          </select>
          <!-- opcional categoría
          <select v-model="categoria" class="select min-w-48">
            <option value="">Todas las categorías</option>
          </select> -->
        </div>
      </div>

      <div>
        <div v-if="loading" class="py-10 text-center text-muted">Cargando…</div>
        <div v-else>
          <TableBasic :rows="productos" :columns="columns" :initialPageSize="10" />
        </div>
      </div>
    </div>

    <!-- MODAL: Movimiento -->
    <div v-if="showMovModal" class="modal-mask" @click.self="showMovModal=false">
      <div class="modal">
        <div class="modal-head">
          <h3>
            {{ mov.tipo==='entrada' ? 'Entrada a almacén' : mov.tipo==='salida' ? 'Salida de almacén' : 'Transferencia' }}
          </h3>
          <button @click="showMovModal=false" class="close">✕</button>
        </div>

        <div class="modal-body">
          <div class="grid sm:grid-cols-3 gap-3">
            <div>
              <label class="lbl">Tipo</label>
              <select v-model="mov.tipo" class="select">
                <option value="entrada">Entrada</option>
                <option value="salida">Salida</option>
                <option value="transferencia">Transferencia</option>
              </select>
              <div v-if="movErrors.tipo" class="err">{{ movErrors.tipo }}</div>
            </div>

            <div v-if="mov.tipo!=='entrada'">
              <label class="lbl">Origen</label>
              <select v-model="mov.origen" class="select">
                <option value="" disabled>Selecciona</option>
                <option v-for="a in almacenes" :key="a.id" :value="String(a.id)">{{ a.nombre }}</option>
              </select>
              <div v-if="movErrors.origen" class="err">{{ movErrors.origen }}</div>
            </div>

            <div v-if="mov.tipo!=='salida'">
              <label class="lbl">Destino</label>
              <select v-model="mov.destino" class="select">
                <option value="" disabled>Selecciona</option>
                <option v-for="a in almacenes" :key="a.id" :value="String(a.id)">{{ a.nombre }}</option>
              </select>
              <div v-if="movErrors.destino" class="err">{{ movErrors.destino }}</div>
            </div>
          </div>

          <div>
            <label class="lbl">Notas (opcional)</label>
            <textarea v-model.trim="mov.notas" rows="2" class="textarea"></textarea>
          </div>

          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <h4 class="text-base" :style="{color:'var(--ui-text)'}">Líneas</h4>
              <button @click="addLinea" class="btn-ghost">+ Agregar</button>
            </div>

            <div v-for="(ln,i) in mov.lineas" :key="i" class="row">
              <div class="md:col-span-7">
                <label class="lbl">Producto</label>
                <div class="relative">
                  <input
                    v-model="ln.nombre"
                    @input="mov._search = ln.nombre"
                    @focus="mov._search = ln.nombre"
                    class="input"
                    placeholder="Buscar…"
                    autocomplete="off"
                  />
                  <div v-if="(mov._search||'').length && productosFiltrados.length" class="autocomplete">
                    <div v-for="p in productosFiltrados" :key="p.id" class="ac-item"
                         @mousedown.prevent="setLineaProducto(i,p)">
                      <span>{{ p.nombre }}</span>
                      <span class="ac-meta">Stock: {{ getStock(p) ?? '…' }}</span>
                    </div>
                  </div>
                </div>
                <div v-if="movErrors.lineas?.[i]?.producto" class="err">{{ movErrors.lineas[i].producto }}</div>
              </div>

              <div class="md:col-span-3">
                <label class="lbl">Cantidad</label>
                <input v-model.number="ln.cantidad" type="number" min="1" step="1" class="input"/>
                <div v-if="movErrors.lineas?.[i]?.cantidad" class="err">{{ movErrors.lineas[i].cantidad }}</div>
              </div>

              <div class="md:col-span-2 flex items-end justify-end">
                <button @click="removeLinea(i)" class="btn-danger">Eliminar</button>
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button @click="showMovModal=false" class="btn-ghost">Cancelar</button>
            <button @click="saveMovimiento" class="btn-primary">Guardar movimiento</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ====== Paleta clara por defecto (puedes sobreescribir desde el Layout según empresa) ====== */
.lightWrap{
  --ui-bg: #ffffff;
  --ui-card: #ffffff;
  --ui-border: #e5e7eb;
  --ui-text: #111827;
  --ui-muted: #6b7280;
  --ui-primary: #1a5eff;   /* botón azul del mock */
  --ui-positive: #10b981;  /* verde badges */
  --ui-negative: #ef4444;  /* rojo badges */
  --ui-hover: #f3f4f6;
}

/* ====== Atomos ====== */
.input, .select, .textarea{
  width: 100%;
  border: 1px solid var(--ui-border);
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: #fff;
  color: var(--ui-text);
}
.textarea{ resize: vertical; }
.text-muted{ color: var(--ui-muted); }

.btn-primary{
  background: var(--ui-primary);
  color: #fff;
  border-radius: 0.6rem;
  padding: .5rem .9rem;
  font-weight: 600;
}
.btn-ghost{
  background: #fff;
  color: var(--ui-text);
  border: 1px solid var(--ui-border);
  border-radius: 0.6rem;
  padding: .5rem .9rem;
}
.btn-danger{
  background: #fff;
  color: var(--ui-negative);
  border: 1px solid #fbd5d5;
  border-radius: 0.6rem;
  padding: .5rem .9rem;
}

/* ====== Tarjetas KPI ====== */
.kpi{
  background: var(--ui-card);
  border: 1px solid var(--ui-border);
  border-radius: 1rem;
  padding: 1rem;
}
.kpi-title{ color: var(--ui-muted); font-size: .9rem; }
.kpi-value{ color: var(--ui-text); font-size: 1.75rem; font-weight: 700; }
.pill{
  display: inline-block;
  font-size: .75rem;
  padding: .125rem .4rem;
  border-radius: .4rem;
  background: #ecfeff;
  color: #065f46;
}
.pill-negative{ background: #fee2e2; color: var(--ui-negative); }

/* ====== Card contenedor ====== */
.card{
  background: var(--ui-card);
  border: 1px solid var(--ui-border);
  border-radius: 1rem;
  padding: 1rem;
}

/* ====== Modal ====== */
.modal-mask{
  position: fixed; inset: 0; background: rgba(17,24,39,.5);
  display: flex; align-items: center; justify-content: center; padding: 1rem; z-index: 50;
}
.modal{
  width: 100%; max-width: 880px;
  background: var(--ui-card);
  border: 1px solid var(--ui-border);
  border-radius: 1rem;
  overflow: hidden;
}
.modal-head{
  padding: .9rem 1rem; border-bottom: 1px solid var(--ui-border);
  display: flex; align-items: center; justify-content: space-between; color: var(--ui-text);
}
.modal-body{ padding: 1rem; }
.modal-actions{ display: flex; justify-content: flex-end; gap: .5rem; margin-top: .5rem; }
.close{ color: var(--ui-muted); }

.lbl{ color: var(--ui-text); font-size: .9rem; display:block; margin-bottom: .25rem; }
.err{ color: var(--ui-negative); font-size: .75rem; margin-top: .25rem; }

/* Líneas */
.row{
  display: grid; grid-template-columns: repeat(12, minmax(0,1fr));
  gap: .5rem; align-items: start;
  border: 1px solid var(--ui-border); border-radius: .9rem; padding: .75rem;
}
.row > .md\:col-span-7{ grid-column: span 12 / span 12; }
.row > .md\:col-span-3{ grid-column: span 12 / span 12; }
.row > .md\:col-span-2{ grid-column: span 12 / span 12; }
@media (min-width: 768px){
  .row > .md\:col-span-7{ grid-column: span 7 / span 7; }
  .row > .md\:col-span-3{ grid-column: span 3 / span 3; }
  .row > .md\:col-span-2{ grid-column: span 2 / span 2; }
}

/* Autocomplete */
.autocomplete{
  position: absolute; left:0; right:0; top: calc(100% + .25rem);
  background: #fff; color: var(--ui-text);
  border: 1px solid var(--ui-border); border-radius: .6rem;
  max-height: 14rem; overflow: auto; z-index: 10;
  box-shadow: 0 10px 30px rgba(0,0,0,.06);
}
.ac-item{
  display: flex; align-items: center; justify-content: space-between;
  padding: .5rem .75rem; cursor: pointer;
}
.ac-item:hover{ background: var(--ui-hover); }
.ac-meta{ font-size: .75rem; color: var(--ui-muted); }
</style>
