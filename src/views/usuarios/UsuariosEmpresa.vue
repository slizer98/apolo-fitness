<template>
  <div class="p-4 text-white">
    <h1 class="text-2xl font-light mb-4">Usuarios de la empresa</h1>
    <div v-if="loading" class="space-y-2">
      <div class="animate-pulse h-8 bg-gray-800/60 rounded" v-for="i in 5" :key="i"></div>
    </div>
    <table v-else class="w-full text-sm">
      <thead class="text-gray-400">
        <tr>
          <th class="text-left pb-2">Usuario</th>
          <th class="text-left pb-2">Correo</th>
          <th class="text-left pb-2">Rol</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="u in rows" :key="u.id" class="border-t border-gray-800/80 hover:bg-gray-900/40">
          <td class="py-2">{{ u.username }}</td>
          <td class="py-2 text-gray-300">{{ u.email || '—' }}</td>
          <td class="py-2 text-gray-300">{{ u.rol || '—' }}</td>
        </tr>
        <tr v-if="!rows.length">
          <td colspan="3" class="py-6 text-center text-gray-400">Sin usuarios</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/services'

const loading = ref(true)
const rows = ref([])

onMounted(fetch)

async function fetch(){
  loading.value = true
  try{
    const { data } = await api.usuariosEmpresa.list({ page_size: 100 })
    rows.value = data?.results || data || []
  } finally {
    loading.value = false
  }
}
</script>
