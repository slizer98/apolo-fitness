<template>
  <div class="min-h-screen">
    <!-- Header -->
    <div class="px-4 pt-4 flex items-center justify-between">
      <h1 class="text-2xl font-semibold">Planes</h1>

      <!-- Botón “+ Nuevo” conservando tu ruta -->
      <!-- <RouterLink
        :to="{ name: 'PlanCrear' }"
        class="rounded-lg px-4 py-2 bg-apolo-primary text-black hover:bg-apolo-secondary transition"
      >
        + Nuevo
      </RouterLink> -->
    </div>

    <!-- Tabs -->
    <div class="px-4 mt-3 border-b border-gray-200 dark:border-gray-800">
      <nav class="-mb-px flex gap-2">
        <button :class="tab==='planes' ? activeTabClass : baseTabClass" @click="tab='planes'" class="px-3 py-2 rounded-t-lg border-b-2">Planes</button>
        <button :class="tab==='servicios' ? activeTabClass : baseTabClass" @click="tab='servicios'" class="px-3 py-2 rounded-t-lg border-b-2">Servicios</button>
        <button :class="tab==='beneficios' ? activeTabClass : baseTabClass" @click="tab='beneficios'" class="px-3 py-2 rounded-t-lg border-b-2" >Beneficios</button>
      </nav>
    </div>

    <!-- Contenido del tab -->
    <div class="px-0 sm:px-4 pb-6">
      <KeepAlive>
        <PlanesTabResumen v-if="tab==='planes'" />
        <PlanesTabServicios v-else-if="tab==='servicios'" />
        <PlanesTabBeneficios v-else-if="tab==='beneficios'" />
      </KeepAlive>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import PlanesTabResumen from './tabs/PlanesTabResumen.vue'
import PlanesTabServicios from './tabs/PlanesTabServicios.vue'
import PlanesTabBeneficios from './tabs/PlanesTabBeneficios.vue'

const tab = ref('planes')

// estilos de la pestaña activa / base (soporta tema claro/oscuro)
const activeTabClass = 'border-apolo-primary text-apolo-primary'
const baseTabClass   = 'border-transparent hover:text-apolo-primary/80 hover:border-apolo-primary/40 text-gray-600 dark:text-gray-300'
</script>
