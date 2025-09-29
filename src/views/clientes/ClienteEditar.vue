<template>
  <div class="p-4 text-white">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-light">Editar cliente</h1>
      <div class="flex items-center gap-2">
        <RouterLink :to="{ name: 'ClientesLista' }" class="px-3 py-2 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700">
          ← Volver
        </RouterLink>
        <button
          @click="saveBasics"
          :disabled="savingBasics"
          class="px-4 py-2 rounded bg-apolo-primary text-black hover:bg-apolo-secondary disabled:opacity-60">
          {{ savingBasics ? 'Guardando…' : 'Guardar básicos' }}
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="border-b border-gray-800/70 mb-4">
      <nav class="flex flex-wrap gap-2">
        <button
          v-for="t in TABS"
          :key="t.key"
          class="px-3 py-2 rounded-t-lg border border-b-0"
          :class="tab===t.key ? 'bg-gray-900 border-gray-700' : 'bg-transparent border-transparent hover:bg-gray-900/40'"
          @click="tab=t.key">
          <i :class="['fa', t.icon, 'mr-2']"></i>{{ t.label }}
        </button>
      </nav>
    </div>

    <!-- Contenido -->
    <div v-if="loadingAll" class="grid gap-2">
      <div class="animate-pulse h-8 bg-gray-800/60 rounded" v-for="i in 8" :key="i"></div>
    </div>

    <div v-else class="space-y-6">
      <!-- BASICOS -->
      <section v-show="tab==='basicos'" class="rounded-2xl bg-gray-900/60 border border-gray-800 p-4">
        <h2 class="text-lg font-medium mb-3">Datos básicos</h2>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <label class="block text-xs text-gray-400 mb-1">Nombre *</label>
            <input v-model="clienteForm.nombre" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
            <p class="text-red-400 text-xs" v-if="errorsBasics.nombre">{{ errorsBasics.nombre }}</p>
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">Apellidos *</label>
            <input v-model="clienteForm.apellidos" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
            <p class="text-red-400 text-xs" v-if="errorsBasics.apellidos">{{ errorsBasics.apellidos }}</p>
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">Correo</label>
            <input v-model="clienteForm.email" type="email" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">Fecha de nacimiento</label>
            <input v-model="clienteForm.fecha_nacimiento" type="date" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">Género</label>
            <input v-model="clienteForm.genero" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" placeholder="M/F/Otro" />
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">Contacto de emergencia</label>
            <input v-model="clienteForm.contacto_emergencia" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
          </div>

          <div class="sm:col-span-2">
            <label class="block text-xs text-gray-400 mb-1">Observaciones</label>
            <textarea v-model="clienteForm.observaciones" rows="3" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"></textarea>
          </div>

          <div class="flex items-center gap-3">
            <label class="inline-flex items-center gap-2 text-sm">
              <input v-model="clienteForm.factura" type="checkbox" class="h-4 w-4 rounded border-gray-700 bg-gray-900" />
              Requiere factura
            </label>
            <label class="inline-flex items-center gap-2 text-sm">
              <input v-model="clienteForm.recordar_vencimiento" type="checkbox" class="h-4 w-4 rounded border-gray-700 bg-gray-900" />
              Recordar vencimiento
            </label>
            <label class="inline-flex items-center gap-2 text-sm">
              <input v-model="clienteForm.recibo_pago" type="checkbox" class="h-4 w-4 rounded border-gray-700 bg-gray-900" />
              Enviar recibo
            </label>
            <label class="inline-flex items-center gap-2 text-sm">
              <input v-model="clienteForm.recibir_promociones" type="checkbox" class="h-4 w-4 rounded border-gray-700 bg-gray-900" />
              Promociones
            </label>
          </div>
        </div>
      </section>

      <!-- CONTACTO -->
      <section v-show="tab==='contacto'" class="rounded-2xl bg-gray-900/60 border border-gray-800 p-4">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-lg font-medium">Datos de contacto</h2>
          <button @click="addContacto" class="px-3 py-2 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700">
            + Agregar
          </button>
        </div>
        <div v-if="contactos.length" class="space-y-2">
          <div v-for="(row, i) in contactos" :key="row.id || i" class="grid sm:grid-cols-3 gap-2 items-center border border-gray-800 rounded-xl p-3">
            <select v-model="row.tipo" class="bg-gray-900 border border-gray-700 rounded px-3 py-2">
              <option value="correo">Correo</option>
              <option value="telefono">Teléfono</option>
              <option value="celular">Celular</option>
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
              <option value="otro">Otro</option>
            </select>
            <input v-model="row.valor" class="bg-gray-900 border border-gray-700 rounded px-3 py-2" placeholder="valor…" />
            <div class="flex items-center justify-end gap-2">
              <button @click="saveContacto(row)" class="px-3 py-1.5 rounded bg-apolo-primary text-black hover:bg-apolo-secondary">Guardar</button>
              <button @click="removeContacto(row)" class="px-3 py-1.5 rounded border border-red-800 bg-red-900/40 hover:bg-red-800">Eliminar</button>
            </div>
          </div>
        </div>
        <div v-else class="text-gray-400 text-sm">Sin datos de contacto.</div>
      </section>

      <!-- FISCALES -->
      <section v-show="tab==='fiscales'" class="rounded-2xl bg-gray-900/60 border border-gray-800 p-4">
        <h2 class="text-lg font-medium mb-3">Datos fiscales</h2>
        <div v-if="fiscales">
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label class="block text-xs text-gray-400 mb-1">RFC</label>
              <input v-model="fiscales.rfc" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-xs text-gray-400 mb-1">Razón social</label>
              <input v-model="fiscales.razon_social" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
            </div>
            <div>
              <label class="block text-xs text-gray-400 mb-1">Tipo de persona</label>
              <select v-model="fiscales.persona" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2">
                <option value="">—</option>
                <option value="fisica">Persona Física</option>
                <option value="moral">Persona Moral</option>
              </select>
            </div>
            <div>
              <label class="block text-xs text-gray-400 mb-1">Código postal</label>
              <input v-model="fiscales.codigo_postal" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
            </div>
            <div>
              <label class="block text-xs text-gray-400 mb-1">Régimen fiscal</label>
              <input v-model="fiscales.regimen_fiscal" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
            </div>
          </div>
          <div class="mt-3">
            <button @click="saveFiscales" class="px-4 py-2 rounded bg-apolo-primary text-black hover:bg-apolo-secondary">Guardar fiscales</button>
          </div>
        </div>
        <div v-else class="space-y-3">
          <p class="text-gray-400 text-sm">Sin datos fiscales.</p>
          <button @click="crearFiscales" class="px-3 py-2 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700">
            + Crear datos fiscales
          </button>
        </div>
      </section>

      <!-- CONVENIOS -->
      <section v-show="tab==='convenios'" class="rounded-2xl bg-gray-900/60 border border-gray-800 p-4">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-lg font-medium">Convenios de la empresa</h2>
          <div class="flex items-center gap-2">
            <input v-model="qConvenios" placeholder="Buscar…" class="bg-gray-900 border border-gray-700 text-gray-200 rounded px-3 py-2 text-sm" />
            <RouterLink :to="{ name: 'ConveniosLista' }"
              class="px-3 py-2 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700">
              + Crear convenio
            </RouterLink>
          </div>
        </div>

        <div class="overflow-x-auto border border-gray-800 rounded-xl">
          <table class="w-full text-sm">
            <thead class="bg-gray-900/60">
              <tr class="text-left">
                <th class="px-3 py-2 border-b border-gray-800">ID</th>
                <th class="px-3 py-2 border-b border-gray-800">Empresa convenio</th>
                <th class="px-3 py-2 border-b border-gray-800">Teléfono</th>
                <th class="px-3 py-2 border-b border-gray-800">Medio</th>
                <th class="px-3 py-2 border-b border-gray-800">Tipo</th>
                <th class="px-3 py-2 border-b border-gray-800">Vinculado a</th>
                <th class="px-3 py-2 border-b border-gray-800 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in conveniosFiltrados" :key="row.id" class="border-b border-gray-900/50">
                <td class="px-3 py-2">{{ row.id }}</td>
                <td class="px-3 py-2">{{ row.empresa_convenio || '—' }}</td>
                <td class="px-3 py-2">{{ row.telefono_oficina || '—' }}</td>
                <td class="px-3 py-2">{{ row.medio_entero || '—' }}</td>
                <td class="px-3 py-2">{{ row.tipo_cliente || '—' }}</td>
                <td class="px-3 py-2">
                  <span v-if="row.cliente === id">Este cliente</span>
                  <span v-else-if="row.cliente_nombre">{{ row.cliente_nombre }}</span>
                  <span v-else>—</span>
                </td>
                <td class="px-3 py-2">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      v-if="row.cliente === id"
                      @click="desenlazarConvenio(row)"
                      class="px-3 py-1.5 rounded border border-red-800 bg-red-900/40 hover:bg-red-800">
                      Quitar enlace
                    </button>
                    <button
                      v-else-if="!row.cliente"
                      @click="enlazarConvenio(row)"
                      class="px-3 py-1.5 rounded bg-apolo-primary text-black hover:bg-apolo-secondary">
                      Enlazar a este cliente
                    </button>
                    <button
                      v-else
                      @click="reasignarConvenio(row)"
                      class="px-3 py-1.5 rounded border border-yellow-700 bg-yellow-900/40 hover:bg-yellow-800">
                      Reasignar a este cliente
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="!conveniosEmpresa.length">
                <td colspan="7" class="px-3 py-6 text-center text-gray-400">Sin convenios en la empresa.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- DATOS ADICIONALES -->
      <section v-show="tab==='adicionales'" class="rounded-2xl bg-gray-900/60 border border-gray-800 p-4">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-lg font-medium">Datos adicionales</h2>
          <button @click="addAdicional" class="px-3 py-2 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700">
            + Agregar
          </button>
        </div>
        <div v-if="adicionales.length" class="space-y-2">
          <div v-for="(row, i) in adicionales" :key="row.id || i" class="grid sm:grid-cols-4 gap-2 items-center border border-gray-800 rounded-xl p-3">
            <select v-model="row.caracteristica" class="bg-gray-900 border border-gray-700 rounded px-3 py-2">
              <option disabled value="">Selecciona característica</option>
              <option v-for="car in caracteristicas" :key="car.id" :value="car.id">{{ car.nombre }}</option>
            </select>
            <input v-model="row.campo" class="bg-gray-900 border border-gray-700 rounded px-3 py-2" placeholder="Campo (opcional)" />
            <input v-model="row.valor" class="bg-gray-900 border border-gray-700 rounded px-3 py-2" placeholder="Valor" />
            <div class="flex items-center justify-end gap-2">
              <button @click="saveAdicional(row)" class="px-3 py-1.5 rounded bg-apolo-primary text-black hover:bg-apolo-secondary">Guardar</button>
              <button @click="removeAdicional(row)" class="px-3 py-1.5 rounded border border-red-800 bg-red-900/40 hover:bg-red-800">Eliminar</button>
            </div>
          </div>
        </div>
        <div v-else class="text-gray-400 text-sm">Sin datos adicionales.</div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import api from '@/api/services'
