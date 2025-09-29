<!-- src/views/convenios/ConveniosLista.vue -->
<template>
  <div class="p-4 text-white">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-light">Convenios</h1>
      <div class="flex items-center gap-2">
        <RouterLink :to="{ name: 'Dashboard' }"
          class="px-3 py-2 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700">
          ← Volver
        </RouterLink>
        <button @click="reload" :disabled="loading"
          class="px-4 py-2 rounded bg-apolo-primary text-black hover:bg-apolo-secondary disabled:opacity-60">
          {{ loading ? 'Cargando…' : 'Recargar' }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="grid gap-2 mb-4">
      <div class="animate-pulse h-8 bg-gray-800/60 rounded" v-for="i in 6" :key="i"></div>
    </div>

    <div class="space-y-6">
      <!-- Crear Convenio -->
      <section class="rounded-2xl bg-gray-900/60 border border-gray-800 p-4">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-lg font-medium">Crear convenio</h2>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <!-- (Opcional) Seleccionar cliente para ligarlo ya -->
          <div>
            <label class="block text-xs text-gray-400 mb-1">Cliente (opcional)</label>
            <select v-model="form.cliente" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2">
              <option :value="null">— Sin cliente —</option>
              <option v-for="c in clientesOpciones" :key="c.id" :value="c.id">
                {{ c.nombre }} {{ c.apellidos ? (' ' + c.apellidos) : '' }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-xs text-gray-400 mb-1">Empresa del convenio *</label>
            <input
              v-model.trim="form.empresa_convenio"
              @input="validateField('empresa_convenio')"
              class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
              placeholder="Ej. ACME, S.A. de C.V."
            />
            <p class="text-red-400 text-xs mt-1" v-if="errors.empresa_convenio">{{ errors.empresa_convenio }}</p>
          </div>

          <div>
            <label class="block text-xs text-gray-400 mb-1">Teléfono de oficina (10 dígitos)</label>
            <input
              v-model="form.telefono_oficina"
              @input="digitsOnly('telefono_oficina', 10)"
              @paste.prevent="onPasteDigits($event, 'telefono_oficina', 10)"
              inputmode="numeric"
              pattern="\\d*"
              maxlength="10"
              class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
              placeholder="5512345678"
            />
            <p class="text-gray-400 text-xs mt-1">Opcional. Si lo capturas, debe tener 10 dígitos.</p>
            <p class="text-red-400 text-xs mt-1" v-if="errors.telefono_oficina">{{ errors.telefono_oficina }}</p>
          </div>

          <div>
            <label class="block text-xs text-gray-400 mb-1">¿Cómo se enteró?</label>
            <input
              v-model.trim="form.medio_entero"
              @input="limitLen('medio_entero', 120)"
              class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
              placeholder="Recomendación, redes sociales, etc."
            />
            <div class="flex justify-between text-xs mt-1">
              <span class="text-red-400" v-if="errors.medio_entero">{{ errors.medio_entero }}</span>
              <span class="text-gray-400 ml-auto">{{ (form.medio_entero || '').length }}/120</span>
            </div>
          </div>

          <div>
            <label class="block text-xs text-gray-400 mb-1">Tipo de cliente</label>
            <input
              v-model.trim="form.tipo_cliente"
              @input="limitLen('tipo_cliente', 120)"
              class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
              placeholder="Ej. Estudiante, Corporativo…"
            />
            <div class="flex justify-between text-xs mt-1">
              <span class="text-red-400" v-if="errors.tipo_cliente">{{ errors.tipo_cliente }}</span>
              <span class="text-gray-400 ml-auto">{{ (form.tipo_cliente || '').length }}/120</span>
            </div>
          </div>
        </div>

        <div class="mt-3">
          <button
            @click="crear"
            :disabled="saving || !formIsValid"
            class="px-4 py-2 rounded bg-apolo-primary text-black hover:bg-apolo-secondary disabled:opacity-60">
            {{ saving ? 'Guardando…' : 'Crear convenio' }}
          </button>
        </div>
      </section>

      <!-- Listado -->
      <section class="rounded-2xl bg-gray-900/60 border border-gray-800 p-4">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-lg font-medium">Listado de convenios (empresa)</h2>
          <input v-model="q" placeholder="Buscar…" class="bg-gray-900 border border-gray-700 text-gray-200 rounded px-3 py-2 text-sm" />
        </div>

        <div class="overflow-x-auto border border-gray-800 rounded-xl">
          <table class="w-full text-sm">
            <thead class="bg-gray-900/60">
              <tr class="text-left">
                <th class="px-3 py-2 border-b border-gray-800">ID</th>
                <th class="px-3 py-2 border-b border-gray-800">Cliente</th>
                <th class="px-3 py-2 border-b border-gray-800">Empresa convenio</th>
                <th class="px-3 py-2 border-b border-gray-800">Teléfono</th>
                <th class="px-3 py-2 border-b border-gray-800">Medio</th>
                <th class="px-3 py-2 border-b border-gray-800">Tipo</th>
                <th class="px-3 py-2 border-b border-gray-800 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in filteredRows" :key="row.id" class="border-b border-gray-900/50">
                <td class="px-3 py-2">{{ row.id }}</td>
                <td class="px-3 py-2">{{ row.cliente_nombre || '—' }}</td>
                <td class="px-3 py-2">{{ row.empresa_convenio || '—' }}</td>
                <td class="px-3 py-2">{{ row.telefono_oficina || '—' }}</td>
                <td class="px-3 py-2">{{ row.medio_entero || '—' }}</td>
                <td class="px-3 py-2">{{ row.tipo_cliente || '—' }}</td>
                <td class="px-3 py-2">
                  <div class="flex items-center justify-end gap-2">
                    <button @click="eliminar(row)" class="px-3 py-1.5 rounded border border-red-800 bg-red-900/40 hover:bg-red-800">Eliminar</button>
                  </div>
                </td>
              </tr>
              <tr v-if="!rows.length && !loading">
                <td colspan="7" class="px-3 py-6 text-center text-gray-400">Sin convenios.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import api from '@/api/services'
import { useWorkspaceStore } from '@/stores/workspace'

const ws = useWorkspaceStore()

const loading = ref(true)
const saving = ref(false)
const rows = ref([])
const q = ref('')
const clientesOpciones = ref([])

const form = ref({
  cliente: null,
  empresa_convenio: '',
  telefono_oficina: '',
  medio_entero: '',
  tipo_cliente: '',
})

const errors = ref({})

const filteredRows = computed(() => {
  const term = q.value.trim().toLowerCase()
  if (!term) return rows.value
  return rows.value.filter(r =>
    String(r.empresa_convenio || '').toLowerCase().includes(term) ||
    String(r.medio_entero || '').toLowerCase().includes(term) ||
    String(r.tipo_cliente || '').toLowerCase().includes(term) ||
    String(r.cliente_nombre || '').toLowerCase().includes(term)
  )
})

const formIsValid = computed(() => {
  // Revalida rápido sin mensajes (solo para el disabled del botón)
  if (!form.value.empresa_convenio || form.value.empresa_convenio.trim().length < 2) return false
  const tel = form.value.telefono_oficina || ''
  if (tel && tel.length !== 10) return false
  return true
})

onMounted(loadAll)

async function loadAll() {
  loading.value = true
  try {
    await ws.ensureEmpresaSet()
    const { data } = await api.convenios.list({ ordering: '-id', page_size: 100 })
    rows.value = data?.results || data || []
    const { data: cli } = await api.clientes.list({ page_size: 200 })
    clientesOpciones.value = cli?.results || cli || []
  } catch (e) {
    console.error('No se pudo cargar convenios', e?.response?.data || e)
  } finally {
    loading.value = false
  }
}

function validateField(field) {
  const e = { ...errors.value }

  if (field === 'empresa_convenio') {
    if (!form.value.empresa_convenio?.trim()) e.empresa_convenio = 'Requerido'
    else if (form.value.empresa_convenio.trim().length < 2) e.empresa_convenio = 'Mínimo 2 caracteres'
    else delete e.empresa_convenio
  }

  if (field === 'telefono_oficina') {
    const tel = form.value.telefono_oficina || ''
    if (tel && tel.length !== 10) e.telefono_oficina = 'Debe tener 10 dígitos'
    else delete e.telefono_oficina
  }

  if (field === 'medio_entero') {
    if ((form.value.medio_entero || '').length > 120) e.medio_entero = 'Máximo 120 caracteres'
    else delete e.medio_entero
  }

  if (field === 'tipo_cliente') {
    if ((form.value.tipo_cliente || '').length > 120) e.tipo_cliente = 'Máximo 120 caracteres'
    else delete e.tipo_cliente
  }

  errors.value = e
}

function limitLen(field, max) {
  if (!form.value[field]) return
  if (form.value[field].length > max) {
    form.value[field] = form.value[field].slice(0, max)
  }
  validateField(field)
}

function digitsOnly(field, maxLen = 10) {
  const raw = form.value[field] || ''
  const only = raw.replace(/\D+/g, '')
  form.value[field] = only.slice(0, maxLen)
  validateField(field)
}

function onPasteDigits(evt, field, maxLen = 10) {
  const text = (evt.clipboardData?.getData('text') || '').replace(/\D+/g, '')
  form.value[field] = text.slice(0, maxLen)
  validateField(field)
}

function validateAll() {
  validateField('empresa_convenio')
  validateField('telefono_oficina')
  validateField('medio_entero')
  validateField('tipo_cliente')
  return Object.keys(errors.value).length === 0 && formIsValid.value
}

async function crear() {
  if (!validateAll()) return
  saving.value = true
  try {
    const payload = {
      cliente: form.value.cliente || null,
      empresa_convenio: form.value.empresa_convenio.trim(),
      telefono_oficina: form.value.telefono_oficina || '',
      medio_entero: form.value.medio_entero || '',
      tipo_cliente: form.value.tipo_cliente || '',
    }
    const { data } = await api.convenios.create(payload)
    rows.value.unshift(data)
    form.value = { cliente: null, empresa_convenio: '', telefono_oficina: '', medio_entero: '', tipo_cliente: '' }
    errors.value = {}
  } catch (e) {
    console.error('No se pudo crear convenio', e?.response?.data || e)
  } finally {
    saving.value = false
  }
}

async function eliminar(row) {
  if (!confirm('¿Eliminar este convenio?')) return
  try {
    await api.convenios.delete(row.id)
    rows.value = rows.value.filter(r => r.id !== row.id)
  } catch (e) {
    console.error('No se pudo eliminar', e?.response?.data || e)
  }
}

function reload() { loadAll() }
</script>

<style scoped>
/* mismos estilos base que ClienteEditar */
</style>
