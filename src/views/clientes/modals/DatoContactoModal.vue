<template>
  <div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="w-full max-w-lg bg-gray-950 border border-gray-800 rounded-2xl shadow-xl">
      <div class="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
        <h3 class="text-lg">Datos de contacto — <span class="text-apolo-primary">{{ clienteNombre }}</span></h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-white">✕</button>
      </div>

      <form @submit.prevent="save" class="p-4 space-y-4">
        <div class="grid sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs text-gray-400 mb-1">Tipo *</label>
            <select v-model="form.tipo" required class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2">
              <option disabled value="">Selecciona…</option>
              <option value="correo">Correo</option>
              <option value="telefono">Teléfono</option>
              <option value="celular">Celular</option>
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">Valor *</label>
            <input
              v-model.trim="form.valor"
              required
              :type="form.tipo==='correo' ? 'email' : 'text'"
              @input="maybeMaskPhone"
              class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
            />
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-1">
          <button type="button" @click="$emit('close')" class="px-4 py-2 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700">Cancelar</button>
          <button type="submit" :disabled="saving" class="px-4 py-2 rounded bg-apolo-primary text-black hover:bg-apolo-secondary disabled:opacity-60">
            {{ saving ? 'Guardando…' : 'Agregar' }}
          </button>
        </div>

        <hr class="border-gray-800 my-2">

        <!-- Listado existente -->
        <div>
          <h4 class="text-sm text-gray-300 mb-2">Contactos existentes</h4>
          <div v-if="loading" class="space-y-2">
            <div class="animate-pulse h-6 bg-gray-800/60 rounded" v-for="i in 3" :key="i"></div>
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="d in rows"
              :key="d.id"
              class="flex items-center justify-between rounded border border-gray-800 bg-gray-900/60 px-3 py-2"
            >
              <div class="text-sm">{{ d.tipo }} — <span class="text-gray-300">{{ d.valor }}</span></div>
              <button @click="remove(d)" class="text-red-400 hover:text-red-300 text-sm">Eliminar</button>
            </div>
            <div v-if="!rows.length" class="text-gray-500 text-sm">Sin datos de contacto</div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/services'

const props = defineProps({
  clienteId: { type: Number, required: true },
  clienteNombre: { type: String, default: '' }
})
const emit = defineEmits(['close', 'saved'])

const loading = ref(true)
const rows = ref([])
const saving = ref(false)

const form = ref({
  tipo: '',
  valor: ''
})

onMounted(load)
async function load () {
  loading.value = true
  try {
    const { data } = await api.clientes.datosContacto.getByCliente(props.clienteId)
    rows.value = data?.results || data || []
  } catch {
    rows.value = []
  } finally {
    loading.value = false
  }
}

function maybeMaskPhone (e) {
  if (['telefono', 'celular'].includes(form.value.tipo)) {
    let v = e.target.value.replace(/\D/g, '').slice(0, 10)
    if (v.length >= 7) e.target.value = `(${v.slice(0,3)}) ${v.slice(3,6)}-${v.slice(6)}`
    else if (v.length >= 4) e.target.value = `(${v.slice(0,3)}) ${v.slice(3)}`
    else if (v.length >= 1) e.target.value = `(${v}`
    form.value.valor = e.target.value
  }
}

async function save () {
  if (!form.value.tipo || !form.value.valor) return
  saving.value = true
  try {
    await api.clientes.datosContacto.create({ cliente: props.clienteId, ...form.value })
    form.value = { tipo: '', valor: '' }
    await load()
    emit('saved')
  } catch (e) {
    console.error(e?.response?.data || e)
  } finally {
    saving.value = false
  }
}

async function remove (row) {
  // si tienes delete por ID en tu endpoint secundario, úsalo.
  // Si no, omite y deja solo el create/list.
  try {
    await api.clientes.datosContacto.delete?.(row.id) // si no existe, no truena
    await load()
    emit('saved')
  } catch (e) {
    await load()
  }
}
</script>
