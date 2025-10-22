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

    <!-- ======== Identidad (nombre y logo) ======== -->
    <section class="rounded-2xl border border-gray-200 mb-4">
      <header class="px-4 py-3 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-medium">Identidad</h2>
          <span class="text-xs text-gray-500">Nombre y logo visibles en el dashboard</span>
        </div>
      </header>
      <div class="p-4 grid md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs text-gray-500 mb-1">Nombre de la empresa (ui.app_name)</label>
          <input v-model.trim="appName" class="w-full border border-gray-300 rounded px-2 py-1.5" placeholder="Mi Empresa" />
        </div>
        <div>
          <label class="block text-xs text-gray-500 mb-1">Logo URL (ui.logo_url)</label>
          <input v-model.trim="logoUrl" class="w-full border border-gray-300 rounded px-2 py-1.5" placeholder="https://…/logo.png" />
          <div v-if="logoUrl" class="mt-2">
            <img :src="logoUrl" alt="logo preview" class="h-10 object-contain" />
          </div>
        </div>
      </div>
    </section>

    <!-- ======== Card: Tema (COLORES) ======== -->
    <section class="rounded-2xl border border-gray-200 mb-4">
      <header class="px-4 py-3 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-medium">Tema (colores)</h2>
          <span class="text-xs text-gray-500">Se aplican por empresa</span>
        </div>
      </header>

      <div class="p-4 grid md:grid-cols-2 gap-4">
        <!-- Colores primarios -->
        <div class="space-y-3">
          <div class="text-sm font-medium text-gray-700">Colores primarios</div>
          <div class="grid sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-500 mb-1">Primary</label>
              <div class="flex items-center gap-2">
                <input type="color" v-model="formTheme.primary" class="h-9 w-10 bg-transparent" />
                <input v-model="formTheme.primary" class="flex-1 border border-gray-300 rounded px-2 py-1.5" />
              </div>
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">Secondary</label>
              <div class="flex items-center gap-2">
                <input type="color" v-model="formTheme.secondary" class="h-9 w-10 bg-transparent" />
                <input v-model="formTheme.secondary" class="flex-1 border border-gray-300 rounded px-2 py-1.5" />
              </div>
            </div>
          </div>

          <div class="text-sm font-medium text-gray-700 mt-2">Fondo (sidebar/app)</div>
          <!-- Fondo general -->
          <div class="text-sm font-medium text-gray-700 mt-2">Fondo general</div>

          <div class="grid sm:grid-cols-2 gap-3 items-start">
            <div>
              <label class="block text-xs text-gray-500 mb-1">Modo</label>
              <div class="flex items-center gap-4 text-sm">
                <label class="inline-flex items-center gap-2">
                  <input type="radio" value="gradient" v-model="formTheme.bgMode">
                  <span>Gradiente</span>
                </label>
                <label class="inline-flex items-center gap-2">
                  <input type="radio" value="solid" v-model="formTheme.bgMode">
                  <span>Sólido</span>
                </label>
              </div>
              <p class="text-xs text-gray-500 mt-1">
                Si eliges <b>Sólido</b>, se usará solo el color siguiente y se ignorará el gradiente.
              </p>
            </div>

            <div>
              <label class="block text-xs text-gray-500 mb-1">Color sólido</label>
              <div class="flex items-center gap-2">
                <input type="color" v-model="formTheme.bgSolid" class="h-9 w-10 bg-transparent" />
                <input v-model="formTheme.bgSolid" class="flex-1 border border-gray-300 rounded px-2 py-1.5" />
              </div>
            </div>
          </div>

          <div class="grid sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-500 mb-1">BG Start</label>
              <div class="flex items-center gap-2">
                <input type="color" v-model="formTheme.bgStart" class="h-9 w-10 bg-transparent" />
                <input v-model="formTheme.bgStart" class="flex-1 border border-gray-300 rounded px-2 py-1.5" />
              </div>
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">BG End</label>
              <div class="flex items-center gap-2">
                <input type="color" v-model="formTheme.bgEnd" class="h-9 w-10 bg-transparent" />
                <input v-model="formTheme.bgEnd" class="flex-1 border border-gray-300 rounded px-2 py-1.5" />
              </div>
            </div>
          </div>

          <div class="text-sm font-medium text-gray-700 mt-2">Topbar</div>
          <div class="grid sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-500 mb-1">Top Start</label>
              <div class="flex items-center gap-2">
                <input type="color" v-model="formTheme.topStart" class="h-9 w-10 bg-transparent" />
                <input v-model="formTheme.topStart" class="flex-1 border border-gray-300 rounded px-2 py-1.5" />
              </div>
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">Top End</label>
              <div class="flex items-center gap-2">
                <input type="color" v-model="formTheme.topEnd" class="h-9 w-10 bg-transparent" />
                <input v-model="formTheme.topEnd" class="flex-1 border border-gray-300 rounded px-2 py-1.5" />
              </div>
            </div>
          </div>

          <!-- Texto global -->
          <div class="text-sm font-medium text-gray-700 mt-2">Texto</div>
          <div class="grid sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-500 mb-1">Texto base</label>
              <div class="flex items-center gap-2">
                <input type="color" v-model="formTheme.text" class="h-9 w-10 bg-transparent" />
                <input v-model="formTheme.text" class="flex-1 border border-gray-300 rounded px-2 py-1.5" />
              </div>
            </div>
          </div>

          <div class="grid sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs text-gray-500 mb-1">Texto secundario (subtext)</label>
            <div class="flex items-center gap-2">
              <!-- Si usas color sólido, puedes poner input color;
                  si vas a permitir rgba(), deja solo el text -->
              <input v-model="formTheme.subtext" class="flex-1 border border-gray-300 rounded px-2 py-1.5" placeholder="#64748b o rgba(15,23,42,.55)"/>
            </div>
          </div>
        </div>


          <!-- Cards -->
          <div class="text-sm font-medium text-gray-700 mt-2">Cards</div>
          <div class="grid sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-500 mb-1">Card BG</label>
              <div class="flex items-center gap-2">
                <input type="color" v-model="formTheme.cardBg" class="h-9 w-10 bg-transparent" />
                <input v-model="formTheme.cardBg" class="flex-1 border border-gray-300 rounded px-2 py-1.5" />
              </div>
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">Card Text</label>
              <div class="flex items-center gap-2">
                <input type="color" v-model="formTheme.cardText" class="h-9 w-10 bg-transparent" />
                <input v-model="formTheme.cardText" class="flex-1 border border-gray-300 rounded px-2 py-1.5" />
              </div>
            </div>
          </div>
        </div>

        <!-- Vista previa -->
        <div>
          <div class="text-sm text-gray-700 mb-2">Vista previa</div>
          <div
            class="rounded-xl overflow-hidden border border-gray-200 shadow"
            :style="formTheme.bgMode === 'solid'
              ? { background: formTheme.bgSolid }
              : { background: `linear-gradient(120deg, ${formTheme.bgStart}, ${formTheme.bgEnd})` }"
          >
            <div
              class="h-12 px-3 flex items-center justify-between text-sm text-white"
              :style="{ background: `linear-gradient(90deg, ${formTheme.topStart}, ${formTheme.topEnd})` }"
            >
              <span>Topbar</span>
              <span class="inline-flex items-center gap-2">
                <span class="h-6 w-6 rounded-lg border border-white/40" :style="{ background: formTheme.primary }"></span>
                <span class="h-6 w-6 rounded-lg border border-white/40" :style="{ background: formTheme.secondary }"></span>
              </span>
            </div>
            <div class="p-3 text-xs" :style="{ color: formTheme.text }">
              <div class="rounded-lg border px-3 py-2"
                   :style="{ background: formTheme.cardBg, color: formTheme.cardText, borderColor: '#e5e7eb' }">
                Card preview — texto de card
              </div>
            </div>
          </div>

          <div class="mt-3">
            <button
              class="px-3 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-50 transition disabled:opacity-50"
              :disabled="saving"
              @click="saveColors"
            >
              Guardar colores
            </button>
          </div>
        </div>
      </div>
    </section>

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
    <IconPicker v-if="openIconPicker" @close="openIconPicker=false" @select="onSelectIconify" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useWorkspaceStore } from '@/stores/workspace'
