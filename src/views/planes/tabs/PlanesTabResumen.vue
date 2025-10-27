<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-5">
      <h1 class="sr-only">Planes</h1>
      <RouterLink
        :to="{ name: 'PlanCrear' }"
        class="rounded-lg px-4 py-2 bg-[#1a5eff] text-white hover:opacity-90"
      >
        + Nuevo plan
      </RouterLink>
    </div>

    <!-- Toolbar (card) -->
    <div class="rounded-2xl border border-[#e6e9ef] bg-white shadow-sm p-3 md:p-4 overflow-hidden">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
        <!-- Chips contadores -->
        <div class="flex flex-wrap gap-2">
          <span class="chip">{{ totalActivos }} activos</span>
          <span class="chip">{{ totalServicios }} servicios</span>
          <span class="chip">{{ totalBeneficios }} beneficios</span>
        </div>

        <!-- Buscador + filtro + toggle -->
        <div class="flex flex-wrap items-center gap-2 min-w-0 md:flex-1 md:justify-end">
          <!-- Search (crece) -->
          <div class="relative flex-1 min-w-[260px] md:min-w-[520px]">
            <input
              v-model.trim="q"
              type="search"
              placeholder="Buscar plan"
              class="h-9 w-full bg-white border border-[#e6e9ef] rounded-xl pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#d9e2ff]"
              @keyup.enter="applySearch"
            />
            <span class="absolute inset-y-0 left-0 w-10 grid place-items-center text-[#9aa] pointer-events-none">
              <i class="fa-solid fa-magnifying-glass"></i>
            </span>
          </div>

          <!-- Estado -->
          <div class="relative">
            <select
              v-model="fEstado"
              class="h-9 appearance-none bg-white border border-[#e6e9ef] rounded-xl pl-3 pr-8 text-[14px] text-[#223] focus:outline-none focus:ring-2 focus:ring-[#d9e2ff]"
            >
              <option value="">Activo</option>
              <option value="archivado">Archivado</option>
              <option value="todos">Todos</option>
            </select>
            <span class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#889]">
              <i class="fa-solid fa-chevron-down text-[12px]"></i>
            </span>
          </div>

          <!-- Toggle vista -->
          <div class="inline-flex rounded-xl overflow-hidden border border-[#e6e9ef]">
            <button
              type="button"
              class="h-9 px-3 text-sm transition"
              :class="view==='card' ? 'bg-[#f5f7fa] text-[#223]' : 'bg-white text-[#223] hover:bg-[#f7f9fc]'"
              @click="view='card'"
            >Tarjeta</button>
            <button
              type="button"
              class="h-9 px-3 text-sm border-l border-[#e6e9ef] transition"
              :class="view==='list' ? 'bg-[#f5f7fa] text-[#223]' : 'bg-white text-[#223] hover:bg-[#f7f9fc]'"
              @click="view='list'"
            >Lista</button>
          </div>
        </div>
      </div>
    </div>

    <div class="h-3"></div>

    <!-- Contenedor -->
    <div class="rounded-2xl border border-[#e6e9ef] bg-white shadow-sm">
      <div class="px-4 py-3 border-b border-[#e6e9ef]">
        <h2 class="font-medium text-[#111]">Lista de planes</h2>
      </div>

      <!-- Skeleton -->
      <div v-if="loading" class="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div v-for="i in 4" :key="i" class="h-40 rounded-2xl bg-[#f5f7fb] animate-pulse"></div>
      </div>

      <!-- Tarjetas -->
      <div v-else-if="view==='card'" class="p-4 grid grid-cols-1 md:grid-cols-2 gap-5">
        <article
          v-for="p in filteredRows"
          :key="p.id"
          class="rounded-2xl border border-[#e6e9ef] bg-white"
        >
          <div class="p-4">
            <!-- Header: nombre + chips + precio derecha -->
            <div class="flex items-start justify-between gap-4 flex-wrap">
  <!-- IZQ: título + chips (puede crecer/encogerse y envolver) -->
  <div class="min-w-0 flex-1">
    <div class="text-[15px] font-semibold text-[#111] truncate">
      {{ p.nombre || '—' }}
    </div>

    <div class="mt-2 flex flex-wrap items-center gap-2">
      <span
        class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border whitespace-nowrap"
        :class="(p.is_active ?? true)
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border-rose-200 bg-rose-50 text-rose-700'"
      >
        {{ (p.is_active ?? true) ? 'Activo' : 'Archivado' }}
      </span>

      <span
        class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border border-[#e6e9ef] text-[#445] whitespace-nowrap"
      >
        Clientes: {{ p.clientes ?? p.clientes_count ?? '—' }}
      </span>
    </div>
  </div>

  <!-- DER: precio (no se encoge) -->
  <div class="text-right shrink-0">
    <div class="text-[13px] text-[#667]"></div>
    <div class="text-[15px] font-semibold text-[#111]">
      {{ precioMensual(p) }}
    </div>
  </div>
</div>

            <!-- Descripción -->
            <p class="mt-2 text-[13px] text-[#667] line-clamp-2">
              {{ p.descripcion || 'Descripción breve del plan….' }}
            </p>

            <!-- Líneas de servicios / beneficios -->
            <div class="mt-3 space-y-1.5">
              <div class="flex items-center gap-2">
                <span class="inline-block text-[11px] px-2 py-0.5 rounded bg-[#eef7ff] text-[#2563eb] border border-[#dbe7ff]">
                  Servicio:
                </span>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="s in (p._svcNames)"
                    :key="s"
                    class="inline-block text-[11px] px-2 py-0.5 rounded bg-[#f3faf7] text-[#0f766e] border border-[#d2f0e6]"
                  >
                    {{ s }}
                  </span>
                  <span v-if="!p._svcNames.length" class="text-[12px] text-[#98a]">—</span>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <span class="inline-block text-[11px] px-2 py-0.5 rounded bg-[#eef7ff] text-[#2563eb] border border-[#dbe7ff]">
                  Beneficio:
                </span>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="b in (p._benNames)"
                    :key="b"
                    class="inline-block text-[11px] px-2 py-0.5 rounded bg-[#eef2ff] text-[#4338ca] border border-[#e0e7ff]"
                  >
                    {{ b }}
                  </span>
                  <span v-if="!p._benNames.length" class="text-[12px] text-[#98a]">—</span>
                </div>
              </div>
            </div>

            <!-- Acciones -->
            <div class="mt-4 flex items-center justify-end gap-2">
              <button
                class="px-3 py-1.5 rounded-lg border border-[#e6e9ef] bg-white hover:bg-[#f5f7fa]"
                @click="goEditar(p)"
              >Editar</button>
              <button
                class="px-3 py-1.5 rounded-lg border border-[#e6e9ef] bg-white hover:bg-[#f5f7fa]"
                @click="duplicar(p)"
              >Duplicar</button>
              <button
                class="px-3 py-1.5 rounded-lg border border-[#e6e9ef] bg-white hover:bg-[#f5f7fa]"
                @click="toggleActivo(p)"
              >
                {{ (p.is_active ?? true) ? 'Archivar' : 'Activar' }}
              </button>
            </div>
          </div>
        </article>

        <div v-if="!filteredRows.length" class="col-span-full py-10 text-center text-[#667]">
          Sin planes
        </div>
      </div>

      <!-- Lista (tabla simple) -->
      <div v-else class="p-4 overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="text-[#667]">
            <tr class="border-b border-[#e6e9ef]">
              <th class="text-left py-2 px-2">Plan</th>
              <th class="text-left py-2 px-2">Precio</th>
              <th class="text-left py-2 px-2">Servicios</th>
              <th class="text-left py-2 px-2">Beneficios</th>
              <th class="text-left py-2 px-2">Clientes</th>
              <th class="text-left py-2 px-2">Estado</th>
              <th class="text-right py-2 px-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in filteredRows" :key="p.id" class="border-b border-[#f0f2f6]">
              <td class="py-3 px-2">
                <div class="font-medium text-[#111]">{{ p.nombre }}</div>
                <div class="text-[12px] text-[#9aa]">{{ p.tipo_plan || 'Acceso general' }}</div>
              </td>
              <td class="py-3 px-2">{{ precioMensual(p) }}</td>
              <td class="py-3 px-2 text-[#223]">
                <span v-if="!p._svcNames.length" class="text-[#667]">—</span>
                <span v-else>{{ p._svcNames.join(', ') }}</span>
              </td>
              <td class="py-3 px-2 text-[#223]">
                <span v-if="!p._benNames.length" class="text-[#667]">—</span>
                <span v-else>{{ p._benNames.join(', ') }}</span>
              </td>
              <td class="py-3 px-2">{{ p.clientes ?? p.clientes_count ?? '—' }}</td>
              <td class="py-3 px-2">
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border"
                  :class="(p.is_active ?? true)
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-rose-200 bg-rose-50 text-rose-700'"
                >{{ (p.is_active ?? true) ? 'Activo' : 'Archivado' }}</span>
              </td>
              <td class="py-3 px-2">
                <div class="relative flex justify-end" data-menu-root>
                  <button
                    class="h-9 w-9 rounded-lg border border-[#e6e9ef] bg-white hover:bg-[#f5f7fa]"
                    :aria-expanded="openMenuId===p.id" aria-haspopup="menu" title="Acciones"
                    @click.stop="toggleMenu(p.id)"
                  >⋯</button>

                  <div
                    v-if="openMenuId===p.id"
                    class="absolute right-0 mt-1 w-48 rounded-xl border border-[#e6e9ef] bg-white shadow-lg p-1 z-20"
                    role="menu"
                  >
                    <button class="mi" role="menuitem" @click="goDetalle(p); closeMenu()">Ver</button>
                    <button class="mi" role="menuitem" @click="goEditar(p); closeMenu()">Editar</button>
                    <button class="mi" role="menuitem" @click="duplicar(p); closeMenu()">Duplicar</button>
                    <button class="mi" role="menuitem" @click="toggleActivo(p); closeMenu()">
                      {{ (p.is_active ?? true) ? 'Archivar' : 'Activar' }}
                    </button>
                    <button class="mi !text-rose-600 hover:!bg-rose-50" role="menuitem" @click="remove(p); closeMenu()">Eliminar</button>
                  </div>
                </div>
              </td>
            </tr>
            <tr v-if="!filteredRows.length">
              <td colspan="7" class="py-10 text-center text-[#667]">Sin planes</td>
            </tr>
          </tbody>
        </table>
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
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import api from '@/api/services'

const router = useRouter()

/* ===== Estado base ===== */
const loading = ref(true)
const rows = ref([])         // resultados de API (página actual)
const q = ref('')
const fEstado = ref('')      // '', 'archivado', 'todos'
const view = ref('card')     // 'card' | 'list'
const page = ref(1)
const pageSize = 12
const count = ref(null)

/* Totales chips */
const totalActivos    = ref(0)
const totalServicios  = ref(0)
const totalBeneficios = ref(0)

/* ===== Helpers UI ===== */
function precioMensual(p){
  // Busca en p.precios el tipo 'mensual'; si no, toma el primero; si no hay, muestra “—”
  const precios = Array.isArray(p.precios) ? p.precios : []
  let precio = null
  const mensual = precios.find(x => (x.tipo || '').toLowerCase() === 'mensual')
  if (mensual) precio = mensual.precio
  else if (precios.length) precio = precios[0].precio
  if (precio == null) return '$ 0.00 / mensual'
  try {
    return Number(precio).toLocaleString('es-MX', { style:'currency', currency:'MXN', maximumFractionDigits:2 }) + ' / mensual'
  } catch { return `$ ${precio} / mensual` }
}

/* ===== Menú ... en tabla ===== */
const openMenuId = ref(null)
function toggleMenu(id){ openMenuId.value = openMenuId.value===id ? null : id }
function closeMenu(){ openMenuId.value = null }
function onDoc(e){ if(!e.target.closest?.('[data-menu-root]')) closeMenu() }
function onEsc(e){ if(e.key==='Escape') closeMenu() }
onMounted(()=>{ document.addEventListener('click', onDoc); document.addEventListener('keydown', onEsc) })
onBeforeUnmount(()=>{ document.removeEventListener('click', onDoc); document.removeEventListener('keydown', onEsc) })

/* ===== Filtro client-side (además del server) ===== */
const filteredRows = computed(() => {
  const term = q.value.trim().toLowerCase()
  let arr = rows.value.map(mapDecorations)
  if (fEstado.value === 'archivado') arr = arr.filter(r => r.is_active === false)
  else if (fEstado.value === '')     arr = arr.filter(r => r.is_active !== false)
  if (term){
    arr = arr.filter(r =>
      (r.nombre || '').toLowerCase().includes(term) ||
      (r.descripcion || '').toLowerCase().includes(term) ||
      r._svcNames.join(' ').toLowerCase().includes(term) ||
      r._benNames.join(' ').toLowerCase().includes(term)
    )
  }
  return arr
})

/* Normaliza arrays para pintar chips */
function mapDecorations(p){
  const svc = Array.isArray(p.servicios_incluidos) ? p.servicios_incluidos
            : Array.isArray(p.servicios) ? p.servicios : []
  const ben = Array.isArray(p.beneficios_incluidos) ? p.beneficios_incluidos
            : Array.isArray(p.beneficios) ? p.beneficios : []
  const svcNames = svc.map(s => s.servicio_nombre || s.nombre).filter(Boolean)
  const benNames = ben.map(b => b.beneficio_nombre || b.nombre).filter(Boolean)
  return { ...p, _svcNames: svcNames, _benNames: benNames }
}

/* ===== Data ===== */
onMounted(async () => {
  await Promise.all([fetchPlanes(), fetchChips()])
})

/* debounce para search */
let t = null
watch(q, () => {
  clearTimeout(t)
  t = setTimeout(() => { page.value = 1; fetchPlanes() }, 300)
})
watch(fEstado, () => { page.value = 1; fetchPlanes() })

async function fetchPlanes(){
  loading.value = true
  try{
    const params = {
      page: page.value,
      page_size: pageSize,
      ordering: '-id',
      search: q.value || '', 
      include: 'servicios,beneficios', 
    }
    if (fEstado.value === 'archivado') params.is_active = false
    else if (fEstado.value === '')     params.is_active = true
    const { data } = await api.planes.list(params)
    const arr = data?.results || data || []
    rows.value = arr
    count.value = data?.count ?? null
  } finally { loading.value = false }
}

async function fetchChips(){
  try{
    const [activos, servicios, beneficios] = await Promise.all([
      api.planes.list({ is_active:true, page_size:1 }),
      api.servicios.list({ page_size:1 }),
      api.beneficios.list({ page_size:1 }),
    ])
    const getCount = (r) => r?.data?.count ?? (Array.isArray(r?.data) ? r.data.length : 0)
    totalActivos.value    = getCount(activos)
    totalServicios.value  = getCount(servicios)
    totalBeneficios.value = getCount(beneficios)
  } catch { /* noop */ }
}

/* ===== Paginación ===== */
const hasMore = computed(() =>
  count.value === null ? rows.value.length === pageSize : count.value > page.value * pageSize
)
function next(){ if (hasMore.value){ page.value++; fetchPlanes() } }
function prev(){ if (page.value>1){ page.value--; fetchPlanes() } }
function applySearch(){ page.value = 1; fetchPlanes() }

/* ===== Acciones ===== */
function goDetalle (p){ router.push({ name: 'PlanDetalle', params: { id: p.id } }) }
function goEditar  (p){ router.push({ name: 'PlanEditar',  params: { id: p.id } }) }

async function toggleActivo(p){
  const is_active = !(p.is_active ?? true)
  await api.planes.patch(p.id, { is_active })
  await Promise.all([fetchPlanes(), fetchChips()])
}
async function duplicar(p){
  const payload = {
    empresa: p.empresa ?? undefined,
    nombre: `${p.nombre} (Copia)`,
    descripcion: p.descripcion || '',
    acceso_multisucursal: !!p.acceso_multisucursal,
    tipo_plan: p.tipo_plan || '',
    preventa: !!p.preventa,
    desde: p.desde || null,
    hasta: p.hasta || null,
    numero_sesiones: p.numero_sesiones || null,
  }
  await api.planes.create(payload)
  await fetchPlanes()
}
async function remove(p){
  if(!confirm(`Eliminar plan "${p.nombre}"?`)) return
  await api.planes.delete(p.id)
  if (rows.value.length === 1 && page.value > 1) page.value -= 1
  await Promise.all([fetchPlanes(), fetchChips()])
}
</script>

<style scoped>
.chip{ @apply px-3 py-1 rounded-full text-[12px] border border-[#e6e9ef] bg-white text-[#223]; }
.mi{ @apply w-full text-left px-3 py-2 rounded-lg text-[14px] text-[#223] hover:bg-[#f5f7fa]; }
</style>
