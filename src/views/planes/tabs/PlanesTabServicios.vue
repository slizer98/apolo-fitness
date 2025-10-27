<template>
  <section class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-900">Servicios</h3>
      <button
        type="button"
        class="h-9 px-3 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
        @click="openNew"
      >
        + Nuevo servicio
      </button>
    </div>

    <!-- Card de controles -->
<div class="rounded-2xl border border-gray-200 bg-white p-3 overflow-hidden">
  <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
    <!-- Contadores -->
    <div class="flex flex-wrap gap-2">
      <span class="px-3 py-1 rounded-full text-[12px] border border-gray-200 bg-white text-gray-700">
        {{ serviciosActivos.length }} activos
      </span>
      <span class="px-3 py-1 rounded-full text-[12px] border border-gray-200 bg-white text-gray-700">
        {{ serviciosArchivados.length }} archivados
      </span>
      <span class="px-3 py-1 rounded-full text-[12px] border border-gray-200 bg-white text-gray-700">
        {{ serviciosConBeneficios.length }} con beneficios
      </span>
    </div>

    <!-- Buscador + filtros + toggle -->
    <div class="flex flex-wrap items-center gap-2 min-w-0">
      <!-- Buscador -->
      <div class="relative flex-1 min-w-[220px] md:min-w-[360px]">
        <input
          v-model.trim="svcSearch"
          type="search"
          placeholder="Buscar servicio"
          class="h-9 w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 text-sm
                 focus:outline-none focus:ring-2 focus:ring-apolo-primary/30"
        />
        <span class="absolute inset-y-0 left-0 grid place-items-center w-9 text-gray-400 pointer-events-none">
          <i class="fa-solid fa-magnifying-glass"></i>
        </span>
      </div>

      <!-- Filtro estado -->
      <select
        v-model="svcEstado"
        class="h-9 shrink-0 bg-white border border-gray-300 rounded-lg px-2 text-sm
               focus:outline-none focus:ring-2 focus:ring-apolo-primary/30"
      >
        <option value="todos">Todos</option>
        <option value="activos">Activos</option>
        <option value="archivados">Archivados</option>
      </select>

      <!-- Toggle vista -->
      <div class="inline-flex shrink-0 rounded-lg overflow-hidden border border-gray-300">
        <button
          type="button"
          class="h-9 px-3 text-sm transition"
          :class="viewMode==='card'
            ? 'bg-gray-100 text-gray-800'
            : 'bg-white text-gray-700 hover:bg-gray-50'"
          @click="viewMode='card'"
        >
          Tarjeta
        </button>
        <button
          type="button"
          class="h-9 px-3 text-sm border-l border-gray-300 transition"
          :class="viewMode==='table'
            ? 'bg-gray-100 text-gray-800'
            : 'bg-white text-gray-700 hover:bg-gray-50'"
          @click="viewMode='table'"
        >
          Lista
        </button>
      </div>
    </div>
  </div>
