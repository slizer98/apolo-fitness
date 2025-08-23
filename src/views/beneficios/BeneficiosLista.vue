<template>
  <div class="p-4 text-white">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-light">Beneficios</h1>
      <button @click="openNew" class="bg-apolo-primary text-black px-4 py-2 rounded hover:bg-apolo-secondary transition">
        + Nuevo
      </button>
    </div>

    <!-- Filtros -->
    <div class="mb-4 flex flex-wrap gap-2">
      <input v-model="q" @keyup.enter="fetch" placeholder="Buscar beneficio…"
             class="bg-gray-900 border border-gray-700 rounded px-3 py-2 w-64" />
      <button @click="fetch" class="bg-gray-800 border border-gray-700 px-4 py-2 rounded hover:bg-gray-700">
        Buscar
      </button>
      <button @click="resetFilters" class="bg-gray-800 border border-gray-700 px-4 py-2 rounded hover:bg-gray-700">
        Limpiar
      </button>
    </div>

    <!-- Tabla -->
    <div v-if="loading" class="space-y-2">
      <div class="animate-pulse h-8 bg-gray-800/60 rounded" v-for="i in 6" :key="i"></div>
    </div>
    <table v-else class="w-full text-sm">
      <thead class="text-gray-400">
        <tr>
          <th class="text-left pb-2">Nombre</th>
          <th class="text-left pb-2">Descripción</th>
          <th class="text-left pb-2">Tipo</th>
          <th class="text-left pb-2">Valor</th>
          <th class="text-left pb-2">Unidad</th>
          <th class="text-right pb-2">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="b in rows" :key="b.id" class="border-t border-gray-800/80 hover:bg-gray-900/40">
          <td class="py-2">{{ b.nombre }}</td>
          <td class="py-2 text-gray-300">{{ b.descripcion || '—' }}</td>
          <td class="py-2 text-gray-300 capitalize">{{ b.tipo_descuento || '—' }}</td>
          <td class="py-2 text-gray-300">{{ b.valor ?? '—' }}</td>
          <td class="py-2 text-gray-300">{{ b.unidad ?? '—' }}</td>
          <td class="py-2">
            <div class="flex items-center justify-end gap-2">
              <button @click="openEdit(b)" class="px-2 py-1 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700">Editar</button>
              <button @click="confirmRemove(b)" class="px-2 py-1 rounded border border-red-800 bg-red-900/40 hover:bg-red-800">Eliminar</button>
            </div>
          </td>
        </tr>
        <tr v-if="!rows.length">
          <td colspan="6" class="py-6 text-center text-gray-400">Sin resultados</td>
        </tr>
      </tbody>
    </table>

    <!-- Paginación -->
    <div class="mt-4 flex items-center gap-2">
      <button :disabled="page<=1" @click="prev" class="px-3 py-1 rounded bg-gray-800/60 border border-gray-700 disabled:opacity-50">Anterior</button>
      <span class="text-gray-300">Página {{ page }}</span>
      <button :disabled="!hasMore" @click="next" class="px-3 py-1 rounded bg-gray-800/60 border border-gray-700 disabled:opacity-50">Siguiente</button>
      <span v-if="count!==null" class="text-gray-500 text-sm">({{ count }} resultados)</span>
    </div>

    <!-- Modal Crear/Editar -->
    <div v-if="showModal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="w-full max-w-xl bg-gray-950 border border-gray-800 rounded-2xl shadow-xl">
        <div class="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
          <h3 class="text-lg">{{ isEditing ? 'Editar beneficio' : 'Nuevo beneficio' }}</h3>
          <button @click="closeModal" class="text-gray-400 hover:text-white">✕</button>
        </div>

        <form @submit.prevent="save" class="p-4 space-y-4">
          <div class="grid sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-400 mb-1">Nombre *</label>
              <input v-model="form.nombre" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
              <p v-if="errors.nombre" class="text-red-400 text-xs mt-1">{{ errors.nombre }}</p>
            </div>
            <div>
              <label class="block text-xs text-gray-400 mb-1">Tipo de descuento</label>
              <select v-model="form.tipo_descuento" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2">
                <option value="">—</option>
                <option value="porcentaje">Porcentaje</option>
                <option value="monto">Monto</option>
              </select>
            </div>
          </div>

          <div class="grid sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-400 mb-1">Valor</label>
              <input type="number" step="0.01" v-model.number="form.valor" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
            </div>
            <div>
              <label class="block text-xs text-gray-400 mb-1">Unidad (opcional)</label>
              <input type="number" v-model.number="form.unidad" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
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

    <!-- Confirmación -->
    <div v-if="confirm.open" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="w-full max-w-sm bg-gray-950 border border-gray-800 rounded-2xl shadow-xl p-4">
        <h3 class="text-lg mb-2">Confirmar</h3>
        <p class="text-sm text-gray-300">¿Eliminar el beneficio <span class="font-semibold">{{ confirm.target?.nombre }}</span>?</p>
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
import { ref, onMounted, computed } from 'vue'
import api from '@/api/services'

