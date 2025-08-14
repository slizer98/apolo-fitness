<template>
  <div class="p-4 text-white">
    <h1 class="text-2xl font-light mb-4">Perfil</h1>
    <div class="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
      <div class="grid sm:grid-cols-2 gap-4">
        <div>
          <div class="text-gray-400 text-sm">Usuario</div>
          <div class="text-white">{{ perfil.username || '—' }}</div>
        </div>
        <div>
          <div class="text-gray-400 text-sm">Rol</div>
          <div class="text-white">{{ perfil.rol || '—' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import api from '@/api/services'

const perfil = ref({})

onMounted(async ()=>{
  try{
    const { data } = await api.accounts.perfil()
    perfil.value = data || {}
  } catch {}
})
</script>
