<template>
  <div class="text-white">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-medium">Servicios del plan</h2>
      <div class="text-sm text-gray-400">Plan #{{ planId }}</div>
    </div>

    <!-- Filtros -->
    <div class="mb-3 flex flex-wrap gap-2">
      <input
        v-model="q"
        @keyup.enter="fetchServicios"
        placeholder="Buscar servicio…"
        class="bg-gray-900 border border-gray-700 rounded px-3 py-2 w-64"
      />
      <button @click="fetchServicios" class="bg-gray-800 border border-gray-700 px-4 py-2 rounded hover:bg-gray-700">
        Buscar
      </button>
      <button @click="resetFilters" class="bg-gray-800 border border-gray-700 px-4 py-2 rounded hover:bg-gray-700">
        Limpiar
      </button>
    </div>

    <!-- Lista / loading -->
    <div v-if="loading" class="space-y-2">
      <div class="animate-pulse h-10 bg-gray-800/60 rounded" v-for="i in 6" :key="i"></div>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="s in serviciosEmpresa"
        :key="s.id"
        class="rounded-xl border border-gray-800 bg-gray-900/60 p-3"
        data-service-root
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-start gap-3">
            <input
              type="checkbox"
              class="mt-1 h-4 w-4 rounded border-gray-700 bg-gray-900"
              :checked="isServicioChecked(s.id)"
              @change="toggleServicio(s)"
            />
            <div>
              <div class="font-medium leading-tight">
                <i v-if="s.icono" :class="['fa', s.icono, 'mr-2', 'opacity-80']"></i>
                {{ s.nombre }}
              </div>
              <div class="text-sm text-gray-300 mt-0.5">{{ s.descripcion || '—' }}</div>

              <!-- Chips de beneficios del servicio (globales) -->
              <div v-if="beneficiosByServicio[s.id]?.length" class="mt-2 flex flex-wrap gap-2">
                <span
                  v-for="b in beneficiosByServicio[s.id]"
                  :key="b.id"
                  class="text-[11px] px-2 py-0.5 rounded-full bg-apolo-primary/20 text-apolo-primary border border-apolo-primary/30"
                >
                  {{ b.nombre }}
                </span>
              </div>
            </div>
          </div>

          <!-- Menú ⋯ solo si el servicio está activo en el plan -->
          <div class="relative" v-if="isServicioChecked(s.id)">
            <button
              class="px-2 py-1 rounded hover:bg-gray-800"
              @click.stop="toggleMenu(s.id)"
              :aria-expanded="openMenuId===s.id"
              aria-haspopup="menu"
              data-menu-btn
            >
              ⋯
            </button>

            <div
              v-if="openMenuId===s.id"
              class="absolute right-0 mt-1 w-64 bg-gray-950 border border-gray-800 rounded-xl shadow-xl p-1 z-20"
              role="menu"
              data-menu-panel
            >
              <button
                class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-900/70"
                role="menuitem"
                @click="openBeneficiosModal(s)"
              >
                Gestionar beneficios del servicio
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!serviciosEmpresa.length" class="text-center text-gray-400 py-6">
        No hay servicios dados de alta en la empresa.
      </div>
    </div>

    <!-- Modal Beneficios (para un servicio globalmente) -->
    <div
      v-if="showBeneficios"
      class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click.self="closeBeneficios"
    >
      <div class="w-full max-w-2xl bg-gray-950 border border-gray-800 rounded-2xl shadow-xl">
        <div class="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
          <h3 class="text-lg">
            Beneficios para: <span class="font-semibold">{{ currentServicio?.nombre }}</span>
          </h3>
          <button @click="closeBeneficios" class="text-gray-400 hover:text-white">✕</button>
        </div>

        <div class="p-4">
          <!-- Buscar beneficios -->
          <div class="mb-3 flex gap-2">
            <input
              v-model="qBenef"
              @keyup.enter="fetchBeneficiosEmpresa"
              placeholder="Buscar beneficio…"
              class="bg-gray-900 border border-gray-700 rounded px-3 py-2 w-64"
            />
            <button @click="fetchBeneficiosEmpresa" class="bg-gray-800 border border-gray-700 px-4 py-2 rounded hover:bg-gray-700">
              Buscar
            </button>
            <button @click="resetBenefFilters" class="bg-gray-800 border border-gray-700 px-4 py-2 rounded hover:bg-gray-700">
              Limpiar
            </button>
          </div>

          <!-- Listado de beneficios -->
          <div v-if="loadingBenef" class="space-y-2">
            <div class="animate-pulse h-8 bg-gray-800/60 rounded" v-for="i in 6" :key="i"></div>
          </div>
          <div v-else class="space-y-1 max-h-72 overflow-auto pr-1">
            <label
              v-for="b in beneficiosEmpresa"
              :key="b.id"
              class="flex items-center gap-2 px-2 py-2 rounded hover:bg-gray-900/40"
            >
              <input
                type="checkbox"
                class="h-4 w-4 rounded border-gray-700 bg-gray-900"
                :value="b.id"
                v-model="selectedBeneficiosIds"
              />
              <div>
                <div class="text-sm font-medium">{{ b.nombre }}</div>
                <div class="text-xs text-gray-400">{{ b.descripcion || '—' }}</div>
              </div>
            </label>

            <div v-if="!beneficiosEmpresa.length" class="text-center text-gray-400 py-4">
              No hay beneficios registrados para la empresa.
            </div>
          </div>
        </div>

        <div class="px-4 pb-4 flex items-center justify-end gap-2">
          <button @click="closeBeneficios" class="px-4 py-2 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700">
            Cancelar
          </button>
          <button
            @click="saveBeneficios"
            :disabled="savingBenef"
            class="px-4 py-2 rounded bg-apolo-primary text-black hover:bg-apolo-secondary disabled:opacity-60"
          >
            {{ savingBenef ? 'Guardando…' : 'Guardar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <transition name="fade">
      <div v-if="toast.show" class="fixed bottom-4 right-4 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm shadow-xl z-50">
        {{ toast.message }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import api from '@/api/services'

// Props
const props = defineProps({
  planId: { type: Number, required: true },
})

// ==== Estado base
const loading = ref(true)
const serviciosEmpresa = ref([])
const q = ref('')

// relaciones Plan–Servicio (para saber qué está checkeado en el plan)
const relPlanServicios = ref([]) // [{id, plan, servicio}]
const relMapServicioId = ref(new Map()) // servicioId -> relId (PlanServicio.id)

// beneficios por servicio (para chips globales)
const beneficiosByServicio = ref({}) // servicioId -> [{id (beneficio), nombre, relId (ServicioBeneficio.id)}]

// ==== Menu ⋯
const openMenuId = ref(null)
function toggleMenu(id){ openMenuId.value = openMenuId.value === id ? null : id }
function closeMenus(){ openMenuId.value = null }

// ==== Modal Beneficios (por servicio GLOBAL)
const showBeneficios = ref(false)
const currentServicio = ref(null)
const beneficiosEmpresa = ref([])
const qBenef = ref('')
const loadingBenef = ref(false)
const savingBenef = ref(false)
const selectedBeneficiosIds = ref([]) // selección actual en modal

// Toast
const toast = ref({ show:false, message:'' })
function showToast(msg){ toast.value={ show:true, message:msg }; setTimeout(()=>toast.value.show=false, 1800) }

// ===== Fetch =====
onMounted(async () => {
  document.addEventListener('click', onDocClick)
  await fetchServicios()
  await fetchRelPlanServicios()
  await hydrateChipsForAll()
})

onUnmounted(() => {
  document.removeEventListener('click', onDocClick)
})

function onDocClick(e){
  const isBtn = e.target.closest?.('[data-menu-btn]')
  const isPanel = e.target.closest?.('[data-menu-panel]')
  if (!isBtn && !isPanel) closeMenus()
}

async function fetchServicios(){
  loading.value = true
  try{
    const { data } = await api.servicios.list({ search: q.value, ordering: 'nombre', page_size: 200 })
    serviciosEmpresa.value = data?.results || data || []
  } finally {
    loading.value = false
  }
}

function resetFilters(){ q.value=''; fetchServicios() }

async function fetchRelPlanServicios(){
  const { data } = await api.planesServicios.list({ plan: props.planId, page_size: 500 })
  const rows = data?.results || data || []
  relPlanServicios.value = rows
  const map = new Map()
  rows.forEach(r => map.set(r.servicio, r.id))
  relMapServicioId.value = map
}

function isServicioChecked(servicioId){
  return relMapServicioId.value.has(servicioId)
}

async function toggleServicio(s){
  const checked = isServicioChecked(s.id)
  try{
    if (!checked){
      // crear relación PlanServicio
      const { data } = await api.planesServicios.create({ plan: props.planId, servicio: s.id })
      relMapServicioId.value.set(s.id, data?.id)
      // asegura chips del servicio
      if (!beneficiosByServicio.value[s.id]) {
        // carga beneficios globales del servicio
        await fetchServicioBeneficiosForServicio(s.id)
      }
      showToast('Servicio agregado al plan')
    } else {
      // eliminar relación del plan
      const relId = relMapServicioId.value.get(s.id)
      if (relId){
        await api.planesServicios.delete(relId)
        relMapServicioId.value.delete(s.id)
        showToast('Servicio removido del plan')
      }
    }
  } catch(e){
    showToast(e?.response?.data?.detail || 'No se pudo actualizar')
  }
}

// ===== Beneficios por servicio (GLOBAL) =====
async function fetchServicioBeneficiosForServicio(servicioId){
  // GET /servicios/beneficios/?servicio=ID
  const { data } = await api.servicioBeneficios.list({ servicio: servicioId, page_size: 500 })
  const rows = data?.results || data || []
  beneficiosByServicio.value[servicioId] = rows.map(r => ({
    id: r.beneficio, nombre: r.beneficio_nombre, relId: r.id
  }))
  return rows
}

async function hydrateChipsForAll(){
  // Para todos los servicios (solo mostramos chips si hay relación global de beneficios)
  for (const s of serviciosEmpresa.value){
    await fetchServicioBeneficiosForServicio(s.id)
  }
}

function openBeneficiosModal(servicio){
  currentServicio.value = servicio
  selectedBeneficiosIds.value = []
  showBeneficios.value = true
  closeMenus()
  // Cargar beneficios empresa y selección actual
  fetchBeneficiosEmpresa().then(() => hydrateSelectionFromRel())
}

function closeBeneficios(){
  showBeneficios.value = false
  currentServicio.value = null
  selectedBeneficiosIds.value = []
  qBenef.value = ''
}

async function fetchBeneficiosEmpresa(){
  loadingBenef.value = true
  try{
    const { data } = await api.beneficios.list({ search: qBenef.value, ordering: 'nombre', page_size: 500 })
    beneficiosEmpresa.value = data?.results || data || []
  } finally {
    loadingBenef.value = false
  }
}

function resetBenefFilters(){ qBenef.value=''; fetchBeneficiosEmpresa() }

async function hydrateSelectionFromRel(){
  if (!currentServicio.value) return
  const rows = await fetchServicioBeneficiosForServicio(currentServicio.value.id)
  selectedBeneficiosIds.value = rows.map(r => r.beneficio)
}

async function saveBeneficios(){
  if (!currentServicio.value) return
  savingBenef.value = true
  const servicioId = currentServicio.value.id

  try{
    const current = await fetchServicioBeneficiosForServicio(servicioId)
    const currentMap = new Map(current.map(r => [r.beneficio, r.id])) // beneficioId -> relId
    const desired = new Set(selectedBeneficiosIds.value)

    const ops = []

    // crear los que faltan
    for (const bId of desired){
      if (!currentMap.has(bId)){
        ops.push(api.servicioBeneficios.create({ servicio: servicioId, beneficio: bId }))
      }
    }
    // eliminar los que sobran
    for (const [bId, relId] of currentMap.entries()){
      if (!desired.has(bId)){
        ops.push(api.servicioBeneficios.delete(relId))
      }
    }

    await Promise.all(ops)
    await fetchServicioBeneficiosForServicio(servicioId)
    showToast('Beneficios del servicio actualizados')
    closeBeneficios()
  } catch(e){
    showToast(e?.response?.data?.detail || 'No se pudo guardar')
  } finally {
    savingBenef.value = false
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .15s ease }
.fade-enter-from, .fade-leave-to { opacity: 0 }
</style>