import { useWorkspaceStore } from '@/stores/workspace'

const route = useRoute()
const ws = useWorkspaceStore()

const id = computed(() => Number(route.params.id))

// Tabs (SIN sucursales)
const TABS = [
  { key: 'basicos',    label: 'Básicos',        icon: 'fa-user' },
  { key: 'contacto',   label: 'Contacto',       icon: 'fa-address-book' },
  { key: 'fiscales',   label: 'Fiscales',       icon: 'fa-file-invoice' },
  { key: 'convenios',  label: 'Convenios',      icon: 'fa-handshake' },
  { key: 'adicionales',label: 'Datos adicionales', icon: 'fa-list' },
]
const tab = ref('basicos')

// Loading
const loadingAll = ref(true)
const savingBasics = ref(false)

// Empresa del contexto
const empresaId = computed(() => ws.empresaId)

// === BASICOS ===
const clienteForm = ref({
  nombre: '', apellidos: '', email: '',
  fecha_nacimiento: '', genero: '',
  contacto_emergencia: '', observaciones: '',
  factura: false, recordar_vencimiento: false,
  recibo_pago: false, recibir_promociones: true,
})
const errorsBasics = ref({})

// === CONTACTO ===
const contactos = ref([])

// === FISCALES (OneToOne) ===
const fiscales = ref(null)

