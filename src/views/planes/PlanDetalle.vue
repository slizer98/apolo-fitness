<template>
  <div class="p-4 text-white max-w-6xl mx-auto">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h1 class="text-2xl font-light">Plan: {{ plan?.nombre || '—' }}</h1>
        <p class="text-sm text-gray-400" v-if="plan">
          Tipo: <span class="text-gray-300">{{ plan.tipo_plan || '—' }}</span>
          <span class="mx-2">•</span>
          Empresa: <span class="text-gray-300">{{ ws.empresaNombre || ws.empresaId }}</span>
        </p>
      </div>
      <div class="flex gap-2">
        <router-link :to="{ name:'PlanesLista' }" class="px-4 py-2 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700">Volver</router-link>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-2 mb-4">
      <button
        v-for="t in TABS" :key="t.key"
        @click="activeTab = t.key"
        class="px-3 py-1.5 rounded-xl border text-sm"
        :class="activeTab===t.key ? 'border-apolo-primary text-white bg-gray-900/60' : 'border-gray-800 text-gray-300 bg-gray-900/30 hover:bg-gray-900/50'">
        {{ t.label }}
      </button>
    </div>

    <div class="rounded-2xl border border-gray-800 bg-gray-950/60 p-4">
      <!-- RESUMEN -->
      <section v-if="activeTab==='resumen'" class="space-y-3">
        <div class="grid sm:grid-cols-2 gap-4">
          <div class="p-3 rounded-xl border border-gray-800 bg-gray-900/40">
            <h3 class="text-sm text-gray-400 mb-2">Básicos</h3>
            <ul class="text-sm text-gray-300 space-y-1">
              <li><span class="text-gray-400">Nombre:</span> {{ plan?.nombre || '—' }}</li>
              <li><span class="text-gray-400">Tipo de plan:</span> {{ plan?.tipo_plan || '—' }}</li>
              <li><span class="text-gray-400">Preventa:</span> {{ plan?.preventa ? 'Sí' : 'No' }}</li>
              <li><span class="text-gray-400">Visitas gratis:</span> {{ plan?.visitas_gratis ?? 0 }}</li>
              <li><span class="text-gray-400">Vigencia:</span> {{ formatRange(plan?.desde, plan?.hasta) }}</li>
              <li><span class="text-gray-400">Multisucursal:</span> {{ plan?.acceso_multisucursal ? 'Sí' : 'No' }}</li>
            </ul>
          </div>

          <div class="p-3 rounded-xl border border-gray-800 bg-gray-900/40">
            <h3 class="text-sm text-gray-400 mb-2">Descripción</h3>
            <p class="text-sm text-gray-300 whitespace-pre-line">{{ plan?.descripcion || '—' }}</p>
          </div>
        </div>
      </section>

      <!-- PRECIOS -->
      <section v-else-if="activeTab==='precios'" class="space-y-5">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-light">Esquemas de precio</h3>
          <button @click="addPrecio" class="px-3 py-1.5 rounded border border-gray-700 bg-gray-900/60 hover:bg-gray-800">+ Agregar</button>
        </div>

        <div v-if="preciosLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div class="animate-pulse h-20 bg-gray-800/60 rounded-xl" v-for="i in 6" :key="'skp'+i"></div>
        </div>

        <div v-else>
          <div v-if="!precios.length" class="text-gray-400 text-sm mb-2">Aún no has agregado precios.</div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <article v-for="pr in precios" :key="pr.id" class="rounded-xl border border-gray-800 bg-gray-900/40 p-3">
              <div class="flex items-center justify-between gap-3">
                <h4 class="font-medium leading-tight">{{ pr.esquema }} · {{ pr.tipo }}</h4>
                <button @click="removePrecio(pr)" class="text-red-300 hover:text-red-200 text-sm">Eliminar</button>
              </div>
              <p class="text-gray-300 text-sm mt-1">
                <span class="text-gray-400">Precio:</span> {{ formatMoney(pr.precio) }}
                <span v-if="pr.numero_visitas" class="ml-2 text-gray-400">· Visitas:</span>
                <span v-if="pr.numero_visitas">{{ pr.numero_visitas }}</span>
              </p>
            </article>
          </div>
        </div>

        <!-- Form inline para nuevo precio -->
        <div v-if="showPrecioForm" class="mt-4 p-3 rounded-xl border border-gray-800 bg-gray-900/40">
          <form @submit.prevent="savePrecio" class="grid sm:grid-cols-4 gap-3">
            <div>
              <label class="block text-xs text-gray-400 mb-1">Esquema *</label>
              <input v-model="precioForm.esquema" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
              <p v-if="errors.precio.esquema" class="text-red-400 text-xs mt-1">{{ errors.precio.esquema }}</p>
            </div>
            <div>
              <label class="block text-xs text-gray-400 mb-1">Tipo *</label>
              <input v-model="precioForm.tipo" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
              <p v-if="errors.precio.tipo" class="text-red-400 text-xs mt-1">{{ errors.precio.tipo }}</p>
            </div>
            <div>
              <label class="block text-xs text-gray-400 mb-1">Precio *</label>
              <input v-model.number="precioForm.precio" type="number" step="0.01" min="0" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
              <p v-if="errors.precio.precio" class="text-red-400 text-xs mt-1">{{ errors.precio.precio }}</p>
            </div>
            <div>
              <label class="block text-xs text-gray-400 mb-1"># Visitas (opcional)</label>
              <input v-model.number="precioForm.numero_visitas" type="number" min="0" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
            </div>

            <div class="sm:col-span-4 flex items-center justify-end gap-2">
              <button type="button" @click="cancelPrecioForm" class="px-4 py-2 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700">Cancelar</button>
              <button type="submit" :disabled="savingPrecio" class="px-4 py-2 rounded bg-apolo-primary text-black hover:bg-apolo-secondary disabled:opacity-60">
                {{ savingPrecio ? 'Guardando…' : 'Agregar precio' }}
              </button>
            </div>
          </form>
        </div>
      </section>

      <!-- RESTRICCIONES -->
      <section v-else-if="activeTab==='restricciones'" class="space-y-5">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-light">Restricciones por día</h3>
          <button @click="addRestriccion" class="px-3 py-1.5 rounded border border-gray-700 bg-gray-900/60 hover:bg-gray-800">+ Agregar</button>
        </div>

        <div v-if="restrLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div class="animate-pulse h-20 bg-gray-800/60 rounded-xl" v-for="i in 6" :key="'skr'+i"></div>
        </div>

        <div v-else>
          <div v-if="!restricciones.length" class="text-gray-400 text-sm mb-2">Aún no has agregado restricciones.</div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <article v-for="r in restricciones" :key="r.id" class="rounded-xl border border-gray-800 bg-gray-900/40 p-3">
              <div class="flex items-center justify-between gap-3">
                <h4 class="font-medium leading-tight">{{ r.dia }} · {{ r.hora_inicio }} → {{ r.hora_fin }}</h4>
                <button @click="removeRestriccion(r)" class="text-red-300 hover:text-red-200 text-sm">Eliminar</button>
              </div>
            </article>
          </div>
        </div>

        <!-- Form inline para nueva restricción -->
        <div v-if="showRestrForm" class="mt-4 p-3 rounded-xl border border-gray-800 bg-gray-900/40">
          <form @submit.prevent="saveRestriccion" class="grid sm:grid-cols-4 gap-3">
            <div>
              <label class="block text-xs text-gray-400 mb-1">Día *</label>
              <select v-model="restrForm.dia" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2">
                <option v-for="d in DOW_LBL" :key="d" :value="d">{{ d }}</option>
              </select>
              <p v-if="errors.restr.dia" class="text-red-400 text-xs mt-1">{{ errors.restr.dia }}</p>
            </div>
            <div>
              <label class="block text-xs text-gray-400 mb-1">Hora inicio *</label>
              <input v-model="restrForm.hora_inicio" placeholder="06:00" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
              <p v-if="errors.restr.hora_inicio" class="text-red-400 text-xs mt-1">{{ errors.restr.hora_inicio }}</p>
            </div>
            <div>
              <label class="block text-xs text-gray-400 mb-1">Hora fin *</label>
              <input v-model="restrForm.hora_fin" placeholder="22:00" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
              <p v-if="errors.restr.hora_fin" class="text-red-400 text-xs mt-1">{{ errors.restr.hora_fin }}</p>
            </div>

            <div class="sm:col-span-4 flex items-center justify-end gap-2">
              <button type="button" @click="cancelRestrForm" class="px-4 py-2 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700">Cancelar</button>
              <button type="submit" :disabled="savingRestr" class="px-4 py-2 rounded bg-apolo-primary text-black hover:bg-apolo-secondary disabled:opacity-60">
                {{ savingRestr ? 'Guardando…' : 'Agregar restricción' }}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api/services'
