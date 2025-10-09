<!-- src/layouts/AppLayout.vue -->
<template>
  <div class="min-h-screen bg-[#f6f7fb] text-[#0f172a] flex">
    <!-- Sidebar -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200',
        'transition-transform duration-200 md:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <!-- Brand -->
      <div class="h-16 px-5 flex items-center gap-3 border-b border-slate-200">
        <div class="h-9 w-9 rounded-full bg-slate-100 grid place-items-center">
          <i class="fa-solid fa-chart-line text-slate-600"></i>
        </div>
        <div class="leading-tight">
          <div class="text-xs text-slate-500">LOGO</div>
          <div class="text-[11px] text-slate-500 truncate">
            Empresa: {{ ws.empresaNombre || ws.empresaId || '—' }}
          </div>
        </div>
      </div>

      <!-- Menu -->
      <nav class="px-3 py-3 overflow-y-auto h-[calc(100vh-4rem)]">
        <RouterLink
          v-for="item in visibleNav"
          :key="item.routeName || item.label"
          :to="{ name: item.routeName }"
          class="group flex items-center gap-3 px-3 py-2 rounded-lg mb-1"
          :class="route.name === item.routeName
            ? 'bg-slate-100 text-slate-900'
            : 'text-slate-700 hover:bg-slate-50'"
          @click="closeOnMobile"
        >
          <i :class="['fa-solid', item.icon || 'fa-circle', 'w-5 text-slate-500 group-hover:text-slate-700']"></i>
          <span class="text-sm truncate">{{ item.label }}</span>
        </RouterLink>

        <div v-if="!visibleNav.length" class="text-xs text-slate-400 px-3 pt-2">
          Sin opciones de menú.
        </div>
      </nav>
    </aside>

    <!-- Mobile overlay -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 bg-black/30 backdrop-blur-[2px] md:hidden"
      @click="sidebarOpen=false"
    ></div>

    <!-- Main -->
    <div class="flex-1 md:pl-64 min-h-screen flex flex-col">
      <!-- Topbar -->
      <header class="h-16 bg-white border-b border-slate-200">
        <div class="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <button
              class="md:hidden p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
              @click="sidebarOpen=true"
              aria-label="Abrir menú"
            >
              <i class="fa-solid fa-bars"></i>
            </button>
            <h1 class="text-[15px] font-semibold tracking-tight">{{ currentTitle }}</h1>
          </div>

          <div class="flex items-center gap-3">
            <!-- Chips informativos -->
            <div class="hidden sm:flex text-[11px] text-slate-600 mr-1">
              <span class="px-2 py-1 rounded-full bg-slate-100 border border-slate-200">
                Rol: {{ ws.rol || '—' }}
              </span>
              <span
                v-if="ws.sucursalNombre"
                class="ml-2 px-2 py-1 rounded-full bg-slate-100 border border-slate-200"
              >
                Sucursal: {{ ws.sucursalNombre }}
              </span>
            </div>

            <!-- Selects superuser -->
            <div v-if="ws.isSuperuser" class="hidden md:flex items-center gap-2 mr-2">
              <select
                v-model="tmpEmpresaId"
                @change="onEmpresaSelect"
                class="h-9 text-xs rounded-md border border-slate-300 bg-white px-2 hover:bg-slate-50"
              >
                <option disabled value="">Empresa…</option>
                <option v-for="e in empresas" :key="e.id" :value="e.id">{{ e.nombre }}</option>
              </select>
              <select
                v-model="tmpSucursalId"
                @change="onSucursalSelect"
                class="h-9 text-xs rounded-md border border-slate-300 bg-white px-2 hover:bg-slate-50"
              >
                <option disabled value="">Sucursal…</option>
                <option v-for="s in sucursales" :key="s.id" :value="s.id">{{ s.nombre }}</option>
              </select>
            </div>

            <!-- User -->
            <div class="relative" data-user-menu>
              <button
                class="flex items-center gap-2 h-9 px-3 rounded-md border border-slate-300 bg-white hover:bg-slate-50"
                @click.stop="userMenuOpen = !userMenuOpen"
              >
                <div class="h-6 w-6 rounded-full bg-slate-100 grid place-items-center">
                  <i class="fa-solid fa-user text-slate-600 text-[13px]"></i>
                </div>
                <span class="text-sm hidden sm:inline">{{ username || 'Usuario' }}</span>
                <i class="fa-solid fa-chevron-down text-[11px] text-slate-500"></i>
              </button>

              <div
                v-if="userMenuOpen"
                class="absolute right-0 mt-2 w-52 rounded-xl shadow-lg bg-white border border-slate-200 overflow-hidden"
              >
                <RouterLink
                  :to="{name:'Perfil'}"
                  class="block px-3 py-2 text-sm hover:bg-slate-50"
                  @click="userMenuOpen=false"
                >
                  <i class="fa-solid fa-id-badge mr-2 text-slate-500"></i> Perfil
                </RouterLink>
                <button class="w-full text-left px-3 py-2 text-sm hover:bg-slate-50" @click="logout">
                  <i class="fa-solid fa-right-from-bracket mr-2 text-slate-500"></i> Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Content -->
      <main class="flex-1">
        <!-- Wrapper de contenido para que todas las vistas luzcan como la captura -->
        <div class="px-4 sm:px-6 lg:px-8 py-5">
          <RouterView />
        </div>
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

