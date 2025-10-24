<template>
  <div class="min-h-screen bg-[#f5f7fb] text-[#1a1a1a]">
    <div class="mx-auto w-full max-w-[1200px] px-5 py-6">
      <!-- ENCABEZADO -->
      <header class="rounded-2xl bg-white border border-gray-200 shadow-sm p-5">
        <div class="flex items-start gap-4">
          <!-- Avatar -->
         <div class="relative">
            <div
              class="h-16 w-16 rounded-full bg-gray-100 grid place-items-center overflow-hidden cursor-pointer"
              @click="openLightbox = !!cliente?.avatar_url"
              :title="cliente?.avatar_url ? 'Ver foto' : ''"
            >
              <template v-if="cliente?.avatar_url">
                <img :src="cliente.avatar_url" alt="avatar" class="h-full w-full object-cover" />
              </template>
              <template v-else>
                <i class="fa-regular fa-user text-2xl text-gray-400"></i>
              </template>
            </div>

            <!-- Botón cámara sobre avatar (opcional, como ya lo tienes) -->
            <button
              class="absolute -bottom-2 -right-2 w-8 h-8 rounded-full grid place-items-center bg-[#1a5eff] text-white shadow hover:opacity-90 z-[210]"
              title="Actualizar foto"
              @click.stop="cameraOpenHeader = true"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l2-3h8l2 3h3a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </button>
          </div>


          <div class="flex-1 min-w-0">
            <h1 class="text-xl sm:text-2xl font-semibold truncate">
              {{ fullName || 'Cliente' }}
            </h1>

            <div class="mt-2 flex flex-wrap items-center gap-2 text-[12px]">
              <span
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border"
                :class="cliente?.is_active ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'"
              >
                <i :class="cliente?.is_active ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-xmark'"></i>
                {{ cliente?.is_active ? 'Activo' : 'Suspendido' }}
              </span>

              <span
                v-if="cliente?.plan_actual"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-[#dfe6ff] bg-[#f1f4ff] text-[#2741d9]"
              >
                Plan {{ cliente.plan_actual }}
              </span>

              <span
                v-if="cliente?.proximo_cobro"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-gray-200 bg-gray-50 text-gray-700"
              >
                Próximo cobro: {{ d(cliente.proximo_cobro) }}
              </span>
            </div>
          </div>

          <!-- Acciones -->
          <div class="flex flex-wrap gap-2">
            <button class="btn-primary" @click="emitCobrar">Cobrar</button>
            <button class="btn-light" @click="emitRenovar">Renovar</button>
            <button class="btn-light" @click="emitCongelar">Congelar</button>
            <button class="btn-light" @click="emitContactar">Contactar</button>
          </div>
        </div>

        <!-- Tabs -->
        <nav class="mt-5 border-t border-gray-200">
          <ul class="flex flex-wrap gap-2 pt-3">
            <li v-for="t in tabs" :key="t.key">
              <button
                class="tab-btn"
                :class="currentTab===t.key ? 'tab-btn--active' : ''"
                @click="currentTab = t.key"
              >
                {{ t.label }}
              </button>
            </li>
          </ul>
        </nav>
      </header>

      <!-- CONTENIDO -->
      <section class="mt-5">
        <component
          :is="currentComponent"
          :cliente-id="clienteId"
          :resumen="cliente"
          @refetch="fetchResumen"
        />
      </section>
    </div>

    <!-- Modal de cámara (desde header) -->
    <CameraModal
      v-if="clienteId"
      v-model:open="cameraOpenHeader"
      :cliente-id="clienteId"
      @saved="fetchResumen"
    />
  </div>
  <ImageLightbox v-model:open="openLightbox" :src="cliente?.avatar_url || ''" />

</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import http from '@/api/http'
import CameraModal from '@/components/CameraModal.vue'
import ImageLightbox from '@/components/ImageLightbox.vue'

const openLightbox = ref(false)


// Tabs
import ClientePerfilTab from '@/components/cliente-tabs/ClientePerfilTab.vue'
import ClienteTabsPagos from '@/components/cliente-tabs/ClienteTabsPagos.vue'
import TabServicios from '@/components/cliente-tabs/TabServicios.vue'
import TabAsistencias from '@/components/cliente-tabs/TabAsistencias.vue'

const route = useRoute()
const clienteId = computed(() => Number(route.params.id))

const cliente = ref(null)
const loading = ref(false)

async function fetchResumen () {
  if (!clienteId.value) return
  loading.value = true
  try {
    const { data } = await http.get(`clientes/${clienteId.value}/resumen/`)
    cliente.value = data || null
  } catch {
    cliente.value = null
  } finally {
    loading.value = false
  }
}

onMounted(fetchResumen)

/* Header helpers */
const fullName = computed(() => {
  const n = [cliente.value?.nombre, cliente.value?.apellidos].filter(Boolean).join(' ')
  return n || ''
})
function d (v) { try { return v ? new Date(v).toLocaleDateString('es-MX', { day:'2-digit', month:'short', year:'numeric' }) : '—' } catch { return v || '—' } }

/* Tabs */
const tabs = [
  { key: 'perfil', label: 'Perfil', component: ClientePerfilTab },
  { key: 'pagos', label: 'Pagos', component: ClienteTabsPagos },
  { key: 'asistencias', label: 'Asistencias', component: TabAsistencias },
  { key: 'servicios', label: 'Servicios', component: TabServicios },
  { key: 'compras', label: 'Compras', component: null },
  { key: 'documentos', label: 'Documentos', component: null },
  { key: 'notas', label: 'Notas', component: null },
]
const currentTab = ref('perfil')
const currentComponent = computed(() => {
  const t = tabs.find(x => x.key === currentTab.value)
  return (t && t.component) || ClientePerfilTab
})

/* Cámara desde el header */
const cameraOpenHeader = ref(false)

/* Acciones top (hooks para tus modales/flows) */
function emitCobrar(){ /* abre tu modal de cobro */ }
function emitRenovar(){ /* abre tu flujo de renovación */ }
function emitCongelar(){ /* … */ }
function emitContactar(){ /* … */ }
</script>

<style scoped>
.btn-primary{ @apply px-3 py-2 rounded-xl text-white bg-[#1a5eff] hover:opacity-90; }
.btn-light{ @apply px-3 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50; }

.tab-btn{ @apply px-3 py-2 rounded-xl text-sm text-gray-700 hover:bg-gray-100; }
.tab-btn--active{ @apply bg-gray-900 text-white hover:bg-gray-900; }
</style>