import { useUiConfigStore } from '@/stores/uiConfig'
import api from '@/api/services'
import { getRouteCatalog } from '@/router/routeCatalog'
import { Icon } from '@iconify/vue'
import IconPicker from '@/components/IconPicker.vue'

const ui = useUiConfigStore()

// ===== estado para el picker =====
const openIconPicker = ref(false)
function onSelectIconify(iconName) {
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

// ===== Identidad =====
const appName = ref('')   // ui.app_name
const logoUrl = ref('')   // ui.logo_url

// ===== Tema (form local)
const formTheme = reactive({
  primary:   '#1a5eff',
  secondary: '#4ae364',
  bgStart:   '#0c1224',
  bgEnd:     '#070a12',
  topStart:  '#0b0f1e',
  topEnd:    '#0c142a',
  text:      '#111827',   // texto base
  cardBg:    '#ffffff',   // fondo de cards
  cardText:  '#1a1a1a',   // texto de cards
  bgMode:    'gradient',   // 'gradient' | 'solid'
  bgSolid:   '#f6f7fb',
  subtext:   'rgba(15,23,42,0.55)',
})

// Drag state
const drag = reactive({
  src: null,
  index: null,
  overIndexMenu: null,
  overIndexCatalog: null,
})

// Modal edición
const editor = reactive({ open: false, from: 'menu', index: null })
const form = reactive({ label: '', routeName: '', icon: 'fa-circle', rolesRaw: '' })

/* =========================
   Utils
========================= */
function rolesFromRaw(raw) {
  return raw ? raw.split(',').map(s => s.trim()).filter(Boolean) : []
}
function toKeySet(arr) {
  const s = new Set()
  arr.forEach(it => s.add(it.routeName))
  return s
}
function loadCatalog() {
  if (Array.isArray(getRouteCatalog)) return getRouteCatalog
  if (typeof getRouteCatalog === 'function') return getRouteCatalog() || []
  if (Array.isArray(getRouteCatalog?.default)) return getRouteCatalog.default
  if (typeof getRouteCatalog?.default === 'function') return getRouteCatalog.default() || []
  return []
}

/* =========================================================
   FIX: migrar menú metido por error en ui.app_name → ui.nav
========================================================= */
async function fixMenuEnAppName(idEmpresa, cfgMap) {
  if (Array.isArray(cfgMap['ui.nav'])) return false
  const raw = cfgMap['ui.app_name']
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
    let { data: cfg } = await api.valoresConfiguracion.getPorEmpresa(empresaId.value)

    // 2) Fix si el menú quedó en app_name
    const migrated = await fixMenuEnAppName(empresaId.value, cfg)
    if (migrated) {
      ;({ data: cfg } = await api.valoresConfiguracion.getPorEmpresa(empresaId.value))
    }

    // 3) Menú actual
    let nav = cfg['ui.nav']
    if (typeof nav === 'string') {
      try { nav = JSON.parse(nav) } catch { nav = [] }
    }
    menu.value = Array.isArray(nav) ? nav : []

    // 3b) Tema (leer si existen; si no, conservar defaults/form)
    formTheme.primary   = cfg['ui.primary']   || ui.theme.primary   || formTheme.primary
    formTheme.secondary = cfg['ui.secondary'] || ui.theme.secondary || formTheme.secondary
    formTheme.bgStart   = cfg['ui.bgStart']   || ui.theme.bgStart   || formTheme.bgStart
    formTheme.bgEnd     = cfg['ui.bgEnd']     || ui.theme.bgEnd     || formTheme.bgEnd
    formTheme.topStart  = cfg['ui.topStart']  || ui.theme.topStart  || formTheme.topStart
    formTheme.topEnd    = cfg['ui.topEnd']    || ui.theme.topEnd    || formTheme.topEnd
    formTheme.text      = cfg['ui.text']      || ui.theme.text      || formTheme.text
    formTheme.cardBg    = cfg['ui.card.bg']   || ui.theme.cardBg    || formTheme.cardBg
    formTheme.cardText  = cfg['ui.card.text'] || ui.theme.cardText  || formTheme.cardText
    formTheme.bgMode  = cfg['ui.bg.mode'] || ui.theme.bgMode || formTheme.bgMode
    formTheme.bgSolid = cfg['ui.bgSolid'] || ui.theme.bgSolid || formTheme.bgSolid
    formTheme.subtext = cfg['ui.subtext'] || ui.theme.subtext || formTheme.subtext



    // 3c) Identidad
    appName.value = cfg['ui.app_name'] || appName.value || ''
    logoUrl.value = cfg['ui.logo_url'] || logoUrl.value || ''

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
async function saveColors() {
  if (!empresaId.value) return
  saving.value = true
  saveMessage.value = 'Guardando colores…'
  saveMessageType.value = 'info'
  try {
    await api.valoresConfiguracion.upsertMany({
      empresa: empresaId.value,
      items: [
        { nombre: 'ui.primary',    valor: formTheme.primary },
        { nombre: 'ui.secondary',  valor: formTheme.secondary },
        { nombre: 'ui.bgStart',    valor: formTheme.bgStart },
        { nombre: 'ui.bgEnd',      valor: formTheme.bgEnd },
        { nombre: 'ui.topStart',   valor: formTheme.topStart },
        { nombre: 'ui.topEnd',     valor: formTheme.topEnd },
        { nombre: 'ui.text',       valor: formTheme.text },
        { nombre: 'ui.card.bg',    valor: formTheme.cardBg },
        { nombre: 'ui.card.text',  valor: formTheme.cardText },
        { nombre: 'ui.bg.mode',    valor: formTheme.bgMode },
        { nombre: 'ui.bgSolid',    valor: formTheme.bgSolid },
        { nombre: 'ui.subtext', valor: formTheme.subtext },

      ]
    })
    // recargar store para que AppLayout tome los cambios
    await ui.loadForActiveCompany()

    saveMessage.value = '✔ Colores guardados'
    saveMessageType.value = 'ok'
  } catch (e) {
    console.error(e)
    saveMessage.value = '✖ Error al guardar colores'
    saveMessageType.value = 'err'
  } finally {
    saving.value = false
  }
}

async function saveAll () {
  if (!empresaId.value) return
  saving.value = true
  saveMessage.value = 'Guardando…'
  saveMessageType.value = 'info'

  try {
    // 1) Guardar tema + identidad en DB
    await api.valoresConfiguracion.upsertMany({
      empresa: empresaId.value,
      items: [
        // tema
        { nombre: 'ui.primary',    valor: formTheme.primary },
        { nombre: 'ui.secondary',  valor: formTheme.secondary },
        { nombre: 'ui.bgStart',    valor: formTheme.bgStart },
        { nombre: 'ui.bgEnd',      valor: formTheme.bgEnd },
        { nombre: 'ui.topStart',   valor: formTheme.topStart },
        { nombre: 'ui.topEnd',     valor: formTheme.topEnd },
        { nombre: 'ui.text',       valor: formTheme.text },
        { nombre: 'ui.card.bg',    valor: formTheme.cardBg },
        { nombre: 'ui.card.text',  valor: formTheme.cardText },
        // identidad
        { nombre: 'ui.app_name',   valor: appName.value || 'Mi App' },
        { nombre: 'ui.logo_url',   valor: logoUrl.value || '' },
        { nombre: 'ui.bg.mode',    valor: formTheme.bgMode },
        { nombre: 'ui.bgSolid',    valor: formTheme.bgSolid },
        { nombre: 'ui.subtext', valor: formTheme.subtext },

      ],
    })

    // 2) Guardar menú (string JSON)
    await api.valoresConfiguracion.upsert({
      empresa: empresaId.value,
      nombre: 'ui.nav',
      valor: JSON.stringify(menu.value),
    })

    // 3) Recargar store para reflejar cambios
    await ui.loadForActiveCompany()

    saveMessage.value = '✔ Guardado'
    saveMessageType.value = 'ok'
  } catch (e) {
    const msg =
      e?.response?.data?.detail ||
      e?.response?.data?.error ||
      e?.message ||
      'Error al guardar'
    console.error('Error guardando configuración', e)
    saveMessage.value = `✖ ${msg}`
    saveMessageType.value = 'err'
  } finally {
    saving.value = false
  }
}

/* =========================
   Drag & Drop (con reorden exacto)
========================= */
function onDragStart(source, index) {
  drag.src = source
  drag.index = index
}
function onItemDragOver(targetList, overIndex) {
  if (targetList === 'menu') drag.overIndexMenu = overIndex
  else drag.overIndexCatalog = overIndex
}
function onListDragOver(targetList) {
  if (targetList === 'menu' && menu.value.length === 0) drag.overIndexMenu = 0
  if (targetList === 'catalog' && newRoutes.value.length === 0) drag.overIndexCatalog = 0
}
function insertAt(list, fromIndex, toIndex) {
  if (toIndex == null || toIndex < 0 || toIndex > list.length) toIndex = list.length
  if (fromIndex === toIndex || fromIndex + 1 === toIndex) return
  const item = list.splice(fromIndex, 1)[0]
  if (fromIndex < toIndex) toIndex--
  list.splice(toIndex, 0, item)
}
function onDrop(target) {
  const { src, index } = drag
  if (src == null || index == null) return
  if (target !== 'menu' && target !== 'catalog') return

  if (src === target) {
    if (src === 'menu') insertAt(menu.value, index, drag.overIndexMenu ?? menu.value.length)
    else insertAt(newRoutes.value, index, drag.overIndexCatalog ?? newRoutes.value.length)
  } else {
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

  drag.src = drag.index = null
  drag.overIndexMenu = drag.overIndexCatalog = null
}

/* =========================
   Editor
========================= */
function openEdit(from, i) {
  editor.from = from
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
