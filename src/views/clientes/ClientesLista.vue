<template>
  <div class="p-4 text-white">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-light">Clientes</h1>

      <!-- Abrir modal de alta -->
      <button
        @click="openCrear()"
        class="bg-apolo-primary text-black px-4 py-2 rounded hover:bg-apolo-secondary transition"
      >
        + Nuevo
      </button>
    </div>

    <!-- Filtros -->
    <div class="mb-4 flex flex-wrap gap-2">
      <input
        v-model="q"
        @keyup.enter="fetch"
        placeholder="Buscar nombre/correo…"
        class="bg-gray-900 border border-gray-700 rounded px-3 py-2 w-64"
      />
      <button @click="fetch" class="bg-gray-800 border border-gray-700 px-4 py-2 rounded hover:bg-gray-700">
        Buscar
      </button>
      <button @click="resetFilters" class="bg-gray-800 border border-gray-700 px-4 py-2 rounded hover:bg-gray-700">
        Limpiar
      </button>
    </div>

    <!-- Tabla -->
    <div v-if="loading" class="space-y-2">
      <div class="animate-pulse h-8 bg-gray-800/60 rounded" v-for="i in 6" :key="i"></div>
    </div>

    <table v-else class="w-full text-sm">
      <thead class="text-gray-400">
        <tr>
          <th class="text-left pb-2">Nombre</th>
          <th class="text-left pb-2">Correo</th>
          <th class="text-left pb-2">Sucursal</th>
          <th class="text-left pb-2">Fecha alta</th>
          <th class="text-right pb-2">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="c in rows"
          :key="c.id"
          class="border-t border-gray-800/80 hover:bg-gray-900/40"
        >
          <td class="py-2">{{ fullName(c) }}</td>
          <td class="py-2 text-gray-300">{{ c.email || '—' }}</td>
          <td class="py-2 text-gray-300">{{ c.sucursal_nombre || '—' }}</td>
          <td class="py-2 text-gray-300">{{ formatDate(c.fecha_alta || c.created_at || c.created) }}</td>
          <td class="py-2">
            <!-- Menú de 3 puntos (con contenedor marcado para click-outside) -->
            <div
              class="relative flex justify-end"
              data-menu-root
            >
              <button
                class="px-2 py-1 rounded hover:bg-gray-800"
                @click.stop="toggleMenu(c.id)"
                :aria-expanded="openMenuId===c.id"
                aria-haspopup="menu"
              >
                ⋯
              </button>

              <div
                v-if="openMenuId===c.id"
                class="absolute right-0 mt-1 w-48 bg-gray-950 border border-gray-800 rounded-xl shadow-xl p-1 z-20"
                role="menu"
              >
                <RouterLink
                  :to="{ name: 'ClienteEditar', params: { id: c.id } }"
                  class="block px-3 py-2 rounded-lg hover:bg-gray-900/70"
                  role="menuitem"
                  @click="closeMenu"
                >
                  Editar datos básicos
                </RouterLink>

                <button
                  class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-900/70"
                  role="menuitem"
                  @click="openContacto(c)"
                >
                  Datos de contacto
                </button>

                <button
                  class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-900/70"
                  role="menuitem"
                  @click="openFiscales(c)"
                >
                  Datos fiscales
                </button>

                <button
                  class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-900/70"
                  role="menuitem"
                  @click="openSucursal(c)"
                >
                  Asignar a sucursal
                </button>

                <button
                  class="w-full text-left px-3 py-2 rounded-lg hover:bg-red-900/40"
                  role="menuitem"
                  @click="remove(c)"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </td>
        </tr>

        <tr v-if="!rows.length">
          <td colspan="5" class="py-6 text-center text-gray-400">Sin resultados</td>
        </tr>
      </tbody>
    </table>

    <!-- Paginación -->
    <div class="mt-4 flex items-center gap-2">
      <button :disabled="page<=1" @click="prev" class="px-3 py-1 rounded bg-gray-800/60 border border-gray-700 disabled:opacity-50">Anterior</button>
      <span class="text-gray-300">Página {{ page }}</span>
      <button :disabled="!hasMore" @click="next" class="px-3 py-1 rounded bg-gray-800/60 border border-gray-700 disabled:opacity-50">Siguiente</button>
      <span v-if="count!==null" class="text-gray-500 text-sm">({{ count }} resultados)</span>
    </div>

    <!-- Modales -->
    <ClienteCrearModal
      v-if="showCrear"
      @close="closeCrear"
      @saved="onAnySaved"
    />

    <DatosFiscalesModal
      v-if="showFiscales"
      :cliente-id="currentCliente?.id"
      :cliente-nombre="fullName(currentCliente)"
      @close="closeFiscales"
      @saved="onAnySaved"
    />
    <DatoContactoModal
      v-if="showContacto"
      :cliente-id="currentCliente?.id"
      :cliente-nombre="fullName(currentCliente)"
      @close="closeContacto"
      @saved="onAnySaved"
    />
    <ClienteSucursalModal
      v-if="showSucursal"
      :cliente-id="currentCliente?.id"
      :cliente-nombre="fullName(currentCliente)"
      @close="closeSucursal"
      @saved="onAnySaved"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { RouterLink } from 'vue-router'
