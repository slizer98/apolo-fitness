<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import api from '@/api/services'

const q = ref('')
const estado = ref('activos') // activos | inactivos | todos
const page = ref(1)
const pageSize = ref(24)
const viewMode = ref(localStorage.getItem('empresasViewMode') || 'cards') // cards | list
const menuOpenId = ref(null) // para el menú "..."

const empresas = ref([])
const loading = ref(false)

/* ===== Modal Empresa ===== */
const showModal = ref(false)
const isEditing = ref(false)
const form = reactive({
  id: null,
  nombre: '',
  razon_social: '',
  rfc: '',
  direccion: '',
  telefono: '',
  correo: '',
  sitio_web: '',
  is_active: true,
})

function toggleView(mode){
  viewMode.value = mode
  localStorage.setItem('empresasViewMode', mode)
}

function openNew(){
  isEditing.value = false
  Object.assign(form, {
    id: null,
    nombre: '',
    razon_social: '',
    rfc: '',
    direccion: '',
    telefono: '',
    correo: '',
    sitio_web: '',
    is_active: true,
  })
  showModal.value = true
}

function openEdit(e){
  isEditing.value = true
  Object.assign(form, {
    id: e.id,
    nombre: e.nombre || '',
    razon_social: e.razon_social || '',
    rfc: e.rfc || '',
    direccion: e.direccion || '',
    telefono: e.telefono || '',
    correo: e.correo || '',
    sitio_web: e.sitio_web || '',
    is_active: e.is_active !== false,
  })
  showModal.value = true
}

async function save(){
  const payload = {
    nombre: form.nombre?.trim(),
    razon_social: form.razon_social?.trim(),
    rfc: form.rfc?.trim(),
    direccion: form.direccion?.trim(),
    telefono: form.telefono?.trim(),
    correo: form.correo?.trim(),
    sitio_web: form.sitio_web?.trim(),
    is_active: !!form.is_active,
  }
  try{
    if(isEditing.value && form.id){
      await api.empresas.update(form.id, payload)
    }else{
      await api.empresas.create(payload)
    }
    showModal.value = false
    await load()
  }catch(e){
    const msg = e?.response?.data
    alert(msg?.detail || 'Error al guardar empresa')
  }
}

async function toggleActive(e){
  try{
    await api.empresas.patch(e.id, { is_active: !e.is_active })
    await load()
  }catch{
    alert('No se pudo actualizar el estado')
  }
}

/* ===== Listado & Filtros (cliente) ===== */
const norm = s => (s || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

const filtered = computed(() => {
  const term = norm(q.value)
  return (empresas.value || []).filter(e => {
    // filtro por estado
    if(estado.value === 'activos' && e.is_active === false) return false
    if(estado.value === 'inactivos' && e.is_active !== false) return false
    // filtro por texto (cliente)
    if(!term) return true
    const hay = [
      e.nombre, e.razon_social, e.rfc, e.correo, e.telefono
    ].some(v => norm(v).includes(term))
    return hay
  })
})

const total = computed(() => filtered.value.length)
const paginated = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value)
})

async function load(){
  loading.value = true
  try{
    // Pedimos un page_size alto para filtrar en cliente cómodamente
    const { data } = await api.empresas.list({ page_size: 500, ordering: 'nombre' })
    empresas.value = data?.results || data || []
    // reset de paginación si la página quedó fuera de rango tras filtrar
    if((page.value - 1) * pageSize.value >= filtered.value.length){
      page.value = 1
    }
  }finally{
    loading.value = false
  }
}

onMounted(load)
watch([q, estado, pageSize], () => { page.value = 1 }) // si cambian filtros, vuelve a página 1
</script>

