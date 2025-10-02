<template>
  <div class="p-4 text-white">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div class="min-w-0">
        <h1 class="text-2xl font-light truncate">
          Plan · <span class="font-medium">{{ plan?.nombre || '—' }}</span>
        </h1>
        <p class="text-sm text-gray-300 mt-1 truncate" v-if="plan?.descripcion">{{ plan.descripcion }}</p>
      </div>
      <div class="flex items-center gap-2">
        <RouterLink
          :to="{ name:'PlanesLista' }"
          class="px-3 py-2 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700"
        >← Volver</RouterLink>
        <RouterLink
          v-if="plan?.id"
          :to="{ name:'PlanEditar', params:{ id: plan.id }}"
          class="px-3 py-2 rounded bg-apolo-primary text-black hover:bg-apolo-secondary"
        >Editar</RouterLink>
      </div>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="grid gap-2">
      <div class="animate-pulse h-8 bg-gray-800/60 rounded" v-for="i in 8" :key="i"></div>
    </div>

    <template v-else>
      <!-- Chips resumen -->
      <div class="mb-4 flex flex-wrap gap-2 text-[11px]">
        <span class="px-2 py-0.5 rounded-full bg-gray-800/60 border border-gray-700">
          Empresa: {{ plan?.empresa_nombre || '—' }}
        </span>
        <span class="px-2 py-0.5 rounded-full bg-gray-800/60 border border-gray-700">
          Tipo: {{ plan?.tipo_plan || '—' }}
        </span>
        <span
          v-if="plan?.desde || plan?.hasta"
          class="px-2 py-0.5 rounded-full bg-gray-800/60 border border-gray-700"
        >
          Vigencia: {{ formatRange(plan?.desde, plan?.hasta) }}
        </span>
        <span
          v-if="plan?.fecha_limite_pago"
          class="px-2 py-0.5 rounded-full bg-gray-800/60 border border-gray-700"
        >
          Límite pago: {{ formatDate(plan?.fecha_limite_pago) }}
        </span>
        <span
          v-if="plan?.costo_inscripcion !== null && plan?.costo_inscripcion !== undefined"
          class="px-2 py-0.5 rounded-full bg-gray-800/60 border border-gray-700"
        >
          Inscripción: {{ money(plan?.costo_inscripcion) }}
        </span>
        <span
          v-if="plan?.acceso_multisucursal"
          class="px-2 py-0.5 rounded-full bg-apolo-primary/20 border border-apolo-primary/40 text-apolo-primary"
        >
          Multisucursal
        </span>
        <span
          v-if="plan?.preventa"
          class="px-2 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-700 text-yellow-400"
        >
          Preventa
        </span>
      </div>

      <!-- Tabs -->
      <div class="border-b border-gray-800/70 mb-4">
        <nav class="flex flex-wrap gap-2">
          <button
            v-for="t in TABS"
            :key="t.key"
            class="px-3 py-2 rounded-t-lg border border-b-0"
            :class="tab===t.key ? 'bg-gray-900 border-gray-700' : 'bg-transparent border-transparent hover:bg-gray-900/40'"
            @click="tab=t.key">
            <i :class="['fa', t.icon, 'mr-2']"></i>{{ t.label }}
          </button>
        </nav>
      </div>

      <!-- INFO -->
      <section v-show="tab==='info'" class="rounded-2xl bg-gray-900/60 border border-gray-800 p-4">
        <PlanInfo
          v-if="plan"
          :plan="plan"
          @changed="reloadPlan"
        />
        <div v-else class="text-sm text-gray-400">Cargando información del plan…</div>
      </section>

      <!-- SERVICIOS -->
      <section v-show="tab==='servicios'" class="rounded-2xl bg-gray-900/60 border border-gray-800 p-4">
        <PlanServicios
          :plan-id="id"
          :servicios="servicios"
          @changed="reloadServicios"
        />
      </section>

      <!-- PRECIOS -->
      <section v-show="tab==='precios'" class="rounded-2xl bg-gray-900/60 border border-gray-800 p-4">
        <PlanPrecios
          :plan-id="id"
          :precios="precios"
          @changed="reloadPrecios"
        />
      </section>

      <!-- BENEFICIOS -->
      <section v-show="tab==='beneficios'" class="rounded-2xl bg-gray-900/60 border border-gray-800 p-4">
        <PlanBeneficios
          :plan-id="id"
          :beneficios="beneficios"
          @changed="reloadBeneficios"
        />
      </section>

      <!-- RESTRICCIONES -->
      <section v-show="tab==='restricciones'" class="rounded-2xl bg-gray-900/60 border border-gray-800 p-4">
        <PlanRestricciones
          :plan-id="id"
          :restricciones="restricciones"
          @changed="reloadRestricciones"
        />
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import api from '@/api/services'

