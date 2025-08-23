<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-medium">Servicios del plan</h2>
      <div class="flex gap-2">
        <button @click="openLink" class="bg-apolo-primary text-black px-3 py-2 rounded hover:bg-apolo-secondary">
          + Enlazar servicio
        </button>
        <button @click="openNew" class="border border-gray-700 bg-gray-800/60 hover:bg-gray-700 px-3 py-2 rounded">
          + Crear servicio
        </button>
      </div>
    </div>

    <div v-if="loading" class="space-y-2">
      <div class="animate-pulse h-8 bg-gray-800/60 rounded" v-for="i in 4" :key="i"></div>
    </div>

    <ul v-else class="divide-y divide-gray-800/80 text-sm">
      <li v-for="r in rows" :key="r.id" class="py-2 flex items-center justify-between">
        <div>
          <div class="font-medium">{{ r.servicio_nombre }}</div>
          <div class="text-gray-400 text-xs" v-if="r.precio">Precio: ${{ Number(r.precio).toFixed(2) }}</div>
        </div>
        <button @click="remove(r)" class="px-2 py-1 rounded border border-red-800 bg-red-900/40 hover:bg-red-800">Quitar</button>
      </li>
      <li v-if="!rows.length" class="py-4 text-center text-gray-400">Sin servicios enlazados</li>
    </ul>

    <!-- Modal: enlazar existente -->
    <div v-if="showLink" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="w-full max-w-md bg-gray-950 border border-gray-800 rounded-2xl shadow-xl p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-lg">Enlazar servicio</h3>
          <button @click="showLink=false" class="text-gray-400 hover:text-white">✕</button>
        </div>
        <div class="mb-3">
          <input v-model="q" @keyup.enter="search" placeholder="Buscar…" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"/>
        </div>
        <div class="max-h-64 overflow-auto space-y-1">
          <button v-for="s in catalog" :key="s.id" @click="link(s)"
                  class="w-full text-left px-3 py-2 rounded hover:bg-gray-800/60 border border-transparent hover:border-gray-700">
            {{ s.nombre }} <span class="text-gray-400 text-xs" v-if="s.descripcion">— {{ s.descripcion }}</span>
          </button>
          <div v-if="!catalog.length" class="text-gray-400 text-sm px-3 py-6 text-center">Sin resultados</div>
        </div>
      </div>
    </div>

    <!-- Modal: crear servicio -->
    <div v-if="showNew" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="w-full max-w-md bg-gray-950 border border-gray-800 rounded-2xl shadow-xl">
        <div class="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
          <h3 class="text-lg">Nuevo servicio</h3>
          <button @click="showNew=false" class="text-gray-400 hover:text-white">✕</button>
        </div>
        <form @submit.prevent="createService" class="p-4 space-y-3">
          <div>
            <label class="block text-xs text-gray-400 mb-1">Nombre *</label>
            <input v-model="svc.nombre" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">Descripción</label>
            <textarea v-model="svc.descripcion" rows="3" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"></textarea>
          </div>
          <div class="flex items-center justify-end gap-2 pt-1">
            <button type="button" @click="showNew=false" class="px-4 py-2 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700">Cancelar</button>
            <button type="submit" class="px-4 py-2 rounded bg-apolo-primary text-black hover:bg-apolo-secondary">Crear</button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/services'
import { useUiStore } from '@/stores/ui'
const props = defineProps({ planId: { type: Number, required: true }, plan: Object })
const emit = defineEmits(['refresh'])
const ui = useUiStore()
const rows = ref([])
const loading = ref(true)

const showLink = ref(false)
const q = ref('')
const catalog = ref([])

const showNew = ref(false)
const svc = ref({ nombre: '', descripcion: '' })

onMounted(load)

async function load(){
  loading.value = true
  try{
    const { data } = await api.planesServicios.list({ plan: props.planId, page_size: 100 })
    rows.value = data?.results || data || []
  } catch { rows.value = [] }
  finally { loading.value = false }
}

function openLink(){ showLink.value = true; q.value = ''; catalog.value = [] }
async function search(){
  const { data } = await api.servicios.list({ search: q.value, page_size: 30 })
  catalog.value = data?.results || data || []
}
async function link(s){
  try{
    await api.planesServicios.create({ plan: props.planId, servicio: s.id })
    ui.toast({ type:'success', title:'Enlazado' })
    showLink.value = false
    await load()
    emit('refresh')
  } catch(e){
    ui.toast({ type:'error', title:'No se pudo enlazar' })
  }
}

function openNew(){ showNew.value = true; svc.value = { nombre:'', descripcion:'' } }
async function createService(){
  try{
    const { data } = await api.servicios.create({ nombre: svc.value.nombre, descripcion: svc.value.descripcion })
    ui.toast({ type:'success', title:'Servicio creado' })
    showNew.value = false
    // auto-enlazar
    await api.planesServicios.create({ plan: props.planId, servicio: data.id })
    await load()
    emit('refresh')
  } catch(e){
    ui.toast({ type:'error', title:'No se pudo crear/enlazar' })
  }
}

async function remove(r){
  if(!confirm('¿Quitar servicio del plan?')) return
  try{
    await api.planesServicios.delete(r.id)
    ui.toast({ type:'success', title:'Eliminado' })
    await load()
    emit('refresh')
  } catch(e){
    ui.toast({ type:'error', title:'No se pudo eliminar' })
  }
}
</script>
