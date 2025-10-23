<template>
  <div class="p-6">
    <!-- Encabezado -->
    <div class="flex items-center justify-between mb-5">
      <h1 class="text-2xl font-semibold text-[#111]">Planes</h1>
      <RouterLink
        :to="{ name: 'PlanCrear' }"
        class="rounded-lg px-4 py-2 bg-[#1a5eff] text-white hover:opacity-90"
      >+ Nuevo plan</RouterLink>
    </div>

    <!-- Toolbar -->
    <div
      class="rounded-2xl border border-[#e6e9ef] bg-white shadow-sm px-3 sm:px-4 py-3 flex flex-wrap gap-3 items-center"
    >
      <!-- Contadores (izquierda del buscador) -->
      <div class="hidden md:flex gap-2">
        <span v-if="totales.activos!=null" class="badge">{{ totales.activos }} activos</span>
        <span v-if="totales.servicios!=null" class="badge">{{ totales.servicios }} servicios</span>
        <span v-if="totales.beneficios!=null" class="badge">{{ totales.beneficios }} beneficios</span>
      </div>

      <!-- Buscar -->
      <div class="flex-1 min-w-[240px]">
        <input
          v-model="q"
          @keyup.enter="applySearch"
          type="search"
          placeholder="Buscar plan"
          class="w-full rounded-xl border border-[#e6e9ef] px-4 py-2 outline-none focus:ring-2 focus:ring-[#d9e2ff]"
        />
      </div>

      <!-- Estado + toggles -->
      <div class="flex items-center gap-2">
        <select
          v-model="fEstado"
          class="rounded-xl border border-[#e6e9ef] px-3 py-2 text-[14px] text-[#223]"
        >
          <option value="">Activo</option>
          <option value="archivado">Archivado</option>
          <option value="todos">Todos</option>
        </select>

        <button
          class="px-3 py-2 rounded-xl border border-[#e6e9ef] bg-white hover:bg-[#f5f7fa]"
          :class="{ 'bg-[#f5f7fa]': view==='card' }"
          @click="view='card'"
        >Tarjeta</button>
        <button
          class="px-3 py-2 rounded-xl border border-[#e6e9ef] bg-white hover:bg-[#f5f7fa]"
          :class="{ 'bg-[#f5f7fa]': view==='list' }"
          @click="view='list'"
        >Lista</button>
      </div>
    </div>

    <div class="h-3"></div>

    <!-- Contenido -->
    <div class="rounded-2xl border border-[#e6e9ef] bg-white shadow-sm">
      <div class="px-4 py-3 border-b border-[#e6e9ef]">
        <h2 class="font-medium text-[#111]">Lista de planes</h2>
      </div>

      <!-- Loading skeleton -->
      <div v-if="loading" class="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        <div v-for="i in 4" :key="i" class="h-40 rounded-2xl bg-[#f5f7fb] animate-pulse"></div>
      </div>

      <!-- Vista Tarjeta -->
      <div v-else-if="view==='card'" class="p-4 grid grid-cols-1 md:grid-cols-2 gap-5">
        <PlanCard
          v-for="p in rows"
          :key="p.id"
          :plan="p"
          @editar="goEditar(p)"
          @ver="goDetalle(p)"
          @archivar="archivar(p)"
          @duplicar="duplicar(p)"
          @eliminar="remove(p)"
        />
        <div v-if="!rows.length" class="col-span-full py-10 text-center text-[#667]">
          Sin planes
        </div>
      </div>

      <!-- Vista Lista -->
      <div v-else class="p-4">
        <PlanTable
          :rows="rows"
          @editar="goEditar"
          @ver="goDetalle"
          @eliminar="remove"
          @archivar="archivar"
        />
        <div v-if="!rows.length" class="py-10 text-center text-[#667]">Sin planes</div>
      </div>

      <!-- Paginación -->
      <div class="px-4 py-3 border-t border-[#e6e9ef] flex items-center gap-2">
        <button
          :disabled="page<=1"
          class="px-3 py-1.5 rounded-lg border border-[#e6e9ef] bg-white disabled:opacity-50"
          @click="prev"
        >Anterior</button>
        <span class="text-sm text-[#445]">Página {{ page }}</span>
        <button
          :disabled="!hasMore"
          class="px-3 py-1.5 rounded-lg border border-[#e6e9ef] bg-white disabled:opacity-50"
          @click="next"
        >Siguiente</button>
        <span v-if="count!==null" class="ml-auto text-[12px] text-[#667]">({{ count }} resultados)</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import api from '@/api/services'
import PlanCard from '@/components/planes/PlanCard.vue'
import PlanTable from '@/components/planes/PlanTable.vue'

const router = useRouter()

/* ===== Estado ===== */
const loading = ref(true)
const rows = ref([])
const q = ref('')
const fEstado = ref('')            // '', 'archivado', 'todos'
const view = ref('card')           // 'card' | 'list'
const page = ref(1)
const pageSize = 12
const count = ref(null)

/* Totales para los chips */
const totales = ref({ activos: null, servicios: null, beneficios: null })

const hasMore = computed(() =>
  count.value === null ? rows.value.length === pageSize : count.value > page.value * pageSize
)

onMounted(async () => {
  await Promise.all([fetchPlanes(), fetchTotales()])
})

/* ====== Buscador con debounce ====== */
let t = null
watch(q, () => {
  clearTimeout(t)
  t = setTimeout(() => { page.value = 1; fetchPlanes() }, 300)
})

async function fetchPlanes () {
  loading.value = true
  try {
    const params = {
      page: page.value,
      page_size: pageSize,
      ordering: '-id',
      search: q.value || '',
      include: 'servicios',
    }
    if (fEstado.value === 'archivado') params.is_active = false
    if (fEstado.value === '')          params.is_active = true
    // "todos": no se manda is_active

    const { data } = await api.planes.list(params)
    const arr = data?.results || data || []
    rows.value = arr.map(p => ({
      ...p,
      servicios: Array.isArray(p.servicios) ? p.servicios : [],
    }))
    count.value = data?.count ?? null
  } finally {
    loading.value = false
  }
}

async function fetchTotales () {
  try {
    const [planesActivos, servicios, beneficios] = await Promise.all([
      api.planes.list({ is_active: true, page_size: 1 }),
      api.servicios.list({ page_size: 1 }),
      api.beneficios.list({ page_size: 1 }),
    ])
    totales.value = {
      activos:    planesActivos.data?.length ?? (planesActivos.data?.results?.length || 0),
      servicios:  servicios.data?.length ?? (servicios.data?.results?.length || 0),
      beneficios: beneficios.data?.length ?? (beneficios.data?.results?.length || 0),
    }
  } catch { /* noop */ }
}

function applySearch(){ page.value = 1; fetchPlanes() }
function next(){ if (hasMore.value){ page.value++; fetchPlanes() } }
function prev(){ if (page.value>1){ page.value--; fetchPlanes() } }

/* ===== Acciones ===== */
function goDetalle (p){ router.push({ name: 'PlanDetalle', params: { id: p.id } }) }
function goEditar  (p){ router.push({ name: 'PlanEditar',  params: { id: p.id } }) }

async function remove (p){
  if (!confirm(`Eliminar plan "${p.nombre}"?`)) return
  await api.planes.delete(p.id)
  if (rows.value.length === 1 && page.value > 1) page.value -= 1
  await fetchPlanes()
}
async function archivar (p){
  await api.planes.patch(p.id, { is_active: false })
  await Promise.all([fetchPlanes(), fetchTotales()])
}
async function duplicar (p){
  const payload = { ...p, nombre: `${p.nombre} (Copia)` }
  delete payload.id
  delete payload.created_at
  delete payload.updated_at
  await api.planes.create(payload)
  await Promise.all([fetchPlanes(), fetchTotales()])
}
</script>

<style scoped>
.badge{
  @apply text-[12px] px-3 py-1 rounded-xl border border-[#e6e9ef] bg-[#fafbfe] text-[#223];
}
</style>
