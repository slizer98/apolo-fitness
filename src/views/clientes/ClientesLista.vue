<template>
  <div class="p-4 text-white">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-light">Clientes</h1>

      <RouterLink :to="{ name: 'ClienteCrear' }"
        class="bg-apolo-primary text-black px-4 py-2 rounded hover:bg-apolo-secondary transition">
        + Nuevo
      </RouterLink>
    </div>

    <!-- Filtros -->
    <div class="mb-4 flex flex-wrap gap-2">
      <input v-model="q" @keyup.enter="fetch" placeholder="Buscar nombre/correo…"
             class="bg-gray-900 border border-gray-700 rounded px-3 py-2 w-64" />
      <button @click="fetch" class="bg-gray-800 border border-gray-700 px-4 py-2 rounded hover:bg-gray-700">
        Buscar
      </button>
      <button @click="resetFilters" class="bg-gray-800 border border-gray-700 px-4 py-2 rounded hover:bg-gray-700">
        Limpiar
      </button>
    </div>

    <!-- Tabla -->
    <div v-if="loading" class="space-y-2">
      <div class="animate-pulse h-8 bg-gray-800/60 rounded" v-for="i in 6" :key="i"></div>
    </div>

    <table v-else class="w-full text-sm">
      <thead class="text-gray-400">
        <tr>
          <th class="text-left pb-2">Nombre</th>
          <th class="text-left pb-2">Correo</th>
          <th class="text-left pb-2">Sucursal</th>
          <th class="text-left pb-2">Fecha alta</th>
          <th class="text-right pb-2">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="c in rows" :key="c.id" class="border-t border-gray-800/80 hover:bg-gray-900/40">
          <td class="py-2">{{ fullName(c) }}</td>
          <td class="py-2 text-gray-300">{{ c.email || '—' }}</td>
          <td class="py-2 text-gray-300">{{ c.sucursal_nombre || '—' }}</td>
          <td class="py-2 text-gray-300">{{ formatDate(c.fecha_alta || c.created) }}</td>
          <td class="py-2">
            <div class="flex items-center justify-end gap-2">
              <RouterLink :to="{ name: 'ClienteDetalle', params: { id: c.id } }"
                class="px-2 py-1 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700">
                Ver
              </RouterLink>
              <RouterLink :to="{ name: 'ClienteEditar', params: { id: c.id } }"
                class="px-2 py-1 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700">
                Editar
              </RouterLink>
              <button @click="confirmDelete(c)"
                class="px-2 py-1 rounded border border-red-800 bg-red-900/40 hover:bg-red-800">
                Eliminar
              </button>
            </div>
          </td>
        </tr>
        <tr v-if="!rows.length">
          <td colspan="5" class="py-6 text-center text-gray-400">Sin resultados</td>
        </tr>
      </tbody>
    </table>

    <!-- Paginación -->
    <div class="mt-4 flex items-center gap-2">
      <button :disabled="page<=1" @click="prev" class="px-3 py-1 rounded bg-gray-800/60 border border-gray-700 disabled:opacity-50">Anterior</button>
      <span class="text-gray-300">Página {{ page }}</span>
      <button :disabled="!hasMore" @click="next" class="px-3 py-1 rounded bg-gray-800/60 border border-gray-700 disabled:opacity-50">Siguiente</button>
      <span v-if="count!==null" class="text-gray-500 text-sm">({{ count }} resultados)</span>
    </div>

    <!-- Modal confirmar eliminación -->
    <div v-if="showConfirm" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="showConfirm=false"></div>
      <div class="relative w-full max-w-md rounded-2xl border border-gray-800 bg-gray-950 p-5 shadow-2xl">
        <h3 class="text-lg font-medium mb-2">Eliminar cliente</h3>
        <p class="text-gray-300">¿Seguro que deseas eliminar <span class="font-semibold">{{ fullName(pendingDelete) }}</span>?</p>
        <div class="mt-4 flex items-center justify-end gap-2">
          <button class="px-4 py-2 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700" @click="showConfirm=false">Cancelar</button>
          <button class="px-4 py-2 rounded bg-red-600 hover:bg-red-700" @click="remove()">Eliminar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import api from '@/api/services'

const loading = ref(true)
const rows = ref([])
const page = ref(1)
const pageSize = 10
const count = ref(null)
const q = ref('')

const showConfirm = ref(false)
const pendingDelete = ref(null)

const hasMore = computed(() => count.value === null ? rows.value.length === pageSize : count.value > page.value * pageSize)

onMounted(fetch)

async function fetch() {
  loading.value = true
  try {
    const { data } = await api.clientes.list({ search: q.value, page: page.value, page_size: pageSize, ordering: '-id' })
    rows.value = data?.results || data || []
    count.value = data?.count ?? null
  } finally {
    loading.value = false
  }
}
function resetFilters(){ q.value=''; page.value=1; fetch() }
function next(){ if(hasMore.value){ page.value++; fetch() } }
function prev(){ if(page.value>1){ page.value--; fetch() } }
function fullName(c){ return [c.nombre, c.apellidos].filter(Boolean).join(' ') }
function formatDate(d){ try{ return new Date(d).toLocaleDateString('es-MX') }catch{ return d||'—' } }

function confirmDelete(c){
  pendingDelete.value = c
  showConfirm.value = true
}
async function remove(){
  try{
    await api.clientes.delete(pendingDelete.value.id)
    if(rows.value.length === 1 && page.value > 1){ page.value -= 1 }
    await fetch()
  } finally {
    showConfirm.value = false
    pendingDelete.value = null
  }
}
</script>
