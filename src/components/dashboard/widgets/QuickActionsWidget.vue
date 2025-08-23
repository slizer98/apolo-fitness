<template>
  <section class="rounded-2xl bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 shadow-xl p-4">
    <h2 class="text-lg font-medium mb-3">Acciones rápidas</h2>
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <RouterLink :to="{ name: 'ClientesLista' }" class="btn-quick">
        <i class="fa-regular fa-id-card"></i>
        <span>Clientes</span>
      </RouterLink>
      <RouterLink :to="{ name: 'PlanesLista' }" class="btn-quick">
        <i class="fa-solid fa-dumbbell"></i>
        <span>Planes</span>
      </RouterLink>
      <RouterLink :to="{ name: 'Perfil' }" class="btn-quick">
        <i class="fa-regular fa-circle-user"></i>
        <span>Perfil</span>
      </RouterLink>
    </div>
  </section>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.btn-quick { @apply inline-flex items-center gap-2 justify-center rounded-xl border border-gray-800 bg-gray-900/60 px-3 py-2 text-sm hover:border-apolo-primary/50 hover:bg-gray-900 transition; }
</style>