</div>


    <!-- VISTA TARJETA -->
    <div v-if="viewMode==='card'" class="grid md:grid-cols-2 gap-4">
      <!-- Skeleton -->
      <div v-if="loading" class="col-span-full space-y-2">
        <div class="animate-pulse h-28 bg-gray-100 rounded-2xl border border-gray-200"></div>
        <div class="animate-pulse h-28 bg-gray-100 rounded-2xl border border-gray-200"></div>
        <div class="animate-pulse h-28 bg-gray-100 rounded-2xl border border-gray-200"></div>
      </div>

      <div
        v-for="s in serviciosFiltrados"
        :key="s.id"
        class="rounded-2xl border border-gray-200 bg-white p-4"
        :class="(s.is_active ?? true) ? '' : 'opacity-60'"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <h4 class="text-sm font-semibold text-gray-900">{{ s.nombre }}</h4>
              <span
                class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border"
                :class="(s.is_active ?? true)
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-rose-200 bg-rose-50 text-rose-700'"
              >
                {{ (s.is_active ?? true) ? 'Activo' : 'Archivado' }}
              </span>
            </div>
            <p class="text-xs text-gray-500 mt-1">{{ s.descripcion || '—' }}</p>
          </div>

        <!-- Precio -->
          <div class="text-right min-w-[160px]">
            <div class="text-[13px] text-gray-400">Precio</div>
            <div class="font-semibold text-gray-900">
              {{ precioServicio(s) }}
            </div>
          </div>
        </div>

        <!-- Beneficios -->
        <div class="mt-3">
          <div class="text-[12px] text-gray-500 mb-1">Beneficios</div>
          <div v-if="(beneficiosByServicio[s.id] || []).length" class="flex flex-wrap gap-1.5">
            <span
              v-for="b in beneficiosByServicio[s.id]"
              :key="b.id"
              class="px-2 py-1 rounded-full text-[11px] border border-gray-200 bg-gray-50 text-gray-700"
            >
              Beneficio: {{ b.nombre }}
            </span>
          </div>
          <div v-else class="text-xs text-gray-400">—</div>
        </div>

        <!-- Acciones (borde gris) -->
        <div class="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            class="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            @click="openEdit(s)"
          >
            Editar
          </button>
          <button
            type="button"
            class="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            @click="duplicate(s)"
          >
            Duplicar
          </button>
          <button
            type="button"
            class="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            @click="toggleArchive(s)"
          >
            {{ (s.is_active ?? true) ? 'Archivar' : 'Activar' }}
          </button>
        </div>
      </div>

      <div v-if="!loading && !serviciosFiltrados.length" class="col-span-full">
        <div class="rounded-2xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
          No hay servicios que coincidan con tu búsqueda/filtro.
        </div>
      </div>
    </div>

    <!-- VISTA TABLA -->
    <div v-else class="rounded-2xl border border-gray-200 bg-white overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="text-gray-500">
          <tr class="border-b border-gray-200">
            <th class="text-left py-2 px-3">Servicio</th>
            <th class="text-left py-2 px-3">Precio</th>
            <th class="text-left py-2 px-3">Beneficios</th>
            <th class="text-left py-2 px-3">Estado</th>
            <th class="text-right py-2 px-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="5" class="py-6">
              <div class="animate-pulse h-6 bg-gray-100 rounded mx-3"></div>
            </td>
          </tr>

          <tr
            v-for="s in serviciosFiltrados"
            :key="s.id"
            class="border-b border-gray-100 hover:bg-gray-50"
          >
            <td class="py-3 px-3">
              <div class="font-medium text-gray-900">{{ s.nombre }}</div>
              <div class="text-[12px] text-gray-500">{{ s.descripcion || '—' }}</div>
            </td>
            <td class="py-3 px-3">{{ precioServicio(s) }}</td>
            <td class="py-3 px-3">
              <template v-if="(beneficiosByServicio[s.id] || []).length">
                <span
                  v-for="b in beneficiosByServicio[s.id]"
                  :key="b.id"
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border border-gray-200 bg-gray-50 text-gray-700 mr-1 mb-1"
                >
                  Beneficio: {{ b.nombre }}
                </span>
              </template>
              <span v-else class="text-gray-400">—</span>
            </td>
            <td class="py-3 px-3">
              <span
                class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border"
                :class="(s.is_active ?? true)
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-rose-200 bg-rose-50 text-rose-700'"
              >
                {{ (s.is_active ?? true) ? 'Activo' : 'Archivado' }}
              </span>
            </td>
            <td class="py-3 px-3">
              <!-- Menú … -->
              <div class="relative flex justify-end" data-menu-root>
                <button
                  class="h-9 w-9 rounded-lg border border-gray-300 bg-white hover:bg-gray-50"
                  :aria-expanded="openMenuId===s.id"
                  aria-haspopup="menu"
                  title="Acciones"
                  @click.stop="toggleMenu(s.id)"
                >⋯</button>

                <div
                  v-if="openMenuId===s.id"
                  class="absolute right-0 mt-1 w-48 rounded-xl border border-gray-200 bg-white shadow-lg p-1 z-20"
                  role="menu"
                >
                  <button class="menu-item" role="menuitem" @click="openEdit(s); closeMenu()">Editar</button>
                  <button class="menu-item" role="menuitem" @click="duplicate(s); closeMenu()">Duplicar</button>
                  <button class="menu-item" role="menuitem" @click="toggleArchive(s); closeMenu()">
                    {{ (s.is_active ?? true) ? 'Archivar' : 'Activar' }}
                  </button>
                </div>
              </div>
            </td>
          </tr>

          <tr v-if="!loading && !serviciosFiltrados.length">
            <td colspan="5" class="py-6 text-center text-gray-500">Sin resultados</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ===== MODAL CREAR/EDITAR — ESTILO BLANCO ===== -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click.self="closeModal"
    >
      <div class="w-full max-w-xl bg-white border border-gray-200 rounded-2xl shadow-2xl">
        <div class="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">{{ isEditing ? 'Editar servicio' : 'Nuevo servicio' }}</h3>
          <button @click="closeModal" class="h-8 w-8 grid place-items-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50" aria-label="Cerrar">
            ✕
          </button>
        </div>

        <form @submit.prevent="save" class="p-5 space-y-4" novalidate>
          <div class="grid sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-600 mb-1">Nombre *</label>
              <input
                v-model.trim="form.nombre"
                class="w-full bg-white border rounded px-3 py-2 text-gray-900"
                :class="errors.nombre ? 'border-red-400' : 'border-gray-300'"
              />
              <p v-if="errors.nombre" class="text-red-600 text-xs mt-1">{{ errors.nombre }}</p>
            </div>

            <div>
              <label class="block text-xs text-gray-600 mb-1">Icono (opcional)</label>
              <div class="flex items-center gap-2">
                <input
                  v-model.trim="form.icono"
                  placeholder="lucide:dumbbell"
                  class="flex-1 bg-white border rounded px-3 py-2 text-gray-900 border-gray-300"
                  readonly
                  @focus="openIconPicker = true"
                />
                <button
                  type="button"
                  class="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                  @click="openIconPicker = true"
                >Elegir…</button>
              </div>
              <div v-if="form.icono" class="mt-2 flex items-center gap-2 text-gray-700">
                <Icon :icon="form.icono" class="w-5 h-5" />
                <span class="text-xs">{{ form.icono }}</span>
                <button type="button" class="text-xs text-gray-500 hover:text-gray-700" @click="form.icono = ''">Quitar</button>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-xs text-gray-600 mb-1">Descripción</label>
            <textarea
              v-model="form.descripcion"
              rows="3"
              class="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900"
            ></textarea>
          </div>

          <div class="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="px-4 py-2 rounded-lg bg-apolo-primary text-white hover:opacity-90 disabled:opacity-60"
            >
              {{ saving ? 'Guardando…' : (isEditing ? 'Guardar cambios' : 'Crear servicio') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Icon Picker -->
    <IconPicker v-if="openIconPicker" @close="openIconPicker=false" @select="onSelectIconify" />
  </section>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import api from '@/api/services'
import { useWorkspaceStore } from '@/stores/workspace'
import IconPicker from '@/components/IconPicker.vue'
import { Icon } from '@iconify/vue'

const ws = useWorkspaceStore()

/* ===== Estado ===== */
const loading = ref(true)
const servicios = ref([])

/* Beneficios por servicio: { [idServicio]: [{id, nombre}] } */
const beneficiosByServicio = reactive({})

/* ===== Vista ===== */
const viewMode = ref('card') // 'card' | 'table'

/* ===== Filtros ===== */
const svcSearch = ref('')
const svcEstado = ref('todos') // 'todos' | 'activos' | 'archivados'

/* ===== Menú “…” en tabla ===== */
const openMenuId = ref(null)
function toggleMenu(id){ openMenuId.value = openMenuId.value===id ? null : id }
function closeMenu(){ openMenuId.value = null }
function onDocClick(e){ if(!e.target.closest?.('[data-menu-root]')) closeMenu() }
function onEsc(e){ if(e.key==='Escape') closeMenu() }
onMounted(()=>{ document.addEventListener('click', onDocClick); document.addEventListener('keydown', onEsc) })
onBeforeUnmount(()=>{ document.removeEventListener('click', onDocClick); document.removeEventListener('keydown', onEsc) })

/* ===== Carga ===== */
async function fetchServicios () {
  loading.value = true
  try {
    const pageSize = 200
    let page = 1
    const out = []
    while (true) {
      const { data } = await api.servicios.list({ page, page_size: pageSize, ordering: '-id' })
      const chunk = data?.results || data || []
      if (!chunk.length) break
      out.push(...chunk)
      if (data?.count && page * pageSize >= data.count) break
      if (chunk.length < pageSize) break
      page += 1
    }
    servicios.value = out
  } finally {
    loading.value = false
  }
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
        tmp[sid].push({
          id: r.beneficio,
          nombre: r.beneficio_nombre || r.nombre || `#${r.beneficio}`
        })
      }
      if (data?.count && page * pageSize >= data.count) break
      if (chunk.length < pageSize) break
      page += 1
    }
    Object.keys(beneficiosByServicio).forEach(k => delete beneficiosByServicio[k])
    Object.entries(tmp).forEach(([k, v]) => { beneficiosByServicio[Number(k)] = v })
  } catch (e) {
    console.warn('No se pudieron cargar beneficios de servicios', e)
  }
}

