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

const tabs = [
  { key: 'almacenes', label: 'Almacenes' },
  { key: 'servicios', label: 'Servicios' },
  { key: 'accesos', label: 'Accesos' },
]
const activeTab = ref('almacenes')

const empresa = ref(null)
const sucursal = ref(null)
const loadingEmpresa = ref(false)
const loadingSucursal = ref(false)

const almacenes = ref([])
const loadingAlmacenes = ref(false)
const almacenesSearch = ref('')

const servicios = ref([])
const loadingServicios = ref(false)
const serviciosSearch = ref('')

const accesos = ref([])
const loadingAccesos = ref(false)
const accesosSearch = ref('')

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

const showServicioModal = ref(false)
const isEditingServicio = ref(false)
const servicioForm = reactive({
  id: null,
  empresa: empresaId,
  sucursal: sucursalId,
  nombre: '',
  descripcion: '',
  is_active: true,
})

const canSubmitServicio = computed(() => !!servicioForm.nombre?.trim())

const showAccesoModal = ref(false)
const isEditingAcceso = ref(false)
const accesoForm = reactive({
  id: null,
  empresa: empresaId,
  sucursal: sucursalId,
  cliente: null,
  tipo_acceso: '',
  fecha: '',
  nota: '',
  is_active: true,
})

const canSubmitAcceso = computed(() => !!accesoForm.cliente && !!accesoForm.fecha)

const filteredServicios = computed(() => {
  const term = serviciosSearch.value.trim().toLowerCase()
  if (!term) return servicios.value
  return servicios.value.filter((item) => {
    const nombre = item?.nombre?.toLowerCase() || ''
    const descripcion = item?.descripcion?.toLowerCase() || ''
    return nombre.includes(term) || descripcion.includes(term)
  })
})

const filteredAccesos = computed(() => {
  const term = accesosSearch.value.trim().toLowerCase()
  if (!term) return accesos.value
  return accesos.value.filter((item) => {
    const cliente = `${item?.cliente_nombre || ''}`.toLowerCase()
    const clienteId = `${item?.cliente || ''}`.toLowerCase()
    const tipo = `${item?.tipo_acceso || item?.tipo || ''}`.toLowerCase()
    const nota = `${item?.nota || ''}`.toLowerCase()
    return cliente.includes(term) || clienteId.includes(term) || tipo.includes(term) || nota.includes(term)
  })
})

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

function resetServicioForm() {
  Object.assign(servicioForm, {
    id: null,
    empresa: empresaId,
    sucursal: sucursalId,
    nombre: '',
    descripcion: '',
    is_active: true,
  })
}

function openNewServicio() {
  isEditingServicio.value = false
  resetServicioForm()
  showServicioModal.value = true
}

function openEditServicio(item) {
  isEditingServicio.value = true
  Object.assign(servicioForm, {
    id: item.id,
    empresa: normalizeId(item.empresa, empresaId),
    sucursal: normalizeId(item.sucursal, sucursalId),
    nombre: item.nombre || '',
    descripcion: item.descripcion || '',
    is_active: item.is_active !== false,
  })
  showServicioModal.value = true
}

function resetAccesoForm() {
  Object.assign(accesoForm, {
    id: null,
    empresa: empresaId,
    sucursal: sucursalId,
    cliente: null,
    tipo_acceso: '',
    fecha: formatDatetimeLocal(new Date()),
    nota: '',
    is_active: true,
  })
}

function openNewAcceso() {
  isEditingAcceso.value = false
  resetAccesoForm()
  showAccesoModal.value = true
}

function openEditAcceso(item) {
  isEditingAcceso.value = true
  Object.assign(accesoForm, {
    id: item.id,
    empresa: normalizeId(item.empresa, empresaId),
    sucursal: normalizeId(item.sucursal, sucursalId),
    cliente: normalizeId(item.cliente, null),
    tipo_acceso: item.tipo_acceso || item.tipo || '',
    fecha: formatDatetimeLocal(item.fecha || item.created_at || new Date()),
    nota: item.nota || '',
    is_active: item.is_active !== false,
  })
  showAccesoModal.value = true
}

function formatDatetimeLocal(value) {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return offsetDate.toISOString().slice(0, 16)
}

function datetimeLocalToISO(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

function formatDisplayDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString()
}

