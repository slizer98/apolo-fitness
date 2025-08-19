<template>
  <div class="p-4 text-white">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-light">
        Plan: <span class="font-medium">{{ plan?.nombre || '—' }}</span>
      </h1>
      <router-link :to="{ name:'PlanesLista' }" class="text-sm text-gray-300 hover:text-white">← Volver</router-link>
    </div>

    <div class="grid lg:grid-cols-3 gap-4">
      <!-- Resumen -->
      <section class="lg:col-span-1 rounded-2xl bg-gray-900/60 border border-gray-800 p-4">
        <h3 class="text-sm text-gray-300 mb-2">Resumen</h3>
        <div class="text-sm space-y-1">
          <div><span class="text-gray-400">Empresa:</span> {{ plan?.empresa_nombre || '—' }}</div>
          <div><span class="text-gray-400">Tipo:</span> {{ plan?.tipo_plan || '—' }}</div>
          <div><span class="text-gray-400">Preventa:</span> {{ plan?.preventa ? 'Sí' : 'No' }}</div>
          <div><span class="text-gray-400">Multisucursal:</span> {{ plan?.acceso_multisucursal ? 'Sí' : 'No' }}</div>
          <div v-if="plan?.desde || plan?.hasta"><span class="text-gray-400">Vigencia:</span> {{ formatRange(plan?.desde, plan?.hasta) }}</div>
          <div><span class="text-gray-400">Visitas gratis:</span> {{ plan?.visitas_gratis ?? 0 }}</div>
        </div>
        <p class="text-gray-300 text-sm mt-3 whitespace-pre-wrap">{{ plan?.descripcion }}</p>
      </section>

      <!-- Tabs -->
      <section class="lg:col-span-2">
        <div class="flex flex-wrap gap-2 border-b border-gray-800 mb-4">
          <button :class="tabBtn('precios')" @click="tab='precios'">Precios</button>
          <button :class="tabBtn('servicios')" @click="tab='servicios'">Servicios</button>
          <button :class="tabBtn('beneficios')" @click="tab='beneficios'">Beneficios</button>
          <button :class="tabBtn('restricciones')" @click="tab='restricciones'">Restricciones</button>
        </div>

        <!-- PRECIOS -->
        <div v-if="tab==='precios'">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-lg">Precios del plan</h3>
            <button @click="openAddPrecio" class="px-3 py-1.5 rounded bg-apolo-primary text-black hover:bg-apolo-secondary">+ Agregar</button>
          </div>

          <div v-if="loading.precios" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="animate-pulse h-20 bg-gray-800/60 rounded-xl" v-for="n in 4" :key="'p-'+n"></div>
          </div>
          <div v-else>
            <div v-if="!precios.length" class="text-gray-400 text-sm">No hay precios configurados.</div>
            <ul class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <li v-for="pr in precios" :key="pr.id" class="rounded-xl border border-gray-800 bg-gray-900/60 p-3">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <div class="font-medium">
                      {{ humanEsquema(pr.esquema) }} · {{ humanTipo(pr.tipo) }}
                    </div>
                    <div class="text-gray-400 text-sm">
                      Precio: {{ fmtMoney(pr.precio) }}
                      <span v-if="pr.tipo==='sesiones' || pr.numero_visitas">
                        · {{ pr.numero_visitas || 0 }} visitas
                      </span>
                    </div>
                  </div>
                  <button @click="removePrecio(pr)" class="text-sm px-2 py-1 rounded border border-red-800 bg-red-900/40 hover:bg-red-800">
                    Eliminar
                  </button>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- SERVICIOS -->
        <div v-if="tab==='servicios'">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-lg">Servicios del plan</h3>
            <button @click="openAddServicio" class="px-3 py-1.5 rounded bg-apolo-primary text-black hover:bg-apolo-secondary">+ Agregar</button>
          </div>

          <div v-if="loading.servicios" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="animate-pulse h-20 bg-gray-800/60 rounded-xl" v-for="n in 4" :key="'s-'+n"></div>
          </div>
          <div v-else>
            <div v-if="!servicios.length" class="text-gray-400 text-sm">No hay servicios agregados.</div>
            <ul class="space-y-2">
              <li v-for="s in servicios" :key="s.id" class="rounded-xl border border-gray-800 bg-gray-900/60 p-3">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <div class="font-medium">{{ s.servicio_nombre }}</div>
                    <div class="text-gray-400 text-sm">Precio: {{ fmtMoney(s.precio) }} <span v-if="s.icono" class="ml-2 text-[11px] bg-gray-800/70 px-2 py-0.5 rounded">{{ s.icono }}</span></div>
                  </div>
                  <button @click="removeServicio(s)" class="text-sm px-2 py-1 rounded border border-red-800 bg-red-900/40 hover:bg-red-800">Quitar</button>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- BENEFICIOS -->
        <div v-if="tab==='beneficios'">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-lg">Beneficios del plan</h3>
            <button @click="openAddBeneficio" class="px-3 py-1.5 rounded bg-apolo-primary text-black hover:bg-apolo-secondary">+ Agregar</button>
          </div>

          <div v-if="loading.beneficios" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="animate-pulse h-20 bg-gray-800/60 rounded-xl" v-for="n in 4" :key="'b-'+n"></div>
          </div>
          <div v-else>
            <div v-if="!beneficios.length" class="text-gray-400 text-sm">No hay beneficios agregados.</div>
            <ul class="space-y-2">
              <li v-for="b in beneficios" :key="b.id" class="rounded-xl border border-gray-800 bg-gray-900/60 p-3">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <div class="font-medium">{{ b.beneficio_nombre }}</div>
                    <div class="text-gray-400 text-sm">
                      Vigencia:
                      <span>{{ b.vigencia_inicio ? formatDate(b.vigencia_inicio) : '—' }}</span>
                      →
                      <span>{{ b.vigencia_fin ? formatDate(b.vigencia_fin) : '—' }}</span>
                    </div>
                  </div>
                  <button @click="removeBeneficio(b)" class="text-sm px-2 py-1 rounded border border-red-800 bg-red-900/40 hover:bg-red-800">Quitar</button>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- RESTRICCIONES -->
        <div v-if="tab==='restricciones'">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-lg">Restricciones del plan</h3>
            <button @click="openAddRestriccion" class="px-3 py-1.5 rounded bg-apolo-primary text-black hover:bg-apolo-secondary">+ Agregar</button>
          </div>

          <div v-if="loading.restricciones" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="animate-pulse h-20 bg-gray-800/60 rounded-xl" v-for="n in 4" :key="'r-'+n"></div>
          </div>
          <div v-else>
            <div v-if="!restricciones.length" class="text-gray-400 text-sm">No hay restricciones registradas.</div>
            <ul class="space-y-2">
              <li v-for="r in restricciones" :key="r.id" class="rounded-xl border border-gray-800 bg-gray-900/60 p-3">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <div class="font-medium">{{ r.dia }}</div>
                    <div class="text-gray-400 text-sm">{{ r.hora_inicio || '—' }} — {{ r.hora_fin || '—' }}</div>
                  </div>
                  <button @click="removeRestriccion(r)" class="text-sm px-2 py-1 rounded border border-red-800 bg-red-900/40 hover:bg-red-800">Quitar</button>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>

    <!-- MODAL: Agregar Precio -->
    <div v-if="modals.precio" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="w-full max-w-lg bg-gray-950 border border-gray-800 rounded-2xl shadow-xl">
        <div class="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
          <h3 class="text-lg">Agregar precio</h3>
          <button @click="closeModal('precio')" class="text-gray-400 hover:text-white">✕</button>
        </div>
        <div class="p-4 space-y-4">
          <div class="grid sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-400 mb-1">Esquema *</label>
              <select v-model="price.esquema" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2">
                <option :value="null">— Selecciona —</option>
                <option v-for="o in esquemaOpts" :key="o.value" :value="o.value">{{ o.label }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs text-gray-400 mb-1">Tipo *</label>
              <select v-model="price.tipo" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2">
                <option :value="null">— Selecciona —</option>
                <option v-for="o in tipoOpts" :key="o.value" :value="o.value">{{ o.label }}</option>
              </select>
            </div>
          </div>
          <div class="grid sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-400 mb-1">Precio *</label>
              <input v-model.number="price.precio" type="number" min="0" step="0.01" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
            </div>
            <div>
              <label class="block text-xs text-gray-400 mb-1">Número de visitas</label>
              <input v-model.number="price.numero_visitas" type="number" min="0" step="1" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
              <p class="text-[11px] text-gray-400 mt-1">
                Para <b>sesiones</b> establece el total de visitas; en mensual/semanal puede ser 0.
              </p>
            </div>
          </div>
          <div class="flex items-center justify-end gap-2 pt-1">
            <button @click="closeModal('precio')" class="px-4 py-2 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700">Cancelar</button>
            <button :disabled="saving.price" @click="savePrecio" class="px-4 py-2 rounded bg-apolo-primary text-black hover:bg-apolo-secondary disabled:opacity-60">
              {{ saving.price ? 'Guardando…' : 'Guardar' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL: Agregar Servicio -->
    <div v-if="modals.servicio" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="w-full max-w-xl bg-gray-950 border border-gray-800 rounded-2xl shadow-xl">
        <div class="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
          <h3 class="text-lg">Agregar servicio al plan</h3>
          <button @click="closeModal('servicio')" class="text-gray-400 hover:text-white">✕</button>
        </div>

        <div class="p-4 space-y-4">
          <div class="grid sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-400 mb-1">Buscar/seleccionar servicio</label>
              <input v-model="svc.search" placeholder="Buscar…" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 mb-2" />
              <select v-model="svc.servicio_id" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2">
                <option :value="null">— Selecciona —</option>
                <option v-for="s in filteredServicios" :key="s.id" :value="s.id">
                  {{ s.nombre }}
                </option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs text-gray-400 mb-1">Precio</label>
                <input v-model.number="svc.precio" type="number" min="0" step="0.01" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
              </div>
              <div>
                <label class="block text-xs text-gray-400 mb-1">Icono</label>
                <input v-model.trim="svc.icono" placeholder="fa-dumbbell…" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
              </div>
            </div>
          </div>

          <details class="rounded-lg border border-gray-800 bg-black/30 p-3">
            <summary class="cursor-pointer text-sm text-gray-300">¿No existe el servicio? Crear uno nuevo</summary>
            <div class="mt-3 grid sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs text-gray-400 mb-1">Nombre *</label>
                <input v-model.trim="svc.new.nombre" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
              </div>
              <div>
                <label class="block text-xs text-gray-400 mb-1">Descripción</label>
                <input v-model.trim="svc.new.descripcion" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
              </div>
              <div class="sm:col-span-2 flex items-center justify-end">
                <button @click="createServicio" class="px-3 py-1.5 rounded bg-gray-800/60 border border-gray-700 hover:bg-gray-700">Crear servicio</button>
              </div>
            </div>
          </details>

          <div class="flex items-center justify-end gap-2 pt-1">
            <button @click="closeModal('servicio')" class="px-4 py-2 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700">Cancelar</button>
            <button :disabled="saving.svc" @click="saveServicio" class="px-4 py-2 rounded bg-apolo-primary text-black hover:bg-apolo-secondary disabled:opacity-60">
              {{ saving.svc ? 'Guardando…' : 'Guardar' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL: Agregar Beneficio -->
    <div v-if="modals.beneficio" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="w-full max-w-xl bg-gray-950 border border-gray-800 rounded-2xl shadow-xl">
        <div class="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
          <h3 class="text-lg">Agregar beneficio al plan</h3>
          <button @click="closeModal('beneficio')" class="text-gray-400 hover:text-white">✕</button>
        </div>

        <div class="p-4 space-y-4">
          <div class="grid sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-400 mb-1">Buscar/seleccionar beneficio</label>
              <input v-model="bnf.search" placeholder="Buscar…" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 mb-2" />
              <select v-model="bnf.beneficio_id" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2">
                <option :value="null">— Selecciona —</option>
                <option v-for="b in filteredBeneficios" :key="b.id" :value="b.id">{{ b.nombre }}</option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs text-gray-400 mb-1">Vigencia inicio</label>
                <input v-model="bnf.vigencia_inicio" type="datetime-local" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
              </div>
              <div>
                <label class="block text-xs text-gray-400 mb-1">Vigencia fin</label>
                <input v-model="bnf.vigencia_fin" type="datetime-local" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
              </div>
            </div>
          </div>

          <details class="rounded-lg border border-gray-800 bg-black/30 p-3">
            <summary class="cursor-pointer text-sm text-gray-300">¿No existe el beneficio? Crear uno nuevo</summary>
            <div class="mt-3 grid sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs text-gray-400 mb-1">Nombre *</label>
                <input v-model.trim="bnf.new.nombre" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
              </div>
              <div>
                <label class="block text-xs text-gray-400 mb-1">Descripción</label>
                <input v-model.trim="bnf.new.descripcion" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
              </div>
              <div>
                <label class="block text-xs text-gray-400 mb-1">Tipo desc.</label>
                <input v-model.trim="bnf.new.tipo_descuento" placeholder="porcentaje / monto" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
              </div>
              <div>
                <label class="block text-xs text-gray-400 mb-1">Valor</label>
                <input v-model.number="bnf.new.valor" type="number" min="0" step="0.01" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
              </div>
              <div class="sm:col-span-2 flex items-center justify-end">
                <button @click="createBeneficio" class="px-3 py-1.5 rounded bg-gray-800/60 border border-gray-700 hover:bg-gray-700">Crear beneficio</button>
              </div>
            </div>
          </details>

          <div class="flex items-center justify-end gap-2 pt-1">
            <button @click="closeModal('beneficio')" class="px-4 py-2 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700">Cancelar</button>
            <button :disabled="saving.bnf" @click="saveBeneficio" class="px-4 py-2 rounded bg-apolo-primary text-black hover:bg-apolo-secondary disabled:opacity-60">
              {{ saving.bnf ? 'Guardando…' : 'Guardar' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL: Agregar Restricción -->
    <div v-if="modals.restriccion" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="w-full max-w-lg bg-gray-950 border border-gray-800 rounded-2xl shadow-xl">
        <div class="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
          <h3 class="text-lg">Agregar restricción</h3>
          <button @click="closeModal('restriccion')" class="text-gray-400 hover:text-white">✕</button>
        </div>

        <div class="p-4 space-y-4">
          <div class="grid sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-xs text-gray-400 mb-1">Día *</label>
              <select v-model="rst.dia" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2">
                <option v-for="d in dias" :key="d" :value="d">{{ d }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs text-gray-400 mb-1">Hora inicio</label>
              <input v-model="rst.hora_inicio" type="time" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
            </div>
            <div>
              <label class="block text-xs text-gray-400 mb-1">Hora fin</label>
              <input v-model="rst.hora_fin" type="time" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-1">
            <button @click="closeModal('restriccion')" class="px-4 py-2 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700">Cancelar</button>
            <button :disabled="saving.rst" @click="saveRestriccion" class="px-4 py-2 rounded bg-apolo-primary text-black hover:bg-apolo-secondary disabled:opacity-60">
              {{ saving.rst ? 'Guardando…' : 'Guardar' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- CONFIRM MODAL (bonito, local) -->
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
import { useRoute } from 'vue-router'
import api from '@/api/services'
import { useUiStore } from '@/stores/ui'
import { useWorkspaceStore } from '@/stores/workspace'

const route = useRoute()
const ui = useUiStore()
const ws = useWorkspaceStore()

const planId = Number(route.params.id)
const plan = ref(null)
const tab = ref('precios')

function tabBtn(name){
  return [
    'px-3 py-2 text-sm border-b-2',
    tab.value === name ? 'border-apolo-primary text-white' : 'border-transparent text-gray-400 hover:text-white'
  ]
}

function formatDate(d){ try{ return new Date(d).toLocaleString('es-MX') }catch{ return d||'—' } }
function formatRange(a,b){
  const fa = a ? new Date(a).toLocaleDateString('es-MX') : '—'
  const fb = b ? new Date(b).toLocaleDateString('es-MX') : '—'
  if(!a && !b) return '—'
  return `${fa} → ${fb}`
}
function fmtMoney(v){
  const n = Number(v || 0)
  return n.toLocaleString('es-MX', { style:'currency', currency:'MXN' })
}

/* ---------- Load ---------- */
onMounted(async () => {
  await loadPlan()
  await Promise.all([loadPrecios(), loadServicios(), loadBeneficios(), loadRestricciones()])
})

async function loadPlan(){
  try{
    const { data } = await api.planes.retrieve(planId)
    plan.value = data
  }catch(e){
    ui.toast({ type:'error', title:'No se pudo cargar el plan', message:e.response?.data?.detail || 'Error' })
  }
}

/* =========================
   PRECIOS
   ========================= */
const precios = ref([])
const loading = ref({ precios:false, servicios:false, beneficios:false, restricciones:false })
const modals = ref({ precio:false, servicio:false, beneficio:false, restriccion:false })
const saving = ref({ price:false, svc:false, bnf:false, rst:false })

const esquemaOpts = [
  { value: 'individual', label: 'Individual' },
  { value: 'grupal',     label: 'Grupal' },
  { value: 'empresa',    label: 'Empresa' },
]
const tipoOpts = [
  { value: 'mensual',  label: 'Mensual' },
  { value: 'semanal',  label: 'Semanal' },
  { value: 'sesiones', label: 'Sesiones' },
]
function humanEsquema(v){ return (esquemaOpts.find(o => o.value === v)?.label) || v }
function humanTipo(v){ return (tipoOpts.find(o => o.value === v)?.label) || v }

const price = ref({
  esquema: null,
  tipo: null,
  precio: 0,
  numero_visitas: 0,
})

async function loadPrecios(){
  loading.value.precios = true
  try{
    const { data } = await api.planes.precios.list({ plan: planId })
    precios.value = data?.results || data || []
  }catch(e){
    ui.toast({ type:'error', title:'No se pudieron cargar precios', message:e.response?.data?.detail || 'Error' })
  }finally{
    loading.value.precios = false
  }
}

function openAddPrecio(){
  price.value = { esquema:null, tipo:null, precio:0, numero_visitas:0 }
  modals.value.precio = true
}
function closeModal(name){ modals.value[name] = false }

async function savePrecio(){
  if(!price.value.esquema || !price.value.tipo){
    ui.toast({ type:'error', title:'Campos obligatorios', message:'Selecciona esquema y tipo.' })
    return
  }
  if(price.value.precio == null || Number(price.value.precio) < 0){
    ui.toast({ type:'error', title:'Precio inválido', message:'El precio no puede ser negativo.' })
    return
  }
  if(price.value.tipo === 'sesiones' && Number(price.value.numero_visitas) <= 0){
    ui.toast({ type:'error', title:'Número de visitas', message:'Para “sesiones” especifica un número de visitas > 0.' })
    return
  }

  saving.value.price = true
  try{
    await api.planes.precios.create({
      plan: planId,
      esquema: price.value.esquema,
      tipo: price.value.tipo,
      precio: Number(price.value.precio || 0),
      numero_visitas: Number(price.value.numero_visitas || 0),
    })
    ui.toast({ type:'success', title:'Precio agregado' })
    closeModal('precio')
    await loadPrecios()
  }catch(e){
    const msg = e.response?.data?.detail
      || e.response?.data?.non_field_errors?.[0]
      || 'No se pudo guardar'
    ui.toast({ type:'error', title:'Error', message: msg })
  }finally{
    saving.value.price = false
  }
}

async function removePrecio(pr){
  if(!(await askConfirm(`Eliminar precio ${humanEsquema(pr.esquema)} · ${humanTipo(pr.tipo)}?`))) return
  try{
    await api.planes.precios.delete(pr.id)
    await loadPrecios()
    ui.toast({ type:'success', title:'Precio eliminado' })
  }catch(e){
    ui.toast({ type:'error', title:'No se pudo eliminar', message:e.response?.data?.detail || 'Error' })
  }
}

/* =========================
   SERVICIOS (relación plan)
   ========================= */
const servicios = ref([])
async function loadServicios(){
  loading.value.servicios = true
  try{
    const { data } = await api.planesServicios.list({ plan: planId })
    servicios.value = data?.results || data || []
  } finally { loading.value.servicios = false }
}

/* catálogo servicios empresa */
const catalogoServicios = ref([])
const svc = ref({
  servicio_id: null,
  precio: 0,
  icono: '',
  search: '',
  new: { nombre:'', descripcion:'' },
})
const filteredServicios = computed(() => {
  const q = (svc.value.search || '').toLowerCase()
  return catalogoServicios.value.filter(s => !q || s.nombre.toLowerCase().includes(q))
})

function openAddServicio(){ modals.value.servicio = true; preloadServiciosCatalogo() }

async function preloadServiciosCatalogo(){
  try{
    const { data } = await api.servicios.list({ page_size: 100 })
    catalogoServicios.value = data?.results || data || []
  } catch {}
}

async function createServicio(){
  if(!ws.empresaId) { ui.toast({ type:'error', title:'Falta empresa' }); return }
  const nombre = svc.value.new.nombre?.trim()
  if(!nombre){ ui.toast({ type:'error', title:'Nombre requerido' }); return }
  try{
    const payload = { empresa: ws.empresaId, nombre, descripcion: svc.value.new.descripcion?.trim() || '' }
    const { data } = await api.servicios.create(payload)
    ui.toast({ type:'success', title:'Servicio creado' })
    await preloadServiciosCatalogo()
    svc.value.servicio_id = data?.id || null
    svc.value.new = { nombre:'', descripcion:'' }
  } catch(e){
    ui.toast({ type:'error', title:'No se pudo crear', message:e.response?.data?.detail || 'Error' })
  }
}

async function saveServicio(){
  if(!svc.value.servicio_id){ ui.toast({ type:'error', title:'Selecciona un servicio' }); return }
  saving.value.svc = true
  try{
    await api.planesServicios.create({
      plan: planId,
      servicio: svc.value.servicio_id,
      precio: Number(svc.value.precio || 0),
      icono: svc.value.icono?.trim() || ''
    })
    ui.toast({ type:'success', title:'Servicio agregado al plan' })
    closeModal('servicio')
    await loadServicios()
  } catch(e){
    ui.toast({ type:'error', title:'No se pudo agregar', message:e.response?.data?.detail || 'Error' })
  } finally {
    saving.value.svc = false
  }
}

async function removeServicio(s){
  if(!(await askConfirm(`Quitar el servicio "${s.servicio_nombre}" del plan?`))) return
  try{
    await api.planesServicios.delete(s.id)
    await loadServicios()
    ui.toast({ type:'success', title:'Servicio quitado' })
  } catch(e){
    ui.toast({ type:'error', title:'No se pudo quitar', message:e.response?.data?.detail || 'Error' })
  }
}

/* =========================
   BENEFICIOS (relación plan)
   ========================= */
const beneficios = ref([])
const catalogoBeneficios = ref([])
const bnf = ref({
  beneficio_id: null,
  vigencia_inicio: '',
  vigencia_fin: '',
  search: '',
  new: { nombre:'', descripcion:'', tipo_descuento:'', valor:0, unidad:0 },
})
const filteredBeneficios = computed(() => {
  const q = (bnf.value.search || '').toLowerCase()
  return catalogoBeneficios.value.filter(b => !q || b.nombre.toLowerCase().includes(q))
})

async function loadBeneficios(){
  loading.value.beneficios = true
  try{
    const { data } = await api.planesBeneficios.list({ plan: planId })
    beneficios.value = data?.results || data || []
  } finally { loading.value.beneficios = false }
}

function openAddBeneficio(){ modals.value.beneficio = true; preloadBeneficiosCatalogo() }

async function preloadBeneficiosCatalogo(){
  try{
    const { data } = await api.beneficios.list({ page_size: 100 })
    catalogoBeneficios.value = data?.results || data || []
  } catch {}
}

async function createBeneficio(){
  if(!ws.empresaId) { ui.toast({ type:'error', title:'Falta empresa' }); return }
  const nombre = bnf.value.new.nombre?.trim()
  if(!nombre){ ui.toast({ type:'error', title:'Nombre requerido' }); return }
  try{
    const payload = {
      empresa: ws.empresaId,
      nombre,
      descripcion: bnf.value.new.descripcion?.trim() || '',
      tipo_descuento: bnf.value.new.tipo_descuento?.trim() || '',
      valor: Number(bnf.value.new.valor || 0),
      unidad: Number(bnf.value.new.unidad || 0),
    }
    const { data } = await api.beneficios.create(payload)
    ui.toast({ type:'success', title:'Beneficio creado' })
    await preloadBeneficiosCatalogo()
    bnf.value.beneficio_id = data?.id || null
    bnf.value.new = { nombre:'', descripcion:'', tipo_descuento:'', valor:0, unidad:0 }
  } catch(e){
    ui.toast({ type:'error', title:'No se pudo crear', message:e.response?.data?.detail || 'Error' })
  }
}

async function saveBeneficio(){
  if(!bnf.value.beneficio_id){ ui.toast({ type:'error', title:'Selecciona un beneficio' }); return }
  saving.value.bnf = true
  try{
    await api.planesBeneficios.create({
      plan: planId,
      beneficio: bnf.value.beneficio_id,
      vigencia_inicio: bnf.value.vigencia_inicio || null,
      vigencia_fin: bnf.value.vigencia_fin || null,
    })
    ui.toast({ type:'success', title:'Beneficio agregado al plan' })
    closeModal('beneficio')
    await loadBeneficios()
  } catch(e){
    ui.toast({ type:'error', title:'No se pudo agregar', message:e.response?.data?.detail || 'Error' })
  } finally {
    saving.value.bnf = false
  }
}

async function removeBeneficio(b){
  if(!(await askConfirm(`Quitar el beneficio "${b.beneficio_nombre}" del plan?`))) return
  try{
    await api.planesBeneficios.delete(b.id)
    await loadBeneficios()
    ui.toast({ type:'success', title:'Beneficio quitado' })
  } catch(e){
    ui.toast({ type:'error', title:'No se pudo quitar', message:e.response?.data?.detail || 'Error' })
  }
}

/* =========================
   RESTRICCIONES
   ========================= */
const restricciones = ref([])
const dias = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo']
const rst = ref({ dia:'Lunes', hora_inicio:'', hora_fin:'' })

async function loadRestricciones(){
  loading.value.restricciones = true
  try{
    const { data } = await api.planesRestricciones.list({ plan: planId })
    restricciones.value = data?.results || data || []
  } finally { loading.value.restricciones = false }
}

function openAddRestriccion(){ modals.value.restriccion = true }

async function saveRestriccion(){
  if(!rst.value.dia){ ui.toast({ type:'error', title:'Selecciona un día' }); return }
  saving.value.rst = true
  try{
    await api.planesRestricciones.create({
      plan: planId,
      dia: rst.value.dia,
      hora_inicio: rst.value.hora_inicio || null,
      hora_fin: rst.value.hora_fin || null,
    })
    ui.toast({ type:'success', title:'Restricción agregada' })
    closeModal('restriccion')
    rst.value = { dia:'Lunes', hora_inicio:'', hora_fin:'' }
    await loadRestricciones()
  } catch(e){
    ui.toast({ type:'error', title:'No se pudo agregar', message:e.response?.data?.detail || 'Error' })
  } finally {
    saving.value.rst = false
  }
}

async function removeRestriccion(r){
  if(!(await askConfirm(`Eliminar restricción de ${r.dia}?`))) return
  try{
    await api.planesRestricciones.delete(r.id)
    await loadRestricciones()
    ui.toast({ type:'success', title:'Restricción eliminada' })
  } catch(e){
    ui.toast({ type:'error', title:'No se pudo eliminar', message:e.response?.data?.detail || 'Error' })
  }
}

/* ---------- Confirm modal (local) ---------- */
const confirm = ref({ show:false, title:'Confirmar acción', message:'', resolve:null })
function askConfirm(message, title='Confirmar acción'){
  confirm.value.title = title
  confirm.value.message = message
  confirm.value.show = true
  return new Promise(res => { confirm.value.resolve = res })
}
function resolveConfirm(val){ confirm.value.show = false; confirm.value.resolve?.(val) }
</script>
