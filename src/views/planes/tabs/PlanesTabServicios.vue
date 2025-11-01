<!-- src/components/Servicios.vue -->
<template>
  <section class="space-y-4">
    <!-- Header + Controles (igual que antes) -->
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-900">Servicios</h3>
      <button type="button" class="h-9 px-3 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700" @click="openNew">
        + Nuevo servicio
      </button>
    </div>

    <div class="rounded-2xl border border-gray-200 bg-white p-3 overflow-hidden">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
        <div class="flex flex-wrap gap-2">
          <span class="pill">{{ serviciosActivos.length }} activos</span>
          <span class="pill">{{ serviciosArchivados.length }} archivados</span>
          <span class="pill">{{ serviciosConBeneficios.length }} con beneficios</span>
        </div>

        <div class="flex flex-wrap items-center gap-2 min-w-0">
          <div class="relative flex-1 min-w-[220px] md:min-w-[360px]">
            <input v-model.trim="svcSearch" type="search" placeholder="Buscar servicio" class="input pl-9" />
            <span class="absolute inset-y-0 left-0 grid place-items-center w-9 text-gray-400 pointer-events-none">
              <i class="fa-solid fa-magnifying-glass"></i>
            </span>
          </div>

          <select v-model="svcEstado" class="input h-9">
            <option value="todos">Todos</option>
            <option value="activos">Activos</option>
            <option value="archivados">Archivados</option>
          </select>

          <div class="inline-flex shrink-0 rounded-lg overflow-hidden border border-gray-300">
            <button type="button" class="toggle" :class="viewMode==='card' ? 'toggle--on' : ''" @click="viewMode='card'">Tarjeta</button>
            <button type="button" class="toggle border-l" :class="viewMode==='table' ? 'toggle--on' : ''" @click="viewMode='table'">Lista</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Vista Tarjeta -->
    <div v-if="viewMode==='card'" class="grid md:grid-cols-2 gap-4">
      <div v-if="loading" class="col-span-full space-y-2">
        <div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>
      </div>

      <div v-for="s in serviciosFiltrados" :key="s.id" class="card" :class="(s.is_active ?? true) ? '' : 'opacity-60'">
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <h4 class="text-sm font-semibold text-gray-900">{{ s.nombre }}</h4>
              <span class="badge" :class="(s.is_active ?? true) ? 'badge--ok' : 'badge--bad'">
                {{ (s.is_active ?? true) ? 'Activo' : 'Archivado' }}
              </span>
            </div>
            <p class="text-xs text-gray-500 mt-1">{{ s.descripcion || '—' }}</p>
          </div>

          <div class="text-right min-w-[160px]">
            <div class="text-[13px] text-gray-400">Precio</div>
            <div class="font-semibold text-gray-900">{{ precioServicio(s) }}</div>
          </div>
        </div>

        <div class="mt-3">
          <div class="text-[12px] text-gray-500 mb-1">Beneficios</div>
          <div v-if="(beneficiosByServicio[s.id] || []).length" class="flex flex-wrap gap-1.5">
            <span v-for="b in beneficiosByServicio[s.id]" :key="b.id" class="chip">Beneficio: {{ b.nombre }}</span>
          </div>
          <div v-else class="text-xs text-gray-400">—</div>
        </div>

        <div class="mt-4 flex items-center justify-end gap-2">
          <button type="button" class="btn" @click="openEdit(s)">Editar</button>
          <button type="button" class="btn" @click="duplicate(s)">Duplicar</button>
          <button type="button" class="btn" @click="toggleArchive(s)">
            {{ (s.is_active ?? true) ? 'Archivar' : 'Activar' }}
          </button>
        </div>
      </div>

      <div v-if="!loading && !serviciosFiltrados.length" class="col-span-full">
        <div class="empty">No hay servicios que coincidan con tu búsqueda/filtro.</div>
      </div>
    </div>

    <!-- Vista Tabla -->
    <div v-else class="rounded-2xl border border-gray-200 bg-white overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="text-gray-500">
          <tr class="border-b border-gray-200">
            <th class="th">Servicio</th><th class="th">Precio</th><th class="th">Beneficios</th><th class="th">Estado</th><th class="th text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading"><td colspan="5" class="py-6"><div class="animate-pulse h-6 bg-gray-100 rounded mx-3"></div></td></tr>

          <tr v-for="s in serviciosFiltrados" :key="s.id" class="tr">
            <td class="td">
              <div class="font-medium text-gray-900">{{ s.nombre }}</div>
              <div class="text-[12px] text-gray-500">{{ s.descripcion || '—' }}</div>
            </td>
            <td class="td">{{ precioServicio(s) }}</td>
            <td class="td">
              <template v-if="(beneficiosByServicio[s.id] || []).length">
                <span v-for="b in beneficiosByServicio[s.id]" :key="b.id" class="chip inline-block mr-1 mb-1">
                  Beneficio: {{ b.nombre }}
                </span>
              </template>
              <span v-else class="text-gray-400">—</span>
            </td>
            <td class="td">
              <span class="badge" :class="(s.is_active ?? true) ? 'badge--ok' : 'badge--bad'">
                {{ (s.is_active ?? true) ? 'Activo' : 'Archivado' }}
              </span>
            </td>
            <td class="td">
              <div class="flex justify-end gap-2">
                <button class="btn" @click="openEdit(s)">Editar</button>
                <button class="btn" @click="duplicate(s)">Duplicar</button>
                <button class="btn" @click="toggleArchive(s)">{{ (s.is_active ?? true) ? 'Archivar' : 'Activar' }}</button>
              </div>
            </td>
          </tr>

          <tr v-if="!loading && !serviciosFiltrados.length"><td colspan="5" class="py-6 text-center text-gray-500">Sin resultados</td></tr>
        </tbody>
      </table>
    </div>

    <!-- ===== MODAL CREAR/EDITAR (estilo de tu imagen) ===== -->
    <div v-if="showModal" class="modal" @click.self="closeModal">
      <div class="modal-card">
        <div class="modal-head">
          <h3 class="text-lg font-semibold text-gray-900">{{ isEditing ? 'Editar servicio' : 'Nuevo servicio' }}</h3>
          <button @click="closeModal" class="icon-close" aria-label="Cerrar">✕</button>
        </div>

        <form @submit.prevent="save" class="p-5 space-y-5" novalidate>
          <!-- Nombre / Precio / Periodicidad -->
          <div class="grid grid-cols-1 md:grid-cols-[1fr_200px_160px] gap-3">
            <div>
              <label class="label">Nombre *</label>
              <input v-model.trim="form.nombre" class="input" :class="errors.nombre && 'input--err'" />
              <p v-if="errors.nombre" class="err">{{ errors.nombre }}</p>
            </div>

            <div>
              <label class="label">Precio</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input v-model="ui.precio" class="input pl-7" inputmode="decimal" placeholder="0.00" />
              </div>
            </div>

            <div>
              <label class="label">Periodicidad</label>
              <select v-model="ui.periodicidad" class="input">
                <option value="mensual">Mensual</option>
                <option value="semanal">Semanal</option>
                <option value="sesion">Por sesión</option>
              </select>
            </div>
          </div>

          <!-- Descripción -->
          <div>
            <label class="label">Descripción</label>
            <textarea v-model="form.descripcion" rows="3" class="input"></textarea>
          </div>

          <!-- Capacidad / Máx por clase / Horarios / Requiere agendar -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="label">Capacidad (máx)</label>
                <input v-model.number="ui.capacidad" type="number" min="0" class="input" />
              </div>
              <div>
                <label class="label">Máx. por clase</label>
                <input v-model.number="ui.maxClase" type="number" min="0" class="input" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="label">Inicio</label>
                <input v-model="ui.horaInicio" type="time" class="input" />
              </div>
              <div>
                <label class="label">Fin</label>
                <input v-model="ui.horaFin" type="time" class="input" />
              </div>
            </div>
          </div>

          <label class="inline-flex items-center gap-2 text-sm text-gray-800">
            <input v-model="ui.requiereAgendar" type="checkbox" class="checkbox" />
            Requiere agendar
          </label>

          <!-- Beneficios vinculados -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <div class="text-sm text-gray-700">
                <strong>Beneficios vinculados</strong>
                <span class="ml-2 text-gray-500">Seleccionados: {{ selectedBeneficios.size }}</span>
              </div>
              <div class="relative w-64">
                <input v-model.trim="benefSearch" type="search" placeholder="Buscar beneficio" class="input pl-9" />
                <span class="absolute inset-y-0 left-0 grid place-items-center w-9 text-gray-400 pointer-events-none">
                  <i class="fa-solid fa-magnifying-glass"></i>
                </span>
              </div>
            </div>

            <div class="grid md:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              <label v-for="b in beneficiosFiltrados" :key="b.id" class="benef-item">
                <input type="checkbox" class="checkbox"
                       :checked="selectedBeneficios.has(b.id)"
                       @change="toggleBenef(b.id, $event.target.checked)" />
                <span class="flex-1">{{ b.nombre }}</span>
              </label>
              <div v-if="!beneficiosFiltrados.length" class="text-xs text-gray-500 px-1">Sin resultados…</div>
            </div>
          </div>

          <!-- Acciones -->
          <div class="flex items-center justify-end gap-2 pt-1">
            <button type="button" class="btn" @click="closeModal">Cancelar</button>
            <button type="submit" :disabled="saving" class="btn-primary">
              {{ saving ? 'Guardando…' : (isEditing ? 'Guardar cambios' : 'Crear servicio') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <IconPicker v-if="openIconPicker" @close="openIconPicker=false" @select="onSelectIconify" />
  </section>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import api from '@/api/services'
import { useWorkspaceStore } from '@/stores/workspace'
import IconPicker from '@/components/IconPicker.vue'

const ws = useWorkspaceStore()

/* ===== Estado base (igual que tenías) ===== */
const loading = ref(true)
const servicios = ref([])
const beneficiosByServicio = reactive({})
const viewMode = ref('card')
const svcSearch = ref(''); const svcEstado = ref('todos')

/* ===== Modal ===== */
const showModal = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const errors = reactive({})
const form = reactive({ id:null, nombre:'', descripcion:'', icono:'' })

/* Campos de UI (no se guardan aún en backend) */
const ui = reactive({
  precio: '', periodicidad: 'mensual',
  capacidad: 0, maxClase: 0,
  horaInicio: '', horaFin: '',
  requiereAgendar: false
})

/* ===== Beneficios para el selector ===== */
const beneficios = ref([])                 // todos los beneficios (empresa)
const benefSearch = ref('')
const selectedBeneficios = reactive(new Set())   // ids seleccionados en el modal

const beneficiosFiltrados = computed(() => {
  const t = benefSearch.value.toLowerCase()
  return beneficios.value.filter(b => (b.nombre || '').toLowerCase().includes(t))
})

function toggleBenef(id, checked){
  if (checked) selectedBeneficios.add(id)
  else selectedBeneficios.delete(id)
}

/* ===== Carga ===== */
async function fetchServicios () {
  loading.value = true
  try {
    const pageSize = 200
    let page = 1; const out = []
    while (true) {
      const { data } = await api.servicios.list({ page, page_size: pageSize, ordering: '-id' })
      const chunk = data?.results || data || []
      if (!chunk.length) break
      out.push(...chunk)
      if (!data?.count || page * pageSize >= data.count || chunk.length < pageSize) break
      page += 1
    }
    servicios.value = out
  } finally { loading.value = false }
}

async function loadServicioBeneficios () {
  try {
    const tmp = {}
    const pageSize = 200
    let page = 1
    while (true) {
      const { data } = await api.servicioBeneficios.list({ page, page_size: pageSize, ordering: '-id' })
      const chunk = data?.results || data || []
      if (!chunk.length) break
      for (const r of chunk) {
        const sid = r.servicio ?? r.servicio_id
        if (!sid) continue
        if (!tmp[sid]) tmp[sid] = []
        tmp[sid].push({ id: r.beneficio, nombre: r.beneficio_nombre || `#${r.beneficio}` })
      }
      if (!data?.count || page * pageSize >= data.count || chunk.length < pageSize) break
      page += 1
    }
    Object.keys(beneficiosByServicio).forEach(k => delete beneficiosByServicio[k])
    Object.entries(tmp).forEach(([k, v]) => { beneficiosByServicio[Number(k)] = v })
  } catch (e) { console.warn('No se pudieron cargar beneficios de servicios', e) }
}

async function loadBeneficios() {
  try {
    const pageSize = 500; let page = 1; const out = []
    while (true) {
      const { data } = await api.beneficios.list({ page, page_size: pageSize, ordering: 'nombre' })
      const chunk = data?.results || data || []
      if (!chunk.length) break
      out.push(...chunk.map(x => ({ id:x.id, nombre:x.nombre })))
      if (!data?.count || page * pageSize >= data.count || chunk.length < pageSize) break
      page += 1
    }
    beneficios.value = out
  } catch (e) { console.warn('No se pudieron cargar beneficios', e) }
}

onMounted(async () => {
  await ws.ensureEmpresaSet()
  await Promise.all([fetchServicios(), loadServicioBeneficios(), loadBeneficios()])
})

/* ===== Derivados ===== */
const serviciosActivos = computed(() => servicios.value.filter(s => (s.is_active ?? true)))
const serviciosArchivados = computed(() => servicios.value.filter(s => !(s.is_active ?? true)))
const serviciosConBeneficios = computed(() => servicios.value.filter(s => (beneficiosByServicio[s.id] || []).length > 0))

const serviciosFiltrados = computed(() => {
  const term = svcSearch.value.toLowerCase()
  let base = servicios.value
  if (svcEstado.value === 'activos') base = base.filter(s => (s.is_active ?? true))
  if (svcEstado.value === 'archivados') base = base.filter(s => !(s.is_active ?? true))
  if (term) base = base.filter(s =>
    (s.nombre || '').toLowerCase().includes(term) || (s.descripcion || '').toLowerCase().includes(term)
  )
  return base.slice().sort((a,b)=> Number(b.is_active ?? true) - Number(a.is_active ?? true))
})

/* ===== Helpers ===== */
function precioServicio (s) {
  const val = s.precio ?? s.precio_mensual ?? s.total ?? null
  if (val === null || val === undefined || val === '') return '$ 0.00 / mensual'
  try { return Number(val).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }) + ' / mensual' }
  catch { return `$ ${val} / mensual` }
}

