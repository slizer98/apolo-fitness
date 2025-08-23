<template>
  <div class="space-y-4">
    <div class="rounded-2xl bg-gray-900/70 border border-gray-800 p-4">
      <h3 class="text-lg font-medium mb-2">Información del plan</h3>

      <form @submit.prevent="save" class="grid md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs text-gray-400 mb-1">Nombre *</label>
          <input v-model="form.nombre" class="w-full bg-gray-950 border border-gray-800 rounded px-3 py-2" />
          <p v-if="errors.nombre" class="text-red-400 text-xs mt-1">{{ errors.nombre }}</p>
        </div>

        <div>
          <label class="block text-xs text-gray-400 mb-1">Tipo de plan</label>
          <input v-model="form.tipo_plan" placeholder="mensual / semanal / sesiones..." class="w-full bg-gray-950 border border-gray-800 rounded px-3 py-2" />
        </div>

        <div class="md:col-span-2">
          <label class="block text-xs text-gray-400 mb-1">Descripción</label>
          <textarea v-model="form.descripcion" rows="3" class="w-full bg-gray-950 border border-gray-800 rounded px-3 py-2"></textarea>
        </div>

        <div>
          <label class="block text-xs text-gray-400 mb-1">Vigente desde</label>
          <input v-model="form.desde" type="date" class="w-full bg-gray-950 border border-gray-800 rounded px-3 py-2" />
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-1">Vigente hasta</label>
          <input v-model="form.hasta" type="date" class="w-full bg-gray-950 border border-gray-800 rounded px-3 py-2" />
        </div>

        <div class="flex items-center gap-3">
          <label class="inline-flex items-center gap-2">
            <input type="checkbox" v-model="form.acceso_multisucursal" class="h-4 w-4 rounded border-gray-700 bg-gray-900" />
            <span class="text-sm">Acceso multisucursal</span>
          </label>
          <label class="inline-flex items-center gap-2">
            <input type="checkbox" v-model="form.preventa" class="h-4 w-4 rounded border-gray-700 bg-gray-900" />
            <span class="text-sm">Preventa</span>
          </label>
        </div>

        <div>
          <label class="block text-xs text-gray-400 mb-1">Visitas gratis</label>
          <input v-model.number="form.visitas_gratis" type="number" min="0" class="w-full bg-gray-950 border border-gray-800 rounded px-3 py-2" />
        </div>

        <div class="md:col-span-2 flex items-center justify-end gap-2 pt-2">
          <span v-if="msg" class="text-xs px-2 py-1 rounded bg-gray-800 border border-gray-700 text-gray-200">{{ msg }}</span>
          <button type="submit" :disabled="saving" class="px-4 py-2 rounded bg-apolo-primary text-black hover:bg-apolo-secondary disabled:opacity-60">
            {{ saving ? 'Guardando…' : 'Guardar cambios' }}
          </button>
        </div>
      </form>
    </div>

    <div class="rounded-2xl bg-gray-900/70 border border-gray-800 p-4">
      <h3 class="text-lg font-medium mb-2">Metadatos</h3>
      <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm">
        <div><span class="text-gray-400">ID:</span> {{ plan.id }}</div>
        <div><span class="text-gray-400">Empresa:</span> {{ plan.empresa_nombre || plan.empresa }}</div>
        <div><span class="text-gray-400">Usuario responsable:</span> {{ plan.usuario_nombre || '—' }}</div>
        <div><span class="text-gray-400">Creado:</span> {{ formatDateTime(plan.created_at) }}</div>
        <div><span class="text-gray-400">Actualizado:</span> {{ formatDateTime(plan.updated_at) }}</div>
        <div><span class="text-gray-400">Activo:</span> <span :class="plan.is_active ? 'text-emerald-400' : 'text-red-400'">{{ plan.is_active ? 'Sí' : 'No' }}</span></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch, ref } from 'vue'
import api from '@/api/services'

const props = defineProps({ planId: Number, plan: Object })
const emit = defineEmits(['refresh'])

const saving = ref(false)
const msg = ref('')
const errors = ref({})
const form = reactive({
  nombre: '',
  descripcion: '',
  tipo_plan: '',
  acceso_multisucursal: false,
  preventa: false,
  desde: '',
  hasta: '',
  visitas_gratis: 0,
})

watch(() => props.plan, (p) => {
  if (!p) return
  form.nombre = p.nombre || ''
  form.descripcion = p.descripcion || ''
  form.tipo_plan = p.tipo_plan || ''
  form.acceso_multisucursal = !!p.acceso_multisucursal
  form.preventa = !!p.preventa
  form.desde = p.desde || ''
  form.hasta = p.hasta || ''
  form.visitas_gratis = p.visitas_gratis ?? 0
}, { immediate: true })

function validate() {
  const e = {}
  if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio'
  errors.value = e
  return Object.keys(e).length === 0
}

async function save() {
  if (!validate()) return
  saving.value = true
  msg.value = ''
  try {
    const payload = { ...form }
    await api.planes.update(props.planId, payload)
    msg.value = 'Cambios guardados'
    emit('refresh')
  } catch (e) {
    msg.value = e?.response?.data?.detail || 'No se pudo guardar'
  } finally {
    saving.value = false
    setTimeout(() => (msg.value = ''), 2500)
  }
}

function formatDateTime(d) {
  if (!d) return '—'
  try { return new Date(d).toLocaleString('es-MX') } catch { return d }
}
</script>
