<template>
  <div class="p-4 text-white">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-light">Servicios</h1>
      <button @click="openNew" class="bg-apolo-primary text-black px-4 py-2 rounded hover:bg-apolo-secondary transition"
              :disabled="!empresaId" :title="!empresaId ? 'Selecciona/activa una empresa para crear' : ''">+ Nuevo</button>
    </div>

    <div class="rounded-2xl bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 shadow-xl p-4">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-lg font-medium">Listado</h2>
        <span v-if="!loading" class="text-sm text-gray-400">{{ rows.length }} registros</span>
      </div>

      <!-- <div class="mb-4 flex flex-wrap gap-2">
        <input v-model="q" @keyup.enter="applyFilter" placeholder="Buscar servicio…"
               class="bg-gray-900 border border-gray-700 rounded px-3 py-2 w-64" />
        <button @click="applyFilter" class="bg-gray-800 border border-gray-700 px-4 py-2 rounded hover:bg-gray-700">Buscar</button>
        <button @click="resetFilters" class="bg-gray-800 border border-gray-700 px-4 py-2 rounded hover:bg-gray-700">Limpiar</button>
      </div> -->

      <div v-if="loading" class="space-y-2">
        <div class="animate-pulse h-8 bg-gray-800/60 rounded" v-for="i in 6" :key="i"></div>
      </div>
      <div v-else>
        <TableBasic :rows="filteredRows" :columns="columns" :initialPageSize="10" />
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="closeModal">
      <div class="w-full max-w-xl bg-gray-950 border border-gray-800 rounded-2xl shadow-xl">
        <div class="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
          <h3 class="text-lg">{{ isEditing ? 'Editar servicio' : 'Nuevo servicio' }}</h3>
          <button @click="closeModal" class="text-gray-400 hover:text-white">✕</button>
        </div>
        <form @submit.prevent="save" class="p-4 space-y-4" novalidate>
          <div class="grid sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-400 mb-1">Nombre *</label>
              <input v-model.trim="form.nombre" class="w-full bg-gray-900 border rounded px-3 py-2"
                     :class="errors.nombre ? 'border-red-600' : 'border-gray-700'" />
              <p v-if="errors.nombre" class="text-red-400 text-xs mt-1">{{ errors.nombre }}</p>
            </div>
            <div>
              <label class="block text-xs text-gray-400 mb-1">Icono (opcional)</label>
              <div class="flex items-center gap-2">
                <input v-model.trim="form.icono" placeholder="lucide:dumbbell"
                       class="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2"
                       @focus="openIconPicker = true" readonly />
                <button type="button" class="px-2 py-2 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700"
                        @click="openIconPicker = true">Elegir…</button>
              </div>
              <div v-if="form.icono" class="mt-2 flex items-center gap-2 text-gray-300">
                <Icon :icon="form.icono" class="w-5 h-5" />
                <span class="text-xs">{{ form.icono }}</span>
                <button type="button" class="text-xs text-gray-400 hover:text-white" @click="form.icono = ''">Quitar</button>
              </div>
            </div>
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">Descripción</label>
            <textarea v-model="form.descripcion" rows="3" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"></textarea>
          </div>
          <div class="flex items-center justify-end gap-2 pt-1">
            <button type="button" @click="closeModal" class="px-4 py-2 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700">Cancelar</button>
            <button type="submit" :disabled="saving" class="px-4 py-2 rounded bg-apolo-primary text-black hover:bg-apolo-secondary disabled:opacity-60">
              {{ saving ? 'Guardando…' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Icon Picker -->
    <IconPicker v-if="openIconPicker" @close="openIconPicker=false" @select="onSelectIconify" />

    <!-- Confirmación -->
    <div v-if="confirm.open" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="confirm.open=false">
      <div class="w-full max-w-sm bg-gray-950 border border-gray-800 rounded-2xl shadow-xl p-4">
        <h3 class="text-lg mb-2">Confirmar</h3>
        <p class="text-sm text-gray-300">¿Eliminar el servicio <span class="font-semibold">{{ confirm.target?.nombre }}</span>?</p>
        <div class="mt-4 flex items-center justify-end gap-2">
          <button @click="confirm.open=false" class="px-4 py-2 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700">Cancelar</button>
          <button @click="remove()" class="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700">Eliminar</button>
        </div>
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
import { h, ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { Icon } from '@iconify/vue'
import TableBasic from '@/components/TableBasic.vue'
import { createColumnHelper } from '@tanstack/vue-table'
import api from '@/api/services'
import { useWorkspaceStore } from '@/stores/workspace'
import IconPicker from '@/components/IconPicker.vue'

const ws = useWorkspaceStore()
const empresaId = computed(() => ws.empresaId)

const loading = ref(true)
const rows = ref([])
const q = ref('')
const filteredRows = computed(() => {
  const term = q.value.trim().toLowerCase()
  if (!term) return rows.value
  return rows.value.filter(r =>
    (r.nombre || '').toLowerCase().includes(term) ||
    (r.descripcion || '').toLowerCase().includes(term) ||
    (r.icono || '').toLowerCase().includes(term)
  )
})

const showModal = ref(false)
const openIconPicker = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const errors = ref({})
const form = ref({ id:null, nombre:'', descripcion:'', icono:'' })

const confirm = ref({ open:false, target:null })
const toast = ref({ show:false, message:'' })
function showToast (msg) { toast.value = { show:true, message: msg }; setTimeout(() => (toast.value.show = false), 2000) }

const openMenuId = ref(null)
function toggleMenu (id) { openMenuId.value = openMenuId.value === id ? null : id }
function closeMenu () { openMenuId.value = null }
function onDocClick (e) { const inside = e.target.closest?.('[data-menu-root]'); if (!inside) closeMenu() }
function onEsc (e) { if (e.key === 'Escape') closeMenu() }

onMounted(async () => {
  await fetchAllClientSide()
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onEsc)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onEsc)
})

async function fetchAllClientSide () {
  loading.value = true
  try {
    const pageSize = 200
    let page = 1
    const maxTotal = 2000
    const out = []
    while (out.length < maxTotal) {
      const { data } = await api.servicios.list({ page, page_size: pageSize, ordering: '-id' })
      const chunk = data?.results || data || []
      if (!chunk.length) break
      out.push(...chunk)
      const total = data?.count
      if (total && out.length >= total) break
      if (chunk.length < pageSize) break
      page += 1
    }
    rows.value = out.map(r => ({
      id: r.id,
      nombre: r.nombre ?? '',
      descripcion: r.descripcion ?? '',
      icono: r.icono ?? '', // <-- aquí guardas algo tipo "lucide:dumbbell"
      __raw: r
    }))
  } finally { loading.value = false }
}

function applyFilter(){ /* computed ya filtra */ }
function resetFilters(){ q.value = '' }

function openNew(){ isEditing.value=false; errors.value={}; form.value={ id:null, nombre:'', descripcion:'', icono:'' }; showModal.value=true }
function openEdit(s){ isEditing.value=true; errors.value={}; form.value={ id:s.id, nombre:s.nombre||'', descripcion:s.descripcion||'', icono:s.icono||'' }; showModal.value=true }
function closeModal(){ showModal.value=false }

function onSelectIconify(name){ form.value.icono = name; openIconPicker.value = false }

function validate(){
  const e = {}
  if(!form.value.nombre?.trim()) e.nombre = 'El nombre es obligatorio'
  if(!empresaId.value && !isEditing.value) e.empresa = 'No hay empresa activa. Selecciona una antes de crear.'
  errors.value = e
  return Object.keys(e).length === 0
}

async function save(){
  if(!validate()){ if(errors.value.empresa) showToast(errors.value.empresa); return }
  saving.value = true
  try{
    const payload = {
      nombre: form.value.nombre.trim(),
      descripcion: form.value.descripcion?.trim() || '',
      icono: form.value.icono?.trim() || ''  // ej: "lucide:dumbbell"
    }
    if(isEditing.value && form.value.id){
      await api.servicios.update(form.value.id, payload)
      showToast('Servicio actualizado')
    } else {
      await api.servicios.create({ ...payload, empresa: empresaId.value })
      showToast('Servicio creado')
    }
    showModal.value = false
    await fetchAllClientSide()
  } catch(e){
    const msg = e?.response?.data?.detail || e?.response?.data?.nombre?.[0] || e?.response?.data?.empresa?.[0] || 'Error al guardar'
    showToast(msg)
  } finally { saving.value = false }
}

function confirmRemove(s){ confirm.value = { open:true, target:s } }
async function remove(){
  try{
    await api.servicios.delete(confirm.value.target.id)
    confirm.value = { open:false, target:null }
    await fetchAllClientSide()
    showToast('Servicio eliminado')
  } catch(e){
    showToast(e?.response?.data?.detail || 'No se pudo eliminar')
  }
}

/* --------- columnas TableBasic (igual patrón que Clientes) --------- */
import { RouterLink } from 'vue-router'
const col = createColumnHelper()

const columns = [
  col.accessor('nombre', { header: () => 'Nombre', enableSorting: true }),
  col.accessor('descripcion', {
    header: () => 'Descripción',
    cell: ({ getValue }) => getValue() || '—',
    enableSorting: true
  }),
  col.display({
    id: 'icono',
    header: () => 'Icono',
    cell: ({ row }) => {
      const n = row.original.icono
      return n
        ? h('div', { class: 'flex items-center gap-2' }, [
            h(Icon, { icon: n, class: 'w-5 h-5' }),
            h('span', n.replace(/^.*:/, '')) // solo el nombre después de la colección
          ])
        : h('span', '—')
    }
  }),
  col.display({
    id: 'acciones',
    header: () => h('div', { class: 'text-right' }, 'Acciones'),
    cell: ({ row }) => {
      const s = row.original
      return h(
        'div',
        { class: 'relative flex justify-end', 'data-menu-root': '' },
        [
          h('button', {
            class: 'px-2 py-1 rounded hover:bg-gray-800',
            onClick: (e) => { e.stopPropagation(); toggleMenu(s.id) },
            'aria-expanded': openMenuId.value === s.id,
            'aria-haspopup': 'menu'
          }, '⋯'),
          openMenuId.value === s.id
            ? h('div', {
                class: 'absolute right-0 mt-1 w-48 bg-gray-950 border border-gray-800 rounded-xl shadow-xl p-1 z-20',
                role: 'menu'
              }, [
                h('button', {
                  class: 'w-full text-left px-3 py-2 rounded-lg hover:bg-gray-900/70',
                  role: 'menuitem',
                  onClick: () => openEdit(s)
                }, 'Editar'),
                h('button', {
                  class: 'w-full text-left px-3 py-2 rounded-lg hover:bg-red-900/40',
                  role: 'menuitem',
                  onClick: () => confirmRemove(s)
                }, 'Eliminar'),
              ])
            : null
        ]
      )
    }
  })
]
</script>


