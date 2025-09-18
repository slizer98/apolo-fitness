// src/router/routeCatalog.js
import router from '@/router'

// Mapa de títulos/íconos por defecto (si el meta no lo trae)
const DEFAULT_META = {
  Dashboard:       { label: 'Dashboard',   icon: 'fa-house' },
  ClientesLista:   { label: 'Clientes',    icon: 'fa-id-card' },
  PlanesLista:     { label: 'Membresías',  icon: 'fa-dumbbell' },
  ServiciosLista:  { label: 'Servicios',   icon: 'fa-screwdriver-wrench' },
  BeneficiosLista: { label: 'Beneficios',  icon: 'fa-gift' },
  ProductosLista:  { label: 'Productos',   icon: 'fa-box' },
  Pos:  { label: 'POS',   icon: 'fa-box' },
  DisciplinasLista:{ label: 'Disciplinas', icon: 'fa-person-running' },
  UsuariosEmpresa: { label: 'Usuarios',    icon: 'fa-user-shield' },
  Configuraciones: { label: 'Config',      icon: 'fa-gear' },
  UiConfigurator:  { label: 'Config UI',   icon: 'fa-sliders' },
  Perfil:          { label: 'Perfil',      icon: 'fa-circle-user' },
}

export function getRouteCatalog() {
  // Filtra rutas con name (navegables) y que estén bajo /app
  return router.getRoutes()
    .filter(r => r.name && r.path.startsWith('/app'))
    .map(r => {
      const def = DEFAULT_META[r.name] || {}
      const label = r.meta?.label || def.label || r.name
      const icon  = r.meta?.icon  || def.icon  || 'fa-circle'
      const roles = r.meta?.roles || [] // roles opcionales
      const perms = r.meta?.perms || [] // permisos opcionales
      return {
        routeName: r.name,
        label,
        icon,
        roles,
        perms,
      }
    })
    // evita duplicar rutas “detalle/editar”
    .filter(item => !String(item.routeName).match(/(Detalle|Editar|Crear)$/))
    .sort((a, b) => a.label.localeCompare(b.label))
}