import { useWorkspaceStore } from '@/stores/workspace'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const ws = useWorkspaceStore()
const auth = useAuthStore()

const planId = Number(route.params.id)
const plan = ref(null)

const TABS = [
  { key:'resumen',       label:'Resumen' },
  { key:'precios',       label:'Precios' },
  { key:'restricciones', label:'Restricciones' },
]
const activeTab = ref('resumen')

// Helpers
const DOW_LBL = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo']
function hhmmToHMS(v){ if(!v) return ''; return v.length===5 ? (v+':00') : v } // 06:00 -> 06:00:00
function formatDate(d){ try{ return new Date(d).toLocaleDateString('es-MX') }catch{ return d||'—' } }
function formatRange(a,b){ const fa=a?formatDate(a):'—', fb=b?formatDate(b):'—'; return (!a&&!b)?'—':`${fa} → ${fb}` }
function formatMoney(n){ try{ return new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN'}).format(n) }catch{ return n } }
function getUserId(){ return auth.user?.id || auth.tokenInfo?.user_id || null }

// ======== PRECIOS ========
const precios = ref([])
const preciosLoading = ref(false)
const showPrecioForm = ref(false)
const savingPrecio = ref(false)
const precioForm = reactive({ esquema:'', tipo:'', precio:null, numero_visitas:null })

async function fetchPrecios(){
  preciosLoading.value = true
  try{
    const { data } = await api.planes.precios.list({ plan: planId })
    precios.value = Array.isArray(data?.results) ? data.results : (data || [])
  } finally { preciosLoading.value = false }
}
function addPrecio(){ showPrecioForm.value = true }
function cancelPrecioForm(){ showPrecioForm.value = false; Object.assign(precioForm,{ esquema:'', tipo:'', precio:null, numero_visitas:null }) }
function validatePrecio(){
  const e = {}
  if(!precioForm.esquema?.trim()) e.esquema = 'Requerido'
  if(!precioForm.tipo?.trim()) e.tipo = 'Requerido'
  if(precioForm.precio == null || Number(precioForm.precio) <= 0) e.precio = 'Debe ser > 0'
  errors.value.precio = e
  return !Object.keys(e).length
}
async function savePrecio(){
  if(!validatePrecio()) return
  savingPrecio.value = true
  try{
    await api.planes.precios.create({
      plan: planId,
      esquema: precioForm.esquema.trim(),
      tipo: precioForm.tipo.trim(),
      precio: Number(precioForm.precio),
      numero_visitas: precioForm.numero_visitas != null ? Number(precioForm.numero_visitas) : null,
      usuario: getUserId(),
    })
    cancelPrecioForm()
    await fetchPrecios()
  } catch(e){ alert(e?.response?.data?.detail || 'Error al guardar precio') }
  finally{ savingPrecio.value = false }
}
async function removePrecio(row){
  if(!confirm('¿Eliminar este precio?')) return
  try{ await api.planes.precios.delete(row.id); await fetchPrecios() }
  catch(e){ alert(e?.response?.data?.detail || 'No se pudo eliminar') }
}

// ======== RESTRICCIONES ========
const restricciones = ref([])
const restrLoading = ref(false)
const showRestrForm = ref(false)
const savingRestr = ref(false)
const restrForm = reactive({ dia:'Lunes', hora_inicio:'', hora_fin:'' })

async function fetchRestricciones(){
  restrLoading.value = true
  try{
    const { data } = await api.planes.restricciones.list({ plan: planId })
    restricciones.value = Array.isArray(data?.results) ? data.results : (data || [])
  } finally { restrLoading.value = false }
}
function addRestriccion(){ showRestrForm.value = true }
function cancelRestrForm(){ showRestrForm.value = false; Object.assign(restrForm,{ dia:'Lunes', hora_inicio:'', hora_fin:'' }) }
function validateRestr(){
  const e = {}
  if(!restrForm.dia) e.dia = 'Requerido'
  if(!/^\d{2}:\d{2}$/.test(restrForm.hora_inicio)) e.hora_inicio = 'HH:MM'
  if(!/^\d{2}:\d{2}$/.test(restrForm.hora_fin)) e.hora_fin = 'HH:MM'
  if(/^\d{2}:\d{2}$/.test(restrForm.hora_inicio) && /^\d{2}:\d{2}$/.test(restrForm.hora_fin) && restrForm.hora_inicio >= restrForm.hora_fin) {
    e.hora_fin = 'Fin > Inicio'
  }
  errors.value.restr = e
  return !Object.keys(e).length
}
async function saveRestriccion(){
  if(!validateRestr()) return
  savingRestr.value = true
  try{
    await api.planes.restricciones.create({
      plan: planId,
      dia: restrForm.dia, // tu API usa string p.ej. "Lunes"
      hora_inicio: hhmmToHMS(restrForm.hora_inicio),
      hora_fin: hhmmToHMS(restrForm.hora_fin),
      usuario: getUserId(),
    })
    cancelRestrForm()
    await fetchRestricciones()
  } catch(e){ alert(e?.response?.data?.detail || 'Error al guardar restricción') }
  finally{ savingRestr.value = false }
}
async function removeRestriccion(row){
  if(!confirm('¿Eliminar esta restricción?')) return
  try{ await api.planes.restricciones.delete(row.id); await fetchRestricciones() }
  catch(e){ alert(e?.response?.data?.detail || 'No se pudo eliminar') }
}

// ======== INIT ========
const errors = ref({ precio:{}, restr:{} })
onMounted(async () => {
  const { data } = await api.planes.retrieve(planId)
  plan.value = data
  await Promise.all([ fetchPrecios(), fetchRestricciones() ])
})
</script>

<style scoped>
/* opcional */
</style>
