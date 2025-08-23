<template>
  <div class="p-4 text-white">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-light">Usuarios (empleados)</h1>
      <button @click="openNew" class="bg-apolo-primary text-black px-4 py-2 rounded hover:bg-apolo-secondary transition">
        + Nuevo
      </button>
    </div>

    <!-- Filtros -->
    <div class="mb-4 flex flex-wrap gap-2">
      <input v-model="q" @keyup.enter="fetch" placeholder="Buscar por usuario, rol o sucursal…"
             class="bg-gray-900 border border-gray-700 rounded px-3 py-2 w-64" />
      <button @click="fetch" class="bg-gray-800 border border-gray-700 px-4 py-2 rounded hover:bg-gray-700">Buscar</button>
      <button @click="resetFilters" class="bg-gray-800 border border-gray-700 px-4 py-2 rounded hover:bg-gray-700">Limpiar</button>
    </div>

    <!-- Tabla -->
    <div class="overflow-x-auto rounded-xl border border-gray-800">
      <table class="min-w-full text-sm">
        <thead class="bg-black/40 border-b border-gray-800">
          <tr class="text-left text-gray-300">
            <th class="px-3 py-2">ID</th>
            <th class="px-3 py-2">Usuario</th>
            <th class="px-3 py-2">Nombre</th>
            <th class="px-3 py-2">Empresa</th>
            <th class="px-3 py-2">Sucursal</th>
            <th class="px-3 py-2">Rol</th>
            <th class="px-3 py-2">Permisos</th>
            <th class="px-3 py-2 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="8" class="px-3 py-6 text-center text-gray-400">Cargando…</td>
          </tr>
          <tr v-for="it in rows" :key="it.id" class="border-b border-gray-800/60 hover:bg-gray-900/40">
            <td class="px-3 py-2 text-gray-400">{{ it.id }}</td>
            <td class="px-3 py-2">{{ it.usuario_username || it.usuario_nombre || it.usuario }}</td>
            <td class="px-3 py-2">{{ it.usuario_fullname || it.usuario_nombre || '—' }}</td>
            <td class="px-3 py-2">{{ it.empresa_nombre || wsEmpresaNombre }}</td>
            <td class="px-3 py-2">{{ it.sucursal_nombre || it.sucursal }}</td>
            <td class="px-3 py-2">
              <span class="px-2 py-0.5 rounded-full text-[11px] bg-gray-700/40 border border-gray-700">{{ it.rol }}</span>
            </td>
            <td class="px-3 py-2">
              <div class="flex flex-wrap gap-1">
                <span v-for="(val,key) in (it.permisos||{})" :key="key"
                      class="px-2 py-0.5 rounded-full text-[11px]"
                      :class="val ? 'bg-green-600/20 border border-green-700/50 text-green-200' : 'bg-gray-700/40 border border-gray-700 text-gray-300'">
                  {{ key }} {{ val ? '✔' : '—' }}
                </span>
              </div>
            </td>
            <td class="px-3 py-2 text-right whitespace-nowrap">
              <button @click="openEdit(it)" class="px-3 py-1.5 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700 mr-2">Editar</button>
              <button @click="askRemove(it)" class="px-3 py-1.5 rounded border border-red-800 bg-red-900/40 hover:bg-red-800">Eliminar</button>
            </td>
          </tr>
          <tr v-if="!loading && !rows.length">
            <td colspan="8" class="px-3 py-8 text-center text-gray-400">Sin registros</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginación -->
    <div class="mt-4 flex items-center gap-2">
      <button :disabled="page<=1" @click="prev" class="px-3 py-1 rounded bg-gray-800/60 border border-gray-700 disabled:opacity-50">Anterior</button>
      <span class="text-gray-300">Página {{ page }}</span>
      <button :disabled="!hasMore" @click="next" class="px-3 py-1 rounded bg-gray-800/60 border border-gray-700 disabled:opacity-50">Siguiente</button>
      <span v-if="count!==null" class="text-gray-500 text-sm">({{ count }} resultados)</span>
    </div>

    <!-- Modal Crear/Editar -->
    <Modal :open="showModal" :title="isEditing ? 'Editar asignación' : 'Usuario + asignación'" @close="closeModal">
      <form id="user-assign-form" @submit.prevent="save" class="space-y-6">
        <!-- Modo de operación -->
        <div v-if="!isEditing" class="rounded-xl border border-gray-800 p-3 bg-gray-900/30">
          <div class="flex flex-wrap items-center gap-4">
            <label class="inline-flex items-center gap-2">
              <input type="radio" class="h-4 w-4" value="existing" v-model="mode" />
              <span>Asignar usuario existente</span>
            </label>
            <label class="inline-flex items-center gap-2">
              <input type="radio" class="h-4 w-4" value="new" v-model="mode" />
              <span>Crear usuario nuevo</span>
            </label>
          </div>
        </div>

        <!-- Sección: Usuario existente (typeahead) -->
        <fieldset v-if="!isEditing && mode==='existing'" class="rounded-xl border border-gray-800 p-3 bg-gray-900/30 relative">
          <legend class="px-2 text-sm text-gray-300">Seleccionar usuario existente</legend>

          <div class="mt-2">
            <label class="block text-xs text-gray-400 mb-1">Buscar usuario</label>
            <div class="relative">
              <input
                v-model.trim="userSearchTerm"
                @input="onUserSearchInput"
                @keydown.escape="hideUserResults"
                placeholder="Busca por username, nombre o email…"
                class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
              />
              <!-- Dropdown -->
              <div v-if="showResults" class="absolute z-10 mt-1 w-full rounded-xl border border-gray-800 bg-gray-950 shadow-xl max-h-72 overflow-auto">
                <div v-if="userSearchLoading" class="px-3 py-2 text-sm text-gray-400">Buscando…</div>
                <template v-else>
                  <button
                    v-for="u in userResults"
                    :key="u.id"
                    type="button"
                    @click="selectUser(u)"
                    class="w-full text-left px-3 py-2 hover:bg-gray-800/60 transition"
                  >
                    <div class="font-medium">{{ displayUser(u) }}</div>
                    <div class="text-[12px] text-gray-400">{{ u.email || 'Sin correo' }}</div>
                  </button>
                  <div v-if="!userResults.length" class="px-3 py-2 text-sm text-gray-400">Sin resultados</div>
                </template>
              </div>
            </div>
            <p v-if="selectedUser" class="text-[12px] text-green-300 mt-2">
              Seleccionado: {{ displayUser(selectedUser) }}
            </p>
            <p v-if="errors.assign.usuario" class="text-red-400 text-xs mt-1">{{ errors.assign.usuario }}</p>
          </div>
        </fieldset>

        <!-- Sección: Datos de usuario (solo en crear nuevo) -->
        <fieldset v-if="!isEditing && mode==='new'" class="rounded-xl border border-gray-800 p-3 bg-gray-900/30">
          <legend class="px-2 text-sm text-gray-300">Datos de usuario</legend>

          <div class="grid sm:grid-cols-2 gap-3 mt-2">
            <div>
              <label class="block text-xs text-gray-400 mb-1">Username *</label>
              <input v-model.trim="user.username" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
              <p v-if="errors.user.username" class="text-red-400 text-xs mt-1">{{ errors.user.username }}</p>
            </div>
            <div>
              <label class="block text-xs text-gray-400 mb-1">Email</label>
              <input v-model.trim="user.email" type="email" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
              <p v-if="errors.user.email" class="text-red-400 text-xs mt-1">{{ errors.user.email }}</p>
            </div>
          </div>

          <div class="grid sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-400 mb-1">Nombre</label>
              <input v-model.trim="user.nombre" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
            </div>
            <div>
              <label class="block text-xs text-gray-400 mb-1">Apellido</label>
              <input v-model.trim="user.apellido" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
            </div>
          </div>

          <div class="grid sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-400 mb-1">Contraseña *</label>
              <input v-model="user.password" type="password" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
              <p v-if="errors.user.password" class="text-red-400 text-xs mt-1">{{ errors.user.password }}</p>
            </div>
            <div>
              <label class="block text-xs text-gray-400 mb-1">Confirmar contraseña *</label>
              <input v-model="user.password2" type="password" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
              <p v-if="errors.user.password2" class="text-red-400 text-xs mt-1">{{ errors.user.password2 }}</p>
            </div>
          </div>

          <div class="grid sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-400 mb-1">Teléfono</label>
              <input v-model.trim="user.telefono" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
            </div>
            <div class="flex items-center gap-2">
              <input id="u_activo" type="checkbox" v-model="user.is_active" class="h-4 w-4 rounded border-gray-700 bg-gray-900">
              <label for="u_activo" class="text-sm text-gray-300">Usuario activo</label>
            </div>
          </div>
        </fieldset>

        <!-- Sección: Asignación (común) -->
        <fieldset class="rounded-xl border border-gray-800 p-3 bg-gray-900/30">
          <legend class="px-2 text-sm text-gray-300">Asignación</legend>

          <div class="grid sm:grid-cols-2 gap-3 mt-2">
            <div>
              <label class="block text-xs text-gray-400 mb-1">Sucursal *</label>
              <select v-model.number="assign.sucursal" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2">
                <option :value="null" disabled>Selecciona…</option>
                <option v-for="s in sucursales" :key="s.id" :value="s.id">{{ s.nombre }}</option>
              </select>
              <p v-if="errors.assign.sucursal" class="text-red-400 text-xs mt-1">{{ errors.assign.sucursal }}</p>
            </div>

            <div>
              <label class="block text-xs text-gray-400 mb-1">Rol *</label>
              <select v-model="assign.rol" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2">
                <option :value="null" disabled>Selecciona…</option>
                <option v-for="r in rolOptions" :key="r" :value="r">{{ r }}</option>
              </select>
              <p v-if="errors.assign.rol" class="text-red-400 text-xs mt-1">{{ errors.assign.rol }}</p>
            </div>
          </div>

          <div class="grid sm:grid-cols-2 gap-2">
            <label class="inline-flex items-center gap-2">
              <input type="checkbox" v-model="assign.permisos.ver_ventas" class="h-4 w-4 rounded border-gray-700 bg-gray-900">
              <span>Ver ventas</span>
            </label>
            <label class="inline-flex items-center gap-2">
              <input type="checkbox" v-model="assign.permisos.editar_clientes" class="h-4 w-4 rounded border-gray-700 bg-gray-900">
              <span>Editar clientes</span>
            </label>
          </div>

          <div class="flex items-center gap-2 mt-2">
            <input id="a_activo" type="checkbox" v-model="assign.is_active" class="h-4 w-4 rounded border-gray-700 bg-gray-900">
            <label for="a_activo" class="text-sm text-gray-300">Asignación activa</label>
          </div>
        </fieldset>
      </form>

      <!-- Footer -->
      <template #footer>
        <div class="flex items-center justify-between w-full">
          <p class="text-[12px] text-gray-400">La empresa se toma del contexto activo.</p>
          <div class="flex items-center gap-2">
            <button type="button" @click="closeModal"
                    class="px-4 py-2 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700">Cancelar</button>
            <button type="submit" form="user-assign-form" :disabled="saving"
                    class="px-4 py-2 rounded bg-apolo-primary text-black hover:bg-apolo-secondary disabled:opacity-60">
              {{ saving ? 'Guardando…' : (isEditing ? 'Guardar cambios' : 'Guardar') }}
            </button>
          </div>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/api/services'
