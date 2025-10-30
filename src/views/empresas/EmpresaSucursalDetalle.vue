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
  <div class="p-4 space-y-6 text-white">
    <div class="flex items-center justify-between">
      <div class="space-y-1">
        <div class="text-xs text-apolo-gray-light">
          <button class="underline text-apolo-secondary hover:text-apolo-primary" @click="goBack">← Regresar a la empresa</button>
        </div>
        <h2 class="text-xl font-semibold text-white">
          {{ loadingSucursal ? 'Cargando sucursal…' : (sucursal?.nombre || 'Sucursal') }}
        </h2>
        <div class="text-sm text-apolo-gray-light">
          {{ empresa?.nombre || 'Empresa' }}
        </div>
      </div>
      <span
        class="text-[11px] px-2 py-0.5 rounded-full"
        :class="sucursal?.is_active !== false ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'"
      >
        {{ sucursal?.is_active !== false ? 'Activa' : 'Inactiva' }}
      </span>
    </div>

    <div class="border border-apolo-primary/30 rounded-xl p-4 bg-apolo-dark/80 text-sm text-apolo-gray-light">
      <div class="grid md:grid-cols-2 gap-4">
        <div><span class="text-apolo-gray-light">Teléfono:</span> <span class="text-white">{{ sucursal?.telefono || '—' }}</span></div>
        <div><span class="text-apolo-gray-light">Correo:</span> <span class="text-white">{{ sucursal?.correo || '—' }}</span></div>
        <div><span class="text-apolo-gray-light">Responsable:</span> <span class="text-white">{{ sucursal?.responsable || '—' }}</span></div>
        <div><span class="text-apolo-gray-light">Horario:</span> <span class="text-white">{{ sucursal?.horario_apertura || '—' }} - {{ sucursal?.horario_cierre || '—' }}</span></div>
        <div class="md:col-span-2"><span class="text-apolo-gray-light">Dirección:</span> <span class="text-white">{{ sucursal?.direccion || '—' }}</span></div>
      </div>
    </div>

    <!-- Almacenes -->
    <section class="space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="text-lg text-white">Almacenes de la sucursal</h3>
        <div class="flex items-center gap-2">
          <input
            v-model="almacenesSearch"
            @keyup.enter="fetchAlmacenes"
            type="search"
            placeholder="Buscar almacén…"
            class="border border-apolo-primary/40 rounded-lg px-3 py-2 bg-apolo-dark text-white placeholder-apolo-gray-light focus:border-apolo-secondary focus:ring-1 focus:ring-apolo-secondary/60"
          />
          <button class="px-3 py-2 rounded-lg border border-apolo-primary bg-apolo-primary text-apolo-dark font-medium hover:bg-apolo-secondary hover:border-apolo-secondary transition-colors" @click="fetchAlmacenes">
            Buscar
          </button>
          <button class="px-3 py-2 rounded-lg border border-apolo-primary/40 text-white hover:border-apolo-secondary hover:text-apolo-secondary transition-colors" @click="openNewAlmacen">
            Nuevo almacén
          </button>
        </div>
      </div>

      <div class="border border-apolo-primary/30 rounded-xl p-4 bg-apolo-dark/80">
        <div v-if="loadingAlmacenes" class="py-10 text-center text-apolo-gray-light">Cargando almacenes…</div>
        <div v-else-if="!almacenes.length" class="py-6 text-center text-apolo-gray-light">Sin almacenes registrados.</div>
        <div v-else class="space-y-3">
          <div
            v-for="alm in almacenes"
            :key="alm.id"
            class="border border-apolo-primary/40 rounded-lg p-3 bg-apolo-gray-dark flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div class="flex items-center gap-2">
                <h4 class="font-medium text-white">{{ alm.nombre }}</h4>
                <span v-if="alm.is_active === false" class="text-[11px] px-2 py-0.5 rounded-full border border-apolo-primary/40 text-apolo-gray-light">Inactivo</span>
              </div>
              <p v-if="alm.descripcion" class="text-sm text-apolo-gray-light">{{ alm.descripcion }}</p>
            </div>
            <div class="flex items-center gap-2">
              <button class="px-3 py-1 border border-apolo-primary/40 rounded text-white hover:border-apolo-secondary hover:text-apolo-secondary transition-colors" @click="openEditAlmacen(alm)">
                Editar
              </button>
              <button
                class="px-3 py-1 border rounded transition-colors"
                :class="alm.is_active !== false ? 'border-apolo-secondary text-apolo-secondary hover:bg-apolo-secondary/10' : 'border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10'"
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
        <h3 class="text-lg text-white">Servicios asignados</h3>
        <button class="text-sm text-apolo-secondary hover:text-apolo-primary underline" @click="fetchServicios">Actualizar</button>
      </div>
      <div class="border border-apolo-primary/30 rounded-xl p-4 bg-apolo-dark/80">
        <div v-if="loadingServicios" class="py-6 text-center text-apolo-gray-light">Cargando servicios…</div>
        <div v-else-if="!servicios.length" class="text-apolo-gray-light">No hay servicios asociados a esta sucursal.</div>
        <ul v-else class="space-y-2">
          <li v-for="srv in servicios" :key="srv.id" class="border border-apolo-primary/20 rounded-lg px-3 py-2 bg-apolo-gray-dark">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-white">{{ srv.nombre }}</p>
                <p v-if="srv.descripcion" class="text-sm text-apolo-gray-light">{{ srv.descripcion }}</p>
              </div>
              <span v-if="srv.is_active === false" class="text-[11px] px-2 py-0.5 rounded-full border border-apolo-primary/40 text-apolo-gray-light">Inactivo</span>
            </div>
          </li>
        </ul>
      </div>
    </section>

    <!-- Accesos -->
    <section class="space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="text-lg text-white">Accesos recientes</h3>
        <button class="text-sm text-apolo-secondary hover:text-apolo-primary underline" @click="fetchAccesos">Actualizar</button>
      </div>
      <div class="border border-apolo-primary/30 rounded-xl p-4 bg-apolo-dark/80">
        <div v-if="loadingAccesos" class="py-6 text-center text-apolo-gray-light">Cargando accesos…</div>
        <div v-else-if="!accesos.length" class="text-apolo-gray-light">Sin accesos registrados recientemente.</div>
        <ul v-else class="space-y-2 text-sm text-apolo-gray-light">
          <li v-for="acc in accesos" :key="acc.id" class="border border-apolo-primary/20 rounded-lg px-3 py-2 bg-apolo-gray-dark">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <span class="text-white">{{ acc.cliente_nombre || 'Cliente' }}</span>
              <span class="text-xs text-apolo-gray-light">{{ acc.fecha || acc.created_at || '—' }}</span>
              <span class="text-xs text-apolo-gray-light">{{ acc.usuario_nombre || '—' }}</span>
            </div>
          </li>
        </ul>
      </div>
    </section>

    <!-- Modal Almacén -->
    <div v-if="showAlmacenModal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="showAlmacenModal = false">
      <div class="w-full max-w-lg bg-apolo-dark border border-apolo-primary/40 rounded-2xl shadow-xl">
        <div class="px-4 py-3 border-b border-apolo-primary/30 flex items-center justify-between">
          <h3 class="text-lg text-white">{{ isEditingAlmacen ? 'Editar almacén' : 'Nuevo almacén' }}</h3>
          <button class="text-apolo-gray-light hover:text-white" @click="showAlmacenModal = false">✕</button>
        </div>
        <form class="p-4 space-y-4" @submit.prevent="saveAlmacen">
          <div>
            <label class="text-sm text-apolo-gray-light">Nombre</label>
            <input v-model.trim="almacenForm.nombre" class="w-full border border-apolo-primary/40 rounded-lg px-3 py-2 bg-apolo-dark text-white focus:border-apolo-secondary focus:ring-1 focus:ring-apolo-secondary/60" required />
          </div>
          <div>
            <label class="text-sm text-apolo-gray-light">Descripción</label>
            <textarea v-model.trim="almacenForm.descripcion" rows="3" class="w-full border border-apolo-primary/40 rounded-lg px-3 py-2 bg-apolo-dark text-white focus:border-apolo-secondary focus:ring-1 focus:ring-apolo-secondary/60"></textarea>
          </div>
          <div class="flex items-center gap-2">
            <input id="almacen_activo" type="checkbox" v-model="almacenForm.is_active" class="accent-white" />
            <label for="almacen_activo" class="text-sm text-white">Activo</label>
          </div>
          <div class="flex items-center justify-end gap-2">
            <button type="button" class="px-3 py-2 border border-apolo-primary/40 rounded-lg text-white hover:border-apolo-secondary hover:text-apolo-secondary transition-colors" @click="showAlmacenModal = false">Cancelar</button>
            <button type="submit" class="px-4 py-2 rounded-lg text-apolo-dark bg-apolo-primary hover:bg-apolo-secondary transition-colors" :disabled="!canSubmitAlmacen">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
