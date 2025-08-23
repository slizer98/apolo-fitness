<template>
  <section>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="rounded-2xl bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 shadow-xl p-4">
        <div class="flex items-center justify-between">
          <h3 class="text-sm text-gray-300">Clientes</h3>
          <i class="fa fa-users opacity-70"></i>
        </div>
        <div class="mt-3 text-2xl font-semibold">{{ loading ? '…' : kpis.clientes }}</div>
      </div>
      <div class="rounded-2xl bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 shadow-xl p-4">
        <div class="flex items-center justify-between">
          <h3 class="text-sm text-gray-300">Planes</h3>
          <i class="fa fa-dumbbell opacity-70"></i>
        </div>
        <div class="mt-3 text-2xl font-semibold">{{ loading ? '…' : kpis.planes }}</div>
      </div>
      <div class="rounded-2xl bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 shadow-xl p-4">
        <div class="flex items-center justify-between">
          <h3 class="text-sm text-gray-300">Sucursales</h3>
          <i class="fa fa-building opacity-70"></i>
        </div>
        <div class="mt-3 text-2xl font-semibold">{{ loading ? '…' : kpis.sucursales }}</div>
      </div>
      <div class="rounded-2xl bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 shadow-xl p-4">
        <div class="flex items-center justify-between">
          <h3 class="text-sm text-gray-300">Usuarios</h3>
          <i class="fa fa-user-shield opacity-70"></i>
        </div>
        <div class="mt-3 text-2xl font-semibold">{{ loading ? '…' : kpis.usuarios }}</div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/services'
import { useWorkspaceStore } from '@/stores/workspace'

const ws = useWorkspaceStore()
const loading = ref(true)
const kpis = ref({ clientes: 0, planes: 0, sucursales: 0, usuarios: 0 })

onMounted(fetchKPIs)

async function fetchKPIs() {
  loading.value = true
  try {
    const [c, p, s, u] = await Promise.all([
      api.clientes.list({ page_size: 1 }),
      api.planes.list({ page_size: 1 }),
      api.sucursales.list({ page_size: 1 }),
      api.usuariosEmpresa.list({ page_size: 1 }),
    ])
    kpis.value = {
      clientes: c?.data?.count ?? (c?.data?.length || 0),
      planes: p?.data?.count ?? (p?.data?.length || 0),
      sucursales: s?.data?.count ?? (s?.data?.length || 0),
      usuarios: u?.data?.count ?? (u?.data?.length || 0),
    }
  } finally {
    loading.value = false
  }
}
</script>