import Modal from '@/components/ui/Modal.vue'
import { useUiStore } from '@/stores/ui'
import { useWorkspaceStore } from '@/stores/workspace'

const ui = useUiStore()
const ws = useWorkspaceStore()

// ===== Listado =====
const loading = ref(true)
const rows = ref([])
const page = ref(1)
const pageSize = 10
const count = ref(null)
const q = ref('')

const hasMore = computed(() => count.value === null ? rows.value.length === pageSize : count.value > page.value * pageSize)

onMounted(async () => {
  await ensureContext()
  await preloadSucursales()
  await fetch()
})

async function ensureContext(){
  if (!ws.empresaId && ws.ensureEmpresaSet) {
    await ws.ensureEmpresaSet()
  }
}

async function fetch(){
  loading.value = true
  try{
    const params = { page: page.value, page_size: pageSize, search: q.value, ordering: '-id' }
    const { data } = await api.usuariosEmpresa.list(params)
    rows.value = data?.results || data || []
    count.value = data?.count ?? null
  } catch (e) {
    ui.toast({ type:'error', title:'Error al cargar', message: e.response?.data?.detail || 'No se pudo obtener la lista' })
  } finally {
    loading.value = false
  }
}
function resetFilters(){ q.value=''; page.value=1; fetch() }
function next(){ if(hasMore.value){ page.value++; fetch() } }
function prev(){ if(page.value>1){ page.value--; fetch() } }

