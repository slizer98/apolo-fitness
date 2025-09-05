<template>
  <div class="min-h-screen bg-black text-white flex flex-col">
    <main class="flex-1">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <!-- KPIs -->
        <section>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard title="Clientes"   :value="kpis.clientes"   :loading="loading.kpis" icon="fa-users" />
            <KpiCard title="Planes"     :value="kpis.planes"     :loading="loading.kpis" icon="fa-dumbbell" />
            <KpiCard title="Sucursales" :value="kpis.sucursales" :loading="loading.kpis" icon="fa-building" />
            <KpiCard title="Usuarios"   :value="kpis.usuarios"   :loading="loading.kpis" icon="fa-user-shield" />
          </div>
        </section>

        <!-- Acciones rápidas -->
        <section class="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-1">
            <div class="rounded-2xl bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 shadow-xl p-4">
              <h2 class="text-lg font-medium mb-3">Acciones rápidas</h2>
              <div class="grid grid-cols-2 gap-3">
                <RouterLink :to="{ name: 'ClientesLista' }" class="btn-quick">
                  <i class="fa-regular fa-id-card"></i><span>Clientes</span>
                </RouterLink>
                <RouterLink :to="{ name: 'PlanesLista' }" class="btn-quick">
                  <i class="fa-solid fa-dumbbell"></i><span>Planes</span>
                </RouterLink>
                <RouterLink v-if="isManagerLike" :to="{ name: 'UsuariosEmpresa' }" class="btn-quick">
                  <i class="fa-solid fa-user-shield"></i><span>Usuarios</span>
                </RouterLink>
                <RouterLink v-if="isManagerLike" :to="{ name: 'Configuraciones' }" class="btn-quick">
                  <i class="fa-solid fa-gear"></i><span>Config</span>
                </RouterLink>
                <RouterLink :to="{ name: 'Perfil' }" class="btn-quick">
                  <i class="fa-regular fa-circle-user"></i><span>Perfil</span>
                </RouterLink>
                <button @click="refreshAll" class="btn-quick">
                  <i class="fa-solid fa-rotate-right"></i><span>Refrescar</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Clientes recientes (TanStack Table) -->
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
                <TableBasic :rows="clientes" :columns="clientesCols" :initialPageSize="5" />
              </div>
            </div>
          </div>
        </section>

        <!-- Planes vigentes -->
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
              <article
                v-for="p in planes"
                :key="p.id"
                class="rounded-xl border border-gray-800 bg-gray-900/60 p-4 hover:border-apolo-primary/60 transition"
              >
                <div class="flex items-start justify-between gap-3">
                  <h3 class="font-medium leading-tight">{{ p.nombre }}</h3>
                  <span
                    v-if="p.acceso_multisucursal"
                    class="text-[10px] px-2 py-0.5 rounded-full bg-apolo-primary/20 text-apolo-primary"
                  >
                    Multisucursal
                  </span>
                </div>
                <p class="text-gray-300 text-sm mt-1 line-clamp-2">{{ p.descripcion }}</p>
                <p v-if="p.desde || p.hasta" class="text-[11px] text-gray-400 mt-2">
                  Vigencia: {{ formatRange(p.desde, p.hasta) }}
                </p>
              </article>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useWorkspaceStore } from '@/stores/workspace'
import api from '@/api/services'

import KpiCard from '@/components/dashboard/KpiCard.vue'
import SkeletonRow from '@/components/dashboard/SkeletonRow.vue'
import SkeletonCard from '@/components/dashboard/SkeletonCard.vue'

import TableBasic from '@/components/TableBasic.vue'
import { createColumnHelper } from '@tanstack/vue-table'

const auth = useAuthStore()
const ws = useWorkspaceStore()

const clientes = ref([])
const planes = ref([])
const kpis = ref({ clientes: 0, planes: 0, sucursales: 0, usuarios: 0 })
const loading = ref({ kpis: true, clientes: true, planes: true })

const isManagerLike = computed(() => /admin|gerent|owner|manager/i.test(ws.rol || ''))

onMounted(async () => {
  if (!auth.isAuthenticated) return
  await ws.ensureEmpresaSet()
  await refreshAll()
})

watch(() => [ws.empresaId, ws.sucursalId], () => {
  refreshAll()
}, { immediate: false })

async function refreshAll () {
  await Promise.all([fetchKPIs(), fetchClientes(), fetchPlanes()])
}

async function fetchKPIs() {
  loading.value.kpis = true
  try {
    const [c, p, s, u] = await Promise.all([
      api.clientes.list({ sucursal: ws.sucursalId, page_size: 1 }),
      api.planes.list({ page_size: 1 }),
      api.sucursales.list({ page_size: 1 }),
      api.usuariosEmpresa.list({ page_size: 1 })
    ])
    kpis.value = {
      clientes:  c?.data?.count ?? (c?.data?.length || 0),
      planes:    p?.data?.count ?? (p?.data?.length || 0),
      sucursales:s?.data?.count ?? (s?.data?.length || 0),
      usuarios:  u?.data?.count ?? (u?.data?.length || 0)
    }
  } finally { loading.value.kpis = false }
}

async function fetchClientes() {
  loading.value.clientes = true
  try {
    const { data } = await api.clientes.list({ sucursal: ws.sucursalId, ordering: '-id', page_size: 50 })
    const rows = data?.results || data || []
    clientes.value = rows.map(r => ({
      id: r.id,
      nombre: `${r.nombre ?? ''} ${r.apellidos ?? ''}`.trim(),
      email: r.email || '—',
      sucursal_nombre: r.sucursal_nombre || '—',
      fecha: r.fecha_alta || r.created
    }))
  } catch {
    clientes.value = []
  } finally { loading.value.clientes = false }
}

async function fetchPlanes() {
  loading.value.planes = true
  try {
    const { data } = await api.planes.list({ ordering: '-id', page_size: 8 })
    planes.value = data?.results || data || []
  } catch {
    planes.value = []
  } finally { loading.value.planes = false }
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

/* ====== Columnas TanStack ====== */
const col = createColumnHelper()

const clientesCols = [
  col.accessor('nombre', { header: () => 'Nombre' }),
  col.accessor('email',  { header: () => 'Correo' }),
  col.accessor('sucursal_nombre', { header: () => 'Sucursal' }),
  col.accessor('fecha', {
    header: () => 'Fecha',
    cell: ({ getValue }) => {
      const v = getValue()
      try { return new Date(v).toLocaleDateString('es-MX') } catch { return v ?? '—' }
    }
  }),
]
</script>

<style scoped>
.btn-quick {
  @apply inline-flex items-center gap-2 justify-center rounded-xl border border-gray-800 bg-gray-900/60 px-3 py-2 text-sm hover:border-apolo-primary/50 hover:bg-gray-900 transition;
}
</style>
