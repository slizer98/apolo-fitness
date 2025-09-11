<template>
  <div class="p-4">
    <!-- Header acciones -->
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-base font-semibold">Config UI</h1>
      <div class="flex items-center gap-2">
        <button
          class="px-3 py-1.5 text-sm rounded border border-gray-300 hover: transition"
          :disabled="loading"
          @click="load(true)"
        >
          <i class="fa-solid fa-rotate mr-1"></i> Recargar
        </button>
        <button
          class="px-3 py-1.5 text-sm rounded border border-gray-900 text-white bg-gray-900 hover:bg-black transition disabled:opacity-50"
          :disabled="saving"
          @click="saveAll"
        >
          <i class="fa-solid fa-floppy-disk mr-1"></i> Guardar
        </button>
        <small
          class="text-xs"
          :class="{
            'text-gray-500': saveMessageType==='info',
            'text-emerald-600': saveMessageType==='ok',
            'text-amber-600': saveMessageType==='warn',
            'text-red-600': saveMessageType==='err',
          }"
        >{{ saveMessage }}</small>
      </div>
    </div>

    <!-- Grid: Rutas nuevas | Menú actual -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <!-- Card: Rutas nuevas -->
      <section class="rounded-2xl border border-gray-200">
        <header class="px-4 py-3 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <h2 class="text-sm font-medium">Rutas nuevas</h2>
              <span class="text-xs text-gray-500">Arrastra al “Menú actual” para añadir</span>
            </div>
          </div>
        </header>

        <ul
          class="p-2"
          @dragover.prevent="onListDragOver('catalog', $event)"
          @drop="onDrop('catalog')"
        >
          <li
            v-for="(r, i) in newRoutes"
            :key="'cat-'+r.routeName"
            class="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-gray-200 mb-2 cursor-grab"
            draggable="true"
            @dragstart="onDragStart('catalog', i)"
            @dragover.prevent="onItemDragOver('catalog', i)"
            @dblclick="openEdit('catalog', i)"
          >
            <div class="flex items-center gap-2 min-w-0">
              <i :class="['fa-solid', r.icon || 'fa-circle']"></i>
              <div class="flex flex-col min-w-0">
                <span class="text-sm font-medium truncate">{{ r.label }}</span>
                <span class="text-xs text-gray-500 truncate">
                  <code>{{ r.routeName }}</code>
                </span>
              </div>
            </div>
            <button class="text-xs px-2 py-1 rounded border border-gray-300" title="Arrastrar">⋮⋮</button>
          </li>

          <li
            v-if="!newRoutes.length"
            class="px-3 py-2 text-center text-xs text-gray-500"
          >No hay rutas disponibles</li>
        </ul>
      </section>

      <!-- Card: Menú actual -->
      <section class="rounded-2xl border border-gray-200">
        <header class="px-4 py-3 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <h2 class="text-sm font-medium">Menú actual</h2>
              <span class="text-xs text-gray-500">Reordena o arrastra hacia “Rutas nuevas” para quitar</span>
            </div>
          </div>
        </header>

        <ul
          class="p-2"
          @dragover.prevent="onListDragOver('menu', $event)"
          @drop="onDrop('menu')"
        >
          <li
            v-for="(m, i) in menu"
            :key="'menu-'+m.routeName+'-'+i"
            class="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-gray-200 mb-2 cursor-grab"
            draggable="true"
            @dragstart="onDragStart('menu', i)"
            @dragover.prevent="onItemDragOver('menu', i)"
            @dblclick="openEdit('menu', i)"
          >
            <div class="flex items-center gap-2 min-w-0">
              <i :class="['fa-solid', m.icon || 'fa-circle']"></i>
              <div class="flex flex-col min-w-0">
                <span class="text-sm font-medium truncate">{{ m.label }}</span>
                <span class="text-xs text-gray-500 truncate">
                  <code>{{ m.routeName }}</code>
                  <template v-if="m.roles?.length"> · roles: {{ m.roles.join(', ') }}</template>
                </span>
              </div>
            </div>
            <button class="text-xs px-2 py-1 rounded border border-gray-300" title="Arrastrar">⋮⋮</button>
          </li>

          <li
            v-if="!menu.length"
            class="px-3 py-2 text-center text-xs text-gray-500"
          >No hay elementos en el menú</li>
        </ul>
      </section>
    </div>
    <!-- Modal edición -->
