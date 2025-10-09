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

  // ⬇️ AMPLIADO: agregamos bgStart/bgEnd/topStart/topEnd con defaults tipo “tema oscuro”
  const theme    = ref({
    primary:   '#FF9F1C',
    secondary: '#F6AE2D',
    bgStart:   '#0c1224',
    bgEnd:     '#070a12',
    topStart:  '#0b0f1e',
    topEnd:    '#0c142a',
  })

  const branding = ref({ appName: 'ÁGORA ERP', logoUrl: null })
  const nav      = ref(null)     // array (JSON ui.nav)
  const widgets  = ref(null)     // array (JSON ui.dashboard.widgets)

  function applyCSSVars() {
    const r = document.documentElement
    r.style.setProperty('--ap-primary',   theme.value.primary || '#FF9F1C')
    r.style.setProperty('--ap-secondary', theme.value.secondary || '#F6AE2D')
    // por si usas variables en CSS global (no obligatorio)
    r.style.setProperty('--ui-bg-start',  theme.value.bgStart)
    r.style.setProperty('--ui-bg-end',    theme.value.bgEnd)
    r.style.setProperty('--ui-top-start', theme.value.topStart)
    r.style.setProperty('--ui-top-end',   theme.value.topEnd)
  }

  async function loadForActiveCompany() {
    const ws = useWorkspaceStore()
    await ws.ensureEmpresaSet()

    if (!ws.empresaId) {
      loaded.value = true
      applyCSSVars()
      return
    }

    // GET /valores-configuracion/por-empresa/:empresaId/
    const { data } = await api.valoresConfiguracion.getPorEmpresa(ws.empresaId)

    // map flexible: objeto directo (clave->valor), o lista con .configuracion.nombre
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
    branding.value = {
      appName: map['ui.app_name'] || branding.value.appName,
      logoUrl: map['ui.logo_url'] || null,
    }

    // Theme (solo sobrescribe si la clave existe)
theme.value = {
  primary:  map['ui.primary']    || theme.value.primary || '#1a5eff',
  secondary:map['ui.secondary']  || theme.value.secondary || '#4ae364',
  // nuevos (fondo y topbar) — toman de DB o usan fallback
  bgStart:  map['ui.bg.start']   || theme.value.bgStart || '#0c1224',
  bgEnd:    map['ui.bg.end']     || theme.value.bgEnd   || '#070a12',
  topStart: map['ui.top.start']  || theme.value.topStart || '#0b0f1e',
  topEnd:   map['ui.top.end']    || theme.value.topEnd   || '#0c142a',
}

    // Menú y widgets (posibles JSON)
    nav.value     = parseMaybeJSON(map['ui.nav'])
    widgets.value = parseMaybeJSON(map['ui.dashboard.widgets'])

    applyCSSVars()
    loaded.value = true
  }

  // Fallbacks si no hay config en DB
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

  async function saveTheme(newTheme) {
    const ws = useWorkspaceStore()
    await ws.ensureEmpresaSet()
    if (!ws.empresaId) throw new Error('Sin empresa activa')

    const items = [
      { nombre: 'ui.primary',    valor: newTheme.primary },
      { nombre: 'ui.secondary',  valor: newTheme.secondary },
      { nombre: 'ui.bg.start',   valor: newTheme.bgStart },
      { nombre: 'ui.bg.end',     valor: newTheme.bgEnd },
      { nombre: 'ui.top.start',  valor: newTheme.topStart },
      { nombre: 'ui.top.end',    valor: newTheme.topEnd },
    ]
    await api.valoresConfiguracion.upsertMany({
      empresa: ws.empresaId,
      items,
    })

    // Actualiza el ref local para que el layout reaccione al instante
    theme.value = { ...theme.value, ...newTheme }
    applyCSSVars()
  }


  return {
    loaded, raw, theme, branding, nav, widgets,
    menu, dashboardWidgets, saveTheme,
    loadForActiveCompany,
  }
})
