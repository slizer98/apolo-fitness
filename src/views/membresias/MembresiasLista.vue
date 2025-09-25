<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/services'

const router = useRouter()

/* ===== Estado UI ===== */
const q = ref('')
const fecha = ref('')
const estado = ref('todos') // activos | inactivos | todos (si r.is_active existe)
const viewMode = ref(localStorage.getItem('membresiasViewMode') || 'list') // cards | list
const page = ref(1)
const pageSize = ref(24)
const menuOpenId = ref(null)

const loading = ref(false)
const items = ref([])    // registros (Altas)
const count = ref(null)  // si backend pagina con count
const today = new Date().toISOString().slice(0,10)

/* ===== Helpers ===== */
function norm (s) {
  return (s || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}
function toggleView(mode){
  viewMode.value = mode
  localStorage.setItem('membresiasViewMode', mode)
}
function toggleMenu(id){ menuOpenId.value = (menuOpenId.value === id ? null : id) }
function closeMenu(){ menuOpenId.value = null }
function fmtRange(a, b){
  const f = (x) => x ? new Date(x).toLocaleDateString() : '—'
  return `${f(a)} → ${f(b)}`
}

/* ===== Carga ===== */
onMounted(fetchServer)

async function fetchServer(){
  loading.value = true
  try{
    const params = { page: page.value, page_size: pageSize.value, ordering: '-id' }
    if(q.value) params.search = q.value
    if(fecha.value) params.fecha = fecha.value
    const { data } = await api.altasPlan.list(params)
    items.value = data?.results || data || []
    count.value = data?.count ?? null
  } finally {
    loading.value = false
  }
}

function resetFilters(){
  q.value = ''
  fecha.value = ''
  estado.value = 'todos'
  page.value = 1
  fetchServer()
}

/* ===== Filtro en cliente (como Empresas) ===== */
const filtered = computed(() => {
  const term = norm(q.value)
  return (items.value || []).filter(r => {
    // estado (si existe is_active)
    if(estado.value === 'activos' && r.is_active === false) return false
    if(estado.value === 'inactivos' && r.is_active !== false) return false

    if(!term) return true
    const hay = [
      r.cliente_nombre, r.plan_nombre, r.sucursal_nombre,
      r.cliente, r.plan, r.sucursal
    ].some(v => norm(v).includes(term))
    return hay
  })
})

const total = computed(() => filtered.value.length)
const paginated = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value)
})

/* ===== Acciones ===== */
async function nuevaAltaDesde(r){
  closeMenu()
  // Si quieres re-crear otra alta para el mismo plan, pasamos plan y revisión vigente
  const rv = await api.planes.revisiones.getVigente(r.plan, today).catch(()=>null)
  const query = rv ? { plan: r.plan, revision: rv.id } : { plan: r.plan }
  router.push({ name: 'MembresiaCrear', query })
}

async function toggleActive(r){
  closeMenu()
  if (typeof r.is_active === 'undefined') return
  try{
    await api.altasPlan.patch(r.id, { is_active: !r.is_active })
    await fetchServer()
  }catch{
    alert('No se pudo actualizar el estado')
  }
}

async function remove(r){
  closeMenu()
  if(!confirm(`Eliminar la membresía de ${r.cliente_nombre || r.cliente} para el plan ${r.plan_nombre || r.plan}?`)) return
  try{
    await api.altasPlan.delete(r.id)
    if(paginated.value.length === 1 && page.value > 1){ page.value -= 1 }
    await fetchServer()
  }catch{
    alert('No se pudo eliminar')
  }
}
</script>

