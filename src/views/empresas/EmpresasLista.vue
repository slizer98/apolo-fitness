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
          class="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 placeholder:text-gray-400 focus:border-apolo-primary focus:ring-1 focus:ring-apolo-primary/50"
        />
        <select v-model="estado" class="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:border-apolo-primary focus:ring-1 focus:ring-apolo-primary/50">
          <option value="activos">Activos</option>
          <option value="inactivos">Inactivos</option>
          <option value="todos">Todos</option>
        </select>
      </div>

      <div class="flex items-center gap-2">
        <div class="border border-gray-200 rounded-lg overflow-hidden flex bg-gray-100">
          <button
            class="px-3 py-2 transition-colors"
            :class="viewMode==='cards' ? 'bg-apolo-primary text-white font-medium' : 'text-gray-600 hover:text-apolo-primary'"
            @click="toggleView('cards')"
          >
            Tarjetas
          </button>
        <button
            class="px-3 py-2 transition-colors"
            :class="viewMode==='list' ? 'bg-apolo-primary text-white font-medium' : 'text-gray-600 hover:text-apolo-primary'"
            @click="toggleView('list')"
          >
            Lista
          </button>
        </div>
        <button @click="openNew" class="px-3 py-2 rounded-lg border border-apolo-primary bg-apolo-primary text-white font-medium hover:bg-apolo-secondary hover:border-apolo-secondary transition-colors">
          Nueva empresa
        </button>
      </div>
    </div>

    <div class="border border-gray-200 rounded-xl p-3 bg-white shadow-sm">
      <div v-if="loading" class="py-10 text-center text-gray-500">Cargando…</div>

      <!-- Cards (clic a detalle) -->
      <div v-else-if="viewMode==='cards'" class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        <div
          v-for="e in paginated"
          :key="e.id"
          class="border border-gray-200 rounded-lg p-3 bg-white hover:border-apolo-primary hover:shadow-lg hover:shadow-apolo-primary/20 cursor-pointer transition"
          @click="$router.push(`/empresas/${e.id}`)"
        >
          <div class="flex items-start justify-between">
            <div>
              <div class="font-medium text-gray-800">{{ e.nombre }}</div>
              <div class="text-xs text-gray-500">{{ e.razon_social || '—' }}</div>
            </div>
            <span
              class="text-[11px] px-2 py-0.5 rounded-full"
              :class="e.is_active !== false ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'"
            >
              {{ e.is_active !== false ? 'Activo' : 'Inactivo' }}
            </span>
          </div>

          <div class="mt-2 text-xs text-gray-500 space-y-0.5">
            <div>RFC: <b class="text-gray-700">{{ e.rfc || '—' }}</b></div>
            <div>Correo: <b class="text-gray-700">{{ e.correo || '—' }}</b></div>
            <div>Tel: <b class="text-gray-700">{{ e.telefono || '—' }}</b></div>
          </div>

          <div class="mt-3 flex items-center justify-end">
            <button
              class="px-2 py-1 border rounded transition"
              :class="e.is_active !== false ? 'border-apolo-secondary text-apolo-secondary hover:bg-apolo-secondary/10' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'"
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
          <thead class="text-gray-500">
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
            <tr v-for="e in paginated" :key="e.id" class="border-t border-gray-100 text-gray-700">
              <td class="p-2">
                <a class="underline text-apolo-secondary hover:text-apolo-primary cursor-pointer" @click="$router.push(`/empresas/${e.id}`)">
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
                  :class="e.is_active !== false ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'"
                >
                  {{ e.is_active !== false ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td class="p-2 text-right relative">
                <button
                  class="px-2 py-1 border border-gray-300 rounded text-gray-600 hover:border-apolo-primary hover:text-apolo-primary transition"
                  @click="menuOpenId = (menuOpenId === e.id ? null : e.id)"
                >
                  …
                </button>
                <div
                  v-if="menuOpenId === e.id"
                  class="absolute right-2 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-xl z-10"
                  @mouseleave="menuOpenId=null"
                >
                  <button class="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 transition" @click="openEdit(e); menuOpenId=null">Editar</button>
                  <button
                    class="w-full text-left px-3 py-2 hover:bg-gray-100 transition"
                    :class="e.is_active !== false ? 'text-apolo-secondary' : 'text-emerald-600'"
                    @click="toggleActive(e); menuOpenId=null"
                  >
                    {{ e.is_active !== false ? 'Desactivar' : 'Activar' }}
                  </button>
                  <button class="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 transition" @click="$router.push(`/empresas/${e.id}`); menuOpenId=null">
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
        <div class="text-sm text-gray-500">Total: {{ total }}</div>
        <div class="flex items-center gap-2">
          <button
            class="px-2 py-1 border border-gray-300 rounded text-gray-600 hover:border-apolo-primary hover:text-apolo-primary disabled:opacity-40 transition"
            :disabled="page<=1"
            @click="page = Math.max(1, page-1)"
          >Anterior</button>
          <span class="text-sm text-gray-700">Página {{ page }}</span>
          <button
            class="px-2 py-1 border border-gray-300 rounded text-gray-600 hover:border-apolo-primary hover:text-apolo-primary disabled:opacity-40 transition"
            :disabled="(page * pageSize) >= total"
            @click="page = page+1"
          >Siguiente</button>
          <select v-model.number="pageSize" class="border border-gray-300 rounded px-2 py-1 bg-white text-gray-700 focus:border-apolo-primary focus:ring-1 focus:ring-apolo-primary/50">
            <option :value="12">12</option>
            <option :value="24">24</option>
            <option :value="48">48</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Modal Empresa -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="showModal=false">
      <div class="w-full max-w-2xl bg-white border border-gray-200 rounded-2xl shadow-xl">
        <div class="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-800">{{ isEditing ? 'Editar empresa' : 'Nueva empresa' }}</h3>
          <button @click="showModal=false" class="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <form @submit.prevent="save" class="p-4 grid sm:grid-cols-2 gap-3">
          <div class="sm:col-span-2">
            <label class="text-sm text-gray-500">Nombre</label>
            <input v-model.trim="form.nombre" required class="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:border-apolo-primary focus:ring-1 focus:ring-apolo-primary/50"/>
          </div>
          <div>
            <label class="text-sm text-gray-500">Razón social</label>
            <input v-model.trim="form.razon_social" class="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:border-apolo-primary focus:ring-1 focus:ring-apolo-primary/50"/>
          </div>
          <div>
            <label class="text-sm text-gray-500">RFC</label>
            <input v-model.trim="form.rfc" class="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:border-apolo-primary focus:ring-1 focus:ring-apolo-primary/50"/>
          </div>
          <div class="sm:col-span-2">
            <label class="text-sm text-gray-500">Dirección</label>
            <textarea v-model.trim="form.direccion" rows="2" class="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:border-apolo-primary focus:ring-1 focus:ring-apolo-primary/50"></textarea>
          </div>
          <div>
            <label class="text-sm text-gray-500">Teléfono</label>
            <input v-model.trim="form.telefono" class="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:border-apolo-primary focus:ring-1 focus:ring-apolo-primary/50"/>
          </div>
          <div>
            <label class="text-sm text-gray-500">Correo</label>
            <input v-model.trim="form.correo" type="email" class="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:border-apolo-primary focus:ring-1 focus:ring-apolo-primary/50"/>
          </div>
          <div class="sm:col-span-2">
            <label class="text-sm text-gray-500">Sitio web</label>
            <input v-model.trim="form.sitio_web" class="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:border-apolo-primary focus:ring-1 focus:ring-apolo-primary/50"/>
          </div>
          <div class="sm:col-span-2 flex items-center justify-between">
            <label class="flex items-center gap-2 text-gray-700">
              <input type="checkbox" v-model="form.is_active" class="accent-apolo-primary"/>
              Activa
            </label>
            <div class="flex gap-2">
              <button type="button" @click="showModal=false" class="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:border-apolo-primary hover:text-apolo-primary transition">Cancelar</button>
              <button type="submit" class="px-4 py-2 rounded-lg text-white bg-apolo-primary hover:bg-apolo-secondary transition">Guardar</button>
            </div>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<style scoped>
</style>
