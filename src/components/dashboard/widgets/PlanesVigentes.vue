<template>
  <section>
    <div class="rounded-2xl bg-gradient-to-r from-gray-900 via-gray-900/70 to-black border border-gray-800 shadow-xl p-4">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-lg font-medium">Planes vigentes</h2>
        <RouterLink :to="{ name: 'PlanesLista' }" class="text-apolo-primary text-sm hover:underline">Administrar</RouterLink>
      </div>
      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div v-for="i in 4" :key="i" class="animate-pulse h-24 bg-gray-800/60 rounded-xl"></div>
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <article v-for="p in rows" :key="p.id" class="rounded-xl border border-gray-800 bg-gray-900/60 p-4 hover:border-apolo-primary/60 transition">
          <div class="flex items-start justify-between gap-3">
            <h3 class="font-medium leading-tight">{{ p.nombre }}</h3>
            <span v-if="p.acceso_multisucursal" class="text-[10px] px-2 py-0.5 rounded-full bg-apolo-primary/20 text-apolo-primary">Multisucursal</span>
          </div>
          <p class="text-gray-300 text-sm mt-1 line-clamp-2">{{ p.descripcion }}</p>
          <p v-if="p.desde || p.hasta" class="text-[11px] text-gray-400 mt-2">
            Vigencia: {{ formatRange(p.desde, p.hasta) }}
          </p>
        </article>
        <div v-if="!rows.length" class="col-span-full text-center text-gray-400 py-6">Sin planes</div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import api from '@/api/services'

const props = defineProps({ limit: { type: Number, default: 8 } })
const loading = ref(true)
const rows = ref([])

function formatDate(d){ try{ return new Date(d).toLocaleDateString('es-MX') }catch{ return d||'—' } }
function formatRange(a,b){
  const fa = a ? formatDate(a) : '—'
  const fb = b ? formatDate(b) : '—'
  if(!a && !b) return '—'
  return `${fa} → ${fb}`
}

onMounted(async () => {
  loading.value = true
  try {
    const { data } = await api.planes.list({ ordering: '-id', page_size: props.limit })
    rows.value = data?.results || data || []
  } finally {
    loading.value = false
  }
})
</script>
