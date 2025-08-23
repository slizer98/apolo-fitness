<template>
  <div class="p-4 text-white max-w-6xl mx-auto">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-light">Configuración de UI por empresa</h1>
      <div class="text-sm text-gray-400">Empresa activa: <span class="text-apolo-primary">{{ empresaNombre || empresaId }}</span></div>
    </div>

    <div v-if="loadingInit" class="grid gap-3">
      <div class="animate-pulse h-8 bg-gray-800/60 rounded"></div>
      <div class="animate-pulse h-40 bg-gray-800/60 rounded"></div>
    </div>

    <div v-else class="grid md:grid-cols-2 gap-6">
      <!-- Editor -->
      <section class="rounded-2xl bg-gray-950 border border-gray-800 p-4">
        <h2 class="text-lg font-medium mb-3">Editor</h2>

        <!-- Branding -->
        <div class="space-y-3">
          <div>
            <label class="block text-xs text-gray-400 mb-1">Nombre de la app (ui.app_name)</label>
            <input v-model="form.appName" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
          </div>

          <div>
            <label class="block text-xs text-gray-400 mb-1">Logo URL (ui.logo_url)</label>
            <input v-model="form.logoUrl" placeholder="https://..." class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-400 mb-1">Color primario (ui.primary)</label>
              <input v-model="form.primary" type="text" placeholder="#FF9F1C" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
            </div>
            <div>
              <label class="block text-xs text-gray-400 mb-1">Color secundario (ui.secondary)</label>
              <input v-model="form.secondary" type="text" placeholder="#F6AE2D" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
            </div>
          </div>
        </div>

        <hr class="my-4 border-gray-800">

        <!-- Menú lateral -->
        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="block text-xs text-gray-400">Menú (ui.nav) — JSON</label>
            <button class="text-xs px-2 py-1 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700"
                    @click="applySampleNav">Usar ejemplo</button>
          </div>
          <textarea v-model="form.nav" rows="8" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 font-mono text-sm"></textarea>
          <p v-if="navError" class="text-red-400 text-xs mt-1">{{ navError }}</p>
        </div>

        <hr class="my-4 border-gray-800">

        <!-- Widgets del dashboard -->
        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="block text-xs text-gray-400">Widgets (ui.dashboard.widgets) — JSON</label>
            <div class="flex gap-2">
              <button class="text-xs px-2 py-1 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700"
                      @click="applySampleWidgets">Ejemplo</button>
              <button class="text-xs px-2 py-1 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700"
                      @click="prettyWidgets">Formatear</button>
            </div>
          </div>
          <textarea v-model="form.widgets" rows="10" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 font-mono text-sm"></textarea>
          <p v-if="widgetsError" class="text-red-400 text-xs mt-1">{{ widgetsError }}</p>
        </div>

        <div class="flex items-center justify-end gap-2 mt-4">
          <button class="px-4 py-2 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700"
                  @click="reload">Descartar cambios</button>
          <button class="px-4 py-2 rounded bg-apolo-primary text-black hover:bg-apolo-secondary disabled:opacity-60"
                  :disabled="saving || !!navError || !!widgetsError" @click="saveAll">
            {{ saving ? 'Guardando…' : 'Guardar' }}
          </button>
        </div>
      </section>

      <!-- Preview -->
      <section class="rounded-2xl bg-gray-950 border border-gray-800 p-4">
        <h2 class="text-lg font-medium mb-3">Previsualización</h2>

        <div class="rounded-xl border border-gray-800 overflow-hidden">
          <div class="p-3 flex items-center gap-3" :style="{ background: `linear-gradient(90deg, #000, ${form.primary || '#FF9F1C'}22, #000)` }">
            <img :src="form.logoUrl || defaultLogo" alt="logo" class="h-8 w-auto">
            <div class="text-sm">
              <div class="font-medium">{{ form.appName || 'ÁGORA ERP' }}</div>
              <div class="text-[11px] text-gray-400">Colores: <span :style="{color: form.primary}">Primary</span>, <span :style="{color: form.secondary}">Secondary</span></div>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-2 p-3">
            <div class="text-xs text-gray-400">Menú simulado</div>
            <div class="grid grid-cols-2 gap-2">
              <div v-for="(item, i) in previewNav" :key="i" class="px-3 py-2 rounded-lg border border-gray-800 bg-gray-900/60 flex items-center gap-2">
                <i :class="['fa', item.icon || 'fa-circle', 'opacity-80']"></i>
                <span class="text-sm">{{ item.label || item.routeName }}</span>
              </div>
            </div>
          </div>

          <div class="p-3">
            <div class="text-xs text-gray-400 mb-2">Widgets</div>
            <div class="flex flex-wrap gap-2">
              <span v-for="(w,i) in previewWidgets" :key="i" class="text-xs px-2 py-1 rounded-full border border-gray-800 bg-gray-900/60">
                {{ w.name }}
              </span>
            </div>
          </div>
        </div>

        <p class="text-xs text-gray-500 mt-3">* La vista real tomará esta configuración al recargar.</p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/api/services'
