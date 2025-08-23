<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-medium">Restricciones de horario</h2>
      <button @click="openNew" class="bg-apolo-primary text-black px-3 py-2 rounded hover:bg-apolo-secondary">
        + Agregar restricción
      </button>
    </div>

    <div v-if="loading" class="space-y-2">
      <div class="animate-pulse h-8 bg-gray-800/60 rounded" v-for="i in 4" :key="i"></div>
    </div>

    <table v-else class="w-full text-sm">
      <thead class="text-gray-400">
        <tr>
          <th class="text-left pb-2">Día</th>
          <th class="text-left pb-2">Inicio</th>
          <th class="text-left pb-2">Fin</th>
          <th class="text-right pb-2">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in rows" :key="r.id" class="border-t border-gray-800/80 hover:bg-gray-900/40">
          <td class="py-2">{{ r.dia }}</td>
          <td class="py-2">{{ r.hora_inicio || '—' }}</td>
          <td class="py-2">{{ r.hora_fin || '—' }}</td>
          <td class="py-2 text-right">
            <button @click="remove(r)" class="px-2 py-1 rounded border border-red-800 bg-red-900/40 hover:bg-red-800">
              Eliminar
            </button>
          </td>
        </tr>
        <tr v-if="!rows.length">
          <td colspan="4" class="py-6 text-center text-gray-400">Sin restricciones</td>
        </tr>
      </tbody>
    </table>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="w-full max-w-md bg-gray-950 border border-gray-800 rounded-2xl shadow-xl">
        <div class="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
          <h3 class="text-lg">Nueva restricción</h3>
          <button @click="closeModal" class="text-gray-400 hover:text-white">✕</button>
        </div>

        <form @submit.prevent="save" class="p-4 space-y-3">
          <div>
            <label class="block text-xs text-gray-400 mb-1">Día *</label>
            <input v-model="form.dia" placeholder="Lunes, Martes, … o 1..7" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
            <p v-if="errors.dia" class="text-red-400 text-xs mt-1">{{ errors.dia }}</p>
          </div>

          <div class="grid sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-400 mb-1">Hora inicio (HH:MM)</label>
              <input v-model="form.hora_inicio" placeholder="08:00" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
            </div>
            <div>
              <label class="block text-xs text-gray-400 mb-1">Hora fin (HH:MM)</label>
              <input v-model="form.hora_fin" placeholder="17:00" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
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
const form = ref({ dia: '', hora_inicio: '', hora_fin: '' })

onMounted(load)

async function load(){
  loading.value = true
  try{
    const { data } = await api.planesRestricciones.list({ plan: props.planId, ordering: '-id', page_size: 100 })
    rows.value = data?.results || data || []
  } catch { rows.value = [] }
  finally { loading.value = false }
}

function openNew(){ errors.value = {}; form.value = { dia:'', hora_inicio:'', hora_fin:'' }; showModal.value = true }
function closeModal(){ showModal.value = false }

function validate(){
  const e = {}
  if(!form.value.dia?.trim()) e.dia = 'Requerido'
  errors.value = e
  return Object.keys(e).length===0
}

async function save(){
  if(!validate()) return
  saving.value = true
  try{
    const payload = { plan: props.planId, dia: form.value.dia, hora_inicio: form.value.hora_inicio || null, hora_fin: form.value.hora_fin || null }
    await api.planesRestricciones.create(payload)
    ui.toast({ type:'success', title:'Restricción agregada' })
    closeModal()
    await load()
    emit('refresh')
  } catch(e){
    ui.toast({ type:'error', title:e?.response?.data?.detail || 'No se pudo guardar' })
  } finally { saving.value = false }
}

async function remove(row){
  if(!confirm('¿Eliminar restricción?')) return
  try{
    await api.planesRestricciones.delete(row.id)
    ui.toast({ type:'success', title:'Eliminada' })
    await load()
    emit('refresh')
  } catch(e){
    ui.toast({ type:'error', title:'No se pudo eliminar' })
  }
}
</script>
