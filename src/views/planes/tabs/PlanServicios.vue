<template>
  <div class="text-white">
    <!-- Encabezado -->
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-lg font-medium">Servicios del plan</h2>
      <div class="flex items-center gap-2">
        <input
          v-model="q"
          @keyup.enter="fetchAll"
          placeholder="Buscar servicio…"
          class="bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-sm w-56"
        />
        <button
          @click="openBeneficiosModal"
          class="px-3 py-1.5 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700 text-sm"
        >
          Administrar beneficios del plan
        </button>
      </div>
    </div>

    <!-- Lista -->
    <div v-if="loading" class="grid gap-2">
      <div class="animate-pulse h-10 bg-gray-800/60 rounded" v-for="i in 6" :key="i"></div>
    </div>

    <div v-else class="grid gap-2">
      <div
        v-for="s in serviciosFiltrados"
        :key="s.id"
        class="flex items-center justify-between gap-3 rounded-xl border border-gray-800 bg-gray-900/60 px-3 py-2"
        data-row-root
      >
        <div class="flex items-center gap-3">
          <!-- Check activo si ya está linkeado -->
          <input
            type="checkbox"
            class="h-4 w-4 rounded border-gray-700 bg-gray-900"
            :checked="!!linksByServicioId.get(s.id)"
            @change="toggleServicio(s)"
          />
          <div>
            <div class="font-medium leading-tight">{{ s.nombre || s.Nombre_Servicio || 'Servicio' }}</div>
            <div class="text-xs text-gray-400 line-clamp-1">
              {{ s.descripcion || s.Descripcion || '—' }}
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- Precio cuando está enlazado -->
          <template v-if="linksByServicioId.get(s.id)">
            <label class="text-xs text-gray-400">Precio</label>
            <input
              :value="formatPrecioInput(linksByServicioId.get(s.id)?.precio)"
              @input="onPrecioInput($event, s.id)"
              @blur="persistPrecio(s.id)"
              inputmode="decimal"
              placeholder="0.00"
              class="w-28 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-right"
            />
          </template>

          <!-- Menú de tres puntos -->
          <div class="relative" @keydown.escape="closeMenu(s.id)">
            <button
              class="px-2 py-1 rounded hover:bg-gray-800"
              @click.stop="toggleMenu(s.id)"
              :aria-expanded="openMenuId===s.id"
              aria-haspopup="menu"
            >
              ⋯
            </button>
            <div
              v-if="openMenuId===s.id"
              class="absolute right-0 mt-1 w-48 bg-gray-950 border border-gray-800 rounded-xl shadow-xl p-1 z-20"
              role="menu"
            >
              <button
                class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-900/70"
                role="menuitem"
                @click="openBeneficiosModal(); closeMenu(s.id)"
              >
                Administrar beneficios del plan
              </button>
              <button
                v-if="linksByServicioId.get(s.id)"
                class="w-full text-left px-3 py-2 rounded-lg hover:bg-red-900/40"
                role="menuitem"
                @click="desenlazarServicio(s)"
              >
                Quitar del plan
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!serviciosFiltrados.length" class="text-center text-gray-400 py-6">
        No hay servicios (o no hay coincidencias).
      </div>
    </div>

    <!-- Modal Beneficios -->
    <div
      v-if="showBeneficios"
      class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click.self="showBeneficios=false"
    >
      <div class="w-full max-w-xl bg-gray-950 border border-gray-800 rounded-2xl shadow-xl">
        <div class="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
          <h3 class="text-lg">Beneficios del plan</h3>
          <button @click="showBeneficios=false" class="text-gray-400 hover:text-white">✕</button>
        </div>

        <div class="p-4 space-y-3">
          <div class="flex items-center gap-2">
            <input
              v-model="qBeneficios"
              @keyup.enter="filterBeneficios"
              placeholder="Buscar beneficio…"
              class="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm flex-1"
            />
            <button
              @click="filterBeneficios"
              class="px-3 py-2 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700 text-sm"
            >
              Buscar
            </button>
          </div>

          <div v-if="loadingBeneficios" class="grid gap-2">
            <div class="animate-pulse h-8 bg-gray-800/60 rounded" v-for="i in 5" :key="i"></div>
          </div>

          <div v-else class="grid gap-2 max-h-80 overflow-auto pr-1">
            <label
              v-for="b in beneficiosFiltrados"
              :key="b.id"
              class="flex items-center justify-between gap-3 px-3 py-2 rounded-lg border border-gray-800 bg-gray-900/50"
            >
              <div>
                <div class="font-medium leading-tight">{{ b.nombre || b.Nombre_beneficio }}</div>
                <div class="text-xs text-gray-400 line-clamp-1">{{ b.descripcion || b.Descripcion || '—' }}</div>
              </div>
              <input
                type="checkbox"
                class="h-4 w-4 rounded border-gray-700 bg-gray-900"
                :checked="!!beneficiosSet.has(b.id)"
                @change="toggleBeneficio(b)"
              />
            </label>

            <div v-if="!beneficiosFiltrados.length" class="text-center text-gray-400 py-6">
              No hay beneficios (o no hay coincidencias).
            </div>
          </div>
        </div>

        <div class="px-4 pb-4 flex items-center justify-end gap-2">
          <button @click="showBeneficios=false" class="px-4 py-2 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * Reemplaza tu archivo por este.
 * Props: planId (Number | String)
 * Endpoints usados: servicios, planesServicios, beneficios, planesBeneficios (api/services.js).
 */
