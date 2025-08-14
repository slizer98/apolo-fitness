import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/services'
import { getEmpresaId as httpGetEmpresaId, setEmpresaId as httpSetEmpresaId } from '@/api/http'

export const useWorkspaceStore = defineStore('workspace', () => {
  // Estado
  const empresaId     = ref(httpGetEmpresaId() || null)
  const empresaNombre = ref(null)
  const sucursalId    = ref(null)
  const sucursalNombre= ref(null)
  const rol           = ref(null)         // string normalizado
  const permisos      = ref({})           // objeto libre
  const isSuperuser   = ref(false)
  const initialized   = ref(false)

  // Si ya había empresa persistida, fija header al montar el store
  if (empresaId.value) {
    httpSetEmpresaId(empresaId.value)
  }

  // Helpers internos
  function _normRole(r) { return (r || '').toString().trim().toLowerCase() }

  /** Inicializa desde /accounts/perfil/ */
  async function initFromProfile() {
    const { data: pr } = await api.accounts.perfil()

    // Flags globales
    isSuperuser.value = !!(pr?.is_superuser || pr?.is_staff)

    // 1) Preferir “activos” del backend
    if (pr?.empresa_activa?.id) {
      empresaId.value     = pr.empresa_activa.id
      empresaNombre.value = pr.empresa_activa.nombre || null
      httpSetEmpresaId(empresaId.value)              // <- fija y persiste X-Empresa-Id
    }
    if (pr?.sucursal_activa?.id) {
      sucursalId.value     = pr.sucursal_activa.id
      sucursalNombre.value = pr.sucursal_activa.nombre || null
    }
    if (pr?.rol_activo) {
      rol.value = _normRole(pr.rol_activo)
    }
    if (pr?.permisos_activos) {
      permisos.value = pr.permisos_activos || {}
    }

    // 2) Fallback si el backend no mandó “activos”
    if (!empresaId.value && Array.isArray(pr?.asignaciones) && pr.asignaciones.length) {
      const a = pr.asignaciones.find(x => x.is_active) || pr.asignaciones[0]
      if (a?.empresa_id) {
        empresaId.value     = a.empresa_id
        empresaNombre.value = a.empresa_nombre || null
        httpSetEmpresaId(empresaId.value)
      }
      if (a?.sucursal_id) {
        sucursalId.value     = a.sucursal_id
        sucursalNombre.value = a.sucursal_nombre || null
      }
      if (!rol.value && a?.rol) rol.value = _normRole(a.rol)
      if (!Object.keys(permisos.value || {}).length && a?.permisos) {
        permisos.value = a.permisos || {}
      }
    }

    initialized.value = true
    return { empresaId: empresaId.value, sucursalId: sucursalId.value, rol: rol.value }
  }

  /** Garantiza que haya empresa fijada en header (útil en guard del router) */
  async function ensureEmpresaSet() {
    if (!initialized.value) {
      try { await initFromProfile() } catch { initialized.value = true }
    }
    // Si por algo aún no hay empresa en memoria pero sí en storage, la re-fijamos
    if (!empresaId.value) {
      const stored = httpGetEmpresaId()
      if (stored) {
        empresaId.value = stored
        httpSetEmpresaId(stored)
      }
    }
  }

  // (Opcional) Si algún día necesitas cambiar manualmente empresa/sucursal activas:
  function setEmpresaLocal(id, nombre=null) {
    empresaId.value = id ? Number(id) : null
    empresaNombre.value = nombre
    httpSetEmpresaId(empresaId.value)
  }

  return {
    // state
    empresaId, empresaNombre, sucursalId, sucursalNombre, rol, permisos, isSuperuser, initialized,
    // actions
    initFromProfile, ensureEmpresaSet, setEmpresaLocal,
  }
})
