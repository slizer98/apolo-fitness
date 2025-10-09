<!-- src/views/inventario/ProductosLista.vue -->
<script setup>
import { ref, reactive, onMounted, watch, computed, nextTick } from 'vue'
import { useWorkspaceStore } from '@/stores/workspace'
import api from '@/api/services'
import TableBasic from '@/components/TableBasic.vue'

/* ====== Constantes impuestos (por producto) ====== */
const IVA_PCT = 16   // 16%
const IEPS_PCT = 8   // 8%

/* ====== Workspace (empresa) ====== */
const ws = useWorkspaceStore()
const empresaId = computed(() => Number(ws.empresaId || 0))
const empresaReady = computed(() => !!empresaId.value)

/* ====== Estado UI / filtros ====== */
const q = ref('')
const categoria = ref('')
const almacen = ref('')         // <- al elegir, cargamos stock de todos
const page = ref(1)
const pageSize = ref(24)
const viewMode = ref(localStorage.getItem('prodViewMode') || 'grid') // grid | table

// 🔹 quitamos toggles globales IVA/IEPS

const productos = ref([])
const count = ref(0)
const categorias = ref([])
const almacenes = ref([])
const loading = ref(false)

/* ====== Modal CRUD Producto (sin stock ni impuestos) ====== */
const showModal = ref(false)
const isEditing = ref(false)
const form = reactive({
  id: null,
  categoria: null,
  nombre: '',
  descripcion: '',
  codigo_barras: '',
  precio: 0,
  aplicar_iva: true,     // 🔹 default
  aplicar_ieps: false,   // 🔹 default
})

function openNew() {
  isEditing.value = false
  Object.assign(form, {
    id: null, categoria: null, nombre: '',
    descripcion: '', codigo_barras: '',
    precio: 0,
    aplicar_iva: true,
    aplicar_ieps: false,
  })
  showModal.value = true
}

function openEdit(p) {
  isEditing.value = true
  Object.assign(form, {
    id: p.id,
    categoria: p.categoria ?? null,
    nombre: p.nombre,
    descripcion: p.descripcion || '',
    codigo_barras: p.codigo_barras || '',
    precio: Number(p.precio || 0),
    aplicar_iva: !!p.aplicar_iva,
    aplicar_ieps: !!p.aplicar_ieps,
  })
  showModal.value = true
}

async function save() {
  if (!empresaReady.value) return alert('Falta empresa activa')
  if (!form.categoria) return alert('Selecciona una categoría')

  const payload = {
    empresa: empresaId.value,
    categoria: form.categoria,
    nombre: form.nombre?.trim(),
    descripcion: form.descripcion?.trim(),
    codigo_barras: (form.codigo_barras || '').trim(),
    precio: form.precio,
    aplicar_iva: !!form.aplicar_iva,     // 🔹
    aplicar_ieps: !!form.aplicar_ieps,   // 🔹
  }
  try {
    if (isEditing.value && form.id) {
      await api.inventario.productos.update(form.id, payload)
    } else {
      await api.inventario.productos.create(payload)
    }
    showModal.value = false
    await load()
    if (almacen.value) await fetchStocksForCurrent()
  } catch (e) {
    const msg = e?.response?.data
    console.warn('save error:', msg)
    alert(
      msg?.detail
      || msg?.empresa?.[0]
      || msg?.categoria?.[0]
      || msg?.nombre?.[0]
      || 'Error al guardar'
    )
  }
}

async function removeProd(p) {
  if (!confirm(`Eliminar "${p.nombre}"?`)) return
  try {
    await api.inventario.productos.delete(p.id)
    await load()
  } catch (e) {
    alert('No se pudo eliminar')
  }
}

/* ====== Modal Nueva Categoría (combobox anti-duplicados) ====== */
const showCatModal = ref(false)
const catForm = reactive({ nombre: '' })
const catOpenList = ref(false)

function openCatModal() {
  if (!empresaReady.value) { alert('Falta empresa activa'); return }
  Object.assign(catForm, { nombre: '' })
  catOpenList.value = false
  showCatModal.value = true
}

