<template>
  <div class="p-4 text-white">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div>
        <h1 class="text-2xl font-light">Plan: {{ plan?.nombre || '—' }}</h1>
        <p class="text-gray-400 text-sm" v-if="plan?.descripcion">{{ plan.descripcion }}</p>
      </div>
      <RouterLink
        :to="{ name: 'PlanesLista' }"
        class="px-3 py-1.5 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700"
      >
        ← Volver
      </RouterLink>
    </div>

    <!-- Tabs -->
    <div class="flex items-center gap-2 border-b border-gray-800/70 mb-4">
      <button
        v-for="t in tabs"
        :key="t.key"
        class="px-3 py-2 rounded-t-lg text-sm"
        :class="tabKey===t.key ? 'bg-gray-900 border border-gray-800 border-b-black' : 'hover:bg-gray-900/60'"
        @click="switchTab(t.key)"
      >
        <i :class="['fa', t.icon, 'mr-2 opacity-80']"></i>{{ t.label }}
      </button>
    </div>

    <!-- Content -->
    <KeepAlive v-if="ready">
      <component
        :is="currentComp"
        :plan-id="idNum"
        :plan="plan"
        @refresh="fetchPlan"
      />
    </KeepAlive>
    <div v-else class="space-y-2">
      <div class="animate-pulse h-8 bg-gray-800/60 rounded" v-for="i in 6" :key="i"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, shallowRef, computed, onMounted, watch, defineAsyncComponent } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import api from '@/api/services'

// Sub-tabs como async components (¡importante!)
const PlanInfo          = defineAsyncComponent(() => import('./tabs/PlanInfo.vue'))
const PlanPrecios       = defineAsyncComponent(() => import('./tabs/PlanPrecios.vue'))
const PlanRestricciones = defineAsyncComponent(() => import('./tabs/PlanRestricciones.vue'))
const PlanServicios     = defineAsyncComponent(() => import('./tabs/PlanServicios.vue'))
const PlanBeneficios    = defineAsyncComponent(() => import('./tabs/PlanBeneficios.vue'))

const route = useRoute()
const idNum = computed(() => Number(route.params.id))

const plan = ref(null)
const ready = ref(false)

const tabs = [
  { key: 'info',          label: 'Info',          icon: 'fa-circle-info',        comp: PlanInfo },
  { key: 'precios',       label: 'Precios',       icon: 'fa-tags',               comp: PlanPrecios },
  { key: 'restricciones', label: 'Restricciones', icon: 'fa-clock',              comp: PlanRestricciones },
  { key: 'servicios',     label: 'Servicios',     icon: 'fa-screwdriver-wrench', comp: PlanServicios },
  { key: 'beneficios',    label: 'Beneficios',    icon: 'fa-gift',               comp: PlanBeneficios },
]

const tabKey = ref('info')
const currentComp = shallowRef(PlanInfo)

function switchTab(key) {
  if (tabKey.value === key) return
  tabKey.value = key
  const found = tabs.find(t => t.key === key)
  if (found) currentComp.value = found.comp
}

async function fetchPlan() {
  ready.value = false
  try {
    const { data } = await api.planes.retrieve(idNum.value)
    plan.value = data
  } catch {
    plan.value = null
  } finally {
    // asegura re-render limpio antes de ready = true
    requestAnimationFrame(() => { ready.value = true })
  }
}

watch(() => route.params.id, fetchPlan)
onMounted(fetchPlan)
</script>

<style scoped>
/* estilos opcionales */
</style>