onMounted(async () => {
  await ws.ensureEmpresaSet()
  await fetchServicios()
  await loadServicioBeneficios()
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
  if (term) {
    base = base.filter(s =>
      (s.nombre || '').toLowerCase().includes(term) ||
      (s.descripcion || '').toLowerCase().includes(term)
    )
  }
  return base.slice().sort((a, b) => Number(b.is_active ?? true) - Number(a.is_active ?? true))
})

/* ===== Helpers ===== */
function precioServicio (s) {
  const val = s.precio ?? s.precio_mensual ?? s.total ?? null
  if (val === null || val === undefined || val === '') return '$ 0.00 / mensual'
  try {
    return Number(val).toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 2 }) + ' / mensual'
  } catch {
    return `$ ${val} / mensual`
  }
}

/* ===== Modal crear/editar ===== */
const showModal = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const errors = reactive({})
const form = reactive({ id:null, nombre:'', descripcion:'', icono:'' })

const openIconPicker = ref(false)
function onSelectIconify(name){ form.icono = name; openIconPicker.value = false }

function openNew(){
  isEditing.value = false
  Object.keys(errors).forEach(k => delete errors[k])
  Object.assign(form, { id:null, nombre:'', descripcion:'', icono:'' })
  showModal.value = true
}
function openEdit(s){
  isEditing.value = true
  Object.keys(errors).forEach(k => delete errors[k])
  Object.assign(form, {
    id: s.id,
    nombre: s.nombre || '',
    descripcion: s.descripcion || '',
    icono: s.icono || ''
  })
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

async function save(){
  if(!validate()) return
  saving.value = true
  try{
    const payload = {
      nombre: form.nombre.trim(),
      descripcion: (form.descripcion || '').trim(),
      icono: (form.icono || '').trim()
    }
    if(isEditing.value && form.id){
      await api.servicios.update(form.id, payload)
    } else {
      const empresa = ws.empresaId
      await api.servicios.create({ ...payload, empresa })
    }
    showModal.value = false
    await fetchServicios()
  } catch(e){
    const msg = e?.response?.data?.detail || e?.response?.data?.nombre?.[0] || 'Error al guardar'
    alert(msg)
  } finally {
    saving.value = false
  }
}

/* ===== Acciones fila ===== */
async function duplicate(s){
  try{
    const empresa = ws.empresaId
    const payload = {
      empresa,
      nombre: `${s.nombre} (copia)`,
      descripcion: s.descripcion || '',
      icono: s.icono || ''
    }
    await api.servicios.create(payload)
    await fetchServicios()
  } catch(e){
    alert(e?.response?.data?.detail || 'No se pudo duplicar')
  }
}
async function toggleArchive(s){
  try{
    await api.servicios.patch(s.id, { is_active: !(s.is_active ?? true) })
    await fetchServicios()
  } catch(e){
    alert(e?.response?.data?.detail || 'No se pudo actualizar el estado')
  }
}
</script>

<style scoped>
.menu-item{
  @apply w-full text-left px-3 py-2 rounded-lg text-[14px] text-[#223] hover:bg-[#f5f7fa];
}
</style>