import { ref, computed, onMounted, watch } from 'vue'
import api from '@/api/services'

const props = defineProps({
  planId: { type: [Number, String], required: true }
})

/* ===== Estado ===== */
const loading = ref(true)
const servicios = ref([])
const enlaces = ref([]) // lista de PlanServicio (enlaces)
const linksByServicioId = computed(() => {
  const map = new Map()
  for (const l of enlaces.value) {
    if (l?.servicio) map.set(l.servicio, l)
  }
  return map
})

const q = ref('')

/* Beneficios */
const showBeneficios = ref(false)
const loadingBeneficios = ref(false)
const beneficios = ref([])
const beneficiosSet = ref(new Set()) // ids actualmente enlazados al plan
const beneficiosRawLinks = ref([]) // objetos PlanBeneficio (para borrar)
const qBeneficios = ref('')

/* ===== Lifecycle ===== */
onMounted(fetchAll)
watch(() => props.planId, fetchAll)

/* ===== Computeds ===== */
const serviciosFiltrados = computed(() => {
  const term = q.value.trim().toLowerCase()
  if (!term) return servicios.value
  return servicios.value.filter(s =>
    (s.nombre || s.Nombre_Servicio || '').toLowerCase().includes(term) ||
    (s.descripcion || s.Descripcion || '').toLowerCase().includes(term)
  )
})
const beneficiosFiltrados = computed(() => {
  const term = qBeneficios.value.trim().toLowerCase()
  if (!term) return beneficios.value
  return beneficios.value.filter(b =>
    (b.nombre || b.Nombre_beneficio || '').toLowerCase().includes(term) ||
    (b.descripcion || b.Descripcion || '').toLowerCase().includes(term)
  )
})

/* ===== Carga ===== */
async function fetchAll () {
  if (!props.planId) return
  loading.value = true
  try {
    // Servicios de la empresa (trae todos; si hay paginación real, hacer loop)
    const { data: ds } = await api.servicios.list({ ordering: 'id', page_size: 500 })
    servicios.value = ds?.results || ds || []

    // Enlaces plan-servicio existentes (para checks y precios)
    const { data: ls } = await api.planesServicios.list({ plan: props.planId, page_size: 500 })
    enlaces.value = ls?.results || ls || []
  } finally {
    loading.value = false
  }
}

function filterBeneficios () {
  // el filtro es solo en cliente; si buscas server-side, llama api.beneficios.list({ search: qBeneficios.value })
}

/* ===== Checks Servicios ===== */
async function toggleServicio (s) {
  const linked = linksByServicioId.value.get(s.id)
  if (linked) {
    await desenlazarServicio(s)
  } else {
    await enlazarServicio(s)
  }
}