// === CONVENIOS (por empresa, para enlazar) ===
const conveniosEmpresa = ref([])
const qConvenios = ref('')

// === ADICIONALES ===
const adicionales = ref([])
const caracteristicas = ref([]) // catálogo para select

onMounted(loadAll)

async function loadAll() {
  loadingAll.value = true
  try {
    await ws.ensureEmpresaSet()

    // Cliente base
    const { data: c } = await api.clientes.retrieve(id.value)
    fillBasicsFrom(c)

    // Subrecursos
    const [
      { data: dc },
      { data: df },
      { data: da },
      { data: cars },
      { data: cvEmpresa },
    ] = await Promise.all([
      api.clientes.datosContacto.getByCliente(id.value),
      api.clientes.datosFiscales.getByCliente(id.value),
      api.clientes.datosAdicionales.getByCliente(id.value),
      api.clientes.caracteristicas.list({ empresa: empresaId.value, page_size: 200 }),
      api.convenios.list({ ordering: '-id', page_size: 200 }), // <- por empresa (header)
    ])

    const toArray = (resp) => resp?.results ?? resp ?? []

    contactos.value = toArray(dc)

    const dfList = toArray(df).filter(x => String(x.cliente) === String(id.value))
    fiscales.value = dfList.length ? dfList[0] : null

    adicionales.value = toArray(da)
    caracteristicas.value = toArray(cars)
    conveniosEmpresa.value = toArray(cvEmpresa) // todos los convenios de la empresa
  } catch (e) {
    console.error('No se pudo cargar cliente', e?.response?.data || e)
  } finally {
    loadingAll.value = false
  }
}

