<template>
  <div class="p-4 text-white">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-light">Productos</h1>
      <button
        @click="openNew"
        class="bg-apolo-primary text-black px-4 py-2 rounded hover:bg-apolo-secondary transition"
      >
        + Nuevo
      </button>
    </div>

    <!-- Tabla (usa TableBasic como Clientes) -->
    <div class="rounded-2xl bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 shadow-xl p-4">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-lg font-medium">Listado</h2>
        <span v-if="!loading" class="text-sm text-gray-400">{{ rows.length }} registros</span>
      </div>

      <div v-if="loading" class="space-y-2">
        <div class="animate-pulse h-8 bg-gray-800/60 rounded" v-for="i in 6" :key="i"></div>
      </div>

      <div v-else>
        <TableBasic :rows="rows" :columns="columns" :initialPageSize="10" />
      </div>
    </div>

    <!-- Modal Crear/Editar -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click.self="closeModal"
    >
      <div class="w-full max-w-xl bg-gray-950 border border-gray-800 rounded-2xl shadow-xl">
        <div class="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
          <h3 class="text-lg">{{ isEditing ? 'Editar producto' : 'Nuevo producto' }}</h3>
          <button @click="closeModal" class="text-gray-400 hover:text-white">✕</button>
        </div>

        <form @submit.prevent="save" class="p-4 space-y-4" novalidate>
          <div class="grid sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-400 mb-1">Nombre *</label>
              <input
                v-model.trim="form.nombre"
                class="w-full bg-gray-900 border rounded px-3 py-2"
                :class="errors.nombre ? 'border-red-600' : 'border-gray-700'"
                autocomplete="off"
              />
              <p v-if="errors.nombre" class="text-red-400 text-xs mt-1">{{ errors.nombre }}</p>
            </div>

            <div>
              <label class="block text-xs text-gray-400 mb-1">Categoría *</label>
              <select
                v-model.number="form.categoria"
                class="w-full bg-gray-900 border rounded px-3 py-2"
                :class="errors.categoria ? 'border-red-600' : 'border-gray-700'"
              >
                <option disabled value="">Selecciona…</option>
                <option v-for="c in categorias" :key="c.id" :value="c.id">{{ c.nombre }}</option>
              </select>
              <p v-if="errors.categoria" class="text-red-400 text-xs mt-1">{{ errors.categoria }}</p>
            </div>
          </div>

          <div class="grid sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-400 mb-1">Código de barras</label>
              <input
                v-model="form.codigo_barras"
                @input="onBarcodeInput"
                inputmode="latin"
                class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
                placeholder="Opcional"
                autocomplete="off"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-400 mb-1">Descripción</label>
              <input
                v-model.trim="form.descripcion"
                class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
                placeholder="Opcional"
              />
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-1">
            <button type="button" @click="closeModal" class="px-4 py-2 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700">
              Cancelar
            </button>
            <button type="submit" :disabled="saving" class="px-4 py-2 rounded bg-apolo-primary text-black hover:bg-apolo-secondary disabled:opacity-60">
              {{ saving ? 'Guardando…' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Toast -->
    <transition name="fade">
      <div v-if="toast.show" class="fixed bottom-4 right-4 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm shadow-xl z-50">
        {{ toast.message }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { h, ref, onMounted, computed } from 'vue'
import { createColumnHelper } from '@tanstack/vue-table'
import TableBasic from '@/components/TableBasic.vue'
import api from '@/api/services'
import { useWorkspaceStore } from '@/stores/workspace'

/* ---------- empresa ---------- */
const ws = useWorkspaceStore()
const empresaId = computed(() => ws.empresaId)

/* ---------- estado ---------- */
const loading = ref(true)
const rows = ref([])           // productos (para TableBasic)
const categorias = ref([])     // para el select

const showModal = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const errors = ref({})
const form = ref({ id:null, nombre:'', categoria:'', descripcion:'', codigo_barras:'' })

const toast = ref({ show:false, message:'' })
function showToast(msg){ toast.value={ show:true, message:msg }; setTimeout(()=>toast.value.show=false, 1800) }

/* ---------- carga ---------- */
onMounted(async () => {
  await Promise.all([fetchCategorias(), fetchAllProductsClientSide()])
})

async function fetchCategorias(){
  try{
    const pageSize = 200
    let page = 1
    const acc = []
    while(true){
      const { data } = await api.inventario.categorias.list({ page, page_size: pageSize, ordering: 'nombre' })
      const chunk = data?.results || data || []
      acc.push(...chunk)
      const total = data?.count
      if (!chunk.length || (total && acc.length >= total) || chunk.length < pageSize) break
      page += 1
    }
    categorias.value = acc
  } catch { categorias.value = [] }
}

async function fetchAllProductsClientSide(){
  loading.value = true
  try{
    const pageSize = 200
    let page = 1
    const acc = []
    while(true){
      const { data } = await api.inventario.productos.list({ page, page_size: pageSize, ordering: '-id' })
      const chunk = data?.results || data || []
      acc.push(...chunk)
      const total = data?.count
      if (!chunk.length || (total && acc.length >= total) || chunk.length < pageSize) break
      page += 1
    }
    rows.value = acc.map(p => ({
      id: p.id,
      nombre: p.nombre ?? '',
      categoria_nombre: p.categoria_nombre || (p.categoria?.nombre ?? '—'),
      codigo_barras: p.codigo_barras || '—',
      descripcion: p.descripcion || '—',
      __raw: p,
    }))
  } finally { loading.value = false }
}

/* ---------- modal ---------- */
function openNew(){
  isEditing.value = false
  errors.value = {}
  form.value = { id:null, nombre:'', categoria:'', descripcion:'', codigo_barras:'' }
  showModal.value = true
}
function openEdit(row){
  const p = row.__raw || row
  isEditing.value = true
  errors.value = {}
  form.value = {
    id: p.id,
    nombre: p.nombre || '',
    categoria: p.categoria || p.categoria_id || '',
    descripcion: p.descripcion || '',
    codigo_barras: p.codigo_barras || ''
  }
  showModal.value = true
}
function closeModal(){ showModal.value = false }

/* ---------- validaciones ---------- */
function validate(){
  const e = {}
  if(!form.value.nombre?.trim()) e.nombre = 'El nombre es obligatorio'
  if(!form.value.categoria) e.categoria = 'Selecciona una categoría'
  errors.value = e
  return Object.keys(e).length === 0
}

/* ---------- helpers ---------- */
function onBarcodeInput(e){
  // Permite letras/números y - _ espacio; recorta a 64 por si acaso
  const raw = String(e.target.value || '')
  const cleaned = raw.replace(/[^\w\- ]+/g, '').slice(0, 64)
  form.value.codigo_barras = cleaned
}

/* ---------- guardar/eliminar ---------- */
async function save(){
  if(!validate()) return
  saving.value = true
  try{
    const payload = {
      nombre: form.value.nombre.trim(),
      categoria: Number(form.value.categoria),
      descripcion: form.value.descripcion?.trim() || '',
      codigo_barras: form.value.codigo_barras?.trim() || ''
    }
    if(isEditing.value && form.value.id){
      await api.inventario.productos.patch(form.value.id, payload)
      showToast('Producto actualizado')
    } else {
      await api.inventario.productos.create({ ...payload, empresa: empresaId.value })
      showToast('Producto creado')
    }
    closeModal()
    await fetchAllProductsClientSide()
  } catch (e) {
    const msg = e?.response?.data?.detail
      || e?.response?.data?.empresa?.[0]
      || e?.response?.data?.nombre?.[0]
      || e?.response?.data?.categoria?.[0]
      || 'Error al guardar'
    showToast(msg)
  } finally { saving.value = false }
}

async function removeRow(row){
  if(!confirm(`Eliminar producto "${row.nombre}"?`)) return
  try{
    await api.inventario.productos.delete(row.id)
    rows.value = rows.value.filter(x => x.id !== row.id)
    showToast('Eliminado')
  } catch(e){
    showToast(e?.response?.data?.detail || 'No se pudo eliminar')
  }
}

/* ---------- columnas (TanStack) ---------- */
const col = createColumnHelper()
const columns = [
  col.accessor('nombre', {
    header: () => 'Nombre',
    enableSorting: true,
  }),
  col.accessor('categoria_nombre', {
    header: () => 'Categoría',
    enableSorting: true,
  }),
  col.accessor('codigo_barras', {
    header: () => 'Código de barras',
    enableSorting: true,
  }),
  col.accessor('descripcion', {
    header: () => 'Descripción',
    enableSorting: false,
  }),
  col.display({
    id: 'acciones',
    header: () => h('div', { class: 'text-right' }, 'Acciones'),
    cell: ({ row }) => {
      const r = row.original
      return h('div', { class:'flex justify-end gap-2' }, [
        h('button', {
          class:'px-2 py-1 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700',
          onClick: () => openEdit(r)
        }, 'Editar'),
        h('button', {
          class:'px-2 py-1 rounded border border-red-800 bg-red-900/40 hover:bg-red-800',
          onClick: () => removeRow(r)
        }, 'Eliminar'),
      ])
    }
  }),
]
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease }
.fade-enter-from, .fade-leave-to { opacity: 0 }
</style>