import api from '@/api/services'

// Modales
import ClienteCrearModal from '@/views/clientes/modals/ClienteCrearModal.vue'
import DatosFiscalesModal from '@/views/clientes/modals/DatosFiscalesModal.vue'
import DatoContactoModal from '@/views/clientes/modals/DatoContactoModal.vue'
import ClienteSucursalModal from '@/views/clientes/modals/ClienteSucursalModal.vue'

const loading = ref(true)
const rows = ref([])
const page = ref(1)
const pageSize = 10
const count = ref(null)
const q = ref('')

const openMenuId = ref(null)

const hasMore = computed(() =>
  count.value === null ? rows.value.length === pageSize : count.value > page.value * pageSize
)

onMounted(() => {
  fetch()
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onEsc)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onEsc)
})

async function fetch () {
  loading.value = true
  try {
    const { data } = await api.clientes.list({
      search: q.value,
      page: page.value,
      page_size: pageSize,
      ordering: '-id'
    })
    rows.value = data?.results || data || []
    count.value = data?.count ?? null
  } finally {
    loading.value = false
  }
}

function resetFilters () { q.value = ''; page.value = 1; fetch() }
function next () { if (hasMore.value) { page.value++; fetch() } }
function prev () { if (page.value > 1) { page.value--; fetch() } }
function fullName (c) { return [c?.nombre, c?.apellidos].filter(Boolean).join(' ') }
function formatDate (d) { try { return new Date(d).toLocaleDateString('es-MX') } catch { return d || '—' } }

function toggleMenu (id) { openMenuId.value = openMenuId.value === id ? null : id }
function closeMenu () { openMenuId.value = null }
function onDocClick (e) {
  // Cierra si el click no ocurrió dentro de algún contenedor etiquetado
  const insideMenu = e.target.closest?.('[data-menu-root]')
  if (!insideMenu) closeMenu()
}
function onEsc (e) {
  if (e.key === 'Escape') closeMenu()
}

// Modales
const showCrear = ref(false)
const showFiscales = ref(false)
const showContacto = ref(false)
const showSucursal = ref(false)
const currentCliente = ref(null)

function openCrear () { showCrear.value = true }
function closeCrear () { showCrear.value = false }

function openFiscales (c) { currentCliente.value = c; showFiscales.value = true; closeMenu() }
function openContacto (c) { currentCliente.value = c; showContacto.value = true; closeMenu() }
function openSucursal (c) { currentCliente.value = c; showSucursal.value = true; closeMenu() }

function closeFiscales () { showFiscales.value = false }
function closeContacto () { showContacto.value = false }
function closeSucursal () { showSucursal.value = false }

async function remove (c) {
  closeMenu()
  if (!confirm(`Eliminar cliente "${fullName(c)}"?`)) return
  try {
    await api.clientes.delete(c.id)
    if (rows.value.length === 1 && page.value > 1) page.value -= 1
    await fetch()
  } catch (e) {
    console.error(e)
  }
}

async function onAnySaved () {
  // Cierra cualquier modal abierto y refresca
  showCrear.value = false
  showFiscales.value = false
  showContacto.value = false
  showSucursal.value = false
  await fetch()
}
</script>