// ===== Catálogos =====
const sucursales = ref([])
async function preloadSucursales(){
  try{
    const { data } = await api.sucursales.list({ ordering: 'nombre' })
    sucursales.value = data?.results || data || []
  }catch{
    sucursales.value = []
  }
}
const rolOptions = ['Gerente','Recepcionista','Contabilidad','Auditor', 'Instructor']

// ===== Modal/Form =====
const showModal = ref(false)
const isEditing = ref(false)
const saving = ref(false)

// modos: existing | new
const mode = ref('existing')

// errores
const errors = ref({ user:{}, assign:{} })

// Datos de usuario (crear nuevo)
const user = ref({
  username: '',
  email: '',
  nombre: '',
  apellido: '',
  password: '',
  password2: '',
  telefono: '',
  is_active: true,
})

// Asignación (crear/editar)
const assign = ref({
  id: null,
  usuario: null,
  sucursal: null,
  rol: null,
  permisos: { ver_ventas: true, editar_clientes: true },
  is_active: true,
})

function openNew(){
  isEditing.value = false
  mode.value = 'existing'
  errors.value = { user:{}, assign:{} }
  user.value = {
    username: '', email: '', nombre: '', apellido: '',
    password: '', password2: '', telefono: '', is_active: true
  }
  assign.value = {
    id: null, usuario: null, sucursal: null, rol: null,
    permisos: { ver_ventas: true, editar_clientes: true }, is_active: true
  }
  // limpiar búsqueda
  userSearchTerm.value = ''
  userResults.value = []
  selectedUser.value = null
  showResults.value = false
  showModal.value = true
}

