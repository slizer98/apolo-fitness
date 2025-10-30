<template>
  <div class="rounded-2xl bg-white border border-gray-200 shadow-sm">
    <!-- Header -->
    <div class="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
      <h3 class="font-semibold">Documentos</h3>
      <div class="flex items-center gap-2">
        <button
          class="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm"
          @click="exportCsv"
        >
          Exportar
        </button>

        <input ref="fileInput" type="file" class="hidden" multiple @change="onPickFiles" />
        <button
          class="px-3 py-1.5 rounded-lg bg-[#1a5eff] text-white hover:opacity-90 text-sm"
          @click="fileInput?.click()"
        >
          Subir
        </button>
      </div>
    </div>

    <!-- Filtros -->
    <div class="px-4 py-3 border-b border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div class="relative">
        <i class="fa fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
        <input
          v-model="q"
          type="text"
          class="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 placeholder-gray-400"
          placeholder="Buscar (nombre, descripción, etiquetas)…"
        />
      </div>

      <input
        v-model="categoria"
        type="text"
        class="w-full px-3 py-2 rounded-lg border border-gray-300 placeholder-gray-400"
        placeholder="Filtrar por categoría (INE, Contrato, Examen, …)"
      />

      <div class="flex items-center justify-end gap-2 text-sm">
        <span class="text-gray-500">Página {{ page }} <span v-if="count !== null">de {{ totalPages }}</span></span>
        <button
          class="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
          :disabled="page<=1 || loading"
          @click="prev"
        >
          « Anterior
        </button>
        <button
          class="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
          :disabled="!hasMore || loading"
          @click="next"
        >
          Siguiente »
        </button>
      </div>
    </div>

    <!-- Zona drag & drop -->
    <div
      class="mx-4 my-3 rounded-xl border-2 border-dashed"
      :class="dragOver ? 'border-[#1a5eff] bg-blue-50/30' : 'border-gray-200 bg-gray-50/40'"
      @dragover.prevent="dragOver = true"
      @dragleave.prevent="dragOver = false"
      @drop.prevent="onDrop"
    >
      <div class="px-4 py-4 text-sm text-gray-600 flex items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <i class="fa-regular fa-file"></i>
          <span>Arrastra archivos aquí para subirlos.</span>
        </div>
        <div class="flex items-center gap-2">
          <input
            v-model="uploadCategoria"
            type="text"
            class="px-2 py-1 rounded border border-gray-300 text-sm"
            placeholder="Categoría (opcional)"
          />
          <input
            v-model="uploadDescripcion"
            type="text"
            class="px-2 py-1 rounded border border-gray-300 text-sm w-64"
            placeholder="Descripción (opcional)"
          />
        </div>
      </div>
      <div v-if="uploads.length" class="px-4 pb-4 grid gap-2">
        <div v-for="u in uploads" :key="u.id" class="flex items-center justify-between text-xs bg-white rounded-lg border border-gray-200 px-3 py-2">
          <div class="truncate">
            <span class="font-medium">{{ u.file.name }}</span>
            <span class="text-gray-500 ml-2">({{ size(u.file.size) }})</span>
            <span class="text-gray-500 ml-2" v-if="u.err">{{ u.err }}</span>
          </div>
          <div class="flex items-center gap-2">
            <div v-if="u.progress < 100 && !u.err" class="w-40 h-1 bg-gray-200 rounded overflow-hidden">
              <div class="h-full bg-[#1a5eff]" :style="{ width: u.progress + '%' }"></div>
            </div>
            <span v-else-if="!u.err" class="text-emerald-600">Listo</span>
            <button class="text-gray-500 hover:text-gray-800" @click="removeUpload(u.id)">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabla -->
    <div class="overflow-x-auto">
      <table class="min-w-full text-sm">
        <thead>
          <tr class="bg-gray-100 text-gray-700">
            <th class="text-left px-4 py-2">Nombre</th>
            <th class="text-left px-4 py-2">Categoría</th>
            <th class="text-left px-4 py-2">Tamaño</th>
            <th class="text-left px-4 py-2">Sucursal</th>
            <th class="text-left px-4 py-2">Fecha</th>
            <th class="text-left px-4 py-2">Acciones</th>
          </tr>
        </thead>

        <tbody v-if="loading">
          <tr v-for="i in 6" :key="'sk'+i" class="odd:bg-white even:bg-gray-50">
            <td class="px-4 py-3"><div class="h-4 w-48 bg-gray-200 rounded animate-pulse"></div></td>
            <td class="px-4 py-3"><div class="h-4 w-20 bg-gray-200 rounded animate-pulse"></div></td>
            <td class="px-4 py-3"><div class="h-4 w-16 bg-gray-200 rounded animate-pulse"></div></td>
            <td class="px-4 py-3"><div class="h-4 w-40 bg-gray-200 rounded animate-pulse"></div></td>
            <td class="px-4 py-3"><div class="h-4 w-24 bg-gray-200 rounded animate-pulse"></div></td>
            <td class="px-4 py-3"><div class="h-4 w-28 bg-gray-200 rounded animate-pulse"></div></td>
          </tr>
        </tbody>

        <tbody v-else>
          <tr
            v-for="d in filteredRows"
            :key="d.id"
            class="odd:bg-white even:bg-gray-50 border-t border-gray-100"
          >
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <i :class="icono(d.mime_type)"></i>
                <a :href="d.archivo" target="_blank" class="text-[#1a5eff] hover:underline">{{ d.nombre || filename(d.archivo) }}</a>
                <span v-if="d.descripcion" class="text-xs text-gray-500">— {{ d.descripcion }}</span>
              </div>
              <div v-if="d.etiquetas?.length" class="mt-1 text-[11px] text-gray-500">
                <span v-for="tag in d.etiquetas" :key="tag" class="inline-block mr-1 px-1.5 py-0.5 rounded bg-gray-100">{{ tag }}</span>
              </div>
            </td>
            <td class="px-4 py-3">{{ d.categoria || '—' }}</td>
            <td class="px-4 py-3">{{ size(d.size_bytes) }}</td>
            <td class="px-4 py-3">{{ d.sucursal_nombre || '—' }}</td>
            <td class="px-4 py-3">{{ dt(d.created_at) }}</td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <a :href="d.archivo" target="_blank" class="text-[#1a5eff] hover:underline">Ver</a>
                <button class="text-gray-700 hover:text-black" @click="download(d)">Descargar</button>
                <button class="text-rose-600 hover:text-rose-700" @click="del(d)">Eliminar</button>
              </div>
            </td>
          </tr>

          <tr v-if="!filteredRows.length">
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
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import api from '@/api/services'
import { useWorkspaceStore } from '@/stores/workspace'

