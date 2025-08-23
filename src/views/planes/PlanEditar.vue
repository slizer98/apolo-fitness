<template>
  <div class="p-4 text-white max-w-3xl">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-light">Editar plan</h1>

      <div class="flex items-center gap-2">
        <RouterLink :to="{ name:'PlanesLista' }"
          class="px-3 py-2 rounded-lg border border-gray-700 bg-gray-900/60 hover:bg-gray-800">
          Volver
        </RouterLink>
        <RouterLink v-if="planId" :to="{ name:'PlanDetalle', params: { id: planId } }"
          class="px-3 py-2 rounded-lg border border-apolo-primary/50 bg-apolo-primary/20 hover:bg-apolo-primary/30">
          Gestión avanzada
        </RouterLink>
      </div>
    </div>

    <!-- Mensajes -->
    <div v-if="banner.msg" :class="['mb-4 rounded-xl px-4 py-3 border', banner.type==='ok' ? 'border-emerald-700 bg-emerald-900/30 text-emerald-200' : 'border-red-800 bg-red-900/30 text-red-200']">
      {{ banner.msg }}
    </div>

    <!-- Cargando -->
    <div v-if="loading" class="space-y-2">
      <div class="animate-pulse h-8 bg-gray-800/60 rounded" v-for="i in 6" :key="i"></div>
    </div>

    <!-- Formulario -->
    <form v-else @submit.prevent="save" class="grid gap-4">
      <div>
        <label class="block text-xs text-gray-400 mb-1">Nombre *</label>
        <input v-model="form.nombre" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
        <p v-if="errors.nombre" class="text-red-400 text-xs mt-1">{{ errors.nombre }}</p>
      </div>

      <div>
        <label class="block text-xs text-gray-400 mb-1">Descripción</label>
        <textarea v-model="form.descripcion" rows="3" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"></textarea>
      </div>

      <div class="grid sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs text-gray-400 mb-1">Tipo de plan</label>
          <input v-model="form.tipo_plan" placeholder="mensual / semanal / sesiones…" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-1">Visitas gratis</label>
          <input v-model.number="form.visitas_gratis" type="number" min="0" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
        </div>
      </div>

      <div class="grid sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs text-gray-400 mb-1">Desde (YYYY-MM-DD)</label>
          <input v-model="form.desde" placeholder="2025-01-01" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-1">Hasta (YYYY-MM-DD)</label>
          <input v-model="form.hasta" placeholder="2025-12-31" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2" />
        </div>
      </div>

      <div class="grid sm:grid-cols-2 gap-4">
        <label class="inline-flex items-center gap-2">
          <input type="checkbox" v-model="form.acceso_multisucursal"
                 class="h-4 w-4 rounded border-gray-700 bg-gray-900">
          <span class="text-sm text-gray-300">Acceso multisucursal</span>
        </label>

        <label class="inline-flex items-center gap-2">
          <input type="checkbox" v-model="form.preventa"
                 class="h-4 w-4 rounded border-gray-700 bg-gray-900">
          <span class="text-sm text-gray-300">Preventa</span>
        </label>
      </div>

      <div class="flex items-center justify-end gap-2 pt-1">
        <RouterLink :to="{ name:'PlanesLista' }"
          class="px-4 py-2 rounded border border-gray-700 bg-gray-800/60 hover:bg-gray-700">
          Cancelar
        </RouterLink>
        <button type="submit" :disabled="saving"
          class="px-4 py-2 rounded bg-apolo-primary text-black hover:bg-apolo-secondary disabled:opacity-60">
          {{ saving ? 'Guardando…' : 'Guardar cambios' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import api from '@/api/services'

const route = useRoute()
const router = useRouter()
const planId = Number(route.params.id)

const loading = ref(true)
const saving  = ref(false)
const banner  = ref({ type: '', msg: '' })
const errors  = ref({})

const form = ref({
  nombre: '',
  descripcion: '',
  acceso_multisucursal: false,
  tipo_plan: '',
  preventa: false,
  desde: '',
  hasta: '',
  visitas_gratis: 0,
})

onMounted(load)

async function load() {
  loading.value = true
  banner.value = { type: '', msg: '' }
  try {
    const { data } = await api.planes.retrieve(planId)
    form.value = {
      nombre: data?.nombre || '',
      descripcion: data?.descripcion || '',
      acceso_multisucursal: !!data?.acceso_multisucursal,
      tipo_plan: data?.tipo_plan || '',
      preventa: !!data?.preventa,
      desde: data?.desde || '',
      hasta: data?.hasta || '',
      visitas_gratis: Number(data?.visitas_gratis || 0),
    }
  } catch (e) {
    banner.value = { type: 'err', msg: e?.response?.data?.detail || 'No se pudo cargar el plan' }
  } finally {
    loading.value = false
  }
}

function validate() {
  const e = {}
  if (!form.value.nombre?.trim()) e.nombre = 'El nombre es obligatorio'
  errors.value = e
  return Object.keys(e).length === 0
}

async function save() {
  if (!validate()) return
  saving.value = true
  banner.value = { type: '', msg: '' }
  try {
    const payload = {
      nombre: form.value.nombre.trim(),
      descripcion: form.value.descripcion?.trim() || '',
      acceso_multisucursal: !!form.value.acceso_multisucursal,
      tipo_plan: form.value.tipo_plan?.trim() || '',
      preventa: !!form.value.preventa,
      desde: form.value.desde || null,
      hasta: form.value.hasta || null,
      visitas_gratis: Number(form.value.visitas_gratis || 0),
    }
    await api.planes.update(planId, payload)
    banner.value = { type: 'ok', msg: 'Cambios guardados' }
    // Opcional: navegar a detalle avanzado
    // router.replace({ name:'PlanDetalle', params:{ id: planId } })
  } catch (e) {
    const data = e?.response?.data
    if (data && typeof data === 'object') {
      // pinta errores de DRF por campo si los hay
      const byField = {}
      for (const k of Object.keys(data)) {
        if (Array.isArray(data[k]) && data[k].length) byField[k] = String(data[k][0])
      }
      errors.value = byField
    }
    banner.value = { type: 'err', msg: data?.detail || 'No se pudo guardar' }
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
/* opcional */
</style>