async function enlazarServicio (s) {
  try {
    // Crea con precio 0 por defecto (ajústalo si tu API necesita string)
    const payload = { plan: Number(props.planId), servicio: s.id, precio: '0.00' }
    const { data } = await api.planesServicios.create(payload)
    // agrega a enlaces
    enlaces.value = [data, ...enlaces.value]
  } catch (e) {
    console.error('No se pudo enlazar servicio', e?.response?.data || e)
  }
}

async function desenlazarServicio (s) {
  try {
    const link = linksByServicioId.value.get(s.id)
    if (!link?.id) return
    await api.planesServicios.delete(link.id)
    enlaces.value = enlaces.value.filter(x => x.id !== link.id)
  } catch (e) {
    console.error('No se pudo quitar servicio', e?.response?.data || e)
  }
}

/* ===== Precio por servicio (inline) ===== */
const precioDraft = ref(new Map()) // servicioId -> string

function formatPrecioInput (val) {
  if (val == null) return ''
  // Normaliza a string con dos decimales si viene número
  if (typeof val === 'number') return val.toFixed(2)
  return String(val)
}

function onPrecioInput (ev, servicioId) {
  const raw = ev.target.value
  // Permite solo [0-9 . ,]
  const cleaned = raw.replace(/[^0-9.,]/g, '').replace(',', '.')
  precioDraft.value.set(servicioId, cleaned)
  ev.target.value = cleaned
}

async function persistPrecio (servicioId) {
  const link = linksByServicioId.value.get(servicioId)
  if (!link?.id) return
  const draft = precioDraft.value.get(servicioId)
  // Si no hay cambios, no parchar
  if (draft == null || String(draft) === String(link.precio)) return
  try {
    await api.planesServicios.patch(link.id, { precio: String(draft || '0') })
    // refleja en memoria
    enlaces.value = enlaces.value.map(x => x.id === link.id ? { ...x, precio: String(draft || '0') } : x)
  } catch (e) {
    console.error('No se pudo guardar precio', e?.response?.data || e)
  } finally {
    precioDraft.value.delete(servicioId)
  }
}

/* ===== Beneficios del plan ===== */
function openBeneficiosModal () {
  showBeneficios.value = true
  loadBeneficios()
}

async function loadBeneficios () {
  loadingBeneficios.value = true
  try {
    // catálogo de beneficios
    const { data: bs } = await api.beneficios.list({ ordering: 'id', page_size: 500 })
    beneficios.value = bs?.results || bs || []

    // enlaces plan-beneficio actuales (para checks)
    const { data: pbs } = await api.planesBeneficios.list({ plan: props.planId, page_size: 500 })
    beneficiosRawLinks.value = pbs?.results || pbs || []
    const set = new Set()
    for (const row of beneficiosRawLinks.value) {
      if (row?.beneficio) set.add(row.beneficio)
    }
    beneficiosSet.value = set
  } finally {
    loadingBeneficios.value = false
  }
}

async function toggleBeneficio (b) {
  const has = beneficiosSet.value.has(b.id)
  if (has) {
    // buscar link para borrar
    const link = beneficiosRawLinks.value.find(x => x?.beneficio === b.id)
    if (!link?.id) return
    try {
      await api.planesBeneficios.delete(link.id)
      beneficiosRawLinks.value = beneficiosRawLinks.value.filter(x => x.id !== link.id)
      beneficiosSet.value.delete(b.id)
    } catch (e) {
      console.error('No se pudo quitar beneficio', e?.response?.data || e)
    }
  } else {
    try {
      const payload = { plan: Number(props.planId), beneficio: b.id }
      const { data } = await api.planesBeneficios.create(payload)
      beneficiosRawLinks.value.push(data)
      beneficiosSet.value.add(b.id)
    } catch (e) {
      console.error('No se pudo agregar beneficio', e?.response?.data || e)
    }
  }
}

/* ===== Cierre de menús de fila ===== */
const openMenuId = ref(null)
function toggleMenu (id) { openMenuId.value = openMenuId.value === id ? null : id }
function closeMenu () { openMenuId.value = null }

function onDocClick (e) {
  const root = e.target.closest?.('[data-row-root]')
  if (!root) closeMenu()
}
function onEsc (e) {
  if (e.key === 'Escape') closeMenu()
}

onMounted(() => {
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onEsc)
})
</script>

<style scoped>
/* opcional */
</style>
