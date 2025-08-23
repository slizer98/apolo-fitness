<template>
  <div class="p-4 text-white">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-light">Membresías</h1>
      <router-link :to="{ name:'MembresiaCrear' }" class="bg-apolo-primary text-black px-4 py-2 rounded hover:bg-apolo-secondary transition">
        + Nueva
      </router-link>
    </div>

    <!-- Filtros -->
    <div class="mb-4 flex flex-wrap gap-2">
      <input v-model="q" @keyup.enter="fetch" placeholder="Buscar por cliente/plan…" class="bg-gray-900 border border-gray-700 rounded px-3 py-2 w-72" />
      <input v-model="fecha" @change="fetch" type="date" class="bg-gray-900 border border-gray-700 rounded px-3 py-2" />
      <button @click="fetch" class="bg-gray-800 border border-gray-700 px-4 py-2 rounded hover:bg-gray-700">Buscar</button>
      <button @click="resetFilters" class="bg-gray-800 border border-gray-700 px-4 py-2 rounded hover:bg-gray-700">Limpiar</button>
    </div>

    <!-- Grid -->
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <div class="animate-pulse h-24 bg-gray-800/60 rounded-xl" v-for="i in 6" :key="i"></div>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <article v-for="r in rows" :key="r.id" class="rounded-xl border border-gray-800 bg-gray-900/60 p-4 hover:border-apolo-primary/60 transition">
        <div class="flex items-start justify-between gap-3">
          <div>
            <div class="font-medium">{{ r.cliente_nombre || ('Cliente #' + r.cliente) }}</div>
            <div class="text-gray-300 text-sm">{{ r.plan_nombre || ('Plan #' + r.plan) }}</div>
            <div class="text-[11px] text-gray-400 mt-1">Vigencia: {{ fmtRange(r.fecha_alta, r.fecha_vencimiento) }}</div>
            <div class="text-[11px] text-gray-400">Sucursal: {{ r.sucursal_nombre || r.sucursal }}</div>
          </div>
          <button @click="remove(r)" class="px-2 py-1 rounded border border-red-800 bg-red-900/40 hover:bg-red-800 text-sm">Eliminar</button>
        </div>
        <div class="mt-2 text-[11px]">
          Renovación: <span :class="r.renovacion ? 'text-green-400' : 'text-gray-400'">{{ r.renovacion ? 'Sí' : 'No' }}</span>
        </div>
      </article>

      <div v-if="!rows.length" class="col-span-full text-center text-gray-400 py-8">Sin membresías</div>
    </div>

    <!-- Paginación simple -->
    <div class="mt-4 flex items-center gap-2">
      <button :disabled="page<=1" @click="prev" class="px-3 py-1 rounded bg-gray-800/60 border border-gray-700 disabled:opacity-50">Anterior</button>
      <span class="text-gray-300">Página {{ page }}</span>
      <button :disabled="!hasMore" @click="next" class="px-3 py-1 rounded bg-gray-800/60 border border-gray-700 disabled:opacity-50">Siguiente</button>
      <span v-if="count!==null" class="text-gray-500 text-sm">({{ count }} resultados)</span>
    </div>

    <!-- Confirm modal -->
    <div v-if="confirm.show" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div class="w-full max-w-sm bg-gray-950 border border-gray-800 rounded-2xl shadow-xl p-4">
        <h3 class="text-lg mb-2">{{ confirm.title }}</h3>
        <p class="text-gray-300 text-sm">{{ confirm.message }}</p>
        <div class="mt-4 flex items-center justify-end gap-2">
          <button @click="resolveConfirm(false)" class="px-3 py-1.5 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700">Cancelar</button>
          <button @click="resolveConfirm(true)" class="px-3 py-1.5 rounded bg-red-500/90 hover:bg-red-500 text-black">Confirmar</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/api/services'
import { useUiStore } from '@/stores/ui'

const ui = useUiStore()

const loading = ref(true)
const rows = ref([])
const page = ref(1)
const pageSize = 12
const count = ref(null)
const q = ref('')
const fecha = ref('')

const hasMore = computed(() => count.value === null ? rows.value.length === pageSize : count.value > page.value * pageSize)

onMounted(fetch)

async function fetch(){
  loading.value = true
  try{
    const params = { page: page.value, page_size: pageSize, ordering: '-id' }
    if(q.value) params.search = q.value
    if(fecha.value) params.fecha = fecha.value
    const { data } = await api.altasPlan.list(params)
    rows.value = data?.results || data || []
    count.value = data?.count ?? null
  } finally {
    loading.value = false
  }
}
function resetFilters(){ q.value=''; fecha.value=''; page.value=1; fetch() }
function next(){ if(hasMore.value){ page.value++; fetch() } }
function prev(){ if(page.value>1){ page.value--; fetch() } }

function fmtDate(d){ try{ return new Date(d).toLocaleDateString('es-MX') }catch{ return d||'—' } }
function fmtRange(a,b){ const fa = a?fmtDate(a):'—', fb = b?fmtDate(b):'—'; return (a||b)? `${fa} → ${fb}` : '—' }

/* confirm modal */
const confirm = ref({ show:false, title:'Confirmar acción', message:'', resolve:null })
function askConfirm(message, title='Confirmar acción'){
  confirm.value.title = title
  confirm.value.message = message
  confirm.value.show = true
  return new Promise(res => { confirm.value.resolve = res })
}
function resolveConfirm(val){ confirm.value.show = false; confirm.value.resolve?.(val) }

async function remove(r){
  if(!(await askConfirm(`Eliminar la membresía de ${r.cliente_nombre || 'cliente'} para el plan ${r.plan_nombre || r.plan}?`))) return
  try{
    await api.altasPlan.delete(r.id)
    if(rows.value.length === 1 && page.value > 1){ page.value -= 1 }
    await fetch()
    ui.toast({ type:'success', title:'Membresía eliminada' })
  } catch(e){
    ui.toast({ type:'error', title:'No se pudo eliminar', message:e.response?.data?.detail || 'Error' })
  }
}
</script>
