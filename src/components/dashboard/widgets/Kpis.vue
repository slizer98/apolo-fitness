<template>
  <section>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="c in cards" :key="c.title" class="rounded-2xl bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 shadow-xl p-4">
        <div class="flex items-center justify-between">
          <h3 class="text-sm text-gray-300">{{ c.title }}</h3>
          <i :class="['fa', c.icon, 'opacity-70']"></i>
        </div>
        <div class="mt-3 text-2xl font-semibold">{{ c.value }}</div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/services'

const cards = ref([
  { title: 'Clientes',   icon: 'fa-users',      value: '…' },
  { title: 'Planes',     icon: 'fa-dumbbell',   value: '…' },
  { title: 'Sucursales', icon: 'fa-building',   value: '…' },
  { title: 'Usuarios',   icon: 'fa-user-shield',value: '…' },
])

onMounted(async () => {
  try {
    const [c, p, s, u] = await Promise.all([
      api.clientes.list({ page_size: 1 }),
      api.planes.list({ page_size: 1 }),
      api.sucursales.list({ page_size: 1 }),
      api.usuariosEmpresa.list({ page_size: 1 }),
    ])
    cards.value = [
      { title: 'Clientes',   icon: 'fa-users',      value: c?.data?.count ?? (c?.data?.length || 0) },
      { title: 'Planes',     icon: 'fa-dumbbell',   value: p?.data?.count ?? (p?.data?.length || 0) },
      { title: 'Sucursales', icon: 'fa-building',   value: s?.data?.count ?? (s?.data?.length || 0) },
      { title: 'Usuarios',   icon: 'fa-user-shield',value: u?.data?.count ?? (u?.data?.length || 0) },
    ]
  } catch {
    // noop
  }
})
</script>