/* ===== Modal create/edit ===== */
const openIconPicker = ref(false)
function onSelectIconify(name){ form.icono = name; openIconPicker.value = false }

function resetUi(){
  Object.assign(ui, { precio:'', periodicidad:'mensual', capacidad:0, maxClase:0, horaInicio:'', horaFin:'', requiereAgendar:false })
}

function openNew(){
  isEditing.value = false
  Object.assign(form, { id:null, nombre:'', descripcion:'', icono:'' })
  Object.keys(errors).forEach(k => delete errors[k])
  selectedBeneficios.clear()
  resetUi()
  showModal.value = true
}

function openEdit(s){
  isEditing.value = true
  Object.assign(form, { id:s.id, nombre:s.nombre || '', descripcion:s.descripcion || '', icono:s.icono || '' })
  Object.keys(errors).forEach(k => delete errors[k])
  resetUi()

  // preseleccionar beneficios existentes del servicio
  selectedBeneficios.clear()
  const actuales = (beneficiosByServicio[s.id] || []).map(x => x.id)
  actuales.forEach(id => selectedBeneficios.add(id))

  showModal.value = true
}

function closeModal(){ showModal.value = false }

function validate(){
  const e = {}
  if(!form.nombre?.trim()) e.nombre = 'El nombre es obligatorio'
  Object.keys(errors).forEach(k => delete errors[k])
  Object.assign(errors, e)
  return Object.keys(e).length === 0
}

