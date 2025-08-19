<template>
  <div class="p-4 text-white">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-light">Planes</h1>
      <button @click="openNew" class="bg-apolo-primary text-black px-4 py-2 rounded hover:bg-apolo-secondary transition">
        + Nuevo
      </button>
    </div>

    <!-- Filtros -->
    <div class="mb-4 flex flex-wrap gap-2">
      <input v-model="q" @keyup.enter="fetch" placeholder="Buscar plan…" class="bg-gray-900 border border-gray-700 rounded px-3 py-2 w-64" />
      <button @click="fetch" class="bg-gray-800 border border-gray-700 px-4 py-2 rounded hover:bg-gray-700">Buscar</button>
      <button @click="resetFilters" class="bg-gray-800 border border-gray-700 px-4 py-2 rounded hover:bg-gray-700">Limpiar</button>
    </div>

    <!-- Grid -->
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <div class="animate-pulse h-24 bg-gray-800/60 rounded-xl" v-for="i in 8" :key="i"></div>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <article
        v-for="p in rows"
        :key="p.id"
        class="rounded-xl border border-gray-800 bg-gray-900/60 p-4 hover:border-apolo-primary/60 transition"
      >
        <div class="flex items-start justify-between gap-3">
          <h3 class="font-medium leading-tight">{{ p.nombre }}</h3>
          <span v-if="p.acceso_multisucursal" class="text-[10px] px-2 py-0.5 rounded-full bg-apolo-primary/20 text-apolo-primary">Multisucursal</span>
        </div>
        <p class="text-gray-300 text-sm mt-1 line-clamp-2">{{ p.descripcion }}</p>
        <p v-if="p.desde || p.hasta" class="text-[11px] text-gray-400 mt-2">Vigencia: {{ formatRange(p.desde, p.hasta) }}</p>

        <div class="mt-3 flex items-center justify-end gap-2">
          <button @click="goManage(p)" class="px-2 py-1 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700">Gestionar</button>
        </div>
      </article>

      <div v-if="!rows.length" class="col-span-full text-center text-gray-400 py-8">Sin planes</div>
    </div>

    <!-- Paginación simple -->
    <div class="mt-4 flex items-center gap-2">
      <button :disabled="page<=1" @click="prev" class="px-3 py-1 rounded bg-gray-800/60 border border-gray-700 disabled:opacity-50">Anterior</button>
      <span class="text-gray-300">Página {{ page }}</span>
      <button :disabled="!hasMore" @click="next" class="px-3 py-1 rounded bg-gray-800/60 border border-gray-700 disabled:opacity-50">Siguiente</button>
      <span v-if="count!==null" class="text-gray-500 text-sm">({{ count }} resultados)</span>
    </div>

    <!-- Modal Crear -->
    <div v-if="showModal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="w-full max-w-xl bg-gray-950 border border-gray-800 rounded-2xl shadow-xl">
        <div class="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
          <h3 class="text-lg">Nuevo plan</h3>
          <button @click="closeModal" class="text-gray-400 hover:text-white">✕</button>
        </div>

        <form @submit.prevent="save" class="p-4 space-y-4">
          <div class="grid sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-400 mb-1">Nombre *</label>
              <input v-model="form.nombre" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
              <p v-if="errors.nombre" class="text-red-400 text-xs mt-1">{{ errors.nombre }}</p>
            </div>
            <div class="flex items-center gap-2 mt-6 sm:mt-0">
              <input id="multi" type="checkbox" v-model="form.acceso_multisucursal" class="h-4 w-4 rounded border-gray-700 bg-gray-900" />
              <label for="multi" class="text-sm text-gray-300">Acceso multisucursal</label>
            </div>
          </div>

          <div>
            <label class="block text-xs text-gray-400 mb-1">Descripción</label>
            <textarea v-model="form.descripcion" rows="3" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"></textarea>
          </div>

          <div class="grid sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-xs text-gray-400 mb-1">Tipo de plan</label>
              <input v-model="form.tipo_plan" placeholder="mensual / sesiones…" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
            </div>
            <div class="flex items-center gap-2">
              <input id="preventa" type="checkbox" v-model="form.preventa" class="h-4 w-4 rounded border-gray-700 bg-gray-900" />
              <label for="preventa" class="text-sm text-gray-300">Preventa</label>
            </div>
            <div>
              <label class="block text-xs text-gray-400 mb-1">Visitas gratis</label>
              <input v-model.number="form.visitas_gratis" type="number" min="0" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
            </div>
          </div>

          <div class="grid sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-400 mb-1">Desde (YYYY-MM-DD)</label>
              <input v-model="form.desde" type="date" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
            </div>
            <div>
              <label class="block text-xs text-gray-400 mb-1">Hasta (YYYY-MM-DD)</label>
              <input v-model="form.hasta" type="date" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-1">
            <button type="button" @click="closeModal" class="px-4 py-2 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700">Cancelar</button>
            <button type="submit" :disabled="saving" class="px-4 py-2 rounded bg-apolo-primary text-black hover:bg-apolo-secondary disabled:opacity-60">
              {{ saving ? 'Guardando…' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/services'
import { useUiStore } from '@/stores/ui'
import { useWorkspaceStore } from '@/stores/workspace'

const ui = useUiStore()
const ws = useWorkspaceStore()
const router = useRouter()

// listado
const loading = ref(true)
const rows = ref([])
const page = ref(1)
const pageSize = 12
const count = ref(null)
const q = ref('')

const hasMore = computed(() => count.value === null ? rows.value.length === pageSize : count.value > page.value * pageSize)

onMounted(fetch)

async function fetch(){
  loading.value = true
  try{
    const params = { page: page.value, page_size: pageSize, ordering: '-id', search: q.value }
    const { data } = await api.planes.list(params)
    rows.value = data?.results || data || []
    count.value = data?.count ?? null
  } catch (e) {
    ui.toast({ type:'error', title:'No se pudo cargar', message: e.response?.data?.detail || 'Error' })
  } finally {
    loading.value = false
  }
}
function resetFilters(){ q.value=''; page.value=1; fetch() }
function next(){ if(hasMore.value){ page.value++; fetch() } }
function prev(){ if(page.value>1){ page.value--; fetch() } }

function formatDate(d){ try{ return new Date(d).toLocaleDateString('es-MX') }catch{ return d||'—' } }
function formatRange(a,b){
  const fa = a ? formatDate(a) : '—'
  const fb = b ? formatDate(b) : '—'
  if(!a && !b) return '—'
  return `${fa} → ${fb}`
}

// modal/form
const showModal = ref(false)
const saving = ref(false)
const errors = ref({})
const form = ref({
  nombre: '',
  descripcion: '',
  acceso_multisucursal: false,
  tipo_plan: '',
  preventa: false,
  desde: '',
  hasta: '',
  visitas_gratis: 0,
})

function openNew(){
  errors.value = {}
  form.value = { nombre:'', descripcion:'', acceso_multisucursal:false, tipo_plan:'', preventa:false, desde:'', hasta:'', visitas_gratis:0 }
  showModal.value = true
}
function closeModal(){ showModal.value = false }

function validate(){
  const e = {}
  if(!form.value.nombre?.trim()) e.nombre = 'El nombre es obligatorio'
  errors.value = e
  return Object.keys(e).length === 0
}

async function save(){
  if(!validate()) return
  if(!ws.empresaId) {
    ui.toast({ type:'error', title:'Falta empresa activa', message:'Vuelve a iniciar sesión o verifica el header X-Empresa-Id.' })
    return
  }
  saving.value = true
  try{
    const payload = {
      empresa: ws.empresaId,
      nombre: form.value.nombre.trim(),
      descripcion: form.value.descripcion?.trim() || '',
      acceso_multisucursal: !!form.value.acceso_multisucursal,
      tipo_plan: form.value.tipo_plan?.trim() || '',
      preventa: !!form.value.preventa,
      desde: form.value.desde || null,
      hasta: form.value.hasta || null,
      visitas_gratis: Number(form.value.visitas_gratis || 0),
    }
    const { data } = await api.planes.create(payload)
    ui.toast({ type:'success', title:'Plan creado', message:`${data?.nombre || 'Plan'} listo para gestionar` })
    closeModal()
    await fetch()
    // Ir directo a gestionar:
    if (data?.id) router.push({ name:'PlanDetalle', params:{ id: data.id } })
  } catch(e){
    ui.toast({ type:'error', title:'Error al guardar', message: e.response?.data?.detail || 'Revisa los campos' })
  } finally {
    saving.value = false
  }
}

function goManage(p){
  router.push({ name:'PlanDetalle', params:{ id: p.id } })
}
</script>
