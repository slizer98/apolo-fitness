<template>
  <div class="rounded-2xl bg-white border border-gray-200 shadow-sm">
    <!-- Header -->
    <div class="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
      <h3 class="font-semibold">Notas</h3>
      <div class="flex items-center gap-2">
        <button
          class="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm"
          @click="exportCsv"
        >
          Exportar
        </button>
        <button
          class="px-3 py-1.5 rounded-lg bg-[#1a5eff] text-white hover:opacity-90 text-sm"
          @click="openForm()"
        >
          Nueva nota
        </button>
      </div>
    </div>

    <!-- Filtros -->
    <div class="px-4 py-3 border-b border-gray-100 grid grid-cols-1 sm:grid-cols-4 gap-3">
      <div class="relative sm:col-span-2">
        <i class="fa fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
        <input
          v-model="q"
          type="text"
          class="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 placeholder-gray-400"
          placeholder="Buscar (título o contenido)…"
          @keyup.enter="fetchPage(true)"
        />
      </div>

      <select
        v-model="fPrioridad"
        class="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
        @change="fetchPage(true)"
      >
        <option value="">Todas las prioridades</option>
        <option value="alta">Alta</option>
        <option value="media">Media</option>
        <option value="baja">Baja</option>
      </select>

      <select
        v-model="fEstado"
        class="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
        @change="fetchPage(true)"
      >
        <option value="">Todos los estados</option>
        <option value="abierta">Abierta</option>
        <option value="en_progreso">En progreso</option>
        <option value="cerrada">Cerrada</option>
      </select>
    </div>

    <!-- Tabla -->
    <div class="overflow-x-auto">
      <table class="min-w-full text-sm">
        <thead>
          <tr class="bg-gray-100 text-gray-700">
            <th class="text-left px-4 py-2">Título</th>
            <th class="text-left px-4 py-2">Prioridad</th>
            <th class="text-left px-4 py-2">Estado</th>
            <th class="text-left px-4 py-2">Autor</th>
            <th class="text-left px-4 py-2">Fecha</th>
            <th class="text-left px-4 py-2">Acciones</th>
          </tr>
        </thead>

        <tbody v-if="loading">
          <tr v-for="i in 6" :key="'sk'+i" class="odd:bg-white even:bg-gray-50">
            <td class="px-4 py-3"><div class="h-4 w-56 bg-gray-200 rounded animate-pulse"></div></td>
            <td class="px-4 py-3"><div class="h-4 w-20 bg-gray-200 rounded animate-pulse"></div></td>
            <td class="px-4 py-3"><div class="h-4 w-24 bg-gray-200 rounded animate-pulse"></div></td>
            <td class="px-4 py-3"><div class="h-4 w-32 bg-gray-200 rounded animate-pulse"></div></td>
            <td class="px-4 py-3"><div class="h-4 w-28 bg-gray-200 rounded animate-pulse"></div></td>
            <td class="px-4 py-3"><div class="h-4 w-28 bg-gray-200 rounded animate-pulse"></div></td>
          </tr>
        </tbody>

        <tbody v-else>
          <tr
            v-for="n in rows"
            :key="n.id"
            class="odd:bg-white even:bg-gray-50 border-t border-gray-100 align-top"
          >
            <td class="px-4 py-3">
              <div class="font-medium">{{ n.titulo || '—' }}</div>
              <div class="mt-1 text-gray-600 text-[13px]" v-html="snippet(n.contenido)"></div>
            </td>
            <td class="px-4 py-3">
              <span class="chip" :class="chipPrioridad(n.prioridad)">
                {{ cap(n.prioridad) }}
              </span>
            </td>
            <td class="px-4 py-3">
              <span class="chip" :class="chipEstado(n.estado)">
                {{ estadoTexto(n.estado) }}
              </span>
            </td>
            <td class="px-4 py-3">{{ n.autor || '—' }}</td>
            <td class="px-4 py-3">{{ dt(n.created_at) }}</td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <button class="text-gray-700 hover:text-black" @click="openForm(n)">Editar</button>
                <button class="text-rose-600 hover:text-rose-700" @click="del(n)">Eliminar</button>
              </div>
            </td>
          </tr>

          <tr v-if="!rows.length">
            <td colspan="6" class="px-4 py-8 text-center text-gray-500">Sin resultados</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Footer paginación -->
    <div class="px-4 py-3 flex items-center justify-between border-t border-gray-100">
      <div class="text-xs text-gray-500">
        Página {{ page }} <span v-if="count !== null">de {{ totalPages }}</span>
      </div>
      <div class="flex items-center gap-2">
        <button
          class="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm disabled:opacity-50"
          :disabled="page<=1 || loading"
          @click="prev"
        >
          « Anterior
        </button>
        <button
          class="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm disabled:opacity-50"
          :disabled="!hasMore || loading"
          @click="next"
        >
          Siguiente »
        </button>
      </div>
    </div>

    <!-- Modal Crear/Editar -->
    <div
      v-if="formOpen"
      class="fixed inset-0 z-[200] bg-black/40 grid place-items-center p-4"
      @click.self="closeForm"
    >
      <div class="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-gray-200">
        <div class="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <div class="font-semibold">{{ editing ? 'Editar nota' : 'Nueva nota' }}</div>
          <button class="text-gray-500 hover:text-black" @click="closeForm">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="p-5 grid gap-3">
          <div>
            <label class="label">Título</label>
            <input v-model.trim="form.titulo" type="text" class="input">
          </div>

          <div>
            <label class="label">Contenido</label>
            <textarea v-model.trim="form.contenido" rows="5" class="input"></textarea>
            <p class="text-xs text-gray-500 mt-1">Soporta texto plano o HTML básico (strong, em, ul, ol).</p>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="label">Prioridad</label>
              <select v-model="form.prioridad" class="input">
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
              </select>
            </div>
            <div>
              <label class="label">Estado</label>
              <select v-model="form.estado" class="input">
                <option value="abierta">Abierta</option>
                <option value="en_progreso">En progreso</option>
                <option value="cerrada">Cerrada</option>
              </select>
            </div>
          </div>

          <div class="pt-2 flex items-center justify-end gap-2">
            <button class="btn-light" @click="closeForm">Cancelar</button>
            <button class="btn-primary" :disabled="saving" @click="save">
              {{ saving ? 'Guardando…' : (editing ? 'Actualizar' : 'Guardar') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import api from '@/api/services'
import { useWorkspaceStore } from '@/stores/workspace'
const ws = useWorkspaceStore()


const props = defineProps({
  clienteId: { type: [String, Number], required: true },
})

/* Estado */
const loading = ref(true)
const rows = ref([])
const page = ref(1)
const pageSize = 10
const count = ref(null)
const q = ref('')
const fPrioridad = ref('')
const fEstado = ref('')

/* Paginación */
const hasMore = computed(() => {
  if (count.value === null) return rows.value.length === pageSize
  return page.value * pageSize < count.value
})
const totalPages = computed(() =>
  count.value ? Math.max(1, Math.ceil(count.value / pageSize)) : 1
)

onMounted(fetchPage)
watch(() => props.clienteId, () => { page.value = 1; fetchPage(true) })

async function fetchPage (reset = false) {
  if (!props.clienteId) return
  if (reset) page.value = 1
  loading.value = true
  try {
    const { data } = await api.notas.list({
      cliente: props.clienteId,
      search: q.value || undefined,
      prioridad: fPrioridad.value || undefined,
      estado: fEstado.value || undefined,
      ordering: '-created_at',
      page: page.value,
      page_size: pageSize,
    })
    const list = data?.results || data || []
    count.value = data?.count ?? null
    rows.value = list.map(v => ({
      id: v.id,
      titulo: v.titulo,
      contenido: v.contenido || '',
      prioridad: v.prioridad || 'media',
      estado: v.estado || 'abierta',
      autor: v.autor_nombre || v.created_by_name || '',
      created_at: v.created_at,
    }))
  } finally {
    loading.value = false
  }
}

function next () { if (hasMore.value) { page.value++; fetchPage() } }
function prev () { if (page.value > 1) { page.value--; fetchPage() } }

/* Crear/Editar */
const formOpen = ref(false)
const editing = ref(false)
const saving = ref(false)
const form = ref({
  id: null,
  titulo: '',
  contenido: '',
  prioridad: 'media',
  estado: 'abierta',
})

function openForm (row = null) {
  if (row) {
    editing.value = true
    form.value = {
      id: row.id,
      titulo: row.titulo || '',
      contenido: row.contenido || '',
      prioridad: row.prioridad || 'media',
      estado: row.estado || 'abierta',
    }
  } else {
    editing.value = false
    form.value = { id: null, titulo: '', contenido: '', prioridad: 'media', estado: 'abierta' }
  }
  formOpen.value = true
}
function closeForm () {
  if (saving.value) return
  formOpen.value = false
}

async function save () {
  if (!form.value.titulo?.trim()) {
    alert('El título es obligatorio.')
    return
  }
  saving.value = true
  try {

    const payload = {
    cliente: props.clienteId,
    empresa: ws.empresaId,                     // <-- requerido por backend
    titulo: form.value.titulo?.trim(),
    cuerpo: form.value.contenido?.trim(),      // <-- nombre correcto que espera el backend
    prioridad: form.value.prioridad,
    estado: form.value.estado,
    }
    if (editing.value && form.value.id) {
      await api.notas.update(form.value.id, payload)
    } else {
      await api.notas.create(payload)
    }
    formOpen.value = false
    fetchPage(true)
  } finally {
    saving.value = false
  }
}

async function del (row) {
  if (!confirm(`Eliminar la nota "${row.titulo}"?`)) return
  try {
    await api.notas.remove(row.id)
    rows.value = rows.value.filter(r => r.id !== row.id)
  } catch {
    alert('No se pudo eliminar.')
  }
}

/* Utils UI */
function cap (s) { s = String(s||'').trim(); return s ? s[0].toUpperCase() + s.slice(1) : s }
function dt (iso) {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleString('es-MX',{ day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) }
  catch { return iso }
}
function estadoTexto (s) {
  const v = String(s||'').toLowerCase()
  if (v === 'abierta') return 'Abierta'
  if (v === 'en_progreso') return 'En progreso'
  if (v === 'cerrada') return 'Cerrada'
  return cap(v || '—')
}
function chipPrioridad (p) {
  const v = String(p||'').toLowerCase()
  if (v === 'alta')  return 'chip--danger'
  if (v === 'baja')  return 'chip--muted'
  return 'chip--warn'
}
function chipEstado (e) {
  const v = String(e||'').toLowerCase()
  if (v === 'cerrada') return 'chip--ok'
  if (v === 'en_progreso') return 'chip--info'
  return 'chip--muted'
}
function snippet (html) {
  const text = String(html || '')
    .replace(/<[^>]+>/g, '')   // quita etiquetas simples
    .slice(0, 180)
  return text + (text.length >= 180 ? '…' : '')
}

/* Export CSV */
function exportCsv () {
  const header = ['Título','Contenido','Prioridad','Estado','Autor','Creado']
  const rowsCsv = rows.value.map(n => [
    n.titulo || '',
    String(n.contenido || '').replace(/(\r?\n)+/g, ' ').replace(/"/g,'""'),
    cap(n.prioridad),
    estadoTexto(n.estado),
    n.autor || '',
    dt(n.created_at),
  ])
  const csv = [header, ...rowsCsv]
    .map(r => r.map(c => `"${String(c)}"`).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `notas_cliente_${props.clienteId}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}
</script>

<style scoped>
.label{ @apply block text-xs text-gray-500 mb-1; }
.input{ @apply w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none; }

.btn-primary{ @apply px-3 py-2 rounded-xl text-white bg-[#1a5eff] hover:opacity-90; }
.btn-light{ @apply px-3 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50; }

.chip{ @apply inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border; }
.chip--ok{ @apply bg-emerald-50 text-emerald-700 border-emerald-200; }
.chip--info{ @apply bg-blue-50 text-blue-700 border-blue-200; }
.chip--warn{ @apply bg-amber-50 text-amber-700 border-amber-200; }
.chip--danger{ @apply bg-rose-50 text-rose-700 border-rose-200; }
.chip--muted{ @apply bg-gray-50 text-gray-700 border-gray-200; }
</style>