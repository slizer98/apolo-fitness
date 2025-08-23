<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-medium">Precios</h2>
      <button @click="openNew" class="bg-apolo-primary text-black px-3 py-2 rounded hover:bg-apolo-secondary">
        + Agregar precio
      </button>
    </div>

    <div v-if="loading" class="space-y-2">
      <div class="animate-pulse h-8 bg-gray-800/60 rounded" v-for="i in 4" :key="i"></div>
    </div>

    <table v-else class="w-full text-sm">
      <thead class="text-gray-400">
        <tr>
          <th class="text-left pb-2">Esquema</th>
          <th class="text-left pb-2">Tipo</th>
          <th class="text-left pb-2">Precio</th>
          <th class="text-left pb-2"># Visitas</th>
          <th class="text-right pb-2">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in rows" :key="r.id" class="border-t border-gray-800/80 hover:bg-gray-900/40">
          <td class="py-2">{{ r.esquema }}</td>
          <td class="py-2">{{ r.tipo }}</td>
          <td class="py-2">${{ Number(r.precio).toFixed(2) }}</td>
          <td class="py-2">{{ r.numero_visitas }}</td>
          <td class="py-2 text-right">
            <button @click="remove(r)" class="px-2 py-1 rounded border border-red-800 bg-red-900/40 hover:bg-red-800">
              Eliminar
            </button>
          </td>
        </tr>
        <tr v-if="!rows.length">
          <td colspan="5" class="py-6 text-center text-gray-400">Sin precios</td>
        </tr>
      </tbody>
    </table>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="w-full max-w-md bg-gray-950 border border-gray-800 rounded-2xl shadow-xl">
        <div class="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
          <h3 class="text-lg">Nuevo precio</h3>
          <button @click="closeModal" class="text-gray-400 hover:text-white">✕</button>
        </div>

        <form @submit.prevent="save" class="p-4 space-y-3">
          <div class="grid sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-400 mb-1">Esquema *</label>
              <select v-model="form.esquema" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2">
                <option value="individual">Individual</option>
                <option value="grupal">Grupal</option>
                <option value="empresa">Empresa</option>
              </select>
              <p v-if="errors.esquema" class="text-red-400 text-xs mt-1">{{ errors.esquema }}</p>
            </div>
            <div>
              <label class="block text-xs text-gray-400 mb-1">Tipo *</label>
              <select v-model="form.tipo" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2">
                <option value="mensual">Mensual</option>
                <option value="semanal">Semanal</option>
                <option value="sesiones">Sesiones</option>
              </select>
              <p v-if="errors.tipo" class="text-red-400 text-xs mt-1">{{ errors.tipo }}</p>
            </div>
          </div>

          <div class="grid sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-400 mb-1">Precio *</label>
              <input v-model.number="form.precio" type="number" step="0.01" min="0"
                     class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
              <p v-if="errors.precio" class="text-red-400 text-xs mt-1">{{ errors.precio }}</p>
            </div>
            <div>
              <label class="block text-xs text-gray-400 mb-1"># visitas</label>
              <input v-model.number="form.numero_visitas" type="number" min="0"
                     class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
            </div>
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

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/services'
import { useUiStore } from '@/stores/ui'
const props = defineProps({ planId: { type: Number, required: true }, plan: Object })
const emit = defineEmits(['refresh'])

const ui = useUiStore()
const rows = ref([])
const loading = ref(true)
const showModal = ref(false)
const saving = ref(false)
const errors = ref({})
const form = ref({ esquema: 'individual', tipo: 'mensual', precio: 0, numero_visitas: 0 })

onMounted(load)

async function load() {
  loading.value = true
  try {
    const { data } = await api.planes.precios.list({ plan: props.planId, ordering: '-id', page_size: 100 })
    rows.value = data?.results || data || []
  } catch { rows.value = [] }
  finally { loading.value = false }
}

function openNew(){ errors.value = {}; form.value = { esquema:'individual', tipo:'mensual', precio:0, numero_visitas:0 }; showModal.value = true }
function closeModal(){ showModal.value = false }

function validate(){
  const e = {}
  if(!form.value.esquema) e.esquema = 'Requerido'
  if(!form.value.tipo) e.tipo = 'Requerido'
  if(form.value.precio == null || form.value.precio < 0) e.precio = 'Inválido'
  errors.value = e
  return Object.keys(e).length===0
}

async function save(){
  if(!validate()) return
  saving.value = true
  try{
    const payload = { plan: props.planId, esquema: form.value.esquema, tipo: form.value.tipo, precio: form.value.precio, numero_visitas: form.value.numero_visitas || 0 }
    await api.planes.precios.create(payload)
    ui.toast({ type:'success', title:'Precio agregado' })
    closeModal()
    await load()
    emit('refresh')
  } catch(e){
    ui.toast({ type:'error', title:'No se pudo agregar' })
  } finally { saving.value = false }
}

async function remove(row){
  if(!confirm('¿Eliminar precio?')) return
  try{
    await api.planes.precios.delete(row.id)
    ui.toast({ type:'success', title:'Eliminado' })
    await load()
    emit('refresh')
  } catch(e){
    ui.toast({ type:'error', title:'No se pudo eliminar' })
  }
}
</script>
