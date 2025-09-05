<template>
  <div class="p-4 text-white">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-light">Clientes</h1>
      <button
        @click="openCrear()"
        class="bg-apolo-primary text-black px-4 py-2 rounded hover:bg-apolo-secondary transition"
      >
        + Nuevo
      </button>
    </div>

    <!-- Tabla (con buscador y paginación integrados en TableBasic) -->
    <div class="rounded-2xl bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 shadow-xl p-4">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-lg font-medium">Listado</h2>
        <span v-if="!loading" class="text-sm text-gray-400">{{ rows.length }} registros</span>
      </div>

      <div v-if="loading" class="space-y-2">
        <div class="animate-pulse h-8 bg-gray-800/60 rounded" v-for="i in 6" :key="i"></div>
      </div>

      <div v-else>
        <TableBasic :rows="rows" :columns="columns" :initialPageSize="10" />
      </div>
    </div>

    <!-- Modales -->
    <ClienteCrearModal v-if="showCrear" @close="closeCrear" @saved="onAnySaved" />
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
import { h, ref, onMounted, onBeforeUnmount } from 'vue'
import { RouterLink } from 'vue-router'
import api from '@/api/services'

import TableBasic from '@/components/TableBasic.vue'
import { createColumnHelper, FlexRender } from '@tanstack/vue-table'

import ClienteCrearModal from '@/views/clientes/modals/ClienteCrearModal.vue'
import DatosFiscalesModal from '@/views/clientes/modals/DatosFiscalesModal.vue'
import DatoContactoModal from '@/views/clientes/modals/DatoContactoModal.vue'
import ClienteSucursalModal from '@/views/clientes/modals/ClienteSucursalModal.vue'

/* ---------- Estado ---------- */
const loading = ref(true)
const rows = ref([]) // todos los registros cargados (client-side)

const showCrear = ref(false)
const showFiscales = ref(false)
const showContacto = ref(false)
const showSucursal = ref(false)
const currentCliente = ref(null)

const openMenuId = ref(null)
function toggleMenu (id) { openMenuId.value = openMenuId.value === id ? null : id }
function closeMenu () { openMenuId.value = null }
function onDocClick (e) {
  const inside = e.target.closest?.('[data-menu-root]')
  if (!inside) closeMenu()
}
function onEsc (e) { if (e.key === 'Escape') closeMenu() }

onMounted(async () => {
  await fetchAllClientSide()
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onEsc)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onEsc)
})

/* ---------- Carga client-side (loop paginado) ---------- */
async function fetchAllClientSide () {
  loading.value = true
  try {
    const pageSize = 200
    let page = 1
    const maxTotal = 2000  // tope de seguridad; ajusta si necesitas más
    const out = []

    while (out.length < maxTotal) {
      const { data } = await api.clientes.list({
        page,
        page_size: pageSize,
        ordering: '-id'
        // OJO: sin "search"; el filtro es client-side como en el dashboard
      })
      const chunk = data?.results || data || []
      if (!chunk.length) break
      out.push(...chunk)
      // si la API trae count, corta cuando alcances el total
      const total = data?.count
      if (total && out.length >= total) break
      if (chunk.length < pageSize) break
      page += 1
    }

    rows.value = out.map(r => ({
      id: r.id,
      nombre: r.nombre ?? '',
      apellidos: r.apellidos ?? '',
      email: r.email || '—',
      sucursal_nombre: r.sucursal_nombre || '—',
      fecha: r.fecha_alta || r.created_at,
      __raw: r,
    }))
  } finally {
    loading.value = false
  }
}

/* ---------- Utils ---------- */
function fullName (c) { if (!c) return ''; return [c?.nombre, c?.apellidos].filter(Boolean).join(' ') }
function formatDate (d) { try { return new Date(d).toLocaleDateString('es-MX') } catch { return d || '—' } }

/* ---------- Modales ---------- */
function openCrear () { showCrear.value = true }
function closeCrear () { showCrear.value = false }

function openFiscales (c) { currentCliente.value = c; showFiscales.value = true; closeMenu() }
function openContacto (c) { currentCliente.value = c; showContacto.value = true; closeMenu() }
function openSucursal (c) { currentCliente.value = c; showSucursal.value = true; closeMenu() }

function closeFiscales () { showFiscales.value = false }
function closeContacto () { showContacto.value = false }
function closeSucursal () { showSucursal.value = false }

async function removeRow (c) {
  closeMenu()
  if (!confirm(`Eliminar cliente "${fullName(c)}"?`)) return
  try {
    await api.clientes.delete(c.id)
    rows.value = rows.value.filter(x => x.id !== c.id)
  } catch (e) {
    console.error(e)
  }
}

async function onAnySaved () {
  showCrear.value = false
  showFiscales.value = false
  showContacto.value = false
  showSucursal.value = false
  await fetchAllClientSide()
}

/* ---------- Columnas (TanStack) ---------- */
const col = createColumnHelper()

const columns = [
  col.accessor(row => fullName(row), {
    id: 'nombre',
    header: () => 'Nombre',
    cell: ({ row }) => fullName(row.original),
    enableSorting: true,
  }),
  col.accessor('email', {
    header: () => 'Correo',
    enableSorting: true,
  }),
  col.accessor('sucursal_nombre', {
    header: () => 'Sucursal',
    enableSorting: true,
  }),
  col.accessor('fecha', {
    header: () => 'Fecha alta',
    cell: ({ getValue }) => formatDate(getValue()),
    enableSorting: true,
  }),
  col.display({
    id: 'acciones',
    header: () => h('div', { class: 'text-right' }, 'Acciones'),
    cell: ({ row }) => {
      const c = row.original
      return h(
        'div',
        { class: 'relative flex justify-end', 'data-menu-root': '' },
        [
          h('button', {
            class: 'px-2 py-1 rounded hover:bg-gray-800',
            onClick: (e) => { e.stopPropagation(); toggleMenu(c.id) },
            'aria-expanded': openMenuId.value === c.id,
            'aria-haspopup': 'menu'
          }, '⋯'),
          openMenuId.value === c.id
            ? h('div', {
                class: 'absolute right-0 mt-1 w-48 bg-gray-950 border border-gray-800 rounded-xl shadow-xl p-1 z-20',
                role: 'menu'
              }, [
                h(RouterLink, {
                  to: { name: 'ClienteEditar', params: { id: c.id } },
                  class: 'block px-3 py-2 rounded-lg hover:bg-gray-900/70',
                  role: 'menuitem',
                  onClick: () => closeMenu()
                }, () => 'Editar datos básicos'),
                h('button', {
                  class: 'w-full text-left px-3 py-2 rounded-lg hover:bg-gray-900/70',
                  role: 'menuitem',
                  onClick: () => openContacto(c)
                }, 'Datos de contacto'),
                h('button', {
                  class: 'w-full text-left px-3 py-2 rounded-lg hover:bg-gray-900/70',
                  role: 'menuitem',
                  onClick: () => openFiscales(c)
                }, 'Datos fiscales'),
                h('button', {
                  class: 'w-full text-left px-3 py-2 rounded-lg hover:bg-gray-900/70',
                  role: 'menuitem',
                  onClick: () => openSucursal(c)
                }, 'Asignar a sucursal'),
                h('button', {
                  class: 'w-full text-left px-3 py-2 rounded-lg hover:bg-red-900/40',
                  role: 'menuitem',
                  onClick: () => removeRow(c)
                }, 'Eliminar'),
              ])
            : null
        ]
      )
    }
  })
]
</script>
