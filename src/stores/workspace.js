// src/stores/workspace.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api/services'

export const useWorkspaceStore = defineStore('workspace', () => {
  // ===== State =====
  const empresaId = ref(null)
  const empresaNombre = ref('')
  const sucursalId = ref(null)
  const sucursalNombre = ref('')
  const rol = ref(null)
  const isSuperuser = ref(false)
  const initialized = ref(false)

  // Cache de sucursales de la empresa activa (para el selector)
  const sucursales = ref([])

  // ===== Init desde perfil =====
  async function initFromProfile () {
    const { data: pr } = await api.accounts.perfil()

    // Tu endpoint trae ..._activa (preferente). Fallback a empresa/sucursal plano.
    const emp = pr?.empresa_activa || pr?.empresa
    const suc = pr?.sucursal_activa || pr?.sucursal

    empresaId.value = emp?.id ?? null
    empresaNombre.value = emp?.nombre ?? ''
    sucursalId.value = suc?.id ?? null
    sucursalNombre.value = suc?.nombre ?? ''
    rol.value = pr?.rol_activo || pr?.rol || null
    isSuperuser.value = !!(pr?.is_superuser || pr?.is_staff)

    // Header global X-Empresa-Id (el backend solo lo respeta para superuser)
    if (empresaId.value) api.system.setEmpresa(empresaId.value)

    await loadSucursales()
    initialized.value = true
  }

  async function ensureEmpresaSet () {
    if (!initialized.value) {
      try { await initFromProfile() } catch { initialized.value = true }
    }
  }

  // ===== Catálogo sucursales para la empresa activa =====
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
    if (!isSuperuser.value) return // bloqueo para no-superuser
    const idNum = newEmpresaId ? Number(newEmpresaId) : null
    if (idNum === empresaId.value) return

    empresaId.value = idNum
    empresaNombre.value = newEmpresaNombre || empresaNombre.value

    // Header para siguientes requests (el backend lo respeta si eres superuser)
    api.system.setEmpresa(idNum)

    // Al cambiar empresa, reset de sucursal y recarga catálogo
    sucursalId.value = null
    sucursalNombre.value = ''
    await loadSucursales()
  }

  function changeSucursal (newSucursalId, newSucursalNombre = '') {
    if (!isSuperuser.value) return // bloqueo para no-superuser
    sucursalId.value = newSucursalId ? Number(newSucursalId) : null
    sucursalNombre.value = newSucursalNombre || sucursalNombre.value
  }

  // ===== Alias internos (compatibilidad con código previo) =====
  async function setEmpresa (id, name = '') {
    // mismo comportamiento que changeEmpresa (y mismo bloqueo)
    return changeEmpresa(id, name)
  }
  function setSucursal (id, name = '') {
    // mismo comportamiento que changeSucursal (y mismo bloqueo)
    return changeSucursal(id, name)
  }

  // ===== Helpers reactivity keys (útiles para watch en vistas) =====
  const empresaKey = computed(() => empresaId.value || 'no-emp')
  const sucursalKey = computed(() => `${empresaKey.value}:${sucursalId.value || 'no-suc'}`)

  return {
    // state
    empresaId, empresaNombre, sucursalId, sucursalNombre, sucursales,
    rol, isSuperuser, initialized,

    // getters
    empresaKey, sucursalKey,

    // actions
    initFromProfile, ensureEmpresaSet, loadSucursales,
    changeEmpresa, changeSucursal,
    // alias de compat
    setEmpresa, setSucursal,
  }
})
