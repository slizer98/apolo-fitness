<template>
  <div class="fixed inset-0 z-50">
    <div class="absolute inset-0 bg-black/60" @click="close"></div>

    <div class="absolute inset-0 flex items-start justify-center p-4 overflow-y-auto">
      <div class="mt-12 w-full max-w-2xl rounded-2xl border border-gray-800 bg-gray-900/90 backdrop-blur p-4 text-white shadow-xl">
        <div class="flex items-start justify-between">
          <div>
            <h3 class="text-xl font-medium">Asignar membresía</h3>
            <p class="text-sm text-gray-300 mt-1">
              Cliente: <span class="font-medium">{{ clienteNombre }}</span>
            </p>
          </div>
          <button @click="close" class="px-3 py-1.5 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700">✕</button>
        </div>

        <div class="mt-4 grid sm:grid-cols-2 gap-3">
          <!-- Plan -->
          <div class="sm:col-span-2">
            <label class="block text-xs text-gray-400 mb-1">Plan *</label>
            <div class="flex gap-2">
              <select v-model="form.plan" class="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2">
                <option disabled value="">Selecciona un plan</option>
                <option v-for="p in planes" :key="p.id" :value="p.id">{{ p.nombre }}</option>
              </select>
              <input
                v-model.trim="q"
                @input="cargarPlanes"
                placeholder="Buscar plan…"
                class="w-48 bg-gray-900 border border-gray-700 rounded px-3 py-2"
              />
            </div>
            <p class="text-red-400 text-xs mt-1" v-if="errors.plan">{{ errors.plan }}</p>
          </div>

          <!-- Sucursal -->
          <div>
            <label class="block text-xs text-gray-400 mb-1">Sucursal *</label>
            <select v-model="form.sucursal" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2">
              <option disabled value="">Selecciona sucursal</option>
              <option v-for="s in sucursales" :key="s.id" :value="s.id">{{ s.nombre }}</option>
            </select>
            <p class="text-red-400 text-xs mt-1" v-if="errors.sucursal">{{ errors.sucursal }}</p>
          </div>

          <!-- Fecha inicio -->
          <div>
            <label class="block text-xs text-gray-400 mb-1">Fecha de inicio *</label>
            <input v-model="form.fecha_alta" type="date" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
            <p class="text-red-400 text-xs mt-1" v-if="errors.fecha_alta">{{ errors.fecha_alta }}</p>
          </div>

          <!-- Fecha vencimiento -->
          <div>
            <label class="block text-xs text-gray-400 mb-1">Fecha de vencimiento</label>
            <input v-model="form.fecha_vencimiento" type="date" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
            <p class="text-red-400 text-xs mt-1" v-if="errors.fecha_vencimiento">{{ errors.fecha_vencimiento }}</p>
          </div>

          <!-- Renovación -->
          <div class="sm:col-span-2 flex items-center gap-2 mt-1">
            <label class="inline-flex items-center gap-2 text-sm">
              <input v-model="form.renovacion" type="checkbox" class="h-4 w-4 rounded border-gray-700 bg-gray-900" />
              Renovar automáticamente
            </label>
          </div>
        </div>

        <div class="mt-4 flex items-center justify-end gap-2">
          <button @click="close" class="px-4 py-2 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700">Cancelar</button>
          <button
            @click="submit"
            :disabled="saving"
            class="px-4 py-2 rounded bg-apolo-primary text-black hover:bg-apolo-secondary disabled:opacity-60">
            {{ saving ? 'Guardando…' : 'Asignar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/api/services'
import { useWorkspaceStore } from '@/stores/workspace'

const props = defineProps({
  show: { type: Boolean, default: false },
  cliente: { type: Object, required: true },
})
const emit = defineEmits(['close', 'saved'])

const ws = useWorkspaceStore()
const empresaId = computed(() => ws.empresaId)

const planes = ref([])
const sucursales = ref([])
const q = ref('')
const saving = ref(false)
const errors = ref({})

const form = ref({
  empresa: null,        // requerido por el serializer
  sucursal: '',         // requerido
  cliente: null,        // fijo del cliente seleccionado
  plan: '',             // requerido
  fecha_alta: '',       // requerido
  fecha_vencimiento: '',// opcional
  renovacion: false,    // opcional
})

const clienteNombre = computed(() => {
  const c = props.cliente || {}
  return [c.nombre, c.apellidos].filter(Boolean).join(' ') || `#${c.id}`
})

onMounted(async () => {
  form.value.empresa = empresaId.value || null
  form.value.cliente = props.cliente?.id || null
  await Promise.all([cargarPlanes(), cargarSucursales()])
})

async function cargarPlanes(){
  const { data } = await api.planes.list({ page_size: 200, ordering: 'nombre', search: q.value || undefined })
  planes.value = data?.results || data || []
}
async function cargarSucursales(){
  const { data } = await api.sucursales.list({ page_size: 200, ordering: 'nombre' })
  sucursales.value = data?.results || data || []
}

function validate(){
  const e = {}
  if(!form.value.plan) e.plan = 'Selecciona un plan'
  if(!form.value.sucursal) e.sucursal = 'Selecciona una sucursal'
  if(!form.value.fecha_alta) e.fecha_alta = 'Requerida'
  if(form.value.fecha_vencimiento && form.value.fecha_alta){
    const a = new Date(form.value.fecha_alta)
    const b = new Date(form.value.fecha_vencimiento)
    if(b < a) e.fecha_vencimiento = 'No puede ser anterior a la fecha de inicio'
  }
  errors.value = e
  return Object.keys(e).length === 0
}

async function submit(){
  if(!validate()) return
  saving.value = true
  try{
    const payload = {
      empresa: form.value.empresa,
      sucursal: form.value.sucursal,
      cliente: form.value.cliente,
      plan: form.value.plan,
      fecha_alta: form.value.fecha_alta,
      fecha_vencimiento: form.value.fecha_vencimiento || null,
      renovacion: !!form.value.renovacion,
    }
    const { data } = await api.altasPlan.create(payload) // POST planes/altas/
    emit('saved', data)
    close()
  } catch(e){
    // Mapea errores del backend por campo (DRF)
    if(e?.response?.data) errors.value = { ...errors.value, ...e.response.data }
    console.error('No se pudo asignar la membresía', e?.response?.data || e)
  } finally {
    saving.value = false
  }
}

function close(){ emit('close') }
</script>