<div v-if="editor.open" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="editor.open=false">
  <div class="w-full max-w-xl bg-gray-950 border border-gray-800 rounded-2xl shadow-xl">
    <div class="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
      <h3 class="text-lg">Editar elemento</h3>
      <button @click="editor.open=false" class="text-gray-400 hover:text-white">✕</button>
    </div>

    <form @submit.prevent="applyEdit" class="p-4 space-y-4" novalidate>
      <div class="grid sm:grid-cols-1 gap-3">
        <div>
          <label class="block text-xs text-gray-400 mb-1">Label *</label>
          <input
            v-model.trim="form.label"
            class="w-full bg-gray-900 border rounded px-3 py-2"
            :class="form.label ? 'border-gray-700' : 'border-red-600'"
            placeholder="Nombre visible en el menú"
          />
          <p v-if="!form.label" class="text-red-400 text-xs mt-1">Requerido</p>
        </div>

        <div>
          <label class="block text-xs text-gray-400 mb-1">Route name</label>
          <input
            v-model="form.routeName"
            class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-gray-400"
            disabled
          />
        </div>

        <div>
          <label class="block text-xs text-gray-400 mb-1">Icono (opcional)</label>
          <div class="flex items-center gap-2">
            <input
              v-model.trim="form.icon"
              placeholder="fa-house o iconify: lucide:dumbbell"
              class="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2"
              @focus="openIconPicker = true"
              readonly
            />
            <button
              type="button"
              class="px-2 py-2 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700"
              @click="openIconPicker = true"
            >
              Elegir...
            </button>
          </div>

          <div v-if="form.icon" class="mt-2 flex items-center gap-2 text-gray-300">
            <!-- Soporta Iconify y clases FA: si es 'algo:algo' mostramos Iconify -->
            <Icon v-if="form.icon.includes(':')" :icon="form.icon" class="w-5 h-5" />
            <i v-else :class="['fa-solid', form.icon]" class="w-5 h-5"></i>
            <span class="text-xs">{{ form.icon }}</span>
            <button type="button" class="text-xs text-gray-400 hover:text-white" @click="form.icon = ''">Quitar</button>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-end gap-2 pt-1">
        <button type="button" @click="editor.open=false"
                class="px-4 py-2 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700">
          Cancelar
        </button>
        <button type="submit"
                class="px-4 py-2 rounded bg-apolo-primary text-black hover:bg-apolo-secondary disabled:opacity-60"
                :disabled="!form.label">
          Aplicar
        </button>
      </div>
    </form>
  </div>
</div>

<!-- Icon Picker -->

</div>
<IconPicker v-if="openIconPicker" @close="openIconPicker=false" @select="onSelectIconify" />
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useWorkspaceStore } from '@/stores/workspace'
import api from '@/api/services'
import { getRouteCatalog } from '@/router/routeCatalog' // si exportas función, ver loadCatalog()
import { Icon } from '@iconify/vue'                  // para previsualizar iconos de Iconify
import IconPicker from '@/components/IconPicker.vue' // ajusta la ruta si la tienes en otro path

// ===== estado para el picker =====
const openIconPicker = ref(false)

// ===== callback cuando el usuario elige un icono en el picker =====
function onSelectIconify(iconName) {
  // iconName esperado tipo 'lucide:dumbbell' o 'mdi:home'
  form.icon = iconName || ''
  openIconPicker.value = false
}
/* =========================
   Workspace (empresaId real)
========================= */
const ws = useWorkspaceStore()
const empresaId = computed(() => ws.empresaId)