function openEdit(it){
  isEditing.value = true
  errors.value = { user:{}, assign:{} }
  mode.value = 'existing'  // irrelevante en edición
  user.value = {
    username: '', email: '', nombre: '', apellido: '',
    password: '', password2: '', telefono: '', is_active: true
  }
  assign.value = {
    id: it.id,
    usuario: it.usuario,
    sucursal: it.sucursal || null,
    rol: it.rol || null,
    permisos: { ...(it.permisos || {}) },
    is_active: it.is_active ?? true,
  }
  showModal.value = true
}

function closeModal(){ showModal.value = false }

// ===== Typeahead usuarios existentes =====
const userSearchTerm = ref('')
const userResults = ref([])
const userSearchLoading = ref(false)
const showResults = ref(false)
const selectedUser = ref(null)
let searchTimer = null

function displayUser(u){
  const full = [u.first_name, u.last_name].filter(Boolean).join(' ').trim()
  return full || u.username || `#${u.id}`
}
function hideUserResults(){ showResults.value = false }

function onUserSearchInput(){
  selectedUser.value = null
  assign.value.usuario = null

  if(searchTimer) clearTimeout(searchTimer)
  const term = userSearchTerm.value.trim()
  if(!term){ userResults.value = []; showResults.value = false; return }
  searchTimer = setTimeout(() => searchUsers(term), 350) // debounce 350ms
}

async function searchUsers(term){
  userSearchLoading.value = true
  showResults.value = true
  try{
    const { data } = await api.accounts.usuarios.list({
      search: term,
      page_size: 8,
      ordering: 'username'
    })
    userResults.value = data?.results || data || []
  } catch (e){
    userResults.value = []
  } finally {
    userSearchLoading.value = false
  }
}

function selectUser(u){
  selectedUser.value = u
  assign.value.usuario = u.id
  userSearchTerm.value = displayUser(u)
  showResults.value = false
}

// ===== Validaciones =====
function validEmail(v){ return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) }

function validateCreateExisting(){
  const ue = {}
  const ae = {}
  if(!assign.value.usuario) ue.usuario = 'Selecciona un usuario'
  if(!assign.value.sucursal) ae.sucursal = 'Sucursal es obligatoria'
  if(!assign.value.rol) ae.rol = 'Rol es obligatorio'
  errors.value = { user: {}, assign: { ...ae, ...ue } }
  return !Object.keys(ue).length && !Object.keys(ae).length
}

function validateCreateNew(){
  const ue = {}
  const ae = {}
  if(!user.value.username?.trim()) ue.username = 'Username es obligatorio'
  if(!user.value.password) ue.password = 'Contraseña es obligatoria'
  if(user.value.password && user.value.password.length < 8) ue.password = 'Mínimo 8 caracteres'
  if(user.value.password2 !== user.value.password) ue.password2 = 'Las contraseñas no coinciden'
  if(!validEmail(user.value.email)) ue.email = 'Email inválido'
  if(!assign.value.sucursal) ae.sucursal = 'Sucursal es obligatoria'
  if(!assign.value.rol) ae.rol = 'Rol es obligatorio'
  errors.value = { user: ue, assign: ae }
  return !Object.keys(ue).length && !Object.keys(ae).length
}

