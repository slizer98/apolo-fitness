<template>
  <div class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="w-full max-w-3xl bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="px-5 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
        <h3 class="text-lg font-semibold">Nuevo cliente</h3>
        <button @click="emit('close')" class="text-gray-500 hover:text-gray-700" aria-label="Cerrar">✕</button>
      </div>

      <!-- Body con scroll -->
      <div class="overflow-auto">
        <form @submit.prevent="save" class="p-5 space-y-5">
          <!-- Foto / Avatar -->
          <section class="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div class="flex items-start gap-4">
              <!-- Preview -->
              <div class="relative">
                <div class="h-20 w-20 rounded-full bg-white border border-gray-200 overflow-hidden grid place-items-center">
                  <template v-if="avatarPreview">
                    <img :src="avatarPreview" class="h-full w-full object-cover" alt="avatar" />
                  </template>
                  <template v-else>
                    <i class="fa-regular fa-user text-xl text-gray-400"></i>
                  </template>
                </div>

                <!-- Botón cámara sobre el avatar -->
                <button
                  type="button"
                  class="absolute -bottom-2 -right-2 w-8 h-8 rounded-full grid place-items-center bg-[#1a5eff] text-white shadow hover:opacity-90 z-[1]"
                  title="Tomar foto"
                  @click="cameraOpen = true"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l2-3h8l2 3h3a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                </button>
              </div>

              <!-- Acciones -->
              <div class="flex-1">
                <div class="flex flex-wrap gap-2">
                  <button type="button" class="btn" @click="cameraOpen = true">Tomar foto</button>

                  <label class="btn">
                    Subir imagen
                    <input type="file" accept="image/*" class="hidden" @change="onPickFile" />
                  </label>

                  <button v-if="avatarPreview" type="button" class="btn-light" @click="clearAvatar">Quitar</button>
                </div>
                <p class="text-xs text-gray-500 mt-2">La foto se guardará automáticamente con el cliente.</p>
              </div>
            </div>
          </section>

          <!-- Datos -->
          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs text-gray-600 mb-1">Nombre *</label>
              <input v-model.trim="form.nombre" required class="w-full bg-white border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-100" />
            </div>
            <div>
              <label class="block text-xs text-gray-600 mb-1">Apellidos *</label>
              <input v-model.trim="form.apellidos" required class="w-full bg-white border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-100" />
            </div>
          </div>

          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs text-gray-600 mb-1">Correo</label>
              <input
                v-model.trim="form.email"
                type="email"
                placeholder="correo@dominio.com"
                class="w-full bg-white border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-100"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-600 mb-1">Fecha de nacimiento</label>
              <input
                v-model="form.fecha_nacimiento"
                type="date"
                class="w-full bg-white border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-100"
              />
            </div>
          </div>

          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs text-gray-600 mb-1">Género</label>
              <select v-model="form.genero" class="w-full bg-white border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-100">
                <option value="">—</option>
                <option value="femenino">Femenino</option>
                <option value="masculino">Masculino</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div>
              <label class="block text-xs text-gray-600 mb-1">Contacto de emergencia</label>
              <input
                v-model="form.contacto_emergencia"
                @input="maskPhone"
                placeholder="(###) ###-####"
                class="w-full bg-white border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-100"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs text-gray-600 mb-1">Observaciones</label>
            <textarea v-model.trim="form.observaciones" rows="3" class="w-full bg-white border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-100"></textarea>
          </div>

          <div class="grid sm:grid-cols-3 gap-4">
            <label class="inline-flex items-center gap-2 text-sm text-gray-800">
              <input type="checkbox" v-model="form.factura" class="h-4 w-4 rounded border-gray-300" />
              <span>Requiere factura</span>
            </label>
            <label class="inline-flex items-center gap-2 text-sm text-gray-800">
              <input type="checkbox" v-model="form.recordar_vencimiento" class="h-4 w-4 rounded border-gray-300" />
              <span>Recordar vencimiento</span>
            </label>
            <label class="inline-flex items-center gap-2 text-sm text-gray-800">
              <input type="checkbox" v-model="form.recibir_promociones" class="h-4 w-4 rounded border-gray-300" />
              <span>Recibir promociones</span>
            </label>
          </div>

          <!-- Botonera -->
          <div class="flex items-center justify-end gap-2 pt-1">
            <button type="button" @click="emit('close')" class="px-4 py-2 rounded border border-gray-300 bg-white hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" :disabled="saving" class="px-4 py-2 rounded bg-[#1a5eff] text-white hover:opacity-90 disabled:opacity-60">
              {{ saving ? 'Guardando…' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Paso fiscal (opcional) -->
      <DatosFiscalesModal
        v-if="showFiscales"
        :cliente-id="createdId"
        :cliente-nombre="form.nombre + ' ' + form.apellidos"
        @close="closeFiscales"
        @saved="afterAll"
      />
    </div>

    <!-- Camera en MODO MEMORIA -->
    <CameraModal
      v-model:open="cameraOpen"
      :upload-direct="false"
      @captured="onCaptured"   
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '@/api/services'
import DatosFiscalesModal from '@/views/clientes/modals/DatosFiscalesModal.vue'
import CameraModal from '@/components/CameraModal.vue'

const emit = defineEmits(['close', 'saved'])

const saving = ref(false)
const showFiscales = ref(false)
const createdId = ref(null)

/** Avatar local */
const avatarFile = ref(null)
const avatarPreview = ref('')

/** Cámara (modo memoria) */
const cameraOpen = ref(false)
function onCaptured ({ file, dataUrl }) {
  avatarFile.value = file
  avatarPreview.value = dataUrl
}

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

function onPickFile (e) {
  const file = e.target.files?.[0]
  if (!file) return
  avatarFile.value = file
  const reader = new FileReader()
  reader.onload = () => { avatarPreview.value = reader.result }
  reader.readAsDataURL(file)
}

function clearAvatar () {
  avatarFile.value = null
  avatarPreview.value = ''
}

async function save () {
  if (!form.value.nombre || !form.value.apellidos) return
  saving.value = true
  try {
    // 1) Crear cliente
    const payload = { ...form.value }
    const { data } = await api.clientes.create(payload)
    createdId.value = data?.id

    // 2) Subir avatar si hay (segunda petición)
    if (createdId.value && avatarFile.value) {
      await api.clientes.setAvatar(createdId.value, avatarFile.value)
    }

    // 3) Flujo fiscales (opcional)
    if (form.value.factura && createdId.value) {
      showFiscales.value = true
    } else {
      emit('saved')
      emit('close')
    }
  } catch (e) {
    console.error(e?.response?.data || e)
  } finally {
    saving.value = false
  }
}

function closeFiscales () { showFiscales.value = false; emit('saved'); emit('close') }
function afterAll ()      { showFiscales.value = false; emit('saved'); emit('close') }
</script>

<style scoped>
.btn{ @apply px-3 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-sm; }
.btn-light{ @apply px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm; }
</style>