/* =========================
   Estado UI
========================= */
const loading = ref(false)
const saving  = ref(false)
const saveMessage = ref('')
const saveMessageType = ref('info') // info | ok | warn | err

const menu = ref([])         // Menú actual (ui.nav)
const newRoutes = ref([])    // Catálogo - menú

// Drag state
const drag = reactive({
  src: /** 'menu' | 'catalog' | null */ null,
  index: /** number|null */ null,
  overIndexMenu: /** number|null */ null,
  overIndexCatalog: /** number|null */ null,
})

// Modal edición
const editor = reactive({ open: false, from: 'menu', index: null })
const form = reactive({ label: '', routeName: '', icon: 'fa-circle', rolesRaw: '' })

/* =========================
   Utils
========================= */
function rolesFromRaw(raw) {
  return raw
    ? raw.split(',').map(s => s.trim()).filter(Boolean)
    : []
}
function toKeySet(arr) {
  const s = new Set()
  arr.forEach(it => s.add(it.routeName))
  return s
}
function loadCatalog() {
  // Soporta: export default array  ó  export default function()->array
  if (Array.isArray(getRouteCatalog)) return getRouteCatalog
  if (typeof getRouteCatalog === 'function') return getRouteCatalog() || []
  if (Array.isArray(getRouteCatalog?.default)) return getRouteCatalog.default
  if (typeof getRouteCatalog?.default === 'function') return getRouteCatalog.default() || []
  return []
}

/* =========================================================
   FIX: migrar menú metido por error en ui.app_name → ui.nav
========================================================= */
async function fixMenuEnAppName(idEmpresa, ui) {
  if (Array.isArray(ui['ui.nav'])) return false
  const raw = ui['ui.app_name']
  if (typeof raw === 'string' && raw.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        await api.valoresConfiguracion.upsert({
          empresa: idEmpresa,
          nombre: 'ui.nav',
          valor: JSON.stringify(parsed),
        })
        await api.valoresConfiguracion.upsert({
          empresa: idEmpresa,
          nombre: 'ui.app_name',
          valor: 'Mi App',
        })
        return true
      }
    } catch { /* ignore */ }
  }
  return false
}

/* =========================
   Carga
========================= */
async function load(force = false) {
  if (!empresaId.value) {
    saveMessage.value = 'Selecciona una empresa'
    saveMessageType.value = 'warn'
    return
  }
  loading.value = true
  saveMessage.value = force ? 'Recargando…' : 'Cargando…'
  saveMessageType.value = 'info'
  try {
    // 1) UI por empresa
    let { data: ui } = await api.valoresConfiguracion.getPorEmpresa(empresaId.value)

    // 2) Fix si el menú quedó en app_name
    const migrated = await fixMenuEnAppName(empresaId.value, ui)
    if (migrated) {
      ;({ data: ui } = await api.valoresConfiguracion.getPorEmpresa(empresaId.value))
    }

    // 3) Menú actual
    let nav = ui['ui.nav']
    if (typeof nav === 'string') {
      try { nav = JSON.parse(nav) } catch { nav = [] }
    }
    menu.value = Array.isArray(nav) ? nav : []

    // 4) Catálogo - diferencia
    const catalog = loadCatalog() || []
    const current = toKeySet(menu.value)
    newRoutes.value = catalog.filter(c => !current.has(c.routeName))

    saveMessage.value = '✔ Config cargada'
    saveMessageType.value = 'ok'
  } catch (e) {
    console.error(e)
    saveMessage.value = '✖ Error al cargar'
    saveMessageType.value = 'err'
  } finally {
    loading.value = false
  }
}

/* =========================
   Guardado
========================= */
async function saveAll() {
  if (!empresaId.value) return
  saving.value = true
  saveMessage.value = 'Guardando…'
  saveMessageType.value = 'info'
  try {
    await api.valoresConfiguracion.upsert({
      empresa: empresaId.value,
      nombre: 'ui.nav',
      valor: JSON.stringify(menu.value),
    })
    saveMessage.value = '✔ Guardado'
    saveMessageType.value = 'ok'
  } catch (e) {
    console.error(e)
    saveMessage.value = '✖ Error al guardar'
    saveMessageType.value = 'err'
  } finally {
    saving.value = false
  }
}

