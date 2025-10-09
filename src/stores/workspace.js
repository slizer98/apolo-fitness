// src/stores/workspace.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api/services'

/**
 * Store de contexto (empresa/sucursal/rol) para toda la app.
 * - Lee empresa/sucursal/rol del endpoint de perfil.
 * - Mantiene un catálogo de sucursales de la empresa activa.
 * - Expone helpers para cambiar empresa/sucursal (solo superuser).
 * - Coloca el header X-Empresa-Id en api.system cuando hay empresa activa.
 */
export const useWorkspaceStore = defineStore('workspace', () => {
  // ===== State =====
  const empresaId = ref(null)
  const empresaNombre = ref('')
  const sucursalId = ref(null)
  const sucursalNombre = ref('')
  const rol = ref(null)
  const isSuperuser = ref(false)
  const initialized = ref(false)

  // Catálogo de sucursales de la empresa activa (para select global)
  const sucursales = ref([])

  // ===== Init desde perfil =====
  async function initFromProfile () {
    const { data: pr } = await api.accounts.perfil()

    // Preferimos campos *_activa si existen; si no, fallback a empresa/sucursal planos
    const emp = pr?.empresa_activa || pr?.empresa
    const suc = pr?.sucursal_activa || pr?.sucursal

    empresaId.value = emp?.id ?? null
    empresaNombre.value = emp?.nombre ?? ''
    sucursalId.value = suc?.id ?? null
    sucursalNombre.value = suc?.nombre ?? ''
    rol.value = pr?.rol_activo || pr?.rol || null
    isSuperuser.value = !!(pr?.is_superuser || pr?.is_staff)

    // Header global X-Empresa-Id (el backend solo lo respeta para superuser, pero no estorba)
    if (empresaId.value) api.system.setEmpresa(empresaId.value)

    await loadSucursales()
    initialized.value = true
  }

  async function ensureEmpresaSet () {
    if (!initialized.value) {
      try {
        await initFromProfile()
      } catch {
        // Si el perfil falla, marcamos como inicializado para no bloquear la app
        initialized.value = true
      }
    }
  }

  // ===== Catálogo sucursales de la empresa activa =====
  async function loadSucursales () {
    if (!empresaId.value) { sucursales.value = []; return }
    try {
      const { data } = await api.sucursales.list({
        empresa: empresaId.value,
        ordering: 'nombre',
        page_size: 200
      })
      sucursales.value = data?.results || data || []
    } catch {
      sucursales.value = []
    }
  }

  // ===== Cambios de empresa/sucursal (solo superuser) =====
  async function changeEmpresa (newEmpresaId, newEmpresaNombre = '') {
    if (!isSuperuser.value) return // protección
    const idNum = newEmpresaId ? Number(newEmpresaId) : null
    if (idNum === empresaId.value) return

    empresaId.value = idNum
    empresaNombre.value = newEmpresaNombre || empresaNombre.value

    // Header para siguientes requests (el backend lo respeta si eres superuser)
    api.system.setEmpresa(idNum)

    // Al cambiar empresa, reiniciamos sucursal y recargamos catálogo
    sucursalId.value = null
    sucursalNombre.value = ''
    await loadSucursales()
  }

  function changeSucursal (newSucursalId, newSucursalNombre = '') {
    if (!isSuperuser.value) return // protección
    sucursalId.value = newSucursalId ? Number(newSucursalId) : null
    sucursalNombre.value = newSucursalNombre || sucursalNombre.value
  }

  // ===== Alias internos (compatibilidad con código previo) =====
  async function setEmpresa (id, name = '') {
    // mismo comportamiento que changeEmpresa (y mismo bloqueo de superuser)
    return changeEmpresa(id, name)
  }
  function setSucursal (id, name = '') {
    // mismo comportamiento que changeSucursal (y mismo bloqueo de superuser)
    return changeSucursal(id, name)
  }

  // ===== Helpers reactivity keys (útiles para watch en vistas) =====
  const empresaKey = computed(() => empresaId.value || 'no-emp')
  const sucursalKey = computed(() => `${empresaKey.value}:${sucursalId.value || 'no-suc'}`)

  return {
    // state
    empresaId,
    empresaNombre,
    sucursalId,
    sucursalNombre,
    sucursales,
    rol,
    isSuperuser,
    initialized,

    // getters
    empresaKey,
    sucursalKey,

    // actions
    initFromProfile,
    ensureEmpresaSet,
    loadSucursales,
    changeEmpresa,
    changeSucursal,

    // alias compat
    setEmpresa,
    setSucursal,
  }
})