<template>
  <div class="p-4 space-y-4">
    <!-- Toolbar -->
    <div class="flex flex-col md:flex-row gap-3 items-stretch">
      <div class="flex-1 flex items-center gap-2">
        <input
          v-model="q"
          type="text"
          placeholder="Buscar empresa…"
          class="w-full border border-gray-800 rounded-lg px-3 py-2 bg-gray-900 text-gray-100 placeholder-gray-400"
        />
        <select v-model="estado" class="border border-gray-800 rounded-lg px-3 py-2 bg-gray-900 text-gray-100">
          <option value="activos">Activos</option>
          <option value="inactivos">Inactivos</option>
          <option value="todos">Todos</option>
        </select>
      </div>

      <div class="flex items-center gap-2">
        <div class="border border-gray-800 rounded-lg overflow-hidden flex">
          <button
            class="px-3 py-2 text-gray-100"
            :class="viewMode==='cards' ? 'bg-gray-800' : ''"
            @click="toggleView('cards')"
          >
            Tarjetas
          </button>
        <button
            class="px-3 py-2 text-gray-100"
            :class="viewMode==='list' ? 'bg-gray-800' : ''"
            @click="toggleView('list')"
          >
            Lista
          </button>
        </div>
        <button @click="openNew" class="px-3 py-2 rounded-lg border border-gray-700 hover:border-gray-500 text-gray-100">
          Nueva empresa
        </button>
      </div>
    </div>

    <div class="border border-gray-800 rounded-xl p-3 bg-gray-950">
      <div v-if="loading" class="py-10 text-center text-gray-400">Cargando…</div>

      <!-- Cards (clic a detalle) -->
      <div v-else-if="viewMode==='cards'" class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        <div
          v-for="e in paginated"
          :key="e.id"
          class="border border-gray-800 rounded-lg p-3 bg-gray-900 hover:shadow-lg hover:shadow-black/30 cursor-pointer"
          @click="$router.push(`/empresas/${e.id}`)"
        >
          <div class="flex items-start justify-between">
            <div>
              <div class="font-medium text-gray-100">{{ e.nombre }}</div>
              <div class="text-xs text-gray-400">{{ e.razon_social || '—' }}</div>
            </div>
            <span
              class="text-[11px] px-2 py-0.5 rounded-full"
              :class="e.is_active !== false ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'"
            >
              {{ e.is_active !== false ? 'Activo' : 'Inactivo' }}
            </span>
          </div>

          <div class="mt-2 text-xs text-gray-400 space-y-0.5">
            <div>RFC: <b class="text-gray-300">{{ e.rfc || '—' }}</b></div>
            <div>Correo: <b class="text-gray-300">{{ e.correo || '—' }}</b></div>
            <div>Tel: <b class="text-gray-300">{{ e.telefono || '—' }}</b></div>
          </div>

          <div class="mt-3 flex items-center justify-end">
            <button
              class="px-2 py-1 border border-gray-700 rounded"
              :class="e.is_active !== false ? 'text-amber-300 hover:border-amber-400' : 'text-emerald-300 hover:border-emerald-400'"
              @click.stop="toggleActive(e)"
            >
              {{ e.is_active !== false ? 'Desactivar' : 'Activar' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Tabla (nombre clickeable + menú ...) -->
      <div v-else class="overflow-auto">
        <table class="min-w-full text-sm">
          <thead class="text-gray-300">
            <tr>
              <th class="text-left p-2">Nombre</th>
              <th class="text-left p-2">Razón social</th>
              <th class="text-left p-2">RFC</th>
              <th class="text-left p-2">Correo</th>
              <th class="text-left p-2">Teléfono</th>
              <th class="text-left p-2">Estado</th>
              <th class="text-right p-2"> </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="e in paginated" :key="e.id" class="border-t border-gray-800 text-gray-200">
              <td class="p-2">
                <a class="underline hover:text-white cursor-pointer" @click="$router.push(`/empresas/${e.id}`)">
                  {{ e.nombre }}
                </a>
              </td>
              <td class="p-2">{{ e.razon_social || '—' }}</td>
              <td class="p-2">{{ e.rfc || '—' }}</td>
              <td class="p-2">{{ e.correo || '—' }}</td>
              <td class="p-2">{{ e.telefono || '—' }}</td>
              <td class="p-2">
                <span
                  class="text-[11px] px-2 py-0.5 rounded-full"
                  :class="e.is_active !== false ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'"
                >
                  {{ e.is_active !== false ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td class="p-2 text-right relative">
                <button
                  class="px-2 py-1 border border-gray-700 rounded text-gray-100 hover:border-gray-500"
                  @click="menuOpenId = (menuOpenId === e.id ? null : e.id)"
                >
                  …
                </button>
                <div
                  v-if="menuOpenId === e.id"
                  class="absolute right-2 mt-1 w-40 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-10"
                  @mouseleave="menuOpenId=null"
                >
                  <button class="w-full text-left px-3 py-2 hover:bg-gray-800" @click="openEdit(e); menuOpenId=null">Editar</button>
                  <button
                    class="w-full text-left px-3 py-2 hover:bg-gray-800"
                    :class="e.is_active !== false ? 'text-amber-300' : 'text-emerald-300'"
                    @click="toggleActive(e); menuOpenId=null"
                  >
                    {{ e.is_active !== false ? 'Desactivar' : 'Activar' }}
                  </button>
                  <button class="w-full text-left px-3 py-2 hover:bg-gray-800" @click="$router.push(`/empresas/${e.id}`); menuOpenId=null">
                    Ver detalle
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div class="mt-4 flex items-center justify-between">
        <div class="text-sm text-gray-400">Total: {{ total }}</div>
        <div class="flex items-center gap-2">
          <button
            class="px-2 py-1 border border-gray-700 rounded text-gray-100 hover:border-gray-500 disabled:opacity-40"
            :disabled="page<=1"
            @click="page = Math.max(1, page-1)"
          >Anterior</button>
          <span class="text-sm text-gray-300">Página {{ page }}</span>
          <button
            class="px-2 py-1 border border-gray-700 rounded text-gray-100 hover:border-gray-500 disabled:opacity-40"
            :disabled="(page * pageSize) >= total"
            @click="page = page+1"
          >Siguiente</button>
          <select v-model.number="pageSize" class="border border-gray-800 rounded px-2 py-1 bg-gray-900 text-gray-100">
            <option :value="12">12</option>
            <option :value="24">24</option>
            <option :value="48">48</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Modal Empresa -->
    <div v-if="showModal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="showModal=false">
      <div class="w-full max-w-2xl bg-gray-950 border border-gray-800 rounded-2xl shadow-xl">
        <div class="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
          <h3 class="text-lg text-gray-100">{{ isEditing ? 'Editar empresa' : 'Nueva empresa' }}</h3>
          <button @click="showModal=false" class="text-gray-400 hover:text-white">✕</button>
        </div>

        <form @submit.prevent="save" class="p-4 grid sm:grid-cols-2 gap-3">
          <div class="sm:col-span-2">
            <label class="text-sm text-gray-300">Nombre</label>
            <input v-model.trim="form.nombre" required class="w-full border border-gray-700 rounded-lg px-3 py-2 bg-gray-900 text-gray-100"/>
          </div>
          <div>
            <label class="text-sm text-gray-300">Razón social</label>
            <input v-model.trim="form.razon_social" class="w-full border border-gray-700 rounded-lg px-3 py-2 bg-gray-900 text-gray-100"/>
          </div>
          <div>
            <label class="text-sm text-gray-300">RFC</label>
            <input v-model.trim="form.rfc" class="w-full border border-gray-700 rounded-lg px-3 py-2 bg-gray-900 text-gray-100"/>
          </div>
          <div class="sm:col-span-2">
            <label class="text-sm text-gray-300">Dirección</label>
            <textarea v-model.trim="form.direccion" rows="2" class="w-full border border-gray-700 rounded-lg px-3 py-2 bg-gray-900 text-gray-100"></textarea>
          </div>
          <div>
            <label class="text-sm text-gray-300">Teléfono</label>
            <input v-model.trim="form.telefono" class="w-full border border-gray-700 rounded-lg px-3 py-2 bg-gray-900 text-gray-100"/>
          </div>
          <div>
            <label class="text-sm text-gray-300">Correo</label>
            <input v-model.trim="form.correo" type="email" class="w-full border border-gray-700 rounded-lg px-3 py-2 bg-gray-900 text-gray-100"/>
          </div>
          <div class="sm:col-span-2">
            <label class="text-sm text-gray-300">Sitio web</label>
            <input v-model.trim="form.sitio_web" class="w-full border border-gray-700 rounded-lg px-3 py-2 bg-gray-900 text-gray-100"/>
          </div>
          <div class="sm:col-span-2 flex items-center justify-between">
            <label class="flex items-center gap-2 text-gray-200">
              <input type="checkbox" v-model="form.is_active" class="accent-white"/>
              Activa
            </label>
            <div class="flex gap-2">
              <button type="button" @click="showModal=false" class="px-3 py-2 border border-gray-700 rounded-lg text-gray-100 hover:border-gray-500">Cancelar</button>
              <button type="submit" class="px-4 py-2 rounded-lg text-white bg-black border border-gray-700 hover:border-gray-500">Guardar</button>
            </div>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<style scoped>
</style>