function fillBasicsFrom(c) {
  clienteForm.value = {
    nombre: c?.nombre || '',
    apellidos: c?.apellidos || '',
    email: c?.email || '',
    fecha_nacimiento: c?.fecha_nacimiento || '',
    genero: c?.genero || '',
    contacto_emergencia: c?.contacto_emergencia || '',
    observaciones: c?.observaciones || '',
    factura: !!c?.factura,
    recordar_vencimiento: !!c?.recordar_vencimiento,
    recibo_pago: !!c?.recibo_pago,
    recibir_promociones: c?.recibir_promociones !== false,
  }
}

function validateBasics() {
  const e = {}
  if (!clienteForm.value.nombre?.trim()) e.nombre = 'Requerido'
  if (!clienteForm.value.apellidos?.trim()) e.apellidos = 'Requerido'
  errorsBasics.value = e
  return !Object.keys(e).length
}

async function saveBasics() {
  if (!validateBasics()) return
  savingBasics.value = true
  try {
    const payload = { ...clienteForm.value }
    await api.clientes.update(id.value, payload)
  } catch (e) {
    console.error('Error guardando básicos', e?.response?.data || e)
  } finally {
    savingBasics.value = false
  }
}

// === CONTACTO ===
function addContacto() {
  contactos.value.push({ id: null, cliente: id.value, tipo: 'correo', valor: '' })
}

async function saveContacto(row) {
  const payload = { cliente: id.value, tipo: row.tipo, valor: row.valor }
  try {
    if (row.id) {
      await api.clientes.datosContacto.patch(row.id, payload)
    } else {
      const { data } = await api.clientes.datosContacto.create(payload)
      row.id = data?.id
    }
  } catch (e) {
    console.error('No se pudo guardar contacto', e?.response?.data || e)
  }
}

