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
  const theme    = ref({ primary: '#FF9F1C', secondary: '#F6AE2D' })
  const branding = ref({ appName: 'ÁGORA ERP', logoUrl: null })
  const nav      = ref(null)     // array (JSON ui.nav)
  const widgets  = ref(null)     // array (JSON ui.dashboard.widgets)

  function applyCSSVars() {
    const r = document.documentElement
    r.style.setProperty('--ap-primary', theme.value.primary || '#FF9F1C')
    r.style.setProperty('--ap-secondary', theme.value.secondary || '#F6AE2D')
  }

  async function loadForActiveCompany() {
    const ws = useWorkspaceStore()
    await ws.ensureEmpresaSet()

    // Si no hay empresa activa, aplica defaults
    if (!ws.empresaId) {
      loaded.value = true
      applyCSSVars()
      return
    }

    // OJO: este endpoint ahora devuelve un OBJETO (no lista)
    // GET /valores-configuracion/por-empresa/:empresaId/
    const { data } = await api.valoresConfiguracion.getPorEmpresa(ws.empresaId)

    // Si viene objeto, úsalo tal cual; si mañana viniera array, lo colapsamos a map
    let map = {}
    if (data && !Array.isArray(data) && typeof data === 'object') {
      map = data
    } else if (Array.isArray(data)) {
      // compat: [{configuracion:{nombre}, valor}, ...]
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

    // Branding y tema
    theme.value = {
      primary: map['ui.primary']   || theme.value.primary,
      secondary: map['ui.secondary'] || theme.value.secondary,
    }
    branding.value = {
      appName: map['ui.app_name'] || branding.value.appName,
      logoUrl: map['ui.logo_url'] || null,
    }

    // Menú y widgets (posibles JSON)
    nav.value     = parseMaybeJSON(map['ui.nav'])
    widgets.value = parseMaybeJSON(map['ui.dashboard.widgets'])

    applyCSSVars()
    loaded.value = true
  }

  // Fallbacks si no hay config en DB
  const menu = computed(() => {
    // Si hay JSON en DB, úsalo
    if (Array.isArray(nav.value)) return nav.value

    // Fallback por defecto
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

  return {
    loaded, raw, theme, branding, nav, widgets,
    menu, dashboardWidgets,
    loadForActiveCompany,
  }
})
