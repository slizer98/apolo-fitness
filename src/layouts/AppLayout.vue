<!-- src/layouts/AppLayout.vue -->
<template>
  <div class="min-h-screen bg-black text-white flex">
    <!-- Sidebar -->
    <aside
      :class="[
        'fixed z-40 inset-y-0 left-0 w-72 bg-gradient-to-b from-gray-950 to-black border-r border-gray-800/70',
        'transition-transform duration-200',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        'md:translate-x-0'
      ]"
    >
      <div class="h-16 px-4 flex items-center gap-3 border-b border-gray-800/70">
        <img :src="apoloImage" alt="Ágora" class="h-7 w-auto opacity-90" />
        <div class="text-sm text-gray-300 leading-tight">
          <!-- <div class="font-medium">{{ ui.branding.appName }}</div>s -->
          <div class="text-[11px] text-gray-400 truncate">Empresa: {{ ws.empresaNombre || ws.empresaId }}</div>
        </div>
      </div>

      <nav class="px-3 py-3 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
        <RouterLink
          v-for="item in visibleNav"
          :key="item.label"
          :to="{ name: item.routeName }"
          class="flex items-center gap-3 px-3 py-2 rounded-xl border border-transparent hover:border-apolo-primary/40 hover:bg-gray-900/60"
          :class="route.name === item.routeName ? 'bg-gray-900/70 border-apolo-primary/40' : ''"
          @click="closeOnMobile"
        >
          <i :class="['fa', item.icon, 'opacity-80']"></i>
          <span class="text-sm">{{ item.label }}</span>
        </RouterLink>
      </nav>
    </aside>

    <!-- Overlay mobile -->
    <div v-if="sidebarOpen" class="fixed inset-0 bg-black/50 backdrop-blur-sm md:hidden" @click="sidebarOpen=false"></div>

    <!-- Main -->
    <div class="flex-1 md:pl-72 min-h-screen flex flex-col">
      <!-- Topbar -->
      <header class="h-16 border-b border-gray-800/70 bg-gradient-to-r from-black via-gray-900 to-black">
        <div class="h-full px-4 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <button class="md:hidden p-2 rounded-lg border border-gray-800 hover:bg-gray-900" @click="sidebarOpen=true" aria-label="Abrir menú">
              <i class="fa fa-bars"></i>
            </button>
            <h1 class="text-lg font-light tracking-wide">{{ currentTitle }}</h1>
          </div>

          <div class="flex items-center gap-3">
            <!-- Chips informativos para todos -->
            <div class="hidden sm:flex text-xs text-gray-400 mr-2">
              <span class="px-2 py-1 rounded-full bg-gray-900/60 border border-gray-800">Rol: {{ ws.rol || '—' }}</span>
              <span v-if="ws.sucursalNombre" class="ml-2 px-2 py-1 rounded-full bg-gray-900/60 border border-gray-800">Sucursal: {{ ws.sucursalNombre }}</span>
            </div>

            <!-- Selects solo para superuser -->
            <div v-if="ws.isSuperuser" class="hidden md:flex items-center gap-2 mr-2">
              <select v-model="tmpEmpresaId" @change="onEmpresaSelect" class="bg-gray-900/70 border border-gray-700 rounded-lg px-2 py-1.5 text-xs">
                <option disabled value="">Empresa…</option>
                <option v-for="e in empresas" :key="e.id" :value="e.id">{{ e.nombre }}</option>
              </select>
              <select v-model="tmpSucursalId" @change="onSucursalSelect" class="bg-gray-900/70 border border-gray-700 rounded-lg px-2 py-1.5 text-xs">
                <option disabled value="">Sucursal…</option>
                <option v-for="s in sucursales" :key="s.id" :value="s.id">{{ s.nombre }}</option>
              </select>
            </div>

            <!-- User menu -->
            <div class="relative" data-user-menu>
              <button class="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-800 bg-gray-900/50 hover:bg-gray-900"
                      @click.stop="userMenuOpen = !userMenuOpen">
                <i class="fa fa-circle-user"></i>
                <span class="text-sm hidden sm:inline">{{ username || 'Usuario' }}</span>
                <i class="fa fa-chevron-down text-xs opacity-70"></i>
              </button>
              <div v-if="userMenuOpen"
                   class="absolute right-0 mt-2 w-48 bg-gray-950 border border-gray-800 rounded-xl shadow-xl p-2">
                <RouterLink :to="{name:'Perfil'}" class="block px-3 py-2 rounded-lg hover:bg-gray-900/70" @click="userMenuOpen=false">
                  <i class="fa fa-id-badge mr-2"></i> Perfil
                </RouterLink>
                <button class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-900/70" @click="logout">
                  <i class="fa fa-right-from-bracket mr-2"></i> Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main class="flex-1">
        <RouterView />
      </main>
    </div>
  </div>
  <Toasts />
  <ConfirmDialog />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWorkspaceStore } from '@/stores/workspace'
import { useUiConfigStore } from '@/stores/uiConfig'
import { useAuthStore } from '@/stores/auth'
import api from '@/api/services'
import apoloImage from '@/assets/images/apolo-name.png'
import Toasts from '@/components/ui/Toasts.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'

const route = useRoute()
const router = useRouter()
const ws = useWorkspaceStore()
const ui = useUiConfigStore()
const auth = useAuthStore()

const sidebarOpen = ref(false)
const userMenuOpen = ref(false)

const username = ref('')
const empresas = ref([])
const sucursales = ref([])

const visibleNav = computed(() => ui.menu)
const currentTitle = computed(() => {
  const found = ui.menu.find(n => route.name === n.routeName)
  return found?.label || 'Panel'
})

function closeOnMobile() {
  if (window.innerWidth < 768) sidebarOpen.value = false
}

async function loadProfileHeader() {
  try {
    const { data: pr } = await api.accounts.perfil()
    username.value = pr?.username || ''
  } catch {}
}

// === Empresa/Sucursal (solo para superuser) ===
const tmpEmpresaId = ref('')
const tmpSucursalId = ref('')

async function loadEmpresas() {
  try {
    const { data } = await api.empresas.list({ page_size: 200 })
    empresas.value = data?.results || data || []
    // Pre-seleccionar
    tmpEmpresaId.value = ws.empresaId || ''
  } catch { empresas.value = [] }
}

async function loadSucursales() {
  if (!tmpEmpresaId.value) { sucursales.value = []; return }
  try {
    const { data } = await api.sucursales.list({ empresa: tmpEmpresaId.value, page_size: 200 })
    sucursales.value = data?.results || data || []
    // Pre-seleccionar
    tmpSucursalId.value = ws.sucursalId || ''
  } catch { sucursales.value = [] }
}

async function onEmpresaSelect() {
  if (!ws.isSuperuser) return
  await ws.changeEmpresa(tmpEmpresaId.value)
  await loadSucursales()
  // refrescar algo global si quieres (dashboard, etc) vía eventos o que cada vista observe ws.empresaId
}

function onSucursalSelect() {
  if (!ws.isSuperuser) return
  ws.changeSucursal(tmpSucursalId.value)
}

function onClickOutside(e) {
  if (!e.target.closest?.('[data-user-menu]')) userMenuOpen.value = false
}

function logout() {
  auth.logout()
  router.replace({ name: 'Login' })
}

onMounted(async () => {
  await ws.ensureEmpresaSet()
  await ui.loadForActiveCompany()
  loadProfileHeader()
  if (ws.isSuperuser) {
    await loadEmpresas()
    await loadSucursales()
  }
  document.addEventListener('click', onClickOutside)
})
</script>
