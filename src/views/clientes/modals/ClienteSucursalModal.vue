<template>
  <div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="w-full max-w-lg bg-gray-950 border border-gray-800 rounded-2xl shadow-xl">
      <div class="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
        <h3 class="text-lg">Asignar sucursal — <span class="text-apolo-primary">{{ clienteNombre }}</span></h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-white">✕</button>
      </div>

      <form @submit.prevent="save" class="p-4 space-y-4">
        <div class="grid sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs text-gray-400 mb-1">Sucursal *</label>
            <select v-model="form.sucursal" required class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2">
              <option disabled value="">Selecciona…</option>
              <option v-for="s in sucursales" :key="s.id" :value="s.id">{{ s.nombre }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">Empresa *</label>
            <select v-model="form.empresa" required class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2">
              <option disabled value="">Actual</option>
              <option :value="empresaId">{{ empresaNombre || `Empresa #${empresaId}` }}</option>
            </select>
          </div>
        </div>

        <div class="grid sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs text-gray-400 mb-1">Fecha inicio</label>
            <input v-model="form.fecha_inicio" type="date" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">Fecha fin</label>
            <input v-model="form.fecha_fin" type="date" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-1">
          <button type="button" @click="$emit('close')" class="px-4 py-2 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700">Cancelar</button>
          <button type="submit" :disabled="saving" class="px-4 py-2 rounded bg-apolo-primary text-black hover:bg-apolo-secondary disabled:opacity-60">
            {{ saving ? 'Guardando…' : 'Guardar' }}
          </button>
        </div>
      </form>

      <div class="px-4 pb-4">
        <h4 class="text-sm text-gray-300 mb-2 mt-2">Asignaciones existentes</h4>
        <div v-if="loading" class="space-y-2">
          <div class="animate-pulse h-6 bg-gray-800/60 rounded" v-for="i in 3" :key="i"></div>
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="r in rows"
            :key="r.id"
            class="flex items-center justify-between rounded border border-gray-800 bg-gray-900/60 px-3 py-2"
          >
            <div class="text-sm">
              {{ r.sucursal_nombre || ('Sucursal #' + r.sucursal) }} — 
              <span class="text-gray-300">{{ fmt(r.fecha_inicio) }} → {{ fmt(r.fecha_fin) }}</span>
            </div>
          </div>
          <div v-if="!rows.length" class="text-gray-500 text-sm">Sin asignaciones</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/api/services'
import { useWorkspaceStore } from '@/stores/workspace'

const props = defineProps({
  clienteId: { type: Number, required: true },
  clienteNombre: { type: String, default: '' }
})
const emit = defineEmits(['close', 'saved'])

const ws = useWorkspaceStore()

const empresaId = computed(() => ws.empresaId)
const empresaNombre = computed(() => ws.empresaNombre)

const sucursales = ref([])
const loading = ref(true)
const rows = ref([])
const saving = ref(false)

const form = ref({
  sucursal: '',
  empresa: '',
  fecha_inicio: '',
  fecha_fin: ''
})

onMounted(async () => {
  await loadSucursales()
  await loadRows()
  form.value.empresa = empresaId.value
})

async function loadSucursales () {
  try {
    const { data } = await api.sucursales.list({ empresa: empresaId.value, page_size: 200 })
    sucursales.value = data?.results || data || []
  } catch { sucursales.value = [] }
}

async function loadRows () {
  loading.value = true
  try {
    const { data } = await api.clientes.clienteSucursales.getByCliente(props.clienteId)
    rows.value = data?.results || data || []
  } catch { rows.value = [] }
  finally { loading.value = false }
}

function fmt (d) { if (!d) return '—'; try { return new Date(d).toLocaleDateString('es-MX') } catch { return d } }

async function save () {
  if (!form.value.sucursal || !form.value.empresa) return
  saving.value = true
  try {
    await api.clientes.clienteSucursales.create({
      cliente: props.clienteId,
      sucursal: form.value.sucursal,
      empresa: form.value.empresa,
      fecha_inicio: form.value.fecha_inicio || null,
      fecha_fin: form.value.fecha_fin || null
    })
    await loadRows()
    emit('saved')
    emit('close')
  } catch (e) {
    console.error(e?.response?.data || e)
  } finally {
    saving.value = false
  }
}
</script>