const props = defineProps({
  clienteId: { type: [String, Number], required: true },
})

const ws = useWorkspaceStore()

/* Estado */
const loading = ref(true)
const rows = ref([])
const page = ref(1)
const pageSize = 10
const count = ref(null)

const q = ref('')
const categoria = ref('')
const fileInput = ref(null)
const dragOver = ref(false)

/* Subidas en curso */
const uploads = ref([]) // [{id, file, progress, err}]
let uploadSeq = 1

/* Computados */
const hasMore = computed(() => {
  if (count.value === null) return rows.value.length === pageSize
  return page.value * pageSize < count.value
})
const totalPages = computed(() => count.value ? Math.max(1, Math.ceil(count.value / pageSize)) : 1)

const filteredRows = computed(() => {
  const term = q.value.trim().toLowerCase()
  const cat  = categoria.value.trim().toLowerCase()
  return rows.value.filter(d => {
    const hitQ = !term || [
      d.nombre, d.descripcion, (d.etiquetas || []).join(' '), d.categoria
    ].join(' ').toLowerCase().includes(term)
    const hitC = !cat || String(d.categoria||'').toLowerCase().includes(cat)
    return hitQ && hitC
  })
})

/* Carga */
onMounted(fetchPage)
watch(() => props.clienteId, () => { page.value = 1; fetchPage() })

async function fetchPage () {
  if (!props.clienteId) return
  loading.value = true
  try {
    const { data } = await api.documentos.list({
      cliente: props.clienteId,
      ordering: '-created_at',
      page: page.value,
      page_size: pageSize,
      // empresa viene por header X-Empresa-Id via interceptor
    })
    const list = data?.results || data || []
    count.value = data?.count ?? null

    rows.value = list.map(v => ({
      id: v.id,
      archivo: v.archivo, // URL
      nombre: v.nombre,
      descripcion: v.descripcion,
      categoria: v.categoria,
      etiquetas: v.etiquetas || [],
      mime_type: v.mime_type || '',
      size_bytes: Number(v.size_bytes || 0),
      sucursal_nombre: v.sucursal_nombre || '',
      created_at: v.created_at,
    }))
  } finally {
    loading.value = false
  }
}

