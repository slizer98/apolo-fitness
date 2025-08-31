<template>
  <div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="w-full max-w-3xl bg-gray-950 border border-gray-800 rounded-2xl shadow-xl">
      <div class="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
        <h3 class="text-lg">Nuevo cliente</h3>
        <button @click="emit('close')" class="text-gray-400 hover:text-white">✕</button>
      </div>

      <form @submit.prevent="save" class="p-4 space-y-4">
        <div class="grid sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs text-gray-400 mb-1">Nombre *</label>
            <input v-model.trim="form.nombre" required class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">Apellidos *</label>
            <input v-model.trim="form.apellidos" required class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
          </div>
        </div>

        <div class="grid sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs text-gray-400 mb-1">Correo</label>
            <input
              v-model.trim="form.email"
              type="email"
              placeholder="correo@dominio.com"
              class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
            />
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">Fecha de nacimiento</label>
            <input
              v-model="form.fecha_nacimiento"
              type="date"
              class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
            />
          </div>
        </div>

        <div class="grid sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs text-gray-400 mb-1">Género</label>
            <select v-model="form.genero" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2">
              <option value="">—</option>
              <option value="femenino">Femenino</option>
              <option value="masculino">Masculino</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">Contacto de emergencia</label>
            <input
              v-model="form.contacto_emergencia"
              @input="maskPhone"
              placeholder="(###) ###-####"
              class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs text-gray-400 mb-1">Observaciones</label>
          <textarea v-model.trim="form.observaciones" rows="3" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"></textarea>
        </div>

        <div class="grid sm:grid-cols-3 gap-3">
          <label class="inline-flex items-center gap-2">
            <input type="checkbox" v-model="form.factura" class="h-4 w-4 rounded border-gray-700 bg-gray-900" />
            <span class="text-sm">Requiere factura</span>
          </label>
          <label class="inline-flex items-center gap-2">
            <input type="checkbox" v-model="form.recordar_vencimiento" class="h-4 w-4 rounded border-gray-700 bg-gray-900" />
            <span class="text-sm">Recordar vencimiento</span>
          </label>
          <label class="inline-flex items-center gap-2">
            <input type="checkbox" v-model="form.recibir_promociones" class="h-4 w-4 rounded border-gray-700 bg-gray-900" />
            <span class="text-sm">Recibir promociones</span>
          </label>
        </div>

        <div class="flex items-center justify-end gap-2 pt-1">
          <button type="button" @click="emit('close')" class="px-4 py-2 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700">
            Cancelar
          </button>
          <button type="submit" :disabled="saving" class="px-4 py-2 rounded bg-apolo-primary text-black hover:bg-apolo-secondary disabled:opacity-60">
            {{ saving ? 'Guardando…' : 'Guardar' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Segundo paso (opcional) -->
    <DatosFiscalesModal
      v-if="showFiscales"
      :cliente-id="createdId"
      :cliente-nombre="form.nombre + ' ' + form.apellidos"
      @close="closeFiscales"
      @saved="afterAll"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '@/api/services'
import DatosFiscalesModal from '@/views/clientes/modals/DatosFiscalesModal.vue'

const emit = defineEmits(['close', 'saved'])

const saving = ref(false)
const showFiscales = ref(false)
const createdId = ref(null)

const form = ref({
  nombre: '',
  apellidos: '',
  fecha_nacimiento: '',
  contacto_emergencia: '',
  email: '',
  factura: false,
  observaciones: '',
  recordar_vencimiento: false,
  recibo_pago: false,
  recibir_promociones: true,
  genero: '',
})

function maskPhone (e) {
  let v = e.target.value.replace(/\D/g, '').slice(0, 10)
  if (v.length >= 7) e.target.value = `(${v.slice(0,3)}) ${v.slice(3,6)}-${v.slice(6)}`
  else if (v.length >= 4) e.target.value = `(${v.slice(0,3)}) ${v.slice(3)}`
  else if (v.length >= 1) e.target.value = `(${v}`
  form.value.contacto_emergencia = e.target.value
}

async function save () {
  if (!form.value.nombre || !form.value.apellidos) return
  saving.value = true
  try {
    const payload = { ...form.value }
    const { data } = await api.clientes.create(payload)
    createdId.value = data?.id
    if (form.value.factura && createdId.value) {
      // paso 2: fiscales
      showFiscales.value = true
    } else {
      // cerrar y notificar
      emit('saved')
      emit('close')
    }
  } catch (e) {
    console.error(e?.response?.data || e)
  } finally {
    saving.value = false
  }
}

function closeFiscales () {
  showFiscales.value = false
  emit('saved')
  emit('close')
}

function afterAll () {
  showFiscales.value = false
  emit('saved')
  emit('close')
}
</script>
