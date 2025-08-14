<template>
  <div class="p-4 text-white max-w-6xl mx-auto">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-light">Nuevo plan</h1>
      <div class="flex gap-2">
        <button @click="cancel" class="px-4 py-2 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700">Cancelar</button>
        <button @click="saveAll" :disabled="saving" class="px-4 py-2 rounded bg-apolo-primary text-black hover:bg-apolo-secondary disabled:opacity-60">
          {{ saving ? 'Guardando…' : 'Guardar' }}
        </button>
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
      <!-- BASICOS -->
      <section v-if="activeTab==='basicos'" class="space-y-4">
        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs text-gray-400 mb-1">Nombre *</label>
            <input v-model="plan.nombre" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
            <p v-if="errors.plan.nombre" class="text-red-400 text-xs mt-1">{{ errors.plan.nombre }}</p>
          </div>
          <div class="flex items-center gap-2 mt-6 sm:mt-0">
            <input id="multi" type="checkbox" v-model="plan.acceso_multisucursal" class="h-4 w-4 rounded border-gray-700 bg-gray-900" />
            <label for="multi" class="text-sm text-gray-300">Acceso multisucursal</label>
          </div>
        </div>

        <div class="grid sm:grid-cols-3 gap-3">
          <div>
            <label class="block text-xs text-gray-400 mb-1">Tipo de plan *</label>
            <select v-model="plan.tipo_plan" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2">
              <option disabled value="">Selecciona…</option>
              <option v-for="opt in TIPO_PLAN_OPTS" :key="opt" :value="opt">{{ opt }}</option>
            </select>
            <p v-if="errors.plan.tipo_plan" class="text-red-400 text-xs mt-1">{{ errors.plan.tipo_plan }}</p>
          </div>

          <div class="flex items-center gap-2">
            <input id="preventa" type="checkbox" v-model="plan.preventa" class="h-4 w-4 rounded border-gray-700 bg-gray-900" />
            <label for="preventa" class="text-sm text-gray-300">Preventa</label>
          </div>

          <div>
            <label class="block text-xs text-gray-400 mb-1">Visitas gratis</label>
            <input type="number" min="0" v-model.number="plan.visitas_gratis" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
          </div>
        </div>

        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs text-gray-400 mb-1">Desde (YYYY-MM-DD)</label>
            <input v-model="plan.desde" placeholder="2025-01-01" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
            <p v-if="errors.plan.desde" class="text-red-400 text-xs mt-1">{{ errors.plan.desde }}</p>
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">Hasta (YYYY-MM-DD)</label>
            <input v-model="plan.hasta" placeholder="2025-12-31" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
            <p v-if="errors.plan.hasta" class="text-red-400 text-xs mt-1">{{ errors.plan.hasta }}</p>
          </div>
        </div>

        <div>
          <label class="block text-xs text-gray-400 mb-1">Descripción</label>
          <textarea v-model="plan.descripcion" rows="3" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"></textarea>
        </div>

        <p v-if="empresaWarning" class="text-yellow-400 text-sm">{{ empresaWarning }}</p>
      </section>

      <!-- PRECIOS -->
      <section v-else-if="activeTab==='precios'" class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-light">Esquemas de precio</h3>
          <button @click="addPrecio" class="px-3 py-1.5 rounded border border-gray-700 bg-gray-900/60 hover:bg-gray-800">+ Agregar</button>
        </div>

        <div v-if="!precios.length" class="text-gray-400 text-sm">Aún no has agregado precios.</div>

        <div v-for="(p,i) in precios" :key="p._key" class="p-3 rounded-xl border border-gray-800 bg-gray-900/40 space-y-3">
          <div class="grid sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-xs text-gray-400 mb-1">Esquema *</label>
              <input v-model="p.esquema" placeholder="Mensual / Anual / Paquete…" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
              <p v-if="errors.precios[i]?.esquema" class="text-red-400 text-xs mt-1">{{ errors.precios[i].esquema }}</p>
            </div>
            <div>
              <label class="block text-xs text-gray-400 mb-1">Tipo *</label>
              <input v-model="p.tipo" placeholder="ilimitado / paquete / visitas…" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
              <p v-if="errors.precios[i]?.tipo" class="text-red-400 text-xs mt-1">{{ errors.precios[i].tipo }}</p>
            </div>
            <div>
              <label class="block text-xs text-gray-400 mb-1">Precio *</label>
              <input v-model.number="p.precio" type="number" step="0.01" min="0" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
              <p v-if="errors.precios[i]?.precio" class="text-red-400 text-xs mt-1">{{ errors.precios[i].precio }}</p>
            </div>
          </div>

          <div class="grid sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-xs text-gray-400 mb-1"># Visitas (opcional)</label>
              <input v-model.number="p.numero_visitas" type="number" min="1" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
              <p v-if="errors.precios[i]?.numero_visitas" class="text-red-400 text-xs mt-1">{{ errors.precios[i].numero_visitas }}</p>
            </div>
            <div class="sm:col-span-2 flex items-end justify-end">
              <button @click="removePrecio(i)" class="px-3 py-2 rounded border border-red-800 bg-red-900/40 hover:bg-red-800">Quitar</button>
            </div>
          </div>
        </div>
      </section>

      <!-- RESTRICCIONES -->
      <section v-else-if="activeTab==='restricciones'" class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-light">Restricciones por día</h3>
          <button @click="addRestriccion" class="px-3 py-1.5 rounded border border-gray-700 bg-gray-900/60 hover:bg-gray-800">+ Agregar</button>
        </div>

        <div v-if="!restricciones.length" class="text-gray-400 text-sm">Aún no has agregado restricciones.</div>

        <div v-for="(r,i) in restricciones" :key="r._key" class="p-3 rounded-xl border border-gray-800 bg-gray-900/40 space-y-3">
          <div class="grid sm:grid-cols-4 gap-3">
            <div>
              <label class="block text-xs text-gray-400 mb-1">Día *</label>
              <select v-model.number="r.dia" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2">
                <option v-for="d in DOW_OPTIONS" :key="d.value" :value="d.value">{{ d.label }}</option>
              </select>
              <p v-if="errors.restricciones[i]?.dia" class="text-red-400 text-xs mt-1">{{ errors.restricciones[i].dia }}</p>
            </div>
            <div>
              <label class="block text-xs text-gray-400 mb-1">Hora inicio *</label>
              <input v-model="r.hora_inicio" placeholder="06:00" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
              <p v-if="errors.restricciones[i]?.hora_inicio" class="text-red-400 text-xs mt-1">{{ errors.restricciones[i].hora_inicio }}</p>
            </div>
            <div>
              <label class="block text-xs text-gray-400 mb-1">Hora fin *</label>
              <input v-model="r.hora_fin" placeholder="22:00" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
              <p v-if="errors.restricciones[i]?.hora_fin" class="text-red-400 text-xs mt-1">{{ errors.restricciones[i].hora_fin }}</p>
            </div>
            <div class="flex items-end justify-end">
              <button @click="removeRestriccion(i)" class="px-3 py-2 rounded border border-red-800 bg-red-900/40 hover:bg-red-800">Quitar</button>
            </div>
          </div>
        </div>
      </section>
    </div>

    <div class="flex items-center justify-end gap-2 mt-4">
      <button @click="cancel" class="px-4 py-2 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700">Cancelar</button>
      <button @click="saveAll" :disabled="saving" class="px-4 py-2 rounded bg-apolo-primary text-black hover:bg-apolo-secondary disabled:opacity-60">
        {{ saving ? 'Guardando…' : 'Guardar' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/services'
import { useWorkspaceStore } from '@/stores/workspace'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const ws = useWorkspaceStore()
const auth = useAuthStore()

// Tabs
const TABS = [
  { key:'basicos',       label:'Básicos' },
  { key:'precios',       label:'Precios' },
  { key:'restricciones', label:'Restricciones' },
]
const activeTab = ref('basicos')

// Catálogo (ajusta a tu backend si hay choices)
const TIPO_PLAN_OPTS = ['mensual','semanal','anual','por_visitas']

// Día de semana (ajusta si tu backend espera 1..7; ahora va 0..6)
const DOW_OPTIONS = [
  { value: 0, label: 'Lunes' },
  { value: 1, label: 'Martes' },
  { value: 2, label: 'Miércoles' },
  { value: 3, label: 'Jueves' },
  { value: 4, label: 'Viernes' },
  { value: 5, label: 'Sábado' },
  { value: 6, label: 'Domingo' },
]

// Form estado
const plan = reactive({
  nombre: '',
  descripcion: '',
  acceso_multisucursal: false,
  tipo_plan: '',
  preventa: false,
  visitas_gratis: 0,
  desde: '',
  hasta: '',
})

const precios = ref([])
const restricciones = ref([])

const errors = ref({ plan:{}, precios:[], restricciones:[] })
const saving = ref(false)

const empresaWarning = computed(() => (!ws.empresaId ? 'No hay empresa activa. No se podrá guardar.' : ''))

// UI helpers
function addPrecio () {
  precios.value.push({ esquema:'', tipo:'', precio:null, numero_visitas:null, _key: String(Date.now()+Math.random()) })
}
function removePrecio (i){ precios.value.splice(i,1) }
function addRestriccion () {
  restricciones.value.push({ dia:0, hora_inicio:'', hora_fin:'', _key: String(Date.now()+Math.random()) })
}
function removeRestriccion (i){ restricciones.value.splice(i,1) }
function cancel(){ router.push({ name: 'PlanesLista' }) }

// Validaciones
function isDate(str){ return !str || /^\d{4}-\d{2}-\d{2}$/.test(str) }
function isTime(str){ return !!str && /^\d{2}:\d{2}$/.test(str) }

function validateBasicos() {
  const e = {}
  if(!plan.nombre?.trim()) e.nombre = 'El nombre es obligatorio'
  if(!plan.tipo_plan) e.tipo_plan = 'El tipo de plan es obligatorio'
  if(!ws.empresaId) e.empresa = 'No hay empresa activa'
  if(plan.desde && !isDate(plan.desde)) e.desde = 'Formato de fecha inválido (YYYY-MM-DD)'
  if(plan.hasta && !isDate(plan.hasta)) e.hasta = 'Formato de fecha inválido (YYYY-MM-DD)'
  if(plan.desde && plan.hasta && plan.desde > plan.hasta) e.hasta = 'La fecha fin debe ser >= inicio'
  errors.value.plan = e
  return Object.keys(e).length === 0
}
function validatePrecios() {
  const out = []; let ok = true
  precios.value.forEach((p) => {
    const e = {}
    if(!p.esquema?.trim()) { e.esquema='Requerido'; ok=false }
    if(!p.tipo?.trim())    { e.tipo='Requerido'; ok=false }
    if(p.precio == null || Number(p.precio) <= 0) { e.precio='Debe ser > 0'; ok=false }
    if(p.numero_visitas != null && Number(p.numero_visitas) < 1) { e.numero_visitas='>= 1'; ok=false }
    out.push(e)
  })
  errors.value.precios = out
  return ok
}
function validateRestricciones() {
  const out = []; let ok = true
  restricciones.value.forEach((r) => {
    const e = {}
    if(r.dia === null || r.dia === undefined) { e.dia='Requerido'; ok=false }
    if(!isTime(r.hora_inicio)) { e.hora_inicio='HH:MM'; ok=false }
    if(!isTime(r.hora_fin))    { e.hora_fin='HH:MM'; ok=false }
    if(isTime(r.hora_inicio) && isTime(r.hora_fin) && r.hora_inicio >= r.hora_fin) { e.hora_fin='Fin > Inicio'; ok=false }
    out.push(e)
  })
  errors.value.restricciones = out
  return ok
}

// Guardado secuencial: Plan -> Precios -> Restricciones
async function saveAll(){
  if(!validateBasicos()) { activeTab.value='basicos'; return }
  if(precios.value.length && !validatePrecios()) { activeTab.value='precios'; return }
  if(restricciones.value.length && !validateRestricciones()) { activeTab.value='restricciones'; return }

  saving.value = true
  try {
    // 1) Plan
    const payloadPlan = {
      empresa: Number(ws.empresaId),             // OBLIGATORIO
      nombre: plan.nombre.trim(),
      tipo_plan: plan.tipo_plan,
      preventa: !!plan.preventa,
      visitas_gratis: Number(plan.visitas_gratis) || 0,
      descripcion: plan.descripcion?.trim() || '',
      acceso_multisucursal: !!plan.acceso_multisucursal,
      desde: plan.desde || null,
      hasta: plan.hasta || null,
      usuario: auth.user?.id || auth.tokenInfo?.user_id || null, // si tu API lo usa
    }
    const { data: created } = await api.planes.create(payloadPlan)
    const planId = created?.id
    if(!planId) throw new Error('No se recibió id del plan')

    // 2) Precios
    for(const p of precios.value){
      await api.planes.precios.create({
        plan: planId,
        esquema: p.esquema?.trim(),
        tipo: p.tipo?.trim(),
        precio: Number(p.precio),
        numero_visitas: p.numero_visitas != null ? Number(p.numero_visitas) : null,
        usuario: auth.user?.id || auth.tokenInfo?.user_id || null,
      })
    }

    // 3) Restricciones
    for(const r of restricciones.value){
      await api.planes.restricciones.create({
        plan: planId,
        dia: Number(r.dia), // AJUSTA si tu backend espera 1..7
        hora_inicio: r.hora_inicio,
        hora_fin: r.hora_fin,
        usuario: auth.user?.id || auth.tokenInfo?.user_id || null,
      })
    }

    alert('Plan creado con éxito')
    router.push({ name: 'PlanesLista' })
  } catch (e) {
    console.error(e)
    const data = e?.response?.data
    if (data && typeof data === 'object') {
      if (data.nombre) errors.value.plan.nombre = Array.isArray(data.nombre) ? data.nombre[0] : String(data.nombre)
      if (data.tipo_plan) errors.value.plan.tipo_plan = Array.isArray(data.tipo_plan) ? data.tipo_plan[0] : String(data.tipo_plan)
    }
    alert(data?.detail || 'Ocurrió un error al guardar')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
/* opcional */
</style>
