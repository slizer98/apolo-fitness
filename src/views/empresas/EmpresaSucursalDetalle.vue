<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api/services'

const route = useRoute()
const router = useRouter()

const empresaId = Number(route.params.id)
const sucursalId = Number(route.params.sucursalId)

if (!empresaId || !sucursalId) {
  router.replace({ name: 'EmpresasLista' })
}

const empresa = ref(null)
const sucursal = ref(null)
const loadingEmpresa = ref(false)
const loadingSucursal = ref(false)

const almacenes = ref([])
const loadingAlmacenes = ref(false)
const almacenesSearch = ref('')

const servicios = ref([])
const loadingServicios = ref(false)

const accesos = ref([])
const loadingAccesos = ref(false)

const showAlmacenModal = ref(false)
const isEditingAlmacen = ref(false)
const almacenForm = reactive({
  id: null,
  empresa: empresaId,
  sucursal: sucursalId,
  nombre: '',
  descripcion: '',
  is_active: true,
})

const canSubmitAlmacen = computed(() => !!almacenForm.nombre?.trim())

function resetAlmacenForm() {
  Object.assign(almacenForm, {
    id: null,
    empresa: empresaId,
    sucursal: sucursalId,
    nombre: '',
    descripcion: '',
    is_active: true,
  })
}

function openNewAlmacen() {
  isEditingAlmacen.value = false
  resetAlmacenForm()
  showAlmacenModal.value = true
}

function openEditAlmacen(item) {
  isEditingAlmacen.value = true
  Object.assign(almacenForm, {
    id: item.id,
    empresa: item.empresa,
    sucursal: item.sucursal,
    nombre: item.nombre || '',
    descripcion: item.descripcion || '',
    is_active: item.is_active !== false,
  })
  showAlmacenModal.value = true
}

async function fetchEmpresa() {
  if (!empresaId) return
  loadingEmpresa.value = true
  try {
    const { data } = await api.empresas.retrieve(empresaId)
    empresa.value = data
  } finally {
    loadingEmpresa.value = false
  }
}

async function fetchSucursal() {
  if (!sucursalId) return
  loadingSucursal.value = true
  try {
    const { data } = await api.sucursales.retrieve(sucursalId)
    sucursal.value = data
  } finally {
    loadingSucursal.value = false
  }
}

async function fetchAlmacenes() {
  if (!sucursalId) return
  loadingAlmacenes.value = true
  try {
    const params = { sucursal: sucursalId, ordering: 'nombre', page_size: 500 }
    if (almacenesSearch.value?.trim()) {
      params.search = almacenesSearch.value.trim()
    }
    const { data } = await api.inventario.almacenes.list(params)
    almacenes.value = data?.results || data || []
  } finally {
    loadingAlmacenes.value = false
  }
}

async function saveAlmacen() {
  if (!canSubmitAlmacen.value) {
    alert('Escribe el nombre del almacén')
    return
  }
  const payload = {
    empresa: almacenForm.empresa,
    sucursal: almacenForm.sucursal,
    nombre: almacenForm.nombre?.trim(),
    descripcion: almacenForm.descripcion?.trim() || '',
    is_active: !!almacenForm.is_active,
  }
  try {
    if (isEditingAlmacen.value && almacenForm.id) {
      await api.inventario.almacenes.update(almacenForm.id, payload)
    } else {
      await api.inventario.almacenes.create(payload)
    }
    showAlmacenModal.value = false
    await fetchAlmacenes()
  } catch (e) {
    const msg = e?.response?.data
    alert(msg?.detail || msg?.non_field_errors?.[0] || msg?.nombre?.[0] || 'Error al guardar almacén')
  }
}

async function toggleAlmacenActive(item) {
  try {
    await api.inventario.almacenes.patch(item.id, { is_active: !item.is_active })
    await fetchAlmacenes()
  } catch {
    alert('No se pudo actualizar el estado del almacén')
  }
}

async function fetchServicios() {
  loadingServicios.value = true
  try {
    const params = { page_size: 200, ordering: 'nombre' }
    if (sucursalId) params.sucursal = sucursalId
    if (empresaId) params.empresa = empresaId
    const { data } = await api.servicios.list(params)
    servicios.value = data?.results || data || []
  } catch {
    servicios.value = []
  } finally {
    loadingServicios.value = false
  }
}

