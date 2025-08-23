<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-medium">Beneficios del plan</h2>
      <div class="flex gap-2">
        <button @click="openLink" class="bg-apolo-primary text-black px-3 py-2 rounded hover:bg-apolo-secondary">
          + Enlazar beneficio
        </button>
        <button @click="openNew" class="border border-gray-700 bg-gray-800/60 hover:bg-gray-700 px-3 py-2 rounded">
          + Crear beneficio
        </button>
      </div>
    </div>

    <div v-if="loading" class="space-y-2">
      <div class="animate-pulse h-8 bg-gray-800/60 rounded" v-for="i in 4" :key="i"></div>
    </div>

    <ul v-else class="divide-y divide-gray-800/80 text-sm">
      <li v-for="r in rows" :key="r.id" class="py-2 flex items-center justify-between">
        <div>
          <div class="font-medium">{{ r.beneficio_nombre }}</div>
          <div class="text-gray-400 text-xs" v-if="r.vigencia_inicio || r.vigencia_fin">
            Vigencia: {{ r.vigencia_inicio || '—' }} → {{ r.vigencia_fin || '—' }}
          </div>
        </div>
        <button @click="remove(r)" class="px-2 py-1 rounded border border-red-800 bg-red-900/40 hover:bg-red-800">Quitar</button>
      </li>
      <li v-if="!rows.length" class="py-4 text-center text-gray-400">Sin beneficios enlazados</li>
    </ul>

    <!-- Modal enlazar -->
    <div v-if="showLink" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="w-full max-w-md bg-gray-950 border border-gray-800 rounded-2xl shadow-xl p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-lg">Enlazar beneficio</h3>
          <button @click="showLink=false" class="text-gray-400 hover:text-white">✕</button>
        </div>
        <div class="mb-3">
          <input v-model="q" @keyup.enter="search" placeholder="Buscar…" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"/>
        </div>
        <div class="max-h-64 overflow-auto space-y-1">
          <button v-for="b in catalog" :key="b.id" @click="link(b)"
                  class="w-full text-left px-3 py-2 rounded hover:bg-gray-800/60 border border-transparent hover:border-gray-700">
            {{ b.nombre_beneficio }} <span class="text-gray-400 text-xs" v-if="b.descripcion">— {{ b.descripcion }}</span>
          </button>
          <div v-if="!catalog.length" class="text-gray-400 text-sm px-3 py-6 text-center">Sin resultados</div>
        </div>
      </div>
    </div>

    <!-- Modal crear beneficio -->
    <div v-if="showNew" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="w-full max-w-md bg-gray-950 border border-gray-800 rounded-2xl shadow-xl">
        <div class="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
          <h3 class="text-lg">Nuevo beneficio</h3>
          <button @click="showNew=false" class="text-gray-400 hover:text-white">✕</button>
        </div>
        <form @submit.prevent="createBenefit" class="p-4 space-y-3">
          <div>
            <label class="block text-xs text-gray-400 mb-1">Nombre *</label>
            <input v-model="ben.nombre_beneficio" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">Descripción</label>
            <textarea v-model="ben.descripcion" rows="3" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"></textarea>
          </div>
          <div class="grid sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-xs text-gray-400 mb-1">Tipo desc.</label>
              <input v-model="ben.tipo_descuento" placeholder="% / $ / otro" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
            </div>
            <div>
              <label class="block text-xs text-gray-400 mb-1">Valor</label>
              <input v-model="ben.valor" type="number" step="0.01" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
            </div>
            <div>
              <label class="block text-xs text-gray-400 mb-1">Unidad</label>
              <input v-model.number="ben.unidad" type="number" min="0" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
            </div>
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
const ben = ref({ nombre_beneficio:'', descripcion:'', tipo_descuento:'', valor:null, unidad:null })

onMounted(load)

async function load(){
  loading.value = true
  try{
    const { data } = await api.planesBeneficios.list({ plan: props.planId, page_size: 100 })
    rows.value = data?.results || data || []
  } catch { rows.value = [] }
  finally { loading.value = false }
}

function openLink(){ showLink.value = true; q.value=''; catalog.value=[] }
async function search(){
  const { data } = await api.beneficios.list({ search: q.value, page_size: 30 })
  catalog.value = data?.results || data || []
}
async function link(b){
  try{
    await api.planesBeneficios.create({ plan: props.planId, beneficio: b.id })
    ui.toast({ type:'success', title:'Actualizada' })
    showLink.value = false
    await load(); emit('refresh')
  } catch(e){ ui.toast({ type:'error', title:'Ocurrio un error' }) }
}

function openNew(){ showNew.value = true; ben.value = { nombre_beneficio:'', descripcion:'', tipo_descuento:'', valor:null, unidad:null } }
async function createBenefit(){
  try{
    const { data } = await api.beneficios.create({
      nombre_beneficio: ben.value.nombre_beneficio,
      descripcion: ben.value.descripcion,
      tipo_descuento: ben.value.tipo_descuento,
      valor: ben.value.valor,
      unidad: ben.value.unidad
    })
    ui.toast({ type:'success', title:'Beneficio creado' })
    showNew.value = false
    await api.planesBeneficios.create({ plan: props.planId, beneficio: data.id })
    await load(); emit('refresh')
  } catch(e){ ui.toast({ type:'error', title:'No se pudo crear?enlazar' }) }
}

async function remove(r){
  if(!confirm('¿Quitar beneficio del plan?')) return
  try{
    await api.planesBeneficios.delete(r.id)
    ui.toast({ type:'success', title:'Eliminado' })
    await load(); emit('refresh')
  } catch(e){ui.toast({ type:'success', title:'No se pudo eliminar' }) }
}
</script>
