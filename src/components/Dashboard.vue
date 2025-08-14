<template>
  <div class="min-h-screen bg-black text-white flex flex-col">
    <!-- Top Bar -->
    <header class="border-b border-gray-800/80 bg-gradient-to-r from-black via-gray-900 to-black">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div class="flex items-center gap-3">
            <img :src="apoloImage" alt="Ágora" class="h-8 w-auto opacity-90" />
            <h1 class="text-xl md:text-2xl font-light tracking-wide">Dashboard</h1>
            <span v-if="perfil.rol" class="ml-2 inline-flex items-center rounded-full bg-apolo-primary/20 text-apolo-primary px-3 py-0.5 text-xs md:text-sm">
              Rol: {{ perfil.rol }}
            </span>
          </div>

          <!-- Empresa | Sucursal selectors -->
          <div class="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div class="relative">
              <select v-model="empresaId" @change="handleEmpresaChange" class="bg-gray-900/70 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-apolo-primary">
                <option disabled value="">Selecciona empresa</option>
                <option v-for="e in empresas" :key="e.id" :value="e.id">{{ e.nombre }}</option>
              </select>
            </div>
            <div class="relative">
              <select v-model="sucursalId" @change="refreshAll" class="bg-gray-900/70 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-apolo-primary">
                <option disabled value="">Selecciona sucursal</option>
                <option v-for="s in sucursales" :key="s.id" :value="s.id">{{ s.nombre }}</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Content -->
    <main class="flex-1">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <!-- KPIs -->
        <section>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard title="Clientes" :value="kpis.clientes" :loading="loading.kpis" icon="fa-users" />
            <KpiCard title="Planes" :value="kpis.planes" :loading="loading.kpis" icon="fa-dumbbell" />
            <KpiCard title="Sucursales" :value="kpis.sucursales" :loading="loading.kpis" icon="fa-building" />
            <KpiCard title="Usuarios" :value="kpis.usuarios" :loading="loading.kpis" icon="fa-user-shield" />
          </div>
        </section>

        <!-- Quick actions & lists -->
        <section class="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Quick actions -->
          <div class="lg:col-span-1">
            <div class="rounded-2xl bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 shadow-xl p-4">
              <h2 class="text-lg font-medium mb-3">Acciones rápidas</h2>
              <div class="grid grid-cols-2 gap-3">
                <RouterLink :to="{ name: 'ClientesLista' }" class="btn-quick">
                  <i class="fa-regular fa-id-card"></i>
                  <span>Clientes</span>
                </RouterLink>
                <RouterLink :to="{ name: 'PlanesLista' }" class="btn-quick">
                  <i class="fa-solid fa-dumbbell"></i>
                  <span>Planes</span>
                </RouterLink>
                <RouterLink v-if="isManagerLike" :to="{ name: 'UsuariosEmpresa' }" class="btn-quick">
                  <i class="fa-solid fa-user-shield"></i>
                  <span>Usuarios</span>
                </RouterLink>
                <RouterLink v-if="isManagerLike" :to="{ name: 'Configuraciones' }" class="btn-quick">
                  <i class="fa-solid fa-gear"></i>
                  <span>Config</span>
                </RouterLink>
                <RouterLink :to="{ name: 'Perfil' }" class="btn-quick">
                  <i class="fa-regular fa-circle-user"></i>
                  <span>Perfil</span>
                </RouterLink>
                <button @click="refreshAll" class="btn-quick">
                  <i class="fa-solid fa-rotate-right"></i>
                  <span>Refrescar</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Recent clients -->
          <div class="lg:col-span-2">
            <div class="rounded-2xl bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 shadow-xl p-4">
              <div class="flex items-center justify-between mb-3">
                <h2 class="text-lg font-medium">Clientes recientes</h2>
                <RouterLink :to="{ name: 'ClientesLista' }" class="text-apolo-primary text-sm hover:underline">Ver todos</RouterLink>
              </div>

              <div v-if="loading.clientes" class="grid gap-2">
                <SkeletonRow v-for="i in 5" :key="i" />
              </div>
              <div v-else>
                <table class="w-full text-sm">
                  <thead class="text-gray-400">
                    <tr>
                      <th class="text-left font-normal pb-2">Nombre</th>
                      <th class="text-left font-normal pb-2">Correo</th>
                      <th class="text-left font-normal pb-2">Sucursal</th>
                      <th class="text-left font-normal pb-2">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="c in clientes" :key="c.id" class="border-t border-gray-800/80 hover:bg-gray-900/40">
                      <td class="py-2">{{ c.nombre }} {{ c.apellidos }}</td>
                      <td class="py-2 text-gray-300">{{ c.email || '—' }}</td>
                      <td class="py-2 text-gray-300">{{ c.sucursal_nombre || '—' }}</td>
                      <td class="py-2 text-gray-300">{{ formatDate(c.fecha_alta) }}</td>
                    </tr>
                    <tr v-if="!clientes.length">
                      <td colspan="4" class="py-6 text-center text-gray-400">Sin registros para esta sucursal</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <!-- Plans highlight -->
        <section class="mt-6">
          <div class="rounded-2xl bg-gradient-to-r from-gray-900 via-gray-900/70 to-black border border-gray-800 shadow-xl p-4">
            <div class="flex items-center justify-between mb-3">
              <h2 class="text-lg font-medium">Planes vigentes</h2>
              <RouterLink :to="{ name: 'PlanesLista' }" class="text-apolo-primary text-sm hover:underline">Administrar</RouterLink>
            </div>
            <div v-if="loading.planes" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <SkeletonCard v-for="i in 4" :key="i" />
            </div>
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <article v-for="p in planes" :key="p.id" class="rounded-xl border border-gray-800 bg-gray-900/60 p-4 hover:border-apolo-primary/60 transition">
                <div class="flex items-start justify-between gap-3">
                  <h3 class="font-medium leading-tight">{{ p.nombre }}</h3>
                  <span v-if="p.acceso_multisucursal" class="text-[10px] px-2 py-0.5 rounded-full bg-apolo-primary/20 text-apolo-primary">Multisucursal</span>
                </div>
                <p class="text-gray-300 text-sm mt-1 line-clamp-2">{{ p.descripcion }}</p>
                <p v-if="p.desde || p.hasta" class="text-[11px] text-gray-400 mt-2">Vigencia: {{ formatRange(p.desde, p.hasta) }}</p>
              </article>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import apoloImage from '@/assets/images/apolo-name.png'