import { useWorkspaceStore } from '@/stores/workspace'
import { useUiConfigStore } from '@/stores/uiConfig'
import defaultLogo from '@/assets/images/apolo-name.png' // si lo usas en el template

const ws = useWorkspaceStore()
const ui = useUiConfigStore()

const loadingInit = ref(true)
const saving = ref(false)

const empresaId = computed(() => ws.empresaId)
const empresaNombre = computed(() => ws.empresaNombre)

// Campos que vamos a gestionar desde este editor
const keys = [
  { name: 'ui.app_name',           type: 'string' },
  { name: 'ui.logo_url',           type: 'string' },
  { name: 'ui.primary',            type: 'string' },
  { name: 'ui.secondary',          type: 'string' },
  { name: 'ui.nav',                type: 'json'   },
  { name: 'ui.dashboard.widgets',  type: 'json'   },
]

// Mapa: nombre_config -> { configId, valorId, valorString, tipo }
const records = ref({})

// Formulario visual
const form = ref({
  appName: '',
  logoUrl: '',
  primary: '#FF9F1C',
  secondary: '#F6AE2D',
  nav: '',
  widgets: '',
})

const navError = ref('')
const widgetsError = ref('')

// --- Helpers de normalización ---
const arr = (data) => {
  if (Array.isArray(data)) return data
  if (data && Array.isArray(data.results)) return data.results
  return []
}

// --- Previews con validación JSON ---
const previewNav = computed(() => {
  try {
    const a = JSON.parse(form.value.nav || '[]')
    if (!Array.isArray(a)) throw new Error('nav debe ser un arreglo')
    navError.value = ''
    return a
  } catch {
    navError.value = 'JSON inválido en ui.nav'
    return []
  }
})

const previewWidgets = computed(() => {
  try {
    const a = JSON.parse(form.value.widgets || '[]')
    if (!Array.isArray(a)) throw new Error('widgets debe ser un arreglo')
    widgetsError.value = ''
    return a
  } catch {
    widgetsError.value = 'JSON inválido en ui.dashboard.widgets'
    return []
  }
})

// --- Botones de ejemplo ---
function applySampleNav() {
  const sample = [
    { label: 'Dashboard',   routeName: 'Dashboard',       icon: 'fa-house' },
    { label: 'Clientes',    routeName: 'ClientesLista',   icon: 'fa-id-card' },
    { label: 'Planes',      routeName: 'PlanesLista',     icon: 'fa-dumbbell' },
    { label: 'Usuarios',    routeName: 'UsuariosEmpresa', icon: 'fa-user-shield', roles: ['admin','owner','manager','gerente'] },
    { label: 'Config',      routeName: 'Configuraciones', icon: 'fa-gear',        roles: ['admin','owner','manager','gerente'] },
    { label: 'Config UI',   routeName: 'UiConfigurator',  icon: 'fa-sliders',     roles: ['admin','owner','manager','gerente'] },
    { label: 'Perfil',      routeName: 'Perfil',          icon: 'fa-circle-user' },
  ]
  form.value.nav = JSON.stringify(sample, null, 2)
}

function applySampleWidgets() {
  const sample = [
    { name: 'kpis', props: {} },
    { name: 'quickActions', props: {} },
    { name: 'entradasDelDia', props: {} },
    { name: 'planesVigentes', props: { limit: 8 } },
  ]
  form.value.widgets = JSON.stringify(sample, null, 2)
}

function prettyWidgets() {
  try {
    form.value.widgets = JSON.stringify(JSON.parse(form.value.widgets || '[]'), null, 2)
  } catch {}
}