function normalizeId(value, fallback = null) {
  if (value === undefined || value === null) return fallback
  if (typeof value === 'object') {
    if (value.id !== undefined && value.id !== null) return value.id
    if (value.pk !== undefined && value.pk !== null) return value.pk
    return fallback
  }
  return value
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

async function saveServicio() {
  if (!canSubmitServicio.value) {
    alert('Escribe el nombre del servicio')
    return
  }
  const payload = {
    empresa: normalizeId(servicioForm.empresa, empresaId),
    sucursal: normalizeId(servicioForm.sucursal, sucursalId),
    nombre: servicioForm.nombre?.trim(),
    descripcion: servicioForm.descripcion?.trim() || '',
    is_active: !!servicioForm.is_active,
  }
  try {
    if (isEditingServicio.value && servicioForm.id) {
      await api.servicios.update(servicioForm.id, payload)
    } else {
      await api.servicios.create(payload)
    }
    showServicioModal.value = false
    await fetchServicios()
  } catch (e) {
    const msg = e?.response?.data
    alert(msg?.detail || msg?.non_field_errors?.[0] || msg?.nombre?.[0] || 'Error al guardar servicio')
  }
}

async function toggleServicioActive(item) {
  try {
    const nextState = item?.is_active === false ? true : false
    await api.servicios.patch(item.id, { is_active: nextState })
    await fetchServicios()
  } catch (e) {
    alert(e?.response?.data?.detail || 'No se pudo actualizar el estado del servicio')
  }
}

async function saveAcceso() {
  if (!canSubmitAcceso.value) {
    alert('El cliente y la fecha son obligatorios')
    return
  }
  const fechaIso = datetimeLocalToISO(accesoForm.fecha)
  if (!fechaIso) {
    alert('Fecha inválida')
    return
  }
  const payload = {
    empresa: normalizeId(accesoForm.empresa, empresaId),
    sucursal: normalizeId(accesoForm.sucursal, sucursalId),
    cliente: normalizeId(accesoForm.cliente, null),
    tipo_acceso: accesoForm.tipo_acceso?.trim() || undefined,
    fecha: fechaIso,
    nota: accesoForm.nota?.trim() || '',
    is_active: !!accesoForm.is_active,
  }
  if (!payload.tipo_acceso) delete payload.tipo_acceso
  try {
    if (isEditingAcceso.value && accesoForm.id) {
      await api.accesos.update(accesoForm.id, payload)
    } else {
      await api.accesos.create(payload)
    }
    showAccesoModal.value = false
    await fetchAccesos()
  } catch (e) {
    const msg = e?.response?.data
    alert(msg?.detail || msg?.non_field_errors?.[0] || 'No se pudo guardar el acceso')
  }
}

async function deactivateAcceso(item) {
  if (!item?.id) return
  try {
    await api.accesos.patch(item.id, { is_active: false })
    await fetchAccesos()
  } catch (e) {
    alert(e?.response?.data?.detail || 'No se pudo desactivar el acceso')
  }
}

async function reactivateAcceso(item) {
  if (!item?.id) return
  try {
    await api.accesos.patch(item.id, { is_active: true })
    await fetchAccesos()
  } catch (e) {
    alert(e?.response?.data?.detail || 'No se pudo reactivar el acceso')
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

    <div class="bg-white border border-gray-200 rounded-2xl shadow-sm">
      <nav class="flex flex-wrap gap-2 px-4 pt-4 border-b border-gray-200">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="px-4 py-2 rounded-xl text-sm font-medium transition"
          :class="
            activeTab === tab.key
              ? 'bg-apolo-primary text-white shadow-sm'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          "
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </nav>

      <div class="p-4 space-y-6">
        <section v-if="activeTab === 'almacenes'" class="space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h3 class="text-lg font-semibold text-gray-800">Almacenes</h3>
            <div class="flex flex-wrap items-center gap-2">
              <div class="relative">
                <span class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
                  <i class="fa-solid fa-magnifying-glass"></i>
                </span>
                <input
                  v-model="almacenesSearch"
                  @keyup.enter="fetchAlmacenes"
                  type="search"
                  placeholder="Buscar almacén…"
                  class="pl-9 pr-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 placeholder:text-gray-400 focus:border-apolo-primary focus:ring-1 focus:ring-apolo-primary/50"
                />
              </div>
              <button
                class="h-10 px-3 rounded-lg border border-apolo-primary bg-apolo-primary text-white font-medium hover:bg-apolo-secondary hover:border-apolo-secondary transition-colors"
                @click="fetchAlmacenes"
              >
                Buscar
              </button>
              <button
                class="h-10 px-3 rounded-lg border border-apolo-secondary text-apolo-secondary hover:bg-apolo-secondary/10 transition"
                @click="openNewAlmacen"
              >
                Nuevo almacén
              </button>
            </div>
          </div>

          <div class="border border-gray-200 rounded-xl overflow-hidden">
            <div v-if="loadingAlmacenes" class="py-10 text-center text-gray-500">Cargando almacenes…</div>
            <div v-else-if="!almacenes.length" class="py-8 text-center text-gray-500">Sin almacenes registrados.</div>
            <div v-else class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200 text-sm text-left">
                <thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th class="px-4 py-3 font-medium">Nombre</th>
                    <th class="px-4 py-3 font-medium">Descripción</th>
                    <th class="px-4 py-3 font-medium">Estado</th>
                    <th class="px-4 py-3 font-medium text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="alm in almacenes" :key="alm.id" class="bg-white">
                    <td class="px-4 py-3 text-gray-800 font-medium">{{ alm.nombre }}</td>
                    <td class="px-4 py-3 text-gray-600">{{ alm.descripcion || '—' }}</td>
                    <td class="px-4 py-3">
                      <span
                        class="text-xs px-2 py-1 rounded-full border"
                        :class="
                          alm.is_active !== false
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                            : 'border-gray-200 bg-gray-100 text-gray-500'
                        "
                      >
                        {{ alm.is_active !== false ? 'Activo' : 'Inactivo' }}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex justify-end gap-2">
                        <button
                          class="px-3 py-1 border border-gray-300 rounded-lg text-gray-600 hover:border-apolo-primary hover:text-apolo-primary transition"
                          @click="openEditAlmacen(alm)"
                        >
                          Editar
                        </button>
                        <button
                          class="px-3 py-1 rounded-lg transition"
                          :class="
                            alm.is_active !== false
                              ? 'border border-apolo-secondary text-apolo-secondary hover:bg-apolo-secondary/10'
                              : 'border border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                          "
                          @click="toggleAlmacenActive(alm)"
                        >
                          {{ alm.is_active !== false ? 'Desactivar' : 'Reactivar' }}
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section v-else-if="activeTab === 'servicios'" class="space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h3 class="text-lg font-semibold text-gray-800">Servicios</h3>
            <div class="flex flex-wrap items-center gap-2">
              <div class="relative">
                <span class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
                  <i class="fa-solid fa-magnifying-glass"></i>
                </span>
                <input
                  v-model="serviciosSearch"
                  type="search"
                  placeholder="Buscar servicio…"
                  class="pl-9 pr-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 placeholder:text-gray-400 focus:border-apolo-primary focus:ring-1 focus:ring-apolo-primary/50"
                />
              </div>
              <button
                class="h-10 px-3 rounded-lg border border-gray-300 text-gray-600 hover:border-apolo-primary hover:text-apolo-primary transition"
                @click="fetchServicios"
              >
                Actualizar
              </button>
              <button
                class="h-10 px-3 rounded-lg border border-apolo-secondary text-apolo-secondary hover:bg-apolo-secondary/10 transition"
                @click="openNewServicio"
              >
                Nuevo servicio
              </button>
            </div>
          </div>

          <div class="border border-gray-200 rounded-xl overflow-hidden">
            <div v-if="loadingServicios" class="py-8 text-center text-gray-500">Cargando servicios…</div>
            <div v-else-if="!filteredServicios.length" class="py-8 text-center text-gray-500">
              {{ servicios.length ? 'Sin coincidencias para la búsqueda.' : 'No hay servicios asociados a esta sucursal.' }}
            </div>
            <div v-else class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200 text-sm text-left">
                <thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th class="px-4 py-3 font-medium">Nombre</th>
                    <th class="px-4 py-3 font-medium">Descripción</th>
                    <th class="px-4 py-3 font-medium">Estado</th>
                    <th class="px-4 py-3 font-medium text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="srv in filteredServicios" :key="srv.id" class="bg-white">
                    <td class="px-4 py-3 text-gray-800 font-medium">{{ srv.nombre }}</td>
                    <td class="px-4 py-3 text-gray-600">{{ srv.descripcion || '—' }}</td>
                    <td class="px-4 py-3">
                      <span
                        class="text-xs px-2 py-1 rounded-full border"
                        :class="
                          srv.is_active !== false
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                            : 'border-gray-200 bg-gray-100 text-gray-500'
                        "
                      >
                        {{ srv.is_active !== false ? 'Activo' : 'Inactivo' }}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex justify-end gap-2">
                        <button
                          class="px-3 py-1 border border-gray-300 rounded-lg text-gray-600 hover:border-apolo-primary hover:text-apolo-primary transition"
                          @click="openEditServicio(srv)"
                        >
                          Editar
                        </button>
                        <button
                          class="px-3 py-1 rounded-lg transition"
                          :class="
                            srv.is_active !== false
                              ? 'border border-apolo-secondary text-apolo-secondary hover:bg-apolo-secondary/10'
                              : 'border border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                          "
                          @click="toggleServicioActive(srv)"
                        >
                          {{ srv.is_active !== false ? 'Desactivar' : 'Reactivar' }}
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section v-else class="space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h3 class="text-lg font-semibold text-gray-800">Accesos</h3>
            <div class="flex flex-wrap items-center gap-2">
              <div class="relative">
                <span class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
                  <i class="fa-solid fa-magnifying-glass"></i>
                </span>
                <input
                  v-model="accesosSearch"
                  type="search"
                  placeholder="Buscar acceso…"
                  class="pl-9 pr-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 placeholder:text-gray-400 focus:border-apolo-primary focus:ring-1 focus:ring-apolo-primary/50"
                />
              </div>
              <button
                class="h-10 px-3 rounded-lg border border-gray-300 text-gray-600 hover:border-apolo-primary hover:text-apolo-primary transition"
                @click="fetchAccesos"
              >
                Actualizar
              </button>
              <button
                class="h-10 px-3 rounded-lg border border-apolo-secondary text-apolo-secondary hover:bg-apolo-secondary/10 transition"
                @click="openNewAcceso"
              >
                Registrar acceso
              </button>
            </div>
          </div>

          <div class="border border-gray-200 rounded-xl overflow-hidden">
            <div v-if="loadingAccesos" class="py-8 text-center text-gray-500">Cargando accesos…</div>
            <div v-else-if="!filteredAccesos.length" class="py-8 text-center text-gray-500">
              {{ accesos.length ? 'Sin coincidencias para la búsqueda.' : 'Sin accesos registrados.' }}
            </div>
            <div v-else class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200 text-sm text-left">
                <thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th class="px-4 py-3 font-medium">Fecha</th>
                    <th class="px-4 py-3 font-medium">Cliente</th>
                    <th class="px-4 py-3 font-medium">Tipo</th>
                    <th class="px-4 py-3 font-medium">Nota</th>
                    <th class="px-4 py-3 font-medium">Estado</th>
                    <th class="px-4 py-3 font-medium text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="acc in filteredAccesos" :key="acc.id" class="bg-white">
                    <td class="px-4 py-3 text-gray-700">{{ formatDisplayDate(acc.fecha || acc.created_at) }}</td>
                    <td class="px-4 py-3 text-gray-800 font-medium">
                      {{ acc.cliente_nombre || acc.cliente || '—' }}
                    </td>
                    <td class="px-4 py-3 text-gray-600">{{ acc.tipo_acceso || acc.tipo || '—' }}</td>
                    <td class="px-4 py-3 text-gray-600">{{ acc.nota || '—' }}</td>
                    <td class="px-4 py-3">
                      <span
                        class="text-xs px-2 py-1 rounded-full border"
                        :class="
                          acc.is_active !== false
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                            : 'border-gray-200 bg-gray-100 text-gray-500'
                        "
                      >
                        {{ acc.is_active !== false ? 'Activo' : 'Inactivo' }}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex justify-end gap-2">
                        <button
                          class="px-3 py-1 border border-gray-300 rounded-lg text-gray-600 hover:border-apolo-primary hover:text-apolo-primary transition"
                          @click="openEditAcceso(acc)"
                        >
                          Editar
                        </button>
                        <button
                          v-if="acc.is_active !== false"
                          class="px-3 py-1 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
                          @click="deactivateAcceso(acc)"
                        >
                          Desactivar
                        </button>
                        <button
                          v-else
                          class="px-3 py-1 rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition"
                          @click="reactivateAcceso(acc)"
                        >
                          Reactivar
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>

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

    <!-- Modal Servicio -->
    <div v-if="showServicioModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="showServicioModal = false">
      <div class="w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-xl">
        <div class="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-800">{{ isEditingServicio ? 'Editar servicio' : 'Nuevo servicio' }}</h3>
          <button class="text-gray-500 hover:text-gray-700" @click="showServicioModal = false">✕</button>
        </div>
        <form class="p-4 space-y-4" @submit.prevent="saveServicio">
          <div>
            <label class="text-sm text-gray-500">Nombre</label>
            <input v-model.trim="servicioForm.nombre" class="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:border-apolo-primary focus:ring-1 focus:ring-apolo-primary/50" required />
          </div>
          <div>
            <label class="text-sm text-gray-500">Descripción</label>
            <textarea v-model.trim="servicioForm.descripcion" rows="3" class="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:border-apolo-primary focus:ring-1 focus:ring-apolo-primary/50"></textarea>
          </div>
          <div class="flex items-center gap-2">
            <input id="servicio_activo" type="checkbox" v-model="servicioForm.is_active" class="accent-apolo-primary" />
            <label for="servicio_activo" class="text-sm text-gray-700">Activo</label>
          </div>
          <div class="flex items-center justify-end gap-2">
            <button type="button" class="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:border-apolo-primary hover:text-apolo-primary transition" @click="showServicioModal = false">Cancelar</button>
            <button type="submit" class="px-4 py-2 rounded-lg text-white bg-apolo-primary hover:bg-apolo-secondary transition" :disabled="!canSubmitServicio">Guardar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Acceso -->
    <div v-if="showAccesoModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="showAccesoModal = false">
      <div class="w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-xl">
        <div class="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-800">{{ isEditingAcceso ? 'Editar acceso' : 'Registrar acceso' }}</h3>
          <button class="text-gray-500 hover:text-gray-700" @click="showAccesoModal = false">✕</button>
        </div>
        <form class="p-4 space-y-4" @submit.prevent="saveAcceso">
          <div>
            <label class="text-sm text-gray-500">ID de cliente</label>
            <input v-model.number="accesoForm.cliente" type="number" min="1" class="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:border-apolo-primary focus:ring-1 focus:ring-apolo-primary/50" required />
            <p v-if="isEditingAcceso && accesos.find(a => a.id === accesoForm.id)?.cliente_nombre" class="text-xs text-gray-500 mt-1">
              Cliente: {{ accesos.find(a => a.id === accesoForm.id)?.cliente_nombre }}
            </p>
          </div>
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="text-sm text-gray-500">Fecha y hora</label>
              <input v-model="accesoForm.fecha" type="datetime-local" class="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:border-apolo-primary focus:ring-1 focus:ring-apolo-primary/50" required />
            </div>
            <div>
              <label class="text-sm text-gray-500">Tipo de acceso</label>
              <input v-model.trim="accesoForm.tipo_acceso" class="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:border-apolo-primary focus:ring-1 focus:ring-apolo-primary/50" placeholder="Presencial, Invitado…" />
            </div>
          </div>
          <div>
            <label class="text-sm text-gray-500">Nota</label>
            <textarea v-model.trim="accesoForm.nota" rows="3" class="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:border-apolo-primary focus:ring-1 focus:ring-apolo-primary/50" placeholder="Opcional"></textarea>
          </div>
          <div class="flex items-center gap-2">
            <input id="acceso_activo" type="checkbox" v-model="accesoForm.is_active" class="accent-apolo-primary" />
            <label for="acceso_activo" class="text-sm text-gray-700">Activo</label>
          </div>
          <div class="flex items-center justify-end gap-2">
            <button type="button" class="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:border-apolo-primary hover:text-apolo-primary transition" @click="showAccesoModal = false">Cancelar</button>
            <button type="submit" class="px-4 py-2 rounded-lg text-white bg-apolo-primary hover:bg-apolo-secondary transition" :disabled="!canSubmitAcceso">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
