// src/stores/uiConfig.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api/services'
import { useWorkspaceStore } from '@/stores/workspace'

const parseMaybeJSON = (val) => {
  if (val == null) return null
  if (typeof val !== 'string') return val
  try { return JSON.parse(val) } catch { return val }
}

export const useUiConfigStore = defineStore('uiConfig', () => {
  const loaded   = ref(false)
  const raw      = ref({}) // key -> valor crudo (por empresa)

  // THEME por defecto (ligero y seguro)
  const theme = ref({
    primary:   '#1a5eff',
    secondary: '#4ae364',
    // Fondo general (por defecto "gradient" muy claro)
    bgMode:    'gradient',       // 'solid' | 'gradient'
    bgSolid:   '#f6f7fb',        // usado si bgMode === 'solid'
    bgStart:   '#f6f7fb',
    bgEnd:     '#f6f7fb',
    // Topbar
    topStart:  '#ffffff',
    topEnd:    '#ffffff',
    // Texto / cards
    text:      '#0f172a',
    cardBg:    '#ffffff',
    cardText:  '#0f172a',
    subtext:   'rgba(15,23,42,0.55)',
  })

  // Branding
  const appName = ref('ÁGORA ERP')
  const logoUrl = ref(null)

  // Navegación y widgets
  const nav      = ref(null)     // array (JSON ui.nav)
  const widgets  = ref(null)     // array (JSON ui.dashboard.widgets)

  async function loadForActiveCompany() {
    const ws = useWorkspaceStore()
    await ws.ensureEmpresaSet()

    if (!ws.empresaId) {
      loaded.value = true
      return
    }

    // GET /valores-configuracion/por-empresa/:empresaId/
    const { data } = await api.valoresConfiguracion.getPorEmpresa(ws.empresaId)

    // Map flexible: objeto directo (clave->valor) o lista con .configuracion.nombre
    let map = {}
    if (data && !Array.isArray(data) && typeof data === 'object') {
      map = data
    } else if (Array.isArray(data)) {
      data.forEach(row => {
        const key = row?.configuracion?.nombre
        if (key) map[key] = row.valor
      })
    } else if (data && Array.isArray(data.results)) {
      data.results.forEach(row => {
        const key = row?.configuracion?.nombre
        if (key) map[key] = row.valor
      })
    }

    raw.value = map

    // Branding
    appName.value = map['ui.app_name'] ?? appName.value
    logoUrl.value = map['ui.logo_url'] ?? null

    // Theme: usamos SIEMPRE las claves sin puntos intermedios
    // (coinciden con lo que guarda tu UiConfigurator.vue)
    theme.value = {
      primary:   map['ui.primary']    || theme.value.primary,
      secondary: map['ui.secondary']  || theme.value.secondary,

      // Fondo general
      bgMode:    map['ui.bg.mode']    || theme.value.bgMode,
      bgSolid:   map['ui.bgSolid']    || theme.value.bgSolid,
      bgStart:   map['ui.bgStart']    || theme.value.bgStart,
      bgEnd:     map['ui.bgEnd']      || theme.value.bgEnd,

      // Topbar
      topStart:  map['ui.topStart']   || theme.value.topStart,
      topEnd:    map['ui.topEnd']     || theme.value.topEnd,

      // Texto y cards
      text:      map['ui.text']       || theme.value.text,
      cardBg:    map['ui.card.bg']    || theme.value.cardBg,
      cardText:  map['ui.card.text']  || theme.value.cardText,
      subtext:   map['ui.subtext']    || theme.value.subtext,
      
    }

    // Menú y widgets (posibles JSON)
    nav.value     = parseMaybeJSON(map['ui.nav'])
    widgets.value = parseMaybeJSON(map['ui.dashboard.widgets'])

    loaded.value = true
  }

  // Menú por defecto si no hay en DB
  const menu = computed(() => {
    if (Array.isArray(nav.value)) return nav.value
    return [
      { label: 'Dashboard',   routeName: 'Dashboard',       icon: 'fa-house' },
      { label: 'Clientes',    routeName: 'ClientesLista',   icon: 'fa-id-card' },
      { label: 'Membresías',  routeName: 'PlanesLista',     icon: 'fa-dumbbell' },
      { label: 'Servicios',   routeName: 'ServiciosLista',  icon: 'fa-screwdriver-wrench' },
      { label: 'Beneficios',  routeName: 'BeneficiosLista', icon: 'fa-gift' },
      { label: 'Productos',   routeName: 'ProductosLista',  icon: 'fa-box' },
      { label: 'Disciplinas', routeName: 'DisciplinasLista',icon: 'fa-person-running' },
      { label: 'Usuarios',    routeName: 'UsuariosEmpresa', icon: 'fa-user-shield', roles: ['admin','owner','manager','gerente'] },
      { label: 'Config',      routeName: 'Configuraciones', icon: 'fa-gear',        roles: ['admin','owner','manager','gerente'] },
      { label: 'Config UI',   routeName: 'UiConfigurator',  icon: 'fa-sliders',     roles: ['admin','owner','manager','gerente'] },
      { label: 'Perfil',      routeName: 'Perfil',          icon: 'fa-circle-user' },
    ]
  })

  const dashboardWidgets = computed(() => {
    if (Array.isArray(widgets.value)) return widgets.value
    return [
      { name: 'kpis', props: {} },
      { name: 'quickActions', props: {} },
      { name: 'entradasDelDia', props: {} },
      { name: 'planesVigentes', props: { limit: 8 } },
    ]
  })

  // Helpers de guardado (por si quieres guardar desde el store)
  async function saveTheme(newTheme) {
    const ws = useWorkspaceStore()
    await ws.ensureEmpresaSet()
    if (!ws.empresaId) throw new Error('Sin empresa activa')

    const items = [
      { nombre: 'ui.primary',    valor: newTheme.primary },
      { nombre: 'ui.secondary',  valor: newTheme.secondary },

      // Fondo general
      { nombre: 'ui.bg.mode',    valor: newTheme.bgMode },
      { nombre: 'ui.bgSolid',    valor: newTheme.bgSolid },
      { nombre: 'ui.bgStart',    valor: newTheme.bgStart },
      { nombre: 'ui.bgEnd',      valor: newTheme.bgEnd },

      // Topbar
      { nombre: 'ui.topStart',   valor: newTheme.topStart },
      { nombre: 'ui.topEnd',     valor: newTheme.topEnd },

      // Texto / cards
      { nombre: 'ui.text',       valor: newTheme.text },
      { nombre: 'ui.card.bg',    valor: newTheme.cardBg },
      { nombre: 'ui.card.text',  valor: newTheme.cardText },
      { nombre: 'ui.subtext',    valor: newTheme.subtext }, 
      
    ].filter(it => it.valor != null)

    await api.valoresConfiguracion.upsertMany({ empresa: ws.empresaId, items })

    // Actualiza refs locales para que la UI reaccione
    theme.value = { ...theme.value, ...newTheme }
  }

  async function saveBranding({ name, logo }) {
    const ws = useWorkspaceStore()
    await ws.ensureEmpresaSet()
    if (!ws.empresaId) throw new Error('Sin empresa activa')

    const items = [
      { nombre: 'ui.app_name', valor: name ?? appName.value ?? 'Mi App' },
      { nombre: 'ui.logo_url', valor: logo ?? logoUrl.value ?? '' },
    ]
    await api.valoresConfiguracion.upsertMany({ empresa: ws.empresaId, items })
    appName.value = items[0].valor
    logoUrl.value = items[1].valor
  }

  async function saveNav(newNavArray) {
    const ws = useWorkspaceStore()
    await ws.ensureEmpresaSet()
    if (!ws.empresaId) throw new Error('Sin empresa activa')
    await api.valoresConfiguracion.upsert({
      empresa: ws.empresaId,
      nombre: 'ui.nav',
      valor: JSON.stringify(newNavArray || []),
    })
    nav.value = Array.isArray(newNavArray) ? [...newNavArray] : []
  }

  return {
    // state
    loaded, raw, theme,
    appName, logoUrl,
    nav, widgets,

    // derived
    menu, dashboardWidgets,

    // actions
    loadForActiveCompany,
    saveTheme,
    saveBranding,
    saveNav,
  }
})