/* Diff y sync de ServicioBeneficio */
async function syncServicioBeneficios(servicioId){
  // actuales en server (de cache local):
  const actuales = new Set((beneficiosByServicio[servicioId] || []).map(x => x.id))
  const deseados = new Set(selectedBeneficios)

  const aCrear = [...deseados].filter(id => !actuales.has(id))
  const aBorrar = [...actuales].filter(id => !deseados.has(id))

  // crear
  for (const bid of aCrear) {
    await api.servicioBeneficios.create({ servicio: servicioId, beneficio: bid })
  }
  // borrar
  if (aBorrar.length) {
    // no tenemos IDs de la relación, hacemos un barrido para encontrar y eliminar
    const { data } = await api.servicioBeneficios.list({ servicio: servicioId, page_size: 500 })
    const rows = data?.results || data || []
    for (const row of rows) {
      if (aBorrar.includes(row.beneficio)) {
        await api.servicioBeneficios.delete(row.id)
      }
    }
  }
  // refrescamos cache local
  await loadServicioBeneficios()
}

async function save(){
  if(!validate()) return
  saving.value = true
  try{
    const payload = {
      nombre: form.nombre.trim(),
      descripcion: (form.descripcion || '').trim(),
      icono: (form.icono || '').trim()
    }

    let servicioId
    if(isEditing.value && form.id){
      await api.servicios.update(form.id, payload)
      servicioId = form.id
    } else {
      const empresa = ws.empresaId
      const { data } = await api.servicios.create({ ...payload, empresa })
      servicioId = data?.id
    }

    // sincroniza beneficios seleccionados
    if (servicioId) await syncServicioBeneficios(servicioId)

    showModal.value = false
    await fetchServicios()
  } catch(e){
    const msg = e?.response?.data?.detail || e?.response?.data?.nombre?.[0] || 'Error al guardar'
    alert(msg)
  } finally { saving.value = false }
}