function next () { if (hasMore.value) { page.value++; fetchPage() } }
function prev () { if (page.value > 1) { page.value--; fetchPage() } }

/* Upload */
const uploadCategoria = ref('')
const uploadDescripcion = ref('')

function onPickFiles (e) {
  const files = Array.from(e.target.files || [])
  if (!files.length) return
  doUpload(files)
  e.target.value = ''
}

function onDrop (e) {
  dragOver.value = false
  const files = Array.from(e.dataTransfer?.files || [])
  if (!files.length) return
  doUpload(files)
}

async function doUpload (files) {
  for (const file of files) {
    const id = uploadSeq++
    uploads.value.push({ id, file, progress: 0, err: '' })
    try {
      const fd = new FormData()
      fd.append('empresa', ws.empresaId)               // por si lo pides en payload
      fd.append('cliente', props.clienteId)
      if (uploadCategoria.value)  fd.append('categoria', uploadCategoria.value)
      if (uploadDescripcion.value) fd.append('descripcion', uploadDescripcion.value)
      fd.append('archivo', file)
      // nombre se infiere en el backend si no lo mandas

      // Nota: Axios no expone onUploadProgress en tu wrapper? Si sí:
      await api.documentos.create(fd /*, { onUploadProgress: (p) => {
        const pct = Math.round((p.loaded / p.total) * 100)
        const row = uploads.value.find(x => x.id === id)
        if (row) row.progress = pct
      }}*/)

      // Si no tienes onUploadProgress configurado en http, simulamos 100%
      const row = uploads.value.find(x => x.id === id)
      if (row) row.progress = 100
    } catch (err) {
      const row = uploads.value.find(x => x.id === id)
      if (row) row.err = 'Error al subir'
    }
  }
  fetchPage()
}

function removeUpload (id) {
  uploads.value = uploads.value.filter(u => u.id !== id)
}

/* Acciones */
async function del (doc) {
  if (!confirm(`Eliminar "${doc.nombre || filename(doc.archivo)}"?`)) return
  try {
    await api.documentos.remove(doc.id)
    rows.value = rows.value.filter(r => r.id !== doc.id)
  } catch (e) {
    alert('No se pudo eliminar.')
  }
}

function download (doc) {
  // abre en nueva pestaña; si quieres “download” forzado, crea un <a download>
  window.open(doc.archivo, '_blank')
}

/* Utils */
function dt (iso) {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleString('es-MX', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) }
  catch { return iso }
}
function size (n) {
  n = Number(n||0)
  const kb = n / 1024, mb = kb / 1024
  if (mb >= 1) return `${mb.toFixed(2)} MB`
  if (kb >= 1) return `${kb.toFixed(0)} KB`
  return `${n} B`
}
function filename (url) {
  try { return decodeURIComponent(String(url).split('/').pop().split('?')[0]) } catch { return url }
}
function icono (mime) {
  const m = String(mime||'').toLowerCase()
  if (m.includes('pdf')) return 'fa-regular fa-file-pdf text-rose-600'
  if (m.includes('image')) return 'fa-regular fa-file-image text-emerald-600'
  if (m.includes('excel') || m.includes('spreadsheet')) return 'fa-regular fa-file-excel text-emerald-700'
  if (m.includes('word')) return 'fa-regular fa-file-word text-blue-700'
  return 'fa-regular fa-file text-gray-500'
}

/* Export CSV (de lo filtrado) */
function exportCsv () {
  const header = ['Nombre','Descripción','Categoría','Etiquetas','Tamaño','Sucursal','Creado','URL']
  const rowsCsv = filteredRows.value.map(v => [
    v.nombre || filename(v.archivo),
    v.descripcion || '',
    v.categoria || '',
    (v.etiquetas || []).join('|'),
    size(v.size_bytes),
    v.sucursal_nombre || '',
    dt(v.created_at),
    v.archivo
  ])
  const csv = [header, ...rowsCsv]
    .map(r => r.map(cell => `"${String(cell).replace(/"/g,'""')}"`).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `documentos_cliente_${props.clienteId}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}
</script>