const loading = ref(true)
const rows = ref([])
const page = ref(1)
const pageSize = 12
const count = ref(null)
const q = ref('')

const hasMore = computed(() => count.value === null ? rows.value.length === pageSize : count.value > page.value * pageSize)

const showModal = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const errors = ref({})
const form = ref({ id:null, nombre:'', descripcion:'', tipo_descuento:'', valor:null, unidad:null })

const confirm = ref({ open:false, target:null })
const toast = ref({ show:false, message:'' })
function showToast(msg){ toast.value={ show:true, message:msg }; setTimeout(()=>toast.value.show=false, 1800) }

onMounted(fetch)

async function fetch() {
  loading.value = true
  try {
    const { data } = await api.beneficios.list({ search: q.value, page: page.value, page_size: pageSize, ordering: '-id' })
    rows.value = data?.results || data || []
    count.value = data?.count ?? null
  } finally {
    loading.value = false
  }
}
function resetFilters(){ q.value=''; page.value=1; fetch() }
function next(){ if(hasMore.value){ page.value++; fetch() } }
function prev(){ if(page.value>1){ page.value--; fetch() } }

function openNew(){
  isEditing.value = false
  errors.value = {}
  form.value = { id:null, nombre:'', descripcion:'', tipo_descuento:'', valor:null, unidad:null }
  showModal.value = true
}
function openEdit(b){
  isEditing.value = true
  errors.value = {}
  form.value = {
    id: b.id,
    nombre: b.nombre || '',
    descripcion: b.descripcion || '',
    tipo_descuento: b.tipo_descuento || '',
    valor: b.valor ?? null,
    unidad: b.unidad ?? null
  }
  showModal.value = true
}
function closeModal(){ showModal.value = false }

function validate(){
  const e = {}
  if(!form.value.nombre?.trim()) e.nombre = 'El nombre es obligatorio'
  errors.value = e
  return Object.keys(e).length === 0
}

async function save(){
  if(!validate()) return
  saving.value = true
  try{
    const payload = {
      nombre: form.value.nombre.trim(),
      descripcion: form.value.descripcion?.trim() || '',
      tipo_descuento: form.value.tipo_descuento || '',
      valor: form.value.valor ?? null,
      unidad: form.value.unidad ?? null
    }
    if(isEditing.value && form.value.id){
      await api.beneficios.update(form.value.id, payload)
      showToast('Beneficio actualizado')
    } else {
      await api.beneficios.create(payload)
      showToast('Beneficio creado')
    }
    closeModal()
    await fetch()
  } catch(e){
    showToast(e?.response?.data?.detail || 'Error al guardar')
  } finally {
    saving.value = false
  }
}

function confirmRemove(b){ confirm.value = { open:true, target: b } }
async function remove(){
  try{
    await api.beneficios.delete(confirm.value.target.id)
    confirm.value = { open:false, target:null }
    if(rows.value.length === 1 && page.value > 1){ page.value -= 1 }
    await fetch()
    showToast('Beneficio eliminado')
  } catch(e){
    showToast(e?.response?.data?.detail || 'No se pudo eliminar')
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease }
.fade-enter-from, .fade-leave-to { opacity: 0 }
</style>