<template>
  <div class="p-4 text-gray-100">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-xl font-semibold">Membresías</h1>
      <div class="flex items-center gap-2">
        <div class="flex items-center border border-gray-800 rounded-lg overflow-hidden">
          <button
            class="px-3 py-2 text-gray-300"
            :class="viewMode==='cards' ? 'bg-gray-800' : ''"
            @click="toggleView('cards')">
            Cards
          </button>
          <button
            class="px-3 py-2 text-gray-300"
            :class="viewMode==='list' ? 'bg-gray-800' : ''"
            @click="toggleView('list')">
            Lista
          </button>
        </div>
        <router-link
          :to="{ name: 'MembresiaCrear' }"
          class="px-3 py-2 rounded-lg border border-gray-700 hover:border-gray-500 text-gray-100">
          Nueva alta
        </router-link>
      </div>
    </div>

    <!-- Controles / filtros (idéntico estilo empresas) -->
    <div class="border border-gray-800 rounded-xl p-3 bg-gray-950">
      <div class="flex flex-wrap items-center gap-2">
        <input
          v-model.trim="q"
          @keyup.enter="page=1; fetchServer()"
          placeholder="Buscar cliente/plan/sucursal…"
          class="w-72 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500"/>

        <input
          v-model="fecha"
          @change="page=1; fetchServer()"
          type="date"
          class="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100"/>

        <select
          v-model="estado"
          class="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100">
          <option value="todos">Todos</option>
          <option value="activos">Activos</option>
          <option value="inactivos">Inactivos</option>
        </select>

        <button @click="page=1; fetchServer()" class="px-3 py-2 rounded-lg border border-gray-700 hover:border-gray-500 text-gray-100">
          Buscar
        </button>
        <button @click="resetFilters" class="px-3 py-2 rounded-lg border border-gray-700 hover:border-gray-500 text-gray-100">
          Limpiar
        </button>

        <div class="ml-auto flex items-center gap-2">
          <label class="text-sm text-gray-400">Por página</label>
          <select v-model.number="pageSize" @change="page=1" class="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm">
            <option :value="12">12</option>
            <option :value="24">24</option>
            <option :value="48">48</option>
          </select>
        </div>
      </div>

      <!-- Cuerpo -->
      <div v-if="loading" class="py-10 text-center text-gray-400">Cargando…</div>

      <!-- Vista: Cards -->
      <div v-else-if="viewMode==='cards'" class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mt-3">
        <div
          v-for="r in paginated"
          :key="r.id"
          class="border border-gray-800 rounded-lg p-3 bg-gray-900 hover:shadow-lg hover:shadow-black/30">
          <div class="flex items-start justify-between">
            <div>
              <div class="font-medium text-gray-100">{{ r.cliente_nombre || ('Cliente #' + r.cliente) }}</div>
              <div class="text-xs text-gray-400">{{ r.plan_nombre || ('Plan #' + r.plan) }}</div>
              <div class="text-[11px] text-gray-400 mt-1">Vigencia: {{ fmtRange(r.fecha_alta, r.fecha_vencimiento) }}</div>
              <div class="text-[11px] text-gray-400">Sucursal: {{ r.sucursal_nombre || r.sucursal }}</div>
              <div class="text-[11px] mt-1">
                Renovación: <span :class="r.renovacion ? 'text-emerald-300' : 'text-gray-400'">{{ r.renovacion ? 'Sí' : 'No' }}</span>
              </div>
            </div>

            <div class="relative">
              <button class="px-2 py-1 rounded-lg border border-gray-700 text-sm" @click.stop="toggleMenu(r.id)">…</button>
              <div
                v-if="menuOpenId===r.id"
                class="absolute right-0 mt-2 w-44 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-10"
                @mouseleave="menuOpenId=null">
                <button @click="nuevaAltaDesde(r)" class="w-full text-left px-3 py-2 text-sm hover:bg-gray-800">Nueva alta (mismo plan)</button>
                <button v-if="'is_active' in r" @click="toggleActive(r)" class="w-full text-left px-3 py-2 text-sm hover:bg-gray-800">
                  {{ r.is_active !== false ? 'Desactivar' : 'Activar' }}
                </button>
                <button @click="remove(r)" class="w-full text-left px-3 py-2 text-sm hover:bg-gray-800 text-red-300">Eliminar</button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="!paginated.length" class="col-span-full text-center text-gray-400 py-8">Sin membresías</div>
      </div>

      <!-- Vista: Tabla -->
      <div v-else class="mt-3 overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead>
            <tr class="text-left text-gray-300 border-b border-gray-800">
              <th class="px-3 py-2">Cliente</th>
              <th class="px-3 py-2">Plan</th>
              <th class="px-3 py-2">Sucursal</th>
              <th class="px-3 py-2">Vigencia</th>
              <th class="px-3 py-2">Renovación</th>
              <th class="px-3 py-2 w-10"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="r in paginated"
              :key="r.id"
              class="border-b border-gray-900 hover:bg-gray-900">
              <td class="px-3 py-2">{{ r.cliente_nombre || ('Cliente #' + r.cliente) }}</td>
              <td class="px-3 py-2">{{ r.plan_nombre || ('Plan #' + r.plan) }}</td>
              <td class="px-3 py-2">{{ r.sucursal_nombre || r.sucursal }}</td>
              <td class="px-3 py-2">{{ fmtRange(r.fecha_alta, r.fecha_vencimiento) }}</td>
              <td class="px-3 py-2">
                <span :class="r.renovacion ? 'text-emerald-300' : 'text-gray-400'">{{ r.renovacion ? 'Sí' : 'No' }}</span>
              </td>
              <td class="px-3 py-2 relative">
                <button class="px-2 py-1 rounded-lg border border-gray-700 text-xs" @click.stop="toggleMenu(r.id)">…</button>
                <div
                  v-if="menuOpenId===r.id"
                  class="absolute right-2 mt-1 w-44 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-10"
                  @mouseleave="menuOpenId=null">
                  <button @click="nuevaAltaDesde(r)" class="w-full text-left px-3 py-2 text-sm hover:bg-gray-800">Nueva alta (mismo plan)</button>
                  <button v-if="'is_active' in r" @click="toggleActive(r)" class="w-full text-left px-3 py-2 text-sm hover:bg-gray-800">
                    {{ r.is_active !== false ? 'Desactivar' : 'Activar' }}
                  </button>
                  <button @click="remove(r)" class="w-full text-left px-3 py-2 text-sm hover:bg-gray-800 text-red-300">Eliminar</button>
                </div>
              </td>
            </tr>
            <tr v-if="!paginated.length">
              <td colspan="6" class="px-3 py-8 text-center text-gray-400">Sin membresías</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div class="mt-4 flex items-center justify-between">
        <div class="text-sm text-gray-400">Total (filtro cliente): {{ total }}</div>
        <div class="flex items-center gap-2">
          <button
            class="px-2 py-1 border border-gray-700 rounded text-gray-100 hover:border-gray-500 disabled:opacity-40"
            :disabled="page===1" @click="page=1">«</button>
          <button
            class="px-2 py-1 border border-gray-700 rounded text-gray-100 hover:border-gray-500 disabled:opacity-40"
            :disabled="page===1" @click="page--">‹</button>
          <span class="text-sm text-gray-400">Página {{ page }}</span>
          <button
            class="px-2 py-1 border border-gray-700 rounded text-gray-100 hover:border-gray-500 disabled:opacity-40"
            :disabled="(page*pageSize)>=total" @click="page++">›</button>
        </div>
      </div>
    </div>

    <!-- Cierra el menú al hacer click fuera -->
    <div v-if="menuOpenId" class="fixed inset-0" @click="closeMenu"></div>
  </div>
</template>
