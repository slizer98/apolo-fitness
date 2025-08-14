<template>
  <div class="p-4 text-white max-w-5xl mx-auto">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-light">Nuevo cliente</h1>
      <div class="flex items-center gap-2">
        <RouterLink :to="{ name: 'ClientesLista' }" class="px-3 py-2 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700">Volver</RouterLink>
        <button @click="saveAll" :disabled="saving" class="px-4 py-2 rounded bg-apolo-primary text-black hover:bg-apolo-secondary disabled:opacity-60">
          {{ saving ? 'Guardando…' : 'Guardar todo' }}
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="border-b border-gray-800 mb-4">
      <nav class="-mb-px flex flex-wrap gap-2">
        <button v-for="t in tabs" :key="t.key"
                @click="activeTab = t.key"
                :class="['px-3 py-2 rounded-t-lg text-sm',
                         activeTab===t.key ? 'border-b-2 border-apolo-primary text-apolo-primary' : 'text-gray-400 hover:text-white']">
          {{ t.label }}
        </button>
      </nav>
    </div>

    <!-- TAB: Cliente -->
    <section v-show="activeTab==='cliente'" class="space-y-4">
      <div class="grid sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs text-gray-400 mb-1">Nombre *</label>
          <input v-model="cliente.nombre" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
          <p v-if="errors.cliente.nombre" class="text-red-400 text-xs mt-1">{{ errors.cliente.nombre }}</p>
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-1">Apellidos *</label>
          <input v-model="cliente.apellidos" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
          <p v-if="errors.cliente.apellidos" class="text-red-400 text-xs mt-1">{{ errors.cliente.apellidos }}</p>
        </div>
      </div>

      <div class="grid sm:grid-cols-3 gap-4">
        <div>
          <label class="block text-xs text-gray-400 mb-1">Fecha de nacimiento</label>
          <input v-model="cliente.fecha_nacimiento" type="date" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-1">Género</label>
          <input v-model="cliente.genero" placeholder="M/F/No binario…" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-1">Correo (rápido)</label>
          <input v-model="cliente.email" type="email" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
          <p class="text-[11px] text-gray-500 mt-1">Si requieres múltiples correos, úsalos en la pestaña “Contacto”.</p>
        </div>
      </div>

      <div class="grid sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs text-gray-400 mb-1">Contacto de emergencia</label>
          <input v-model="cliente.contacto_emergencia" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-1">Usuario asignado (opcional, id numérico)</label>
          <input v-model.number="cliente.usuario" type="number" placeholder="ID usuario" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
        </div>
      </div>

      <div class="grid sm:grid-cols-3 gap-4">
        <label class="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" v-model="cliente.factura" class="h-4 w-4 rounded border-gray-700 bg-gray-900" />
          Requiere factura
        </label>
        <label class="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" v-model="cliente.recordar_vencimiento" class="h-4 w-4 rounded border-gray-700 bg-gray-900" />
          Recordar vencimiento
        </label>
        <label class="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" v-model="cliente.recibo_pago" class="h-4 w-4 rounded border-gray-700 bg-gray-900" />
          Enviar recibo de pago
        </label>
        <label class="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" v-model="cliente.recibir_promociones" class="h-4 w-4 rounded border-gray-700 bg-gray-900" />
          Recibir promociones
        </label>
      </div>

      <div>
        <label class="block text-xs text-gray-400 mb-1">Observaciones</label>
        <textarea v-model="cliente.observaciones" rows="3" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"></textarea>
      </div>
    </section>

    <!-- TAB: Contacto (múltiples) -->
    <section v-show="activeTab==='contacto'" class="space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="text-lg">Datos de contacto</h3>
        <button @click="addContacto" class="px-3 py-2 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700">+ Agregar</button>
      </div>
      <div v-if="!contactos.length" class="text-gray-400 text-sm">Sin filas. Agrega al menos una si necesitas más medios.</div>
      <div v-for="(row,idx) in contactos" :key="row._key" class="grid sm:grid-cols-5 gap-2 items-end border border-gray-800 rounded-xl p-3 bg-gray-900/40">
        <div class="sm:col-span-2">
          <label class="block text-xs text-gray-400 mb-1">Tipo</label>
          <select v-model="row.tipo" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2">
            <option value="">—</option>
            <option value="correo">Correo</option>
            <option value="telefono">Teléfono</option>
            <option value="celular">Celular</option>
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
            <option value="otro">Otro</option>
          </select>
          <p v-if="errors.contacto[idx]?.tipo" class="text-red-400 text-xs mt-1">{{ errors.contacto[idx].tipo }}</p>
        </div>
        <div class="sm:col-span-3">
          <label class="block text-xs text-gray-400 mb-1">Valor</label>
          <input v-model="row.valor" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
          <p v-if="errors.contacto[idx]?.valor" class="text-red-400 text-xs mt-1">{{ errors.contacto[idx].valor }}</p>
        </div>
        <div class="sm:col-span-5 flex justify-end">
          <button @click="removeContacto(idx)" class="px-2 py-1 rounded border border-red-800 bg-red-900/40 hover:bg-red-800">Eliminar</button>
        </div>
      </div>
    </section>

    <!-- TAB: Fiscales (1:1) -->
    <section v-show="activeTab==='fiscales'" class="space-y-4">
      <div class="grid sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs text-gray-400 mb-1">RFC</label>
          <input v-model="fiscales.rfc" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-1">Razón social</label>
          <input v-model="fiscales.razon_social" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
        </div>
      </div>
      <div class="grid sm:grid-cols-3 gap-4">
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
      <p class="text-[11px] text-gray-500">Este bloque es opcional; solo se enviará si capturas algún campo.</p>
    </section>

    <!-- TAB: Convenios (múltiples) -->
    <section v-show="activeTab==='convenios'" class="space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="text-lg">Convenios</h3>
        <button @click="addConvenio" class="px-3 py-2 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700">+ Agregar</button>
      </div>
      <div v-if="!convenios.length" class="text-gray-400 text-sm">Sin filas. Agrega si aplica.</div>
      <div v-for="(row, idx) in convenios" :key="row._key" class="grid sm:grid-cols-6 gap-2 items-end border border-gray-800 rounded-xl p-3 bg-gray-900/40">
        <div class="sm:col-span-3">
          <label class="block text-xs text-gray-400 mb-1">Empresa del convenio</label>
          <input v-model="row.empresa_convenio" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-1">Teléfono oficina</label>
          <input v-model="row.telefono_oficina" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-1">Medio enteró</label>
          <input v-model="row.medio_entero" placeholder="Facebook, Google, Referido…" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-1">Tipo cliente</label>
          <input v-model="row.tipo_cliente" placeholder="Estudiante, Corporativo…" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
        </div>
        <div class="sm:col-span-6 flex justify-end">
          <button @click="removeConvenio(idx)" class="px-2 py-1 rounded border border-red-800 bg-red-900/40 hover:bg-red-800">Eliminar</button>
        </div>
      </div>
      <p class="text-[11px] text-gray-500">Se asociará a la empresa activa automáticamente.</p>
    </section>

    <!-- TAB: Características / Datos adicionales -->
    <section v-show="activeTab==='caracteristicas'" class="space-y-3">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg">Características (empresa)</h3>
          <p class="text-[11px] text-gray-500">Define valores para las características configuradas en esta empresa.</p>
        </div>
        <button @click="loadCaracteristicas" class="px-3 py-2 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700">Refrescar</button>
      </div>

      <div v-if="loading.caracteristicas" class="text-gray-400">Cargando características…</div>
      <div v-else-if="!caracteristicas.length" class="text-gray-400 text-sm">No hay características configuradas.</div>

      <div v-for="(c, idx) in caracteristicas" :key="c.id" class="grid sm:grid-cols-3 gap-2 items-end border border-gray-800 rounded-xl p-3 bg-gray-900/40">
        <div>
          <div class="text-sm">{{ c.nombre }}</div>
          <div class="text-[11px] text-gray-500">Tipo: {{ c.tipo_dato }}</div>
        </div>
        <div>
          <input v-model="caracteristicaValores[idx].valor"
                 :placeholder="placeholderFor(c.tipo_dato)"
                 class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
        </div>
        <div>
          <input v-model="caracteristicaValores[idx].campo"
                 placeholder="Etiqueta/Campo (opcional)"
                 class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
        </div>
      </div>
    </section>

    <!-- TAB: Sucursales -->
    <section v-show="activeTab==='sucursales'" class="space-y-4">
      <div class="grid sm:grid-cols-3 gap-4">
        <div>
          <label class="block text-xs text-gray-400 mb-1">Sucursal</label>
          <select v-model="asignacion.sucursal" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2">
            <option value="">—</option>
            <option v-for="s in sucursales" :key="s.id" :value="s.id">{{ s.nombre }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-1">Fecha inicio</label>
          <input v-model="asignacion.fecha_inicio" type="date" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-1">Fecha fin</label>
          <input v-model="asignacion.fecha_fin" type="date" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
        </div>
      </div>
      <p class="text-[11px] text-gray-500">La validación de empresa-sucursal la hace el backend (mismo company scope).</p>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import api from '@/api/services'
import { useAuthStore } from '@/stores/auth'
import { useWorkspaceStore } from '@/stores/workspace'
const ws = useWorkspaceStore()

const router = useRouter()
const auth = useAuthStore()

// ===== Contexto empresa/sucursal =====
const empresaId = ref('')
const sucursales = ref([])

onMounted(async () => {
  try {
    const { data: pr } = await api.accounts.perfil();
    if (pr?.empresa?.id) {
      empresaId.value = pr.empresa.id;
      api.system.setEmpresa(empresaId.value);
    }
  } catch {}
  await loadSucursales();
  await loadCaracteristicas();
});


// ===== Tabs =====
const tabs = [
  { key: 'cliente', label: 'Cliente' },
  { key: 'contacto', label: 'Contacto' },
  { key: 'fiscales', label: 'Datos fiscales' },
  { key: 'convenios', label: 'Convenios' },
  { key: 'caracteristicas', label: 'Características' },
  { key: 'sucursales', label: 'Sucursal' },
]
const activeTab = ref('cliente')

// ===== Cliente (core) =====
const cliente = reactive({
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
  usuario: null, // id opcional
})
// ===== Contactos (0..n) =====
const contactos = ref([])
// ===== Fiscales (0..1) =====
const fiscales = reactive({
  rfc: '',
  razon_social: '',
  persona: '',
  codigo_postal: '',
  regimen_fiscal: '',
})
// ===== Convenios (0..n) =====
const convenios = ref([])
// ===== Características (listado por empresa) y entradas del usuario =====
const caracteristicas = ref([])
const caracteristicaValores = ref([]) // [{caracteristica:id, valor:'', campo:''}, …]
// ===== Asignación sucursal (opcional) =====
const asignacion = reactive({
  sucursal: '',
  fecha_inicio: '',
  fecha_fin: '',
})

// ===== UI state =====
const loading = reactive({
  caracteristicas: false,
})
const saving = ref(false)
const errors = reactive({
  cliente: {},
  contacto: [],
})

// ===== Helpers =====
function addContacto(){
  contactos.value.push({_key: crypto.randomUUID(), tipo:'', valor:''})
  errors.contacto.push({})
}
function removeContacto(idx){
  contactos.value.splice(idx,1)
  errors.contacto.splice(idx,1)
}
function addConvenio(){
  convenios.value.push({_key: crypto.randomUUID(), empresa_convenio:'', telefono_oficina:'', medio_entero:'', tipo_cliente:''})
}
function removeConvenio(idx){
  convenios.value.splice(idx,1)
}

async function ensureEmpresaId() {
  // 1) Si ya está en memoria, úsalo
  if (empresaId.value) return empresaId.value;

  // 2) Intenta desde el perfil
  try {
    const { data: pr } = await api.accounts.perfil();
    const id = pr?.empresa?.id;
    if (id) {
      empresaId.value = id;
      api.system.setEmpresa(id);
      return id;
    }
  } catch {}

  // 3) Si hay una sucursal elegida, dedúcelo por la sucursal
  if (asignacion.sucursal) {
    try {
      const { data: s } = await api.sucursales.retrieve(asignacion.sucursal);
      // backend puede devolver empresa como id, empresa_id, o objeto
      const id = s?.empresa?.id ?? s?.empresa_id ?? s?.empresa;
      if (id) {
        empresaId.value = id;
        api.system.setEmpresa(id);
        return id;
      }
    } catch {}
  }

  // 4) Último intento: si ya cargaste el listado de sucursales
  if (sucursales.value.length && asignacion.sucursal) {
    const s = sucursales.value.find(x => String(x.id) === String(asignacion.sucursal));
    const id = s?.empresa?.id ?? s?.empresa_id ?? s?.empresa;
    if (id) {
      empresaId.value = id;
      api.system.setEmpresa(id);
      return id;
    }
  }

  return null; // No fue posible determinarla
}


function placeholderFor(tipo){
  const t = (tipo||'').toLowerCase()
  if (t.includes('fecha')) return 'YYYY-MM-DD'
  if (t.includes('bool') || t.includes('boolean')) return 'true/false'
  if (t.includes('número') || t.includes('numero') || t.includes('int')) return '123'
  return 'Texto'
}

async function loadSucursales(){
  try{
    const { data } = await api.sucursales.list({ empresa: empresaId.value })
    sucursales.value = data?.results || data || []
  }catch{
    sucursales.value = []
  }
}
async function loadCaracteristicas(){
  loading.caracteristicas = true
  try{
    const { data } = await api.clientes.caracteristicas.list({ empresa: empresaId.value })
    const list = data?.results || data || []
    caracteristicas.value = list
    caracteristicaValores.value = list.map(c => ({ caracteristica: c.id, valor: '', campo: '' }))
  }finally{
    loading.caracteristicas = false
  }
}

function validateCliente(){
  const e = {}
  if(!cliente.nombre?.trim()) e.nombre = 'El nombre es obligatorio'
  if(!cliente.apellidos?.trim()) e.apellidos = 'Los apellidos son obligatorios'
  errors.cliente = e
  return Object.keys(e).length === 0
}
function validateContactos(){
  errors.contacto = contactos.value.map(() => ({}))
  let ok = true
  contactos.value.forEach((row, idx) => {
    const er = {}
    if(row.tipo && !row.valor){ er.valor = 'Captura el valor'; ok = false }
    if(row.valor && !row.tipo){ er.tipo = 'Selecciona el tipo'; ok = false }
    errors.contacto[idx] = er
  })
  return ok
}

function trimmedOrNull(v){
  if (v === null || v === undefined) return null
  if (typeof v === 'string') {
    const t = v.trim()
    return t === '' ? null : t
  }
  return v
}

// ===== Guardado secuencial =====
// ===== Guardado secuencial =====
async function saveAll(){
  if(!validateCliente()) { activeTab.value = 'cliente'; return }
  if(!validateContactos()) { activeTab.value = 'contacto'; return }

  saving.value = true
  let clienteId = null

  try {
    // 1) Crear Cliente
    const payloadCliente = {
      nombre: cliente.nombre.trim(),
      apellidos: cliente.apellidos.trim(),
      fecha_nacimiento: trimmedOrNull(cliente.fecha_nacimiento),
      contacto_emergencia: trimmedOrNull(cliente.contacto_emergencia) || '',
      email: trimmedOrNull(cliente.email) || '',
      factura: !!cliente.factura,
      observaciones: trimmedOrNull(cliente.observaciones) || '',
      recordar_vencimiento: !!cliente.recordar_vencimiento,
      recibo_pago: !!cliente.recibo_pago,
      recibir_promociones: !!cliente.recibir_promociones,
      genero: trimmedOrNull(cliente.genero) || '',
      usuario: cliente.usuario || null,
    }
    const { data: cli } = await api.clientes.create(payloadCliente)
    clienteId = cli.id

    // 2) Contactos
    for (const c of contactos.value) {
      if (c.tipo && c.valor) {
        await api.clientes.datosContacto.create({
          cliente: clienteId,
          tipo: c.tipo,
          valor: c.valor.trim(),
        })
      }
    }

    // 3) Fiscales
    const hayFiscales = Object.values(fiscales).some(v => (v||'').toString().trim() !== '')
    if (hayFiscales) {
      await api.clientes.datosFiscales.create({
        cliente: clienteId,
        rfc: trimmedOrNull(fiscales.rfc) || '',
        razon_social: trimmedOrNull(fiscales.razon_social) || '',
        persona: trimmedOrNull(fiscales.persona) || '',
        codigo_postal: trimmedOrNull(fiscales.codigo_postal) || '',
        regimen_fiscal: trimmedOrNull(fiscales.regimen_fiscal) || '',
      })
    }

    // 4) *** Asegura EMPRESA para convenios y sucursal ***
const empresaOk = ws.empresaId
if (!empresaOk) {
  alert('No se pudo determinar la empresa. Vuelve a iniciar sesión.')
  throw new Error('Empresa no determinada')
}
const empresaNum = Number(empresaOk)

    // 5) Convenios
    for (const cv of convenios.value) {
      const algo = [cv.empresa_convenio, cv.telefono_oficina, cv.medio_entero, cv.tipo_cliente].some(v => (v||'').trim()!=='')
      if (algo) {
        await api.clientes.convenios.create({
          cliente: clienteId,
          empresa: empresaNum,  // <- SIEMPRE número
          empresa_convenio: trimmedOrNull(cv.empresa_convenio) || '',
          telefono_oficina: trimmedOrNull(cv.telefono_oficina) || '',
          medio_entero: trimmedOrNull(cv.medio_entero) || '',
          tipo_cliente: trimmedOrNull(cv.tipo_cliente) || '',
        })
      }
    }

    // 6) Asignación a sucursal (opcional)
    if (asignacion.sucursal) {
      await api.clientes.clienteSucursales.create({
        cliente: clienteId,
        sucursal: Number(asignacion.sucursal),
        empresa: empresaNum,  // <- SIEMPRE número
        fecha_inicio: trimmedOrNull(asignacion.fecha_inicio),
        fecha_fin: trimmedOrNull(asignacion.fecha_fin),
      })
    }

    alert('Cliente creado con éxito')
    router.push({ name: 'ClientesLista' })
  } catch (e) {
    const data = e?.response?.data
    if (data && typeof data === 'object') {
      if (data.nombre) errors.cliente.nombre = Array.isArray(data.nombre) ? data.nombre[0] : String(data.nombre)
      if (data.apellidos) errors.cliente.apellidos = Array.isArray(data.apellidos) ? data.apellidos[0] : String(data.apellidos)
    }
    if (e?.message !== 'Empresa no determinada') {
      alert(data?.detail || 'Ocurrió un error al guardar')
    }
    console.error(e)
  } finally {
    saving.value = false
  }
}

</script>

<style scoped>
/* opcional de estilos */
</style>