import api from '@/api/services'

// Componentes (modular)
import KpiCard from '@/components/dashboard/KpiCard.vue'
import SkeletonRow from '@/components/dashboard/SkeletonRow.vue'
import SkeletonCard from '@/components/dashboard/SkeletonCard.vue'

// === Estado principal ===
const router = useRouter()
const auth = useAuthStore()

const perfil = ref({ usuario: null, empresa: null, sucursal: null, rol: null })
const empresas = ref([])
const sucursales = ref([])

const empresaId = ref('')
const sucursalId = ref('')

const clientes = ref([])
const planes = ref([])

const kpis = ref({ clientes: 0, planes: 0, sucursales: 0, usuarios: 0 })
const loading = ref({ kpis: true, clientes: true, planes: true })

const isManagerLike = computed(() => /admin|gerent|owner|manager/i.test(perfil.value.rol || ''))

onMounted(async () => {
  if (!auth.isAuthenticated) {
    router.replace({ name: 'Login' })
    return
  }
  await initPerfilYContexto()
  await refreshAll()
})

async function initPerfilYContexto() {
  try {
    const { data: pr } = await api.accounts.perfil()
    perfil.value = {
      usuario: pr?.username ?? auth.user?.username ?? null,
      empresa: pr?.empresa ?? null,
      sucursal: pr?.sucursal ?? null,
      rol: pr?.rol ?? '—'
    }
    if (perfil.value.empresa?.id) {
      empresaId.value = perfil.value.empresa.id
      api.system.setEmpresa(empresaId.value)
      await loadSucursales()
      if (perfil.value.sucursal?.id) {
        sucursalId.value = perfil.value.sucursal.id
      }
    }
  } catch (e) {
    perfil.value = { usuario: auth.user?.username ?? null, empresa: null, sucursal: null, rol: '—' }
  }
  try {
    const { data } = await api.empresas.list()
    empresas.value = data?.results || data || []
  } catch {
    empresas.value = []
  }
}

async function loadSucursales() {
  try {
    const { data } = await api.sucursales.list({ empresa: empresaId.value })
    sucursales.value = data?.results || data || []
  } catch {
    sucursales.value = []
  }
}

async function handleEmpresaChange() {
  await loadSucursales()
  sucursalId.value = ''
  api.system.setEmpresa(empresaId.value)
  await refreshAll()
}

async function refreshAll() {
  await Promise.all([fetchKPIs(), fetchClientes(), fetchPlanes()])
}

async function fetchKPIs() {
  loading.value.kpis = true
  try {
    const [c, p, s, u] = await Promise.all([
      api.clientes.list({ empresa: empresaId.value, sucursal: sucursalId.value, page_size: 1 }),
      api.planes.list({ empresa: empresaId.value, page_size: 1 }),
      api.sucursales.list({ empresa: empresaId.value, page_size: 1 }),
      api.usuariosEmpresa.list({ empresa: empresaId.value, page_size: 1 })
    ])
    kpis.value = {
      clientes: c?.data?.count ?? (c?.data?.length || 0),
      planes: p?.data?.count ?? (p?.data?.length || 0),
      sucursales: s?.data?.count ?? (s?.data?.length || 0),
      usuarios: u?.data?.count ?? (u?.data?.length || 0)
    }
  } catch {}
  finally { loading.value.kpis = false }
}

async function fetchClientes() {
  loading.value.clientes = true
  try {
    const { data } = await api.clientes.list({ empresa: empresaId.value, sucursal: sucursalId.value, ordering: '-id', page_size: 5 })
    const rows = data?.results || data || []
    clientes.value = rows.map(r => ({
      id: r.id,
      nombre: r.nombre,
      apellidos: r.apellidos,
      email: r.email,
      sucursal_nombre: r.sucursal_nombre,
      fecha_alta: r.fecha_alta || r.created
    }))
  } catch {
    clientes.value = []
  }
  finally { loading.value.clientes = false }
}

async function fetchPlanes() {
  loading.value.planes = true
  try {
    const { data } = await api.planes.list({ empresa: empresaId.value, ordering: '-id', page_size: 8 })
    planes.value = data?.results || data || []
  } catch {
    planes.value = []
  }
  finally { loading.value.planes = false }
}

function formatDate(d) {
  if (!d) return '—'
  try { return new Date(d).toLocaleDateString('es-MX') } catch { return d }
}
function formatRange(a, b) {
  const fa = a ? formatDate(a) : '—'
  const fb = b ? formatDate(b) : '—'
  if (!a && !b) return '—'
  return `${fa} → ${fb}`
}
</script>

<style scoped>
.btn-quick {
  @apply inline-flex items-center gap-2 justify-center rounded-xl border border-gray-800 bg-gray-900/60 px-3 py-2 text-sm hover:border-apolo-primary/50 hover:bg-gray-900 transition;
}
</style>