async function fetchAccesos() {
  loadingAccesos.value = true
  try {
    const params = { page_size: 20, ordering: '-fecha' }
    if (sucursalId) params.sucursal = sucursalId
    const { data } = await api.accesos.list(params)
    accesos.value = data?.results || data || []
  } catch {
    accesos.value = []
  } finally {
    loadingAccesos.value = false
  }
}

function goBack() {
  router.push({ name: 'EmpresaDetalle', params: { id: empresaId } })
}

watch(almacenesSearch, async (val, oldVal) => {
  if (val !== oldVal && !val) {
    await fetchAlmacenes()
  }
})

onMounted(async () => {
  await Promise.all([fetchEmpresa(), fetchSucursal()])
  await Promise.all([fetchAlmacenes(), fetchServicios(), fetchAccesos()])
})
</script>

<template>
  <div class="p-4 space-y-6">
    <div class="flex items-center justify-between">
      <div class="space-y-1">
        <div class="text-xs text-gray-500">
          <button class="underline text-apolo-secondary hover:text-apolo-primary" @click="goBack">← Regresar a la empresa</button>
        </div>
        <h2 class="text-xl font-semibold text-gray-800">
          {{ loadingSucursal ? 'Cargando sucursal…' : (sucursal?.nombre || 'Sucursal') }}
        </h2>
        <div class="text-sm text-gray-500">
          {{ empresa?.nombre || 'Empresa' }}
        </div>
      </div>
      <span
        class="text-[11px] px-2 py-0.5 rounded-full"
        :class="sucursal?.is_active !== false ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'"
      >
        {{ sucursal?.is_active !== false ? 'Activa' : 'Inactiva' }}
      </span>
    </div>

    <div class="border border-gray-200 rounded-xl p-4 bg-white text-sm text-gray-600">
      <div class="grid md:grid-cols-2 gap-4">
        <div><span class="text-gray-500">Teléfono:</span> <span class="text-gray-800">{{ sucursal?.telefono || '—' }}</span></div>
        <div><span class="text-gray-500">Correo:</span> <span class="text-gray-800">{{ sucursal?.correo || '—' }}</span></div>
        <div><span class="text-gray-500">Responsable:</span> <span class="text-gray-800">{{ sucursal?.responsable || '—' }}</span></div>
        <div><span class="text-gray-500">Horario:</span> <span class="text-gray-800">{{ sucursal?.horario_apertura || '—' }} - {{ sucursal?.horario_cierre || '—' }}</span></div>
        <div class="md:col-span-2"><span class="text-gray-500">Dirección:</span> <span class="text-gray-800">{{ sucursal?.direccion || '—' }}</span></div>
      </div>
    </div>

    <!-- Almacenes -->
    <section class="space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-800">Almacenes de la sucursal</h3>
        <div class="flex items-center gap-2">
          <input
            v-model="almacenesSearch"
            @keyup.enter="fetchAlmacenes"
            type="search"
            placeholder="Buscar almacén…"
            class="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 placeholder:text-gray-400 focus:border-apolo-primary focus:ring-1 focus:ring-apolo-primary/50"
          />
          <button class="px-3 py-2 rounded-lg border border-apolo-primary bg-apolo-primary text-white font-medium hover:bg-apolo-secondary hover:border-apolo-secondary transition-colors" @click="fetchAlmacenes">
            Buscar
          </button>
          <button class="px-3 py-2 rounded-lg border border-apolo-secondary text-apolo-secondary hover:bg-apolo-secondary/10 transition" @click="openNewAlmacen">
            Nuevo almacén
          </button>
        </div>
      </div>

      <div class="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
        <div v-if="loadingAlmacenes" class="py-10 text-center text-gray-500">Cargando almacenes…</div>
        <div v-else-if="!almacenes.length" class="py-6 text-center text-gray-500">Sin almacenes registrados.</div>
        <div v-else class="space-y-3">
          <div
            v-for="alm in almacenes"
            :key="alm.id"
            class="border border-gray-200 rounded-lg p-3 bg-white flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between shadow-sm"
          >
            <div>
              <div class="flex items-center gap-2">
                <h4 class="font-medium text-gray-800">{{ alm.nombre }}</h4>
                <span v-if="alm.is_active === false" class="text-[11px] px-2 py-0.5 rounded-full border border-gray-300 text-gray-500">Inactivo</span>
              </div>
              <p v-if="alm.descripcion" class="text-sm text-gray-500">{{ alm.descripcion }}</p>
            </div>
            <div class="flex items-center gap-2">
              <button class="px-3 py-1 border border-gray-300 rounded text-gray-600 hover:border-apolo-primary hover:text-apolo-primary transition" @click="openEditAlmacen(alm)">
                Editar
              </button>
              <button
                class="px-3 py-1 border rounded transition"
                :class="alm.is_active !== false ? 'border-apolo-secondary text-apolo-secondary hover:bg-apolo-secondary/10' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'"
                @click="toggleAlmacenActive(alm)"
              >
                {{ alm.is_active !== false ? 'Desactivar' : 'Reactivar' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Servicios -->
    <section class="space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-800">Servicios asignados</h3>
        <button class="text-sm text-apolo-secondary hover:text-apolo-primary underline" @click="fetchServicios">Actualizar</button>
      </div>
      <div class="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
        <div v-if="loadingServicios" class="py-6 text-center text-gray-500">Cargando servicios…</div>
        <div v-else-if="!servicios.length" class="text-gray-500">No hay servicios asociados a esta sucursal.</div>
        <ul v-else class="space-y-2">
          <li v-for="srv in servicios" :key="srv.id" class="border border-gray-200 rounded-lg px-3 py-2 bg-gray-50">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-gray-800">{{ srv.nombre }}</p>
                <p v-if="srv.descripcion" class="text-sm text-gray-500">{{ srv.descripcion }}</p>
              </div>
              <span v-if="srv.is_active === false" class="text-[11px] px-2 py-0.5 rounded-full border border-gray-300 text-gray-500">Inactivo</span>
            </div>
          </li>
        </ul>
      </div>
    </section>

    <!-- Accesos -->
    <section class="space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-800">Accesos recientes</h3>
        <button class="text-sm text-apolo-secondary hover:text-apolo-primary underline" @click="fetchAccesos">Actualizar</button>
      </div>
      <div class="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
        <div v-if="loadingAccesos" class="py-6 text-center text-gray-500">Cargando accesos…</div>
        <div v-else-if="!accesos.length" class="text-gray-500">Sin accesos registrados recientemente.</div>
        <ul v-else class="space-y-2 text-sm text-gray-600">
          <li v-for="acc in accesos" :key="acc.id" class="border border-gray-200 rounded-lg px-3 py-2 bg-gray-50">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <span class="text-gray-800">{{ acc.cliente_nombre || 'Cliente' }}</span>
              <span class="text-xs text-gray-500">{{ acc.fecha || acc.created_at || '—' }}</span>
              <span class="text-xs text-gray-500">{{ acc.usuario_nombre || '—' }}</span>
            </div>
          </li>
        </ul>
      </div>
    </section>

    <!-- Modal Almacén -->
    <div v-if="showAlmacenModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="showAlmacenModal = false">
      <div class="w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-xl">
        <div class="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-800">{{ isEditingAlmacen ? 'Editar almacén' : 'Nuevo almacén' }}</h3>
          <button class="text-gray-500 hover:text-gray-700" @click="showAlmacenModal = false">✕</button>
        </div>
        <form class="p-4 space-y-4" @submit.prevent="saveAlmacen">
          <div>
            <label class="text-sm text-gray-500">Nombre</label>
            <input v-model.trim="almacenForm.nombre" class="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:border-apolo-primary focus:ring-1 focus:ring-apolo-primary/50" required />
          </div>
          <div>
            <label class="text-sm text-gray-500">Descripción</label>
            <textarea v-model.trim="almacenForm.descripcion" rows="3" class="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:border-apolo-primary focus:ring-1 focus:ring-apolo-primary/50"></textarea>
          </div>
          <div class="flex items-center gap-2">
            <input id="almacen_activo" type="checkbox" v-model="almacenForm.is_active" class="accent-apolo-primary" />
            <label for="almacen_activo" class="text-sm text-gray-700">Activo</label>
          </div>
          <div class="flex items-center justify-end gap-2">
            <button type="button" class="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:border-apolo-primary hover:text-apolo-primary transition" @click="showAlmacenModal = false">Cancelar</button>
            <button type="submit" class="px-4 py-2 rounded-lg text-white bg-apolo-primary hover:bg-apolo-secondary transition" :disabled="!canSubmitAlmacen">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