function norm(s) {
  return (s || '')
    .toString()
    .trim()
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

const catMatches = computed(() => {
  const term = norm(catForm.nombre)
  if (!term) return (categorias.value || []).slice(0, 8)
  return (categorias.value || [])
    .filter(c => norm(c.nombre).includes(term))
    .slice(0, 8)
})

const catIsDuplicate = computed(() => {
  const n = norm(catForm.nombre)
  if (!n) return false
  return (categorias.value || []).some(c => norm(c.nombre) === n)
})

function useExistingCategory(cat) {
  categoria.value = String(cat.id) // filtro de lista
  form.categoria = cat.id          // preselecciona en modal producto
  showCatModal.value = false
}

async function saveCategoria() {
  if (!empresaReady.value) return alert('Falta empresa activa')
  const nombreLimpio = (catForm.nombre || '').trim()
  if (!nombreLimpio) return alert('Escribe un nombre')

  const dup = (categorias.value || []).find(c => norm(c.nombre) === norm(nombreLimpio))
  if (dup) {
    useExistingCategory(dup)
    return
  }

  try {
    await api.inventario.categoriasProducto.create({
      empresa: empresaId.value,
      nombre: nombreLimpio,
    })
    showCatModal.value = false
    await loadCategorias()
    const rec = (categorias.value || []).find(c => norm(c.nombre) === norm(nombreLimpio))
    if (rec?.id) {
      categoria.value = String(rec.id)
      form.categoria = rec.id
    }
  } catch (e) {
    const msg = e?.response?.data
    const exist = (categorias.value || []).find(c => norm(c.nombre) === norm(nombreLimpio))
    if (exist) useExistingCategory(exist)
    else alert(msg?.detail || msg?.nombre?.[0] || 'No se pudo crear la categoría')
  }
}

/* ====== Carga de datos ====== */
async function load() {
  if (!empresaReady.value) return
  loading.value = true
  try {
    const params = {
      empresa: empresaId.value,
      search: q.value || undefined,
      categoria: categoria.value || undefined,
      page: viewMode.value === 'table' ? 1 : page.value,
      page_size: viewMode.value === 'table' ? 500 : pageSize.value,
      ordering: 'nombre',
    }
    const { data } = await api.inventario.productos.list(params)
    productos.value = data?.results || data || []
    count.value = data?.count ?? productos.value.length

    if (almacen.value) {
      await nextTick()
      await fetchStocksForCurrent()
    }
  } finally {
    loading.value = false
  }
}

async function loadCategorias() {
  if (!empresaReady.value) { categorias.value = []; return }
  const { data } = await api.inventario.categoriasProducto.list({
    empresa: empresaId.value,
    page_size: 500,
    ordering: 'nombre'
  })
  categorias.value = data?.results || data || []
}

async function loadAlmacenes() {
  if (!empresaReady.value) { almacenes.value = []; return }
  const { data } = await api.inventario.almacenes.list({
    empresa: empresaId.value,
    page_size: 500,
    ordering: 'nombre'
  })
  almacenes.value = data?.results || data || []
}

/* ====== STOCK por producto (auto por almacén) ====== */
const stockCache = reactive(new Map()) // key: `${id}:${almacen}` -> number

async function fetchStock(productId, almacenId) {
  const key = `${productId}:${almacenId}`
  if (stockCache.has(key)) return stockCache.get(key)
  const { data } = await api.inventario.productos.stock(productId, {
    empresa: empresaId.value,
    almacen: almacenId
  })
  const val = Number(data?.stock || 0)
  stockCache.set(key, val)
  return val
}

async function fetchStocksForCurrent() {
  if (!almacen.value) return
  const current = productos.value || []
  const chunkSize = 12
  for (let i = 0; i < current.length; i += chunkSize) {
    const slice = current.slice(i, i + chunkSize)
    await Promise.all(slice.map(p => fetchStock(p.id, almacen.value)))
  }
}

function getStock(p) {
  if (!almacen.value) return undefined
  const key = `${p.id}:${almacen.value}`
  return stockCache.get(key)
}

/* ====== Precios (por producto) ====== */
function precioConImpuestos(p) {
  const base = Number(p.precio || 0)
  let total = base
  if (p.aplicar_iva) total += base * (IVA_PCT / 100)
  if (p.aplicar_ieps) total += base * (IEPS_PCT / 100)
  return total
}

/* ====== Tabla: columnas ====== */
const tableColumns = computed(() => {
  const cols = [
    {
      accessorKey: 'nombre',
      header: 'Nombre',
      cell: ({ row }) => row.original.nombre,
      enableSorting: true,
    },
    {
      accessorKey: 'categoria_nombre',
      header: 'Categoría',
      cell: ({ row }) => row.original.categoria_nombre || '—',
      enableSorting: true,
    },
    {
      accessorKey: 'precio',
      header: 'Precio base',
      cell: ({ row }) => `$ ${Number(row.original.precio || 0).toFixed(2)}`,
      enableSorting: true,
    },
    {
      accessorKey: 'precio_total',
      header: () => 'Total (según flags)',
      cell: ({ row }) => `$ ${precioConImpuestos(row.original).toFixed(2)}`,
      enableSorting: false,
    },
    {
      accessorKey: 'impuestos',
      header: 'Impuestos',
      cell: ({ row }) => {
        const p = row.original
        const parts = []
        if (p.aplicar_iva) parts.push(`IVA ${IVA_PCT}%`)
        if (p.aplicar_ieps) parts.push(`IEPS ${IEPS_PCT}%`)
        return parts.join(' + ') || '—'
      },
      enableSorting: false,
    },
    {
      accessorKey: 'codigo_barras',
      header: 'Cód. barras',
      cell: ({ row }) => row.original.codigo_barras || '—',
      enableSorting: true,
    },
  ]
  if (almacen.value) {
    cols.push({
      accessorKey: 'stock',
      header: 'Stock',
      cell: ({ row }) => {
        const s = getStock(row.original)
        return s === undefined ? '...' : s
      },
      enableSorting: false,
    })
  }
  cols.push({
    accessorKey: 'acciones',
    header: 'Acciones',
    cell: () => '—',
    enableSorting: false,
  })
  return cols
})

/* ====== Lifecycle / watchers ====== */
onMounted(async () => {
  await ws.ensureEmpresaSet()
  if (!empresaReady.value) return
  await Promise.all([loadCategorias(), loadAlmacenes()])
  await load()
})

watch(() => ws.empresaKey, async () => {
  stockCache.clear()
  categoria.value = ''
  almacen.value = ''
  page.value = 1
  await Promise.all([loadCategorias(), loadAlmacenes()])
  await load()
})

watch([q, categoria, page, pageSize, viewMode], async () => {
  await load()
})

watch(almacen, async () => {
  stockCache.clear()
  if (almacen.value) await fetchStocksForCurrent()
})
</script>

<template>
  <div class="p-4 space-y-4">
    <!-- Aviso si no hay empresa -->
    <div v-if="!empresaReady" class="border border-amber-500/30 bg-amber-500/10 text-amber-200 rounded-lg p-3 text-sm">
      No hay empresa activa. Abre sesión o selecciona una empresa para continuar.
    </div>

    <!-- Filtros / Controles -->
    <div v-else class="flex flex-col gap-3">
      <div class="flex flex-col md:flex-row gap-3 items-stretch">
        <div class="flex-1 flex items-center gap-2">
          <input
            v-model="q"
            type="text"
            placeholder="Buscar por nombre o código de barras…"
            class="w-full border border-gray-800 rounded-lg px-3 py-2 bg-gray-900 text-gray-100 placeholder-gray-400"
          />
        </div>

        <div class="flex items-center gap-2">
          <select
            v-model="categoria"
            class="border border-gray-800 rounded-lg px-3 py-2 min-w-52 bg-gray-900 text-gray-100"
          >
            <option value="">Todas las categorías</option>
            <option v-for="c in categorias" :key="c.id" :value="String(c.id)">
              {{ c.nombre }}
            </option>
          </select>

          <select
            v-model="almacen"
            class="border border-gray-800 rounded-lg px-3 py-2 min-w-48 bg-gray-900 text-gray-100"
          >
            <option value="">Almacén (opcional)</option>
            <option v-for="a in almacenes" :key="a.id" :value="String(a.id)">
              {{ a.nombre }}
            </option>
          </select>

          <button
            @click="openCatModal"
            class="px-3 py-2 rounded-lg border border-gray-700 hover:border-gray-500 text-gray-100"
          >
            Nueva categoría
          </button>

          <button
            @click="openNew"
            class="px-3 py-2 rounded-lg border border-gray-700 hover:border-gray-500 text-gray-100"
          >
            Nuevo producto
          </button>
        </div>
      </div>

      <!-- 🔹 quitamos los checks globales -->
      <div class="flex flex-wrap items-center gap-3 text-sm">
        <div class="ml-auto border border-gray-800 rounded-lg overflow-hidden flex">
          <button
            class="px-3 py-2 text-gray-100"
            :class="viewMode==='grid' ? 'bg-gray-800' : ''"
            @click="viewMode='grid'; localStorage.setItem('prodViewMode','grid')"
          >
            Tarjetas
          </button>
          <button
            class="px-3 py-2 text-gray-100"
            :class="viewMode==='table' ? 'bg-gray-800' : ''"
            @click="viewMode='table'; localStorage.setItem('prodViewMode','table')"
          >
            Tabla
          </button>
        </div>
      </div>
    </div>

    <!-- GRID de productos -->
    <div v-if="empresaReady && viewMode==='grid'" class="border border-gray-800 rounded-xl p-3 bg-gray-950">
      <div v-if="loading" class="py-10 text-center text-gray-400">Cargando…</div>

      <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        <div
          v-for="p in productos"
          :key="p.id"
          class="border border-gray-800 rounded-lg p-3 hover:shadow-lg hover:shadow-black/30 bg-gray-900"
        >
          <div class="flex items-start justify-between gap-2">
            <div>
              <div class="font-medium text-gray-100">{{ p.nombre }}</div>
              <div class="text-xs text-gray-400">{{ p.categoria_nombre || '—' }}</div>
            </div>
            <div class="text-right text-gray-100">
              <div class="font-semibold">$ {{ precioConImpuestos(p).toFixed(2) }}</div>
              <div class="text-[11px] text-gray-400">
                Base: $ {{ Number(p.precio||0).toFixed(2) }}
                <template v-if="p.aplicar_iva"> + IVA {{ IVA_PCT }}%</template>
                <template v-if="p.aplicar_ieps"> + IEPS {{ IEPS_PCT }}%</template>
              </div>
            </div>
          </div>

          <div class="mt-2 text-xs text-gray-400">
            CB: {{ p.codigo_barras || '—' }}
          </div>

          <div class="mt-3 flex items-center justify-between gap-2">
            <div class="text-sm">
              <template v-if="almacen">
                <span class="text-gray-400">Stock</span>:
                <b class="text-gray-200">{{ getStock(p) ?? '...' }}</b>
              </template>
            </div>
            <div class="flex items-center gap-2">
              <button
                class="px-2 py-1 border border-gray-700 rounded text-gray-100 hover:border-gray-500"
                @click="openEdit(p)"
              >
                Editar
              </button>
              <button
                class="px-2 py-1 border border-gray-700 rounded text-red-400 hover:border-red-400"
                @click="removeProd(p)"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Paginación (solo grid) -->
      <div class="mt-4 flex items-center justify-between">
        <div class="text-sm text-gray-400">Total: {{ count }}</div>
        <div class="flex items-center gap-2">
          <button
            class="px-2 py-1 border border-gray-700 rounded text-gray-100 hover:border-gray-500 disabled:opacity-40"
            :disabled="page <= 1"
            @click="page = Math.max(1, page - 1)"
          >
            Anterior
          </button>
          <span class="text-sm text-gray-300">Página {{ page }}</span>
          <button
            class="px-2 py-1 border border-gray-700 rounded text-gray-100 hover:border-gray-500 disabled:opacity-40"
            :disabled="productos.length < pageSize"
            @click="page = page + 1"
          >
            Siguiente
          </button>
          <select
            v-model.number="pageSize"
            class="border border-gray-800 rounded px-2 py-1 bg-gray-900 text-gray-100"
          >
            <option :value="12">12</option>
            <option :value="24">24</option>
            <option :value="48">48</option>
          </select>
        </div>
      </div>
    </div>

    <!-- TABLA de productos -->
    <div v-if="empresaReady && viewMode==='table'" class="border border-gray-800 rounded-xl p-3 bg-gray-950">
      <div v-if="loading" class="py-10 text-center text-gray-400">Cargando…</div>

      <div v-else>
        <TableBasic :rows="productos" :columns="tableColumns" :initialPageSize="10" />
      </div>
    </div>

    <!-- Modal NUEVA CATEGORÍA -->
    <div
      v-if="showCatModal"
      class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click.self="showCatModal = false"
    >
      <div class="w-full max-w-md bg-gray-950 border border-gray-800 rounded-2xl shadow-xl">
        <div class="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
          <h3 class="text-lg text-gray-100">Nueva categoría</h3>
          <button @click="showCatModal = false" class="text-gray-400 hover:text-white">✕</button>
        </div>
        <form @submit.prevent="saveCategoria" class="p-4 space-y-3" novalidate>
          <div>
            <label class="text-sm text-gray-300">Nombre de categoría</label>
            <div class="relative">
              <input
                v-model.trim="catForm.nombre"
                @focus="catOpenList = true"
                @blur="setTimeout(()=>catOpenList=false, 120)"
                placeholder="Ej. Bebidas, Accesorios…"
                class="w-full border border-gray-700 rounded-lg px-3 py-2 bg-gray-900 text-gray-100"
                autocomplete="off"
              />
              <div
                v-if="catOpenList && catMatches.length"
                class="absolute z-10 mt-1 w-full max-h-56 overflow-auto border border-gray-700 rounded-lg bg-gray-900 shadow-xl"
              >
                <div
                  v-for="c in catMatches"
                  :key="c.id"
                  class="px-3 py-2 cursor-pointer hover:bg-gray-800 text-gray-100 flex items-center justify-between"
                  @mousedown.prevent="useExistingCategory(c)"
                >
                  <span>{{ c.nombre }}</span>
                  <span class="text-[11px] text-gray-400">Usar existente</span>
                </div>
              </div>
            </div>
            <div class="text-xs mt-1" :class="catIsDuplicate ? 'text-amber-300' : 'text-gray-400'">
              <template v-if="catIsDuplicate">
                Ya existe una categoría con ese nombre. Se usará la existente.
              </template>
              <template v-else>
                Escribe para buscar o crea una nueva si no aparece.
              </template>
            </div>
          </div>
          <div class="flex items-center justify-end gap-2">
            <button type="button" @click="showCatModal = false"
              class="px-3 py-2 border border-gray-700 rounded-lg text-gray-100 hover:border-gray-500">
              Cancelar
            </button>
            <button type="submit"
              class="px-4 py-2 rounded-lg text-white bg-black border border-gray-700 hover:border-gray-500">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal CRUD PRODUCTO -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click.self="showModal = false"
    >
      <div class="w-full max-w-xl bg-gray-950 border border-gray-800 rounded-2xl shadow-xl">
        <div class="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
          <h3 class="text-lg text-gray-100">{{ isEditing ? 'Editar producto' : 'Nuevo producto' }}</h3>
          <button @click="showModal = false" class="text-gray-400 hover:text-white">✕</button>
        </div>

        <form @submit.prevent="save" class="p-4 space-y-4" novalidate>
          <div class="grid sm:grid-cols-2 gap-3">
            <div class="sm:col-span-2">
              <label class="text-sm text-gray-300">Categoría</label>
              <select
                v-model.number="form.categoria"
                required
                class="w-full border border-gray-700 rounded-lg px-3 py-2 bg-gray-900 text-gray-100"
              >
                <option :value="undefined" disabled>Selecciona categoría</option>
                <option v-for="c in categorias" :key="c.id" :value="c.id">{{ c.nombre }}</option>
              </select>
              <div class="text-xs text-gray-400 mt-1">
                ¿No está? <button type="button" @click="openCatModal" class="underline text-blue-400">crear nueva</button>
              </div>
            </div>

            <div class="sm:col-span-2">
              <label class="text-sm text-gray-300">Nombre</label>
              <input
                v-model.trim="form.nombre"
                required
                class="w-full border border-gray-700 rounded-lg px-3 py-2 bg-gray-900 text-gray-100"
              />
            </div>

            <div class="sm:col-span-2">
              <label class="text-sm text-gray-300">Descripción</label>
              <textarea
                v-model.trim="form.descripcion"
                rows="2"
                class="w-full border border-gray-700 rounded-lg px-3 py-2 bg-gray-900 text-gray-100"
              ></textarea>
            </div>

            <div>
              <label class="text-sm text-gray-300">Código de barras</label>
              <input
                v-model.trim="form.codigo_barras"
                class="w-full border border-gray-700 rounded-lg px-3 py-2 bg-gray-900 text-gray-100"
              />
            </div>

            <div>
              <label class="text-sm text-gray-300">Precio base</label>
              <input
                v-model.number="form.precio"
                type="number" min="0" step="0.01" required
                class="w-full border border-gray-700 rounded-lg px-3 py-2 bg-gray-900 text-gray-100"
              />
            </div>

            <!-- 🔹 Impuestos por producto -->
            <div class="sm:col-span-2 flex flex-wrap items-center gap-4 text-sm">
              <label class="inline-flex items-center gap-2 text-gray-200">
                <input type="checkbox" v-model="form.aplicar_iva" class="accent-white">
                Aplicar IVA ({{ IVA_PCT }}%)
              </label>
              <label class="inline-flex items-center gap-2 text-gray-200">
                <input type="checkbox" v-model="form.aplicar_ieps" class="accent-white">
                Aplicar IEPS ({{ IEPS_PCT }}%)
              </label>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2">
            <button type="button" @click="showModal = false"
              class="px-3 py-2 border border-gray-700 rounded-lg text-gray-100 hover:border-gray-500">
              Cancelar
            </button>
            <button type="submit"
              class="px-4 py-2 rounded-lg text-white bg-black border border-gray-700 hover:border-gray-500">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