function validateEdit(){
  const ae = {}
  if(!assign.value.sucursal) ae.sucursal = 'Sucursal es obligatoria'
  if(!assign.value.rol) ae.rol = 'Rol es obligatorio'
  errors.value.assign = ae
  return !Object.keys(ae).length
}

// ===== Guardado =====
async function save(){
  if(isEditing.value){
    if(!validateEdit()) return
    await saveAssignment(assign.value)
    return
  }

  // Crear
  if(mode.value === 'existing'){
    if(!validateCreateExisting()) return
    saving.value = true
    try{
      const apayload = {
        usuario: Number(assign.value.usuario),
        empresa: Number(ws.empresaId),
        sucursal: Number(assign.value.sucursal),
        rol: assign.value.rol,
        permisos: assign.value.permisos || {},
        is_active: !!assign.value.is_active,
      }
      await api.usuariosEmpresa.create(apayload)
      ui.toast({ type:'success', title:'Asignación creada', message:'Usuario existente asignado correctamente' })
      closeModal()
      await fetch()
    } catch(e){
      ui.toast({ type:'error', title:'No se pudo asignar', message: e?.response?.data?.detail || 'Error al crear asignación' })
    } finally {
      saving.value = false
    }
    return
  }

  // Crear usuario nuevo y asignación
  if(!validateCreateNew()) return
  saving.value = true
  try{
    const upayload = {
      username: user.value.username.trim(),
      password: user.value.password,
      email: user.value.email?.trim() || '',
      nombre: user.value.nombre?.trim() || '',
      apellido: user.value.apellido?.trim() || '',
      telefono: user.value.telefono?.trim() || '',
      is_active: !!user.value.is_active,
      empresa: Number(ws.empresaId),
    }
    const { data: u } = await api.accounts.usuarios.create(upayload)
    if(!u?.id) throw new Error('No se obtuvo ID del usuario')

    const apayload = {
      usuario: Number(u.id),
      empresa: Number(ws.empresaId),
      sucursal: Number(assign.value.sucursal),
      rol: assign.value.rol,
      permisos: assign.value.permisos || {},
      is_active: !!assign.value.is_active,
    }
    await api.usuariosEmpresa.create(apayload)

    ui.toast({ type:'success', title:'Usuario creado', message:'Usuario y asignación creados' })
    closeModal()
    await fetch()
  } catch(e){
    ui.toast({ type:'error', title:'No se pudo guardar', message: e?.response?.data?.detail || e.message || 'Error al crear usuario/asignación' })
  } finally {
    saving.value = false
  }
}

async function saveAssignment(assignData){
  saving.value = true
  try{
    const payload = {
      usuario: Number(assignData.usuario),
      empresa: Number(ws.empresaId),
      sucursal: Number(assignData.sucursal),
      rol: assignData.rol,
      permisos: assignData.permisos || {},
      is_active: !!assignData.is_active,
    }
    await api.usuariosEmpresa.update(assignData.id, payload)
    ui.toast({ type:'success', title:'Asignación actualizada' })
    closeModal()
    await fetch()
  } catch(e){
    ui.toast({ type:'error', title:'Error', message: e.response?.data?.detail || 'No se pudo actualizar' })
  } finally {
    saving.value = false
  }
}

// Eliminar
async function askRemove(it){
  const ok = await ui.confirm({
    title: 'Eliminar asignación',
    message: `Esto desvinculará al usuario de la sucursal/empresa.\n¿Deseas continuar?`,
    confirmText: 'Eliminar',
    variant: 'danger'
  })
  if(!ok) return
  try{
    await api.usuariosEmpresa.delete(it.id)
    ui.toast({ type:'success', title:'Eliminado', message:'Asignación eliminada' })
    if(rows.value.length === 1 && page.value > 1){ page.value -= 1 }
    await fetch()
  } catch(e){
    ui.toast({ type:'error', title:'No se eliminó', message: e.response?.data?.detail || 'Ocurrió un problema' })
  }
}

const wsEmpresaNombre = '' // opcional
</script>

<style scoped>
/* opcional: limitar ancho del dropdown del typeahead ya está por defecto a w-full */
</style>
