<template>
  <div class="p-4 text-white">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-light">Planes</h1>
      <RouterLink
        :to="{ name: 'PlanCrear' }"
        class="bg-apolo-primary text-black px-4 py-2 rounded hover:bg-apolo-secondary transition"
      >+ Nuevo</RouterLink>
    </div>

    <!-- Filtros -->
    <div class="mb-4 flex flex-wrap gap-2">
      <input
        v-model="q"
        @keyup.enter="fetch"
        placeholder="Buscar plan…"
        class="bg-gray-900 border border-gray-700 rounded px-3 py-2 w-64"
      />
      <button
        @click="fetch"
        class="bg-gray-800 border border-gray-700 px-4 py-2 rounded hover:bg-gray-700"
      >Buscar</button>
      <button
        @click="resetFilters"
        class="bg-gray-800 border border-gray-700 px-4 py-2 rounded hover:bg-gray-700"
      >Limpiar</button>
    </div>

    <!-- Grid -->
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <div class="animate-pulse h-24 bg-gray-800/60 rounded-xl" v-for="i in 8" :key="i"></div>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <article
        v-for="p in rows"
        :key="p.id"
        class="rounded-xl border border-gray-800 bg-gray-900/60 p-4 hover:border-apolo-primary/60 transition"
      >
        <div class="flex items-start justify-between gap-3">
          <h3 class="font-medium leading-tight">{{ p.nombre }}</h3>
          <span
            v-if="p.acceso_multisucursal"
            class="text-[10px] px-2 py-0.5 rounded-full bg-apolo-primary/20 text-apolo-primary"
          >Multisucursal</span>
        </div>

        <p class="text-gray-300 text-sm mt-1 line-clamp-2">{{ p.descripcion }}</p>

        <!-- Iconos de servicios (máx. 6 visibles + contador) -->
        <div v-if="(p.servicios && p.servicios.length)" class="mt-3 flex flex-wrap items-center gap-2">
          <span
            v-for="(s, idx) in p.servicios.slice(0, maxIcons)"
            :key="s.id || s.nombre || idx"
            class="relative inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-800 bg-gray-900/60 hover:bg-gray-800/60"
            v-tippy="{
              content: `<div class='text-xs'>
                          <div class='font-medium'>${(s.servicio_nombre || s.nombre) ?? ''}</div>
                          ${s.servicio_descripcion ? `<div class='text-gray-300/90 mt-0.5'>${s.servicio_descripcion}</div>` : ''}
                        </div>`,
              placement: 'top'
            }"
            aria-label="Servicio"
          >
            <Icon :icon="safeIcon(s.icono)" width="18" />
          </span>

          <span
            v-if="p.servicios.length > maxIcons"
            class="inline-flex items-center justify-center h-8 px-2 rounded-lg border border-gray-800 bg-gray-900/60 text-xs text-gray-300"
            :title="p.servicios.slice(maxIcons).map(x => x.nombre).join(', ')"
          >
            +{{ p.servicios.length - maxIcons }}
          </span>
        </div>

        <div class="mt-2 flex flex-wrap gap-2 text-[11px]">
          <span class="px-2 py-0.5 rounded-full bg-gray-800/60 border border-gray-700">
            Tipo: {{ p.tipo_plan || '—' }}
          </span>
          <span
            v-if="p.desde || p.hasta"
            class="px-2 py-0.5 rounded-full bg-gray-800/60 border border-gray-700"
          >
            Vigencia: {{ formatRange(p.desde, p.hasta) }}
          </span>
        </div>

        <div class="mt-3 flex items-center justify-end gap-2">
          <RouterLink
            :to="{ name:'PlanDetalle', params:{ id: p.id }}"
            class="px-2 py-1 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700"
          >Ver</RouterLink>
          <RouterLink
            :to="{ name:'PlanEditar', params:{ id: p.id }}"
            class="px-2 py-1 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700"
          >Editar</RouterLink>
          <button
            @click="remove(p)"
            class="px-2 py-1 rounded border border-red-800 bg-red-900/40 hover:bg-red-800"
          >Eliminar</button>
        </div>
      </article>

      <div v-if="!rows.length" class="col-span-full text-center text-gray-400 py-8">
        Sin planes
      </div>
    </div>

    <!-- Paginación -->
    <div class="mt-4 flex items-center gap-2">
      <button
        :disabled="page<=1"
        @click="prev"
        class="px-3 py-1 rounded bg-gray-800/60 border border-gray-700 disabled:opacity-50"
      >Anterior</button>
      <span class="text-gray-300">Página {{ page }}</span>
      <button
        :disabled="!hasMore"
        @click="next"
        class="px-3 py-1 rounded bg-gray-800/60 border border-gray-700 disabled:opacity-50"
      >Siguiente</button>
      <span v-if="count!==null" class="text-gray-500 text-sm">({{ count }} resultados)</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import api from '@/api/services'
// <Icon> está registrado globalmente (main.js): app.component('Icon', Icon)

const loading = ref(true)
const rows = ref([])
const page = ref(1)
const pageSize = 12
const count = ref(null)
const q = ref('')

const maxIcons = 6 // cantidad máxima de iconos visibles por card

const hasMore = computed(() =>
  count.value === null ? rows.value.length === pageSize : count.value > page.value * pageSize
)

onMounted(fetch)

async function fetch(){
  loading.value = true
  try{
    const params = { page: page.value, page_size: pageSize, ordering: '-id', search: q.value, include: 'servicios' }
    const { data } = await api.planes.list(params)
    const arr = data?.results || data || []
    rows.value = arr.map(p => ({ ...p, servicios: Array.isArray(p.servicios) ? p.servicios : [] }))
    count.value = data?.count ?? null
  } finally {
    loading.value = false
  }
}


function resetFilters(){ q.value=''; page.value=1; fetch() }
function next(){ if(hasMore.value){ page.value++; fetch() } }
function prev(){ if(page.value>1){ page.value--; fetch() } }

function formatDate(d){
  try{ return new Date(d).toLocaleDateString('es-MX') }catch{ return d||'—' }
}
function formatRange(a,b){
  const fa = a ? formatDate(a) : '—'
  const fb = b ? formatDate(b) : '—'
  if(!a && !b) return '—'
  return `${fa} → ${fb}`
}

// Fallback de icono
function safeIcon(icon) {
  return icon && icon.includes(':') ? icon : 'lucide:help-circle'
}

async function remove(p){
  if(!confirm(`Eliminar plan "${p.nombre}"?`)) return
  try{
    await api.planes.delete(p.id)
    if(rows.value.length === 1 && page.value > 1){ page.value -= 1 }
    await fetch()
  } catch(e){
    console.error(e)
  }
}
</script>