/* Acciones fila */
async function duplicate(s){
  try{
    const empresa = ws.empresaId
    const payload = { empresa, nombre: `${s.nombre} (copia)`, descripcion: s.descripcion || '', icono: s.icono || '' }
    const { data } = await api.servicios.create(payload)

    // replica beneficios
    const curr = (beneficiosByServicio[s.id] || []).map(x => x.id)
    for (const bid of curr) await api.servicioBeneficios.create({ servicio: data.id, beneficio: bid })
    await loadServicioBeneficios()
    await fetchServicios()
  } catch(e){
    alert(e?.response?.data?.detail || 'No se pudo duplicar')
  }
}

async function toggleArchive(s){
  try { await api.servicios.patch(s.id, { is_active: !(s.is_active ?? true) }); await fetchServicios() }
  catch(e){ alert(e?.response?.data?.detail || 'No se pudo actualizar el estado') }
}
</script>

<style scoped>
.pill{ @apply px-3 py-1 rounded-full text-[12px] border border-gray-200 bg-white text-gray-700; }
.input{ @apply h-9 w-full bg-white border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-apolo-primary/30; }
.input--err{ @apply border-red-400 ring-red-100; }
.label{ @apply block text-xs text-gray-600 mb-1; }
.checkbox{ @apply h-4 w-4 rounded border-gray-300 text-[#1a5eff]; }

.card{ @apply rounded-2xl border border-gray-200 bg-white p-4; }
.badge{ @apply inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border; }
.badge--ok{ @apply border-emerald-200 bg-emerald-50 text-emerald-700; }
.badge--bad{ @apply border-rose-200 bg-rose-50 text-rose-700; }
.chip{ @apply px-2 py-1 rounded-full text-[11px] border border-gray-200 bg-gray-50 text-gray-700; }
.btn{ @apply px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50; }
.btn-primary{ @apply px-4 py-2 rounded-lg bg-apolo-primary text-white hover:opacity-90 disabled:opacity-60; }
.toggle{ @apply h-9 px-3 text-sm transition bg-white text-gray-700 hover:bg-gray-50; }
.toggle--on{ @apply bg-gray-100 text-gray-800; }
.skeleton{ @apply animate-pulse h-28 bg-gray-100 rounded-2xl border border-gray-200; }
.empty{ @apply rounded-2xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500; }

.th{ @apply text-left py-2 px-3; } .td{ @apply py-3 px-3; } .tr{ @apply border-b border-gray-100 hover:bg-gray-50; }

.modal{ @apply fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4; }
.modal-card{ @apply w-full max-w-3xl bg-white border border-gray-200 rounded-2xl shadow-2xl; }
.modal-head{ @apply px-5 py-4 border-b border-gray-200 flex items-center justify-between; }
.icon-close{ @apply h-8 w-8 grid place-items-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50; }

.benef-item{ @apply flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm; }
.err{ @apply text-red-600 text-xs mt-1; }
</style>