const visibleNav = computed(() => Array.isArray(ui.menu) ? ui.menu : [])

const currentTitle = computed(() => {
  const found = visibleNav.value.find(n => route.name === n.routeName)
  return found?.label || 'Dashboard'
})

function closeOnMobile () {
  if (window.innerWidth < 768) sidebarOpen.value = false
}

async function loadProfileHeader () {
  try {
    const { data: pr } = await api.accounts.perfil()
    username.value = pr?.username || ''
  } catch {}
}

// Superuser selectors
const tmpEmpresaId = ref('')
const tmpSucursalId = ref('')

async function loadEmpresas () {
  try {
    const { data } = await api.empresas.list({ page_size: 200 })
    empresas.value = data?.results || data || []
    tmpEmpresaId.value = ws.empresaId || ''
  } catch { empresas.value = [] }
}

async function loadSucursales () {
  if (!tmpEmpresaId.value) { sucursales.value = []; return }
  try {
    const { data } = await api.sucursales.list({ empresa: tmpEmpresaId.value, page_size: 200 })
    sucursales.value = data?.results || data || []
    tmpSucursalId.value = ws.sucursalId || ''
  } catch { sucursales.value = [] }
}

async function onEmpresaSelect () {
  if (!ws.isSuperuser) return
  await ws.changeEmpresa(tmpEmpresaId.value)
  await loadSucursales()
}

function onSucursalSelect () {
  if (!ws.isSuperuser) return
  ws.changeSucursal(tmpSucursalId.value)
}

function onClickOutside (e) {
  if (!e.target.closest?.('[data-user-menu]')) userMenuOpen.value = false
}

function logout () {
  auth.logout()
  router.replace({ name: 'Login' })
}

onMounted(async () => {
  await ws.ensureEmpresaSet()
  await ui.loadForActiveCompany() // mantiene menú
  loadProfileHeader()
  if (ws.isSuperuser) {
    await loadEmpresas()
    await loadSucursales()
  }
  document.addEventListener('click', onClickOutside)
})
</script>

<style scoped>
/* look & feel de tarjetas como en la captura, disponible para que lo reutilices en tus vistas */
.card {
  @apply bg-white border border-slate-200 rounded-2xl shadow-sm;
}
.card-header {
  @apply px-4 py-3 border-b border-slate-200 text-[13px] font-semibold text-slate-700;
}
.card-body {
  @apply p-4;
}
</style>
