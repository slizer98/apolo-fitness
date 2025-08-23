<template>
  <div class="p-4 text-white">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-light">Nueva membresía</h1>
      <router-link :to="{ name:'MembresiasLista' }" class="text-sm text-gray-300 hover:text-white">← Volver</router-link>
    </div>

    <div class="rounded-2xl border border-gray-800 bg-gray-900/60">
      <!-- tabs -->
      <div class="px-4 py-3 border-b border-gray-800 flex flex-wrap gap-2">
        <button :class="tabBtn('datos')"     @click="tab='datos'">Datos</button>
        <button :class="tabBtn('confirmar')" @click="tab='confirmar'">Confirmar</button>
      </div>

      <!-- contenido -->
      <div class="p-4">
        <!-- TAB: Datos -->
        <div v-if="tab==='datos'" class="grid sm:grid-cols-2 gap-4">
          <!-- Cliente -->
          <div>
            <label class="block text-xs text-gray-400 mb-1">Cliente *</label>
            <div class="flex gap-2">
              <input v-model="clienteSearch" @keyup="debouncedSearchClientes" placeholder="Buscar cliente…" class="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2" />
              <button @click="loadClientes" class="px-3 py-2 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700 text-sm">Buscar</button>
            </div>
            <select v-model="form.cliente" class="mt-2 w-full bg-gray-900 border border-gray-700 rounded px-3 py-2">
              <option :value="null">— Selecciona —</option>
              <option v-for="c in clientes" :key="c.id" :value="c.id">
                {{ c.nombre }} {{ c.apellidos }} ({{ c.email || 'sin correo' }})
              </option>
            </select>
            <p v-if="errors.cliente" class="text-red-400 text-xs mt-1">{{ errors.cliente }}</p>
          </div>

          <!-- Plan -->
          <div>
            <label class="block text-xs text-gray-400 mb-1">Plan *</label>
            <div class="flex gap-2">
              <input v-model="planSearch" @keyup="debouncedSearchPlanes" placeholder="Buscar plan…" class="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2" />
              <button @click="loadPlanes" class="px-3 py-2 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700 text-sm">Buscar</button>
            </div>
            <select v-model="form.plan" class="mt-2 w-full bg-gray-900 border border-gray-700 rounded px-3 py-2">
              <option :value="null">— Selecciona —</option>
              <option v-for="p in planes" :key="p.id" :value="p.id">
                {{ p.nombre }}
              </option>
            </select>
            <p v-if="errors.plan" class="text-red-400 text-xs mt-1">{{ errors.plan }}</p>
          </div>

          <!-- Empresa (readonly del workspace) -->
          <div>
            <label class="block text-xs text-gray-400 mb-1">Empresa *</label>
            <input :value="ws.empresaId || '—'" disabled class="w-full bg-gray-900/60 border border-gray-800 rounded px-3 py-2 text-gray-400" />
            <p class="text-[11px] text-gray-500 mt-1">Se toma del contexto activo (header X-Empresa-Id).</p>
          </div>

          <!-- Sucursal -->
          <div>
            <label class="block text-xs text-gray-400 mb-1">Sucursal *</label>
            <input v-model="form.sucursal" placeholder="ID de sucursal" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
            <p v-if="errors.sucursal" class="text-red-400 text-xs mt-1">{{ errors.sucursal }}</p>
            <p class="text-[11px] text-gray-500 mt-1">Puedes precargar la sucursal activa del perfil si la tienes (ws.sucursalId).</p>
          </div>

          <!-- Fechas -->
          <div>
            <label class="block text-xs text-gray-400 mb-1">Fecha de alta *</label>
            <input v-model="form.fecha_alta" type="date" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
            <p v-if="errors.fecha_alta" class="text-red-400 text-xs mt-1">{{ errors.fecha_alta }}</p>
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">Fecha de vencimiento *</label>
            <input v-model="form.fecha_vencimiento" type="date" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
            <p v-if="errors.fecha_vencimiento" class="text-red-400 text-xs mt-1">{{ errors.fecha_vencimiento }}</p>
          </div>

          <!-- Renovación -->
          <div class="sm:col-span-2">
            <label class="inline-flex items-center gap-2">
              <input type="checkbox" v-model="form.renovacion" class="h-4 w-4 rounded border-gray-700 bg-gray-900" />
              <span class="text-sm text-gray-300">Renovar automáticamente</span>
            </label>
          </div>
        </div>

        <!-- TAB: Confirmar -->
        <div v-else>
          <div class="rounded-xl border border-gray-800 bg-black/30 p-4">
            <h3 class="text-lg mb-3">Resumen</h3>
            <ul class="text-sm space-y-1">
              <li><span class="text-gray-400">Cliente:</span> {{ selectedClienteLabel || '—' }}</li>
              <li><span class="text-gray-400">Plan:</span> {{ selectedPlanLabel || '—' }}</li>
              <li><span class="text-gray-400">Empresa:</span> {{ ws.empresaId || '—' }}</li>
              <li><span class="text-gray-400">Sucursal:</span> {{ form.sucursal || ws.sucursalId || '—' }}</li>
              <li><span class="text-gray-400">Vigencia:</span> {{ rangeText }}</li>
              <li><span class="text-gray-400">Renovación:</span> {{ form.renovacion ? 'Sí' : 'No' }}</li>
            </ul>
          </div>
          <div class="mt-4 flex items-center justify-end gap-2">
            <button @click="tab='datos'" class="px-4 py-2 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700">Atrás</button>
            <button :disabled="saving" @click="save" class="px-4 py-2 rounded bg-apolo-primary text-black hover:bg-apolo-secondary disabled:opacity-60">
              {{ saving ? 'Guardando…' : 'Confirmar y crear' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirm modal (opcional para cancelar) -->
    <div v-if="confirm.show" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div class="w-full max-w-sm bg-gray-950 border border-gray-800 rounded-2xl shadow-xl p-4">
        <h3 class="text-lg mb-2">{{ confirm.title }}</h3>
        <p class="text-gray-300 text-sm">{{ confirm.message }}</p>
        <div class="mt-4 flex items-center justify-end gap-2">
          <button @click="resolveConfirm(false)" class="px-3 py-1.5 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700">Seguir editando</button>
          <button @click="resolveConfirm(true)" class="px-3 py-1.5 rounded bg-red-500/90 hover:bg-red-500 text-black">Descartar</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/api/services'
import { useUiStore } from '@/stores/ui'
import { useWorkspaceStore } from '@/stores/workspace'
import { useRouter } from 'vue-router'

const ui = useUiStore()
const ws = useWorkspaceStore()
const router = useRouter()

const tab = ref('datos')
function tabBtn(name){
  return [
    'px-3 py-2 text-sm border-b-2',
    tab.value === name ? 'border-apolo-primary text-white' : 'border-transparent text-gray-400 hover:text-white'
  ]
}

/* ===== Form ===== */
const form = ref({
  cliente: null,
  plan: null,
  empresa: null,   // lo asignaremos con ws.empresaId al guardar (o en mounted)
  sucursal: '',
  fecha_alta: '',
  fecha_vencimiento: '',
  renovacion: false,
})
const errors = ref({})
const saving = ref(false)

/* defaults desde workspace */
onMounted(() => {
  if(ws.sucursalId && !form.value.sucursal) form.value.sucursal = ws.sucursalId
})

/* ===== Clientes ===== */
const clientes = ref([])
const clienteSearch = ref('')
let clienteTimer = null
function debouncedSearchClientes(){
  clearTimeout(clienteTimer)
  clienteTimer = setTimeout(loadClientes, 300)
}
async function loadClientes(){
  try{
    const { data } = await api.clientes.list({ search: clienteSearch.value, page_size: 50 })
    clientes.value = data?.results || data || []
  }catch{}
}
const selectedClienteLabel = computed(() => {
  const c = clientes.value.find(x => x.id === form.value.cliente)
  return c ? `${c.nombre} ${c.apellidos}` : ''
})

/* ===== Planes ===== */
const planes = ref([])
const planSearch = ref('')
let planTimer = null
function debouncedSearchPlanes(){
  clearTimeout(planTimer)
  planTimer = setTimeout(loadPlanes, 300)
}
async function loadPlanes(){
  try{
    const { data } = await api.planes.list({ search: planSearch.value, page_size: 50 })
    planes.value = data?.results || data || []
  }catch{}
}
const selectedPlanLabel = computed(() => {
  const p = planes.value.find(x => x.id === form.value.plan)
  return p ? p.nombre : ''
})

/* ===== Helpers ===== */
const rangeText = computed(() => {
  const a = form.value.fecha_alta ? new Date(form.value.fecha_alta).toLocaleDateString('es-MX') : '—'
  const b = form.value.fecha_vencimiento ? new Date(form.value.fecha_vencimiento).toLocaleDateString('es-MX') : '—'
  return (form.value.fecha_alta || form.value.fecha_vencimiento) ? `${a} → ${b}` : '—'
})

function validate(){
  const e = {}
  if(!form.value.cliente) e.cliente = 'Cliente obligatorio'
  if(!form.value.plan) e.plan = 'Plan obligatorio'
  if(!ws.empresaId) e.empresa = 'No hay empresa activa'
  if(!form.value.sucursal) e.sucursal = 'Sucursal obligatoria'
  if(!form.value.fecha_alta) e.fecha_alta = 'Fecha de alta obligatoria'
  if(!form.value.fecha_vencimiento) e.fecha_vencimiento = 'Fecha de vencimiento obligatoria'
  errors.value = e
  return Object.keys(e).length === 0
}

async function save(){
  if(!validate()){ ui.toast({ type:'error', title:'Completa los campos obligatorios' }); return }
  saving.value = true
  try{
    const payload = {
      empresa: ws.empresaId,
      sucursal: form.value.sucursal,
      cliente: form.value.cliente,
      plan: form.value.plan,
      fecha_alta: form.value.fecha_alta,
      fecha_vencimiento: form.value.fecha_vencimiento,
      renovacion: !!form.value.renovacion,
    }
    await api.altasPlan.create(payload)
    ui.toast({ type:'success', title:'Membresía creada' })
    router.replace({ name:'MembresiasLista' })
  } catch(e){
    const msg = e.response?.data?.detail
      || Object.values(e.response?.data || {})?.[0]?.[0]
      || 'No se pudo crear'
    ui.toast({ type:'error', title:'Error', message: msg })
  } finally {
    saving.value = false
  }
}

/* confirm modal (si quisieras abortar edición) */
const confirm = ref({ show:false, title:'Descartar cambios', message:'¿Deseas salir sin guardar?', resolve:null })
function askConfirm(message, title='Confirmar acción'){
  confirm.value.title = title
  confirm.value.message = message
  confirm.value.show = true
  return new Promise(res => { confirm.value.resolve = res })
}
function resolveConfirm(val){ confirm.value.show = false; confirm.value.resolve?.(val) }
</script>