async function removeContacto(row) {
  if (!row.id) {
    contactos.value = contactos.value.filter(r => r !== row)
    return
  }
  try {
    await api.clientes.datosContacto.delete(row.id)
    contactos.value = contactos.value.filter(r => r.id !== row.id)
  } catch (e) {
    console.error('No se pudo eliminar contacto', e?.response?.data || e)
  }
}

// === FISCALES ===
async function crearFiscales() {
  try {
    const { data } = await api.clientes.datosFiscales.create({ cliente: id.value })
    fiscales.value = data
  } catch (e) {
    console.error('No se pudo crear fiscales', e?.response?.data || e)
  }
}
async function saveFiscales() {
  if (!fiscales.value) return
  const payload = {
    cliente: id.value,
    rfc: fiscales.value.rfc || '',
    razon_social: fiscales.value.razon_social || '',
    persona: fiscales.value.persona || '',
    codigo_postal: fiscales.value.codigo_postal || '',
    regimen_fiscal: fiscales.value.regimen_fiscal || '',
  }
  try {
    if (fiscales.value.id) {
      await api.clientes.datosFiscales.patch(fiscales.value.id, payload)
    } else {
      const { data } = await api.clientes.datosFiscales.create(payload)
      fiscales.value = data
    }
  } catch (e) {
    console.error('No se pudo guardar fiscales', e?.response?.data || e)
  }
}

// === CONVENIOS (enlazar / desenlazar / reasignar) ===
const conveniosFiltrados = computed(() => {
  const t = qConvenios.value.trim().toLowerCase()
  if (!t) return conveniosEmpresa.value
  return conveniosEmpresa.value.filter(r =>
    String(r.empresa_convenio || '').toLowerCase().includes(t) ||
    String(r.medio_entero || '').toLowerCase().includes(t) ||
    String(r.tipo_cliente || '').toLowerCase().includes(t) ||
    String(r.cliente_nombre || '').toLowerCase().includes(t)
  )
})

async function enlazarConvenio(row) {
  try {
    const { data } = await api.convenios.patch(row.id, { cliente: id.value })
    // actualiza fila
    Object.assign(row, data)
  } catch (e) {
    console.error('No se pudo enlazar', e?.response?.data || e)
  }
}

async function desenlazarConvenio(row) {
  if (!confirm('¿Quitar enlace de este convenio con el cliente?')) return
  try {
    const { data } = await api.convenios.patch(row.id, { cliente: null })
    Object.assign(row, data)
  } catch (e) {
    console.error('No se pudo desenlazar', e?.response?.data || e)
  }
}

async function reasignarConvenio(row) {
  if (!confirm('Este convenio está enlazado a otro cliente. ¿Reasignarlo a este cliente?')) return
  try {
    const { data } = await api.convenios.patch(row.id, { cliente: id.value })
    Object.assign(row, data)
  } catch (e) {
    console.error('No se pudo reasignar', e?.response?.data || e)
  }
}

// === ADICIONALES ===
function addAdicional() {
  adicionales.value.push({ id: null, cliente: id.value, caracteristica: '', campo: '', valor: '' })
}
async function saveAdicional(row) {
  const payload = {
    cliente: id.value,
    caracteristica: row.caracteristica || null,
    campo: row.campo || '',
    valor: row.valor || '',
  }
  if (!payload.caracteristica) return
  try {
    if (row.id) {
      await api.clientes.datosAdicionales.patch(row.id, payload)
    } else {
      const { data } = await api.clientes.datosAdicionales.create(payload)
      row.id = data?.id
    }
  } catch (e) {
    console.error('No se pudo guardar dato adicional', e?.response?.data || e)
  }
}
async function removeAdicional(row) {
  if (!row.id) {
    adicionales.value = adicionales.value.filter(r => r !== row)
    return
  }
  try {
    await api.clientes.datosAdicionales.delete(row.id)
    adicionales.value = adicionales.value.filter(r => r.id !== row.id)
  } catch (e) {
    console.error('No se pudo eliminar dato adicional', e?.response?.data || e)
  }
}
</script>

<style scoped>
/* opcional */
</style>