import PlanInfo from './tabs/PlanInfo.vue'
import PlanServicios from './tabs/PlanServicios.vue'
import PlanPrecios from './tabs/PlanPrecios.vue'
import PlanBeneficios from './tabs/PlanBeneficios.vue'
import PlanRestricciones from './tabs/PlanRestricciones.vue'

const route = useRoute()
const id = computed(() => Number(route.params.id))

const TABS = [
  { key: 'info',          label: 'Información',   icon: 'fa-circle-info' },
  { key: 'servicios',     label: 'Servicios',     icon: 'fa-list' },
  { key: 'precios',       label: 'Precios',       icon: 'fa-tag' },
  { key: 'beneficios',    label: 'Beneficios',    icon: 'fa-gift' },
  { key: 'restricciones', label: 'Restricciones', icon: 'fa-ban' },
]
const tab = ref('info')

const loading = ref(true)
const plan = ref(null)
const servicios = ref([])
const precios = ref([])
const beneficios = ref([])
const restricciones = ref([])

onMounted(loadAll)
watch(() => id.value, () => loadAll(), { immediate: false })

async function loadAll () {
  loading.value = true
  try {
    await reloadPlan() // primero plan
    await Promise.allSettled([ // luego hijos en paralelo
      reloadServicios(),
      reloadPrecios(),
      reloadBeneficios(),
      reloadRestricciones(),
    ])
  } finally {
    loading.value = false
  }
}

async function reloadPlan () {
  try {
    const { data } = await api.planes.retrieve(id.value, { include: 'servicios' })
    plan.value = {
      ...data,
      costo_inscripcion: data?.costo_inscripcion ?? null,
      fecha_limite_pago: data?.fecha_limite_pago ?? null,
    }
  } catch (e) {
    console.error('No se pudo cargar el plan', e)
    plan.value = null
  }
}

async function reloadServicios () {
  try {
    const { data } = await api.planesServicios.list({ plan: id.value, page_size: 300, ordering: 'id' })
    servicios.value = data?.results || data || []
  } catch (e) {
    console.error('No se pudieron cargar servicios del plan', e)
    servicios.value = []
  }
}

async function reloadPrecios () {
  try {
    const { data } = await api.planes.precios.list({ plan: id.value, page_size: 300, ordering: 'id' })
    precios.value = data?.results || data || []
  } catch (e) {
    console.error('No se pudieron cargar precios del plan', e)
    precios.value = []
  }
}

async function reloadBeneficios () {
  try {
    const { data } = await api.planesBeneficios.list({ plan: id.value, page_size: 300, ordering: 'id' })
    beneficios.value = data?.results || data || []
  } catch (e) {
    console.error('No se pudieron cargar beneficios del plan', e)
    beneficios.value = []
  }
}

async function reloadRestricciones () {
  try {
    const { data } = await api.planesRestricciones.list({ plan: id.value, page_size: 300, ordering: 'id' })
    restricciones.value = data?.results || data || []
  } catch (e) {
    console.error('No se pudieron cargar restricciones del plan', e)
    restricciones.value = []
  }
}

/* Utils */
function formatDate (d) { try { return new Date(d).toLocaleDateString('es-MX') } catch { return d || '—' } }
function formatRange (a, b) {
  const fa = a ? formatDate(a) : '—'
  const fb = b ? formatDate(b) : '—'
  if (!a && !b) return '—'
  return `${fa} → ${fb}`
}
function money (v) {
  const num = Number(v)
  if (Number.isNaN(num)) return '—'
  return num.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 })
}
</script>