/* =========================
   Drag & Drop (con reorden exacto)
========================= */
function onDragStart(source, index) {
  drag.src = source // 'menu' | 'catalog'
  drag.index = index
}

function onItemDragOver(targetList, overIndex) {
  if (targetList === 'menu') {
    drag.overIndexMenu = overIndex
  } else {
    drag.overIndexCatalog = overIndex
  }
}

function onListDragOver(targetList, evt) {
  // Si no hay elementos, overIndex = 0 (insertar al inicio)
  if (targetList === 'menu' && menu.value.length === 0) {
    drag.overIndexMenu = 0
  }
  if (targetList === 'catalog' && newRoutes.value.length === 0) {
    drag.overIndexCatalog = 0
  }
}

function insertAt(list, fromIndex, toIndex) {
  if (toIndex == null || toIndex < 0 || toIndex > list.length) {
    // si no tenemos un índice válido, va al final
    toIndex = list.length
  }
  if (fromIndex === toIndex || fromIndex + 1 === toIndex) return
  const item = list.splice(fromIndex, 1)[0]
  if (fromIndex < toIndex) toIndex-- // al sacar, el array encoge
  list.splice(toIndex, 0, item)
}

function onDrop(target) {
  const { src, index } = drag
  if (src == null || index == null) return
  if (target !== 'menu' && target !== 'catalog') return

  if (src === target) {
    // Reordenar dentro de la misma lista usando overIndex
    if (src === 'menu') {
      insertAt(menu.value, index, drag.overIndexMenu ?? menu.value.length)
    } else {
      insertAt(newRoutes.value, index, drag.overIndexCatalog ?? newRoutes.value.length)
    }
  } else {
    // Mover entre listas con inserción por overIndex
    if (src === 'menu' && target === 'catalog') {
      const item = menu.value.splice(index, 1)[0]
      const exists = newRoutes.value.findIndex(r => r.routeName === item.routeName) >= 0
      const insertIndex = drag.overIndexCatalog ?? newRoutes.value.length
      if (!exists) newRoutes.value.splice(insertIndex, 0, { ...item })
    } else if (src === 'catalog' && target === 'menu') {
      const item = newRoutes.value.splice(index, 1)[0]
      const exists = menu.value.findIndex(m => m.routeName === item.routeName) >= 0
      const insertIndex = drag.overIndexMenu ?? menu.value.length
      if (!exists) menu.value.splice(insertIndex, 0, { ...item })
    }
  }

  // limpiar estado drag
  drag.src = drag.index = null
  drag.overIndexMenu = drag.overIndexCatalog = null
}

/* =========================
   Editor
========================= */
function openEdit(from, i) {
  editor.from = from         // 'menu' | 'catalog'
  editor.index = i
  const srcArr = from === 'menu' ? menu.value : newRoutes.value
  const it = srcArr[i]
  form.label = it.label
  form.routeName = it.routeName
  form.icon = it.icon || 'fa-circle'
  form.rolesRaw = (it.roles || []).join(', ')
  editor.open = true
}

function applyEdit() {
  const roles = rolesFromRaw(form.rolesRaw)
  const destArr = editor.from === 'menu' ? menu.value : newRoutes.value
  const idx = editor.index
  if (idx == null) return
  const current = destArr[idx]
  destArr.splice(idx, 1, {
    ...current,
    label: form.label?.trim() || current.label,
    icon:  form.icon?.trim()  || current.icon || 'fa-circle',
    roles: roles.length ? roles : undefined,
  })
  editor.open = false
}

/* =========================
   Lifecycle
========================= */
onMounted(async () => {
  await ws.ensureEmpresaSet()
  if (empresaId.value) load()
})
watch(empresaId, (n, o) => { if (n && n !== o) load(true) })
</script>
