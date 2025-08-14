<template>
  <div class="p-4 text-white">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-light">Planes</h1>
      <button
        @click="openNew"
        class="bg-apolo-primary text-black px-4 py-2 rounded hover:bg-apolo-secondary transition"
      >
        + Nuevo
      </button>
    </div>

    <!-- Filtros -->
    <div class="mb-4 flex flex-wrap gap-2">
      <input
        v-model="q"
        @keyup.enter="fetch"
        placeholder="Buscar plan…"
        class="bg-gray-900 border border-gray-700 rounded px-3 py-2 w-64"
      />
      <button @click="fetch" class="bg-gray-800 border border-gray-700 px-4 py-2 rounded hover:bg-gray-700">
        Buscar
      </button>
      <button @click="resetFilters" class="bg-gray-800 border border-gray-700 px-4 py-2 rounded hover:bg-gray-700">
        Limpiar
      </button>
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
          <div class="flex items-center gap-2">
            <span
              v-if="p.acceso_multisucursal"
              class="text-[10px] px-2 py-0.5 rounded-full bg-apolo-primary/20 text-apolo-primary"
            >Multisucursal</span>
            <span
              v-if="p.tipo_plan"
              class="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 border border-gray-700"
            >{{ p.tipo_plan }}</span>
          </div>
        </div>

        <p class="text-gray-300 text-sm mt-1 line-clamp-2">{{ p.descripcion }}</p>
        <p v-if="p.desde || p.hasta" class="text-[11px] text-gray-400 mt-2">Vigencia: {{ formatRange(p.desde, p.hasta) }}</p>
        <p v-if="p.visitas_gratis" class="text-[11px] text-gray-400 mt-1">Visitas gratis: {{ p.visitas_gratis }}</p>

        <div class="mt-3 flex items-center justify-end gap-2">
          <button @click="openEdit(p)" class="px-2 py-1 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700">
            Editar
          </button>
          <button @click="remove(p)" class="px-2 py-1 rounded border border-red-800 bg-red-900/40 hover:bg-red-800">
            Eliminar
          </button>
        </div>
      </article>

      <div v-if="!rows.length" class="col-span-full text-center text-gray-400 py-8">Sin planes</div>
    </div>

    <!-- Paginación simple -->
    <div class="mt-4 flex items-center gap-2">
      <button :disabled="page<=1" @click="prev" class="px-3 py-1 rounded bg-gray-800/60 border border-gray-700 disabled:opacity-50">
        Anterior
      </button>
      <span class="text-gray-300">Página {{ page }}</span>
      <button :disabled="!hasMore" @click="next" class="px-3 py-1 rounded bg-gray-800/60 border border-gray-700 disabled:opacity-50">
        Siguiente
      </button>
      <span v-if="count!==null" class="text-gray-500 text-sm">({{ count }} resultados)</span>
    </div>

    <!-- Modal Crear/Editar -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div class="w-full max-w-2xl bg-gray-950 border border-gray-800 rounded-2xl shadow-xl">
        <div class="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
          <h3 class="text-lg">{{ isEditing ? 'Editar plan' : 'Nuevo plan' }}</h3>
          <button @click="closeModal" class="text-gray-400 hover:text-white">✕</button>
        </div>

        <form @submit.prevent="save" class="p-4 space-y-4">
          <div class="grid sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-400 mb-1">Nombre *</label>
              <input v-model="form.nombre" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
              <p v-if="errors.nombre" class="text-red-400 text-xs mt-1">{{ errors.nombre }}</p>
            </div>

            <div class="flex items-center gap-2">
              <input id="multi" type="checkbox" v-model="form.acceso_multisucursal" class="h-4 w-4 rounded border-gray-700 bg-gray-900" />
              <label for="multi" class="text-sm text-gray-300">Acceso multisucursal</label>
            </div>
          </div>

          <div class="grid sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-xs text-gray-400 mb-1">Tipo de plan *</label>
              <select v-model="form.tipo_plan" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2">
                <option disabled value="">Selecciona…</option>
                <option v-for="opt in TIPO_PLAN_OPTS" :key="opt" :value="opt">{{ opt }}</option>
              </select>
              <p v-if="errors.tipo_plan" class="text-red-400 text-xs mt-1">{{ errors.tipo_plan }}</p>
            </div>

            <div class="flex items-center gap-2">
              <input id="preventa" type="checkbox" v-model="form.preventa" class="h-4 w-4 rounded border-gray-700 bg-gray-900" />
              <label for="preventa" class="text-sm text-gray-300">Preventa</label>
            </div>

            <div>
              <label class="block text-xs text-gray-400 mb-1">Visitas gratis</label>
              <input type="number" min="0" v-model.number="form.visitas_gratis" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
            </div>
          </div>

          <div class="grid sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-400 mb-1">Desde (YYYY-MM-DD)</label>
              <input v-model="form.desde" placeholder="2025-01-01" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
            </div>
            <div>
              <label class="block text-xs text-gray-400 mb-1">Hasta (YYYY-MM-DD)</label>
              <input v-model="form.hasta" placeholder="2025-12-31" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
            </div>
          </div>

          <div>
            <label class="block text-xs text-gray-400 mb-1">Descripción</label>
            <textarea v-model="form.descripcion" rows="3" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"></textarea>
          </div>

          <!-- Aviso empresa -->
          <!-- <p v-if="empresaWarning" class="text-yellow-400 text-sm">
            {{ empresaWarning }}
          </p> -->

          <div class="flex items-center justify-end gap-2 pt-1">
            <button type="button" @click="closeModal" class="px-4 py-2 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700">
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="px-4 py-2 rounded bg-apolo-primary text-black hover:bg-apolo-secondary disabled:opacity-60"
            >
              {{ saving ? 'Guardando…' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/api/services'
import { useWorkspaceStore } from '@/stores/workspace'
import { useAuthStore } from '@/stores/auth'

// opciones "comunes" para tipo de plan (puedes ajustar a tu catálogo real)
const TIPO_PLAN_OPTS = ['mensual', 'semanal', 'anual', 'por_visitas']

// listado
const loading = ref(true)
const rows = ref([])
const page = ref(1)
const pageSize = 12
const count = ref(null)
const q = ref('')

const hasMore = computed(() => (count.value === null ? rows.value.length === pageSize : count.value > page.value * pageSize))

onMounted(fetch)

async function fetch () {
  loading.value = true
  try {
    const params = { page: page.value, page_size: pageSize, ordering: '-id', search: q.value }
    const { data } = await api.planes.list(params)
    rows.value = data?.results || data || []
    count.value = data?.count ?? null
  } finally {
    loading.value = false
  }
}
function resetFilters () { q.value = ''; page.value = 1; fetch() }
function next () { if (hasMore.value) { page.value++; fetch() } }
function prev () { if (page.value > 1) { page.value--; fetch() } }

function formatDate (d) { try { return new Date(d).toLocaleDateString('es-MX') } catch { return d || '—' } }
function formatRange (a, b) {
  const fa = a ? formatDate(a) : '—'
  const fb = b ? formatDate(b) : '—'
  if (!a && !b) return '—'
  return `${fa} → ${fb}`
}

// modal/form
const showModal = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const errors = ref({})
const form = ref({
  id: null,
  nombre: '',
  descripcion: '',
  acceso_multisucursal: false,
  tipo_plan: '',
  preventa: false,
  visitas_gratis: 0,
  desde: '',
  hasta: '',
})

const ws = useWorkspaceStore()
console.log(ws.empresaId)
const auth = useAuthStore()
// const empresaWarning = computed(() => (!ws.empresaId ? 'No hay empresa activa. No se podrá guardar.' : ''))

function openNew () {
  isEditing.value = false
  errors.value = {}
  form.value = {
    id: null,
    nombre: '',
    descripcion: '',
    acceso_multisucursal: false,
    tipo_plan: '',
    preventa: false,
    visitas_gratis: 0,
    desde: '',
    hasta: '',
  }
  showModal.value = true
}
function openEdit (p) {
  isEditing.value = true
  errors.value = {}
  form.value = {
    id: p.id,
    nombre: p.nombre || '',
    descripcion: p.descripcion || '',
    acceso_multisucursal: !!p.acceso_multisucursal,
    tipo_plan: p.tipo_plan || '',
    preventa: !!p.preventa,
    visitas_gratis: Number(p.visitas_gratis) || 0,
    desde: p.desde || '',
    hasta: p.hasta || '',
  }
  showModal.value = true
}
function closeModal () { showModal.value = false }

function validate () {
  const e = {}
  if (!form.value.nombre?.trim()) e.nombre = 'El nombre es obligatorio'
  if (!form.value.tipo_plan) e.tipo_plan = 'El tipo de plan es obligatorio'
  if (!ws.empresaId) e.empresa = 'No hay empresa activa'
  errors.value = e
  return Object.keys(e).length === 0
}

async function save () {
  if (!validate()) return
  saving.value = true
  try {
    const payload = {
      // obligatorios/esperados por tu API
      empresa: ws.empresaId,                           // ← requerido (según Postman)
      nombre: form.value.nombre.trim(),
      tipo_plan: form.value.tipo_plan,
      preventa: !!form.value.preventa,
      visitas_gratis: Number(form.value.visitas_gratis) || 0,
      // opcionales / metadatos
      descripcion: form.value.descripcion?.trim() || '',
      acceso_multisucursal: !!form.value.acceso_multisucursal,
      desde: form.value.desde || null,
      hasta: form.value.hasta || null,
      // si tu API lo usa (tu tabla lo tiene); si lo infiere del token, puedes omitirlo
      usuario: auth.user?.id || null,
    }

    if (isEditing.value && form.value.id) {
      await api.planes.update(form.value.id, payload)
    } else {
      await api.planes.create(payload)
    }

    closeModal()
    await fetch()
  } catch (e) {
    alert(e.response?.data?.detail || 'Error al guardar')
  } finally {
    saving.value = false
  }
}

async function remove (p) {
  if (!confirm(`Eliminar plan "${p.nombre}"?`)) return
  try {
    await api.planes.delete(p.id)
    if (rows.value.length === 1 && page.value > 1) { page.value -= 1 }
    await fetch()
  } catch (e) {
    alert(e.response?.data?.detail || 'No se pudo eliminar')
  }
}
</script>

<style scoped>
/* opcional: estilos mínimos */
</style>