// --- Carga de configuraciones ---
async function loadConfig() {
  loadingInit.value = true
  await ws.ensureEmpresaSet()

  // 1) Catálogo de configuraciones (para obtener configId)
  const { data: cfgsResp } = await api.configuraciones.list({ page_size: 200 })
  const cfgList = arr(cfgsResp)

  // 2) Valores por empresa ***como LISTA*** (necesitamos valorId para hacer update)
  const { data: valsResp } = await api.valoresConfiguracion.list({ empresa: ws.empresaId, page_size: 200 })
  const valList = arr(valsResp)

  const map = {}
  for (const k of keys) {
    const c = cfgList.find(x => x?.nombre === k.name) || null
    // Soporta ambos shapes: con configuracion_nombre o configuracion anidado
    const v = valList.find(
      x => x?.configuracion_nombre === k.name ||
           x?.configuracion?.nombre === k.name
    ) || null

    map[k.name] = {
      configId: c?.id || null,
      valorId: v?.id || null,
      valorString: v?.valor ?? '',
      tipo: k.type,
    }
  }
  records.value = map

  // Prefills con fallback al store de UI
  form.value.appName   = map['ui.app_name']?.valorString || ui.branding.appName || 'ÁGORA ERP'
  form.value.logoUrl   = map['ui.logo_url']?.valorString || ''
  form.value.primary   = map['ui.primary']?.valorString  || ui.theme.primary || '#FF9F1C'
  form.value.secondary = map['ui.secondary']?.valorString|| ui.theme.secondary || '#F6AE2D'
  form.value.nav       = map['ui.nav']?.valorString      || JSON.stringify(ui.menu, null, 2)
  form.value.widgets   = map['ui.dashboard.widgets']?.valorString || JSON.stringify(ui.dashboardWidgets, null, 2)

  loadingInit.value = false
}

// Crea las definiciones del catálogo si no existen
async function ensureConfigDefinitions() {
  const defs = [
    { nombre:'ui.app_name',           tipo_dato:'string', descripcion:'Nombre visible de la app' },
    { nombre:'ui.logo_url',           tipo_dato:'string', descripcion:'URL del logo' },
    { nombre:'ui.primary',            tipo_dato:'string', descripcion:'Color primario' },
    { nombre:'ui.secondary',          tipo_dato:'string', descripcion:'Color secundario' },
    { nombre:'ui.nav',                tipo_dato:'json',   descripcion:'Menú lateral' },
    { nombre:'ui.dashboard.widgets',  tipo_dato:'json',   descripcion:'Widgets dashboard' },
  ]

  for (const d of defs) {
    if (!records.value[d.nombre]?.configId) {
      try {
        const { data } = await api.configuraciones.create(d)
        records.value[d.nombre] = { ...(records.value[d.nombre] || {}), configId: data?.id }
      } catch {
        // Si ya existía, vuelve a buscar para capturar su id
        const { data: cfgsResp } = await api.configuraciones.list({ search: d.nombre })
        const found = arr(cfgsResp).find(x => x?.nombre === d.nombre)
        if (found?.id) {
          records.value[d.nombre] = { ...(records.value[d.nombre] || {}), configId: found.id }
        }
      }
    }
  }
}

// Guardado en lote
async function saveAll() {
  // Validaciones de JSON
  try { JSON.parse(form.value.nav || '[]'); navError.value = '' } 
  catch { navError.value = 'JSON inválido en ui.nav'; return }
  try { JSON.parse(form.value.widgets || '[]'); widgetsError.value = '' } 
  catch { widgetsError.value = 'JSON inválido en ui.dashboard.widgets'; return }

  saving.value = true
  try {
    await ensureConfigDefinitions()

    // Upsert de cada clave
    const upserts = [
      ['ui.app_name',           form.value.appName],
      ['ui.logo_url',           form.value.logoUrl],
      ['ui.primary',            form.value.primary],
      ['ui.secondary',          form.value.secondary],
      ['ui.nav',                form.value.nav],
      ['ui.dashboard.widgets',  form.value.widgets],
    ]

    const ops = []
    for (const [key, val] of upserts) {
      const rec = records.value[key]
      if (!rec?.configId) continue

      const payload = {
        configuracion: rec.configId,
        empresa: ws.empresaId,
        valor: String(val ?? ''),
      }

      // Si ya hay valor, actualiza; si no, crea
      if (rec?.valorId) {
        // Usa update o patch según tu services
        ops.push(
          (api.valoresConfiguracion.update
            ? api.valoresConfiguracion.update(rec.valorId, { valor: payload.valor })
            : api.valoresConfiguracion.patch(rec.valorId, { valor: payload.valor })
          )
        )
      } else {
        ops.push(api.valoresConfiguracion.create(payload))
      }
    }

    await Promise.all(ops)

    // Recarga el store de UI para que el layout aplique colores/menú/widgets
    await ui.loadForActiveCompany()
    // Puedes disparar un toast aquí si tienes tu sistema de notificaciones
    // toast.success('Configuración actualizada')

  } catch (e) {
    console.error('No se pudo guardar', e?.response?.data || e)
    // toast.error('Hubo un error al guardar')
  } finally {
    saving.value = false
  }
}

function reload() {
  loadConfig()
}

onMounted(loadConfig)
</script>

