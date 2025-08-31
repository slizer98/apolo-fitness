<template>
  <div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="w-full max-w-xl bg-gray-950 border border-gray-800 rounded-2xl shadow-xl">
      <div class="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
        <h3 class="text-lg">Datos fiscales — <span class="text-apolo-primary">{{ clienteNombre }}</span></h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-white">✕</button>
      </div>

      <form @submit.prevent="save" class="p-4 space-y-4">
        <div class="grid sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs text-gray-400 mb-1">RFC *</label>
            <input
              v-model.trim="form.rfc"
              required
              @input="upper"
              pattern="[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}"
              title="RFC válido (13 caracteres para persona moral, 13 para física con homoclave)"
              class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
            />
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">Razón social</label>
            <input v-model.trim="form.razon_social" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
          </div>
        </div>

        <div class="grid sm:grid-cols-3 gap-3">
          <div>
            <label class="block text-xs text-gray-400 mb-1">Persona</label>
            <select v-model="form.persona" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2">
              <option value="">—</option>
              <option value="fisica">Persona Física</option>
              <option value="moral">Persona Moral</option>
            </select>
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">Código Postal</label>
            <input
              v-model="form.codigo_postal"
              inputmode="numeric"
              pattern="[0-9]{5}"
              maxlength="5"
              class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
              placeholder="00000"
            />
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">Régimen fiscal</label>
            <input v-model.trim="form.regimen_fiscal" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-1">
          <button type="button" @click="$emit('close')" class="px-4 py-2 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700">Cancelar</button>
          <button type="submit" :disabled="saving" class="px-4 py-2 rounded bg-apolo-primary text-black hover:bg-apolo-secondary disabled:opacity-60">
            {{ saving ? 'Guardando…' : 'Guardar' }}
          </button>
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
defineEmits(['close', 'saved'])

const saving = ref(false)
const form = ref({
  rfc: '',
  razon_social: '',
  persona: '',
  codigo_postal: '',
  regimen_fiscal: '',
})

function upper (e) { form.value.rfc = (e.target.value || '').toUpperCase() }

onMounted(load)
async function load () {
  try {
    const { data } = await api.clientes.datosFiscales.getByCliente(props.clienteId)
    // si no existe, el endpoint devolverá 404 => catch y mantenemos limpio
    if (data?.id) {
      form.value = {
        rfc: data.rfc || '',
        razon_social: data.razon_social || '',
        persona: data.persona || '',
        codigo_postal: data.codigo_postal || '',
        regimen_fiscal: data.regimen_fiscal || '',
      }
    }
  } catch { /* no fiscal yet */ }
}

async function save () {
  saving.value = true
  try {
    // intentar upsert: si ya existe, PATCH; si no, CREATE
    try {
      const existing = await api.clientes.datosFiscales.getByCliente(props.clienteId)
      await api.clientes.datosFiscales.create({ // tu API es create-only por cliente? en ese caso borra el try
        cliente: props.clienteId,
        ...form.value
      })
    } catch {
      await api.clientes.datosFiscales.create({
        cliente: props.clienteId,
        ...form.value
      })
    }
    emit('saved')
    emit('close')
  } catch (e) {
    console.error(e?.response?.data || e)
  } finally {
    saving.value = false
  }
}
</script>
