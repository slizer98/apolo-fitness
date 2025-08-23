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
        <img :src="ui.branding.logoUrl || apoloImage" alt="Ágora" class="h-7 w-auto opacity-90" />
        <div class="text-sm text-gray-300 leading-tight">
          <div class="font-medium">{{ ui.branding.appName }}</div>
          <div class="text-[11px] text-gray-400 truncate">Empresa: {{ empresaNombre || empresaId }}</div>
        </div>
      </div>

      <nav class="px-3 py-3 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
        <RouterLink
          v-for="item in visibleNav"
          :key="item.routeName || item.label"
          :to="{ name: item.routeName }"
          class="flex items-center gap-3 px-3 py-2 rounded-xl border border-transparent hover:border-apolo-primary/40 hover:bg-gray-900/60"
          :class="isActive(item.routeName) ? 'bg-gray-900/70 border-apolo-primary/40' : ''"
          @click="closeOnMobile"
        >
          <i :class="['fa', item.icon || 'fa-circle', 'opacity-80']"></i>
          <span class="text-sm">{{ item.label || item.routeName }}</span>
        </RouterLink>
      </nav>
    </aside>

    <!-- Overlay mobile -->
    <div v-if="sidebarOpen" class="fixed inset-0 bg-black/50 backdrop-blur-sm md:hidden" @click="sidebarOpen=false"></div>

    <!-- Main -->
    <div class="flex-1 md:pl-72 min-h-screen flex flex-col">
      <!-- Topbar -->
      <header class="h-16 border-b border-gray-800/70"
              :style="{ background: `linear-gradient(90deg, #000, ${primary20}, #000)` }">
        <div class="h-full px-4 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <button class="md:hidden p-2 rounded-lg border border-gray-800 hover:bg-gray-900" @click="sidebarOpen=true" aria-label="Abrir menú">
              <i class="fa fa-bars"></i>
            </button>
            <h1 class="text-lg font-light tracking-wide">{{ currentTitle }}</h1>
          </div>

          <div class="flex items-center gap-3">
            <div class="hidden sm:flex text-xs text-gray-400 mr-2">
              <span class="px-2 py-1 rounded-full bg-gray-900/60 border border-gray-800">Rol: {{ rol || '—' }}</span>
            </div>

            <div class="relative" data-user-menu>
              <button class="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-800 bg-gray-900/50 hover:bg-gray-900"
                      @click="toggleUserMenu">
                <i class="fa fa-circle-user"></i>
                <span class="text-sm hidden sm:inline">{{ username || 'Usuario' }}</span>
                <i class="fa fa-chevron-down text-xs opacity-70"></i>
              </button>
              <div v-if="userMenuOpen"
                   class="absolute right-0 mt-2 w-56 bg-gray-950 border border-gray-800 rounded-xl shadow-xl p-2 z-50">
                <RouterLink :to="{name:'Perfil'}" class="block px-3 py-2 rounded-lg hover:bg-gray-900/70" @click="userMenuOpen=false">
                  <i class="fa fa-id-badge mr-2"></i> Perfil
                </RouterLink>

                <!-- Config UI sólo para roles admin/manager/owner/gerente -->
                <RouterLink
                  v-if="/admin|gerent|owner|manager/i.test(rol || '')"
                  :to="{name:'UiConfigurator'}"
                  class="block px-3 py-2 rounded-lg hover:bg-gray-900/70"
                  @click="userMenuOpen=false">
                  <i class="fa fa-sliders mr-2"></i> Configuración UI
                </RouterLink>

                <button class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-900/70" @click="logout">
                  <i class="fa fa-right-from-bracket mr-2"></i> Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Content -->
      <main class="flex-1">
        <RouterView />
      </main>
    </div>
  </div>

  <!-- Utilidades -->
  <Toasts />
  <ConfirmDialog />
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter, RouterLink, RouterView } from 'vue-router'
import { useWorkspaceStore } from '@/stores/workspace'
import { useAuthStore } from '@/stores/auth'
import { useUiConfigStore } from '@/stores/uiConfig'
import api from '@/api/services'
import apoloImage from '@/assets/images/apolo-name.png'
import Toasts from '@/components/ui/Toasts.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'

const route = useRoute()
const router = useRouter()
const ws = useWorkspaceStore()
const auth = useAuthStore()
const ui = useUiConfigStore()

const sidebarOpen = ref(false)
const userMenuOpen = ref(false)

const username = ref('')
const empresaNombre = computed(() => ws.empresaNombre)
const empresaId = computed(() => ws.empresaId)
const rol = computed(() => ws.rol)

const primary20 = computed(() => (ui.theme.primary || '#FF9F1C') + '22')

const visibleNav = computed(() => {
  const r = (rol.value || '').toLowerCase()
  return (ui.menu || []).filter(item => {
    if (!item.roles || !item.roles.length) return true
    return item.roles.some(rr => r.includes(rr.toLowerCase()))
  })
})

const currentTitle = computed(() => {
  const found = (ui.menu || []).find(n => route.name === n.routeName)
  return found?.label || 'Panel'
})

function isActive(routeName) { return route.name === routeName }
function closeOnMobile() { if (window.innerWidth < 768) sidebarOpen.value = false }

async function loadHeader() {
  try {
    const { data: pr } = await api.accounts.perfil()
    username.value = pr?.username || pr?.email || 'Usuario'
  } catch { username.value = 'Usuario' }
}

function toggleUserMenu() { userMenuOpen.value = !userMenuOpen.value }
function onDocClick(e) {
  if (!userMenuOpen.value) return
  const inMenu = e.target.closest('[data-user-menu]')
  if (!inMenu) userMenuOpen.value = false
}

function logout() {
  auth.logout()
  router.replace({ name: 'Login' })
}

onMounted(async () => {
  await ws.ensureEmpresaSet()
  await ui.loadForActiveCompany()
  await loadHeader()
  document.addEventListener('click', onDocClick)
})
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))
</script>

<style scoped>
/* opcional */
</style